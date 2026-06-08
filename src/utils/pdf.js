const escapePdfText = (text) => {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

const wrapPdfLine = (line, maxLength = 86) => {
  if (line.length <= maxLength) return [line]

  const words = line.split(' ')
  const lines = []
  let current = ''

  words.forEach(word => {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxLength) {
      if (current) lines.push(current)
      current = word
    } else {
      current = next
    }
  })

  if (current) lines.push(current)
  return lines
}

export const createPdfBlob = (content) => {
  const rawLines = content.trim().split('\n').flatMap(line => wrapPdfLine(line.trimEnd()))
  const linesPerPage = 48
  const pages = []

  for (let i = 0; i < rawLines.length; i += linesPerPage) {
    pages.push(rawLines.slice(i, i + linesPerPage))
  }

  const objects = []
  const pageObjectIds = []
  const addObject = (body) => {
    objects.push(body)
    return objects.length
  }

  const catalogId = addObject('')
  const pagesId = addObject('')
  const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')

  pages.forEach(pageLines => {
    const stream = [
      'BT',
      '/F1 11 Tf',
      '50 790 Td',
      '14 TL',
      ...pageLines.map(line => `(${escapePdfText(line || ' ')}) Tj T*`),
      'ET',
    ].join('\n')
    const contentId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)
    const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`)
    pageObjectIds.push(pageId)
  })

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageObjectIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageObjectIds.length} >>`

  let pdf = '%PDF-1.4\n'
  const offsets = [0]

  objects.forEach((body, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`
  })

  const xrefStart = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  offsets.slice(1).forEach(offset => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  return new Blob([pdf], { type: 'application/pdf' })
}

export const downloadPdf = (content, filename) => {
  const url = URL.createObjectURL(createPdfBlob(content))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
