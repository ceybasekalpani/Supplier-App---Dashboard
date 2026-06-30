const timestamp = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
const reportDate = () => new Date().toLocaleString('en-LK', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const getCellValue = (row, column) => (
  typeof column.value === 'function' ? column.value(row) : row[column.value]
)

const columnWidthPercent = (column, columns) => {
  const total = columns.reduce((sum, item) => sum + Number(item.width || 1), 0) || columns.length || 1
  return `${(Number(column.width || 1) / total) * 100}%`
}

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

const isTotalsHighlight = (label) => /total|grand|net|balance/i.test(String(label || ''))

const buildTotalRows = (totals) => (
  (totals || []).map(item => `
    <tr class="${isTotalsHighlight(item.label) ? 'total-row-strong' : ''}">
      <th class="total-label">${escapeHtml(item.label)}</th>
      <td class="total-value">${escapeHtml(item.value)}</td>
    </tr>
  `).join('')
)

const buildSummaryRows = (summary) => {
  const items = summary || []
  const columnsPerRow = items.length === 5 ? 5 : 4
  const rows = []

  for (let index = 0; index < items.length; index += columnsPerRow) {
    rows.push(items.slice(index, index + columnsPerRow))
  }

  return rows.map(row => `
    <tr>
      ${row.map(item => `
        <td class="metric">
          <div class="metric-label">${escapeHtml(item.label)}</div>
          <div class="metric-value">${escapeHtml(item.value)}</div>
        </td>
      `).join('')}
      ${Array.from({ length: columnsPerRow - row.length }, () => '<td class="metric metric-empty"></td>').join('')}
    </tr>
  `).join('')
}

export const buildReportHtml = ({ title, subtitle = '', columns, rows, summary = [], totals = [] }) => {
  const generatedAt = reportDate()

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4 landscape; margin: 14mm 12mm; }
    * { box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #1f2b23;
      margin: 0;
      background: #ffffff;
      font-size: 12px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page-frame {
      border: 1.5px solid #d8e2d2;
      padding: 0;
    }
    .report-shell {
      width: 100%;
      border-collapse: collapse;
    }

    /* ---------- Letterhead ---------- */
    .hero {
      background: #f2f8ee;
      border-bottom: 4px solid #c79a3a;
    }
    .hero td { border: 0; padding: 0; }
    .hero-grid { width: 100%; border-collapse: collapse; }
    .hero-grid td { border: 0; padding: 18px 20px; vertical-align: middle; }
    .brand-mark {
      width: 56px;
      height: 56px;
      min-width: 56px;
      background: #2f5d44;
      color: #ffffff;
      text-align: center;
      vertical-align: middle;
      font-size: 17px;
      font-weight: 800;
      letter-spacing: .5px;
      border: 1px solid #234634;
    }
    .hero-copy { padding-left: 16px; }
    .kicker {
      color: #234634;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.6px;
      text-transform: uppercase;
    }
    h1 {
      color: #1d3a2b;
      font-size: 23px;
      line-height: 28px;
      margin: 4px 0 0;
      font-weight: 800;
      letter-spacing: .1px;
    }
    .report-note {
      color: #5b6a5d;
      font-size: 10.5px;
      line-height: 15px;
      margin-top: 5px;
    }
    .hero-meta { text-align: right; white-space: nowrap; }
    .hero-meta-line {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: .4px;
      text-transform: uppercase;
      color: #6a7a5e;
      margin-bottom: 3px;
    }
    .hero-meta-value {
      font-size: 12px;
      font-weight: 800;
      color: #1d3a2b;
      margin-bottom: 7px;
    }

    /* ---------- Body padding wrapper ---------- */
    .body-pad { padding: 16px 20px 18px; }

    .section-title {
      color: #234735;
      font-size: 12.5px;
      font-weight: 800;
      letter-spacing: .3px;
      text-transform: uppercase;
      margin: 0 0 8px;
      padding-left: 9px;
      border-left: 4px solid #c79a3a;
    }
    .section-block + .section-block { margin-top: 16px; }

    /* ---------- Criteria ---------- */
    .criteria {
      width: 100%;
      border-collapse: separate;
      border-spacing: 7px;
      margin: 0;
    }
    .criteria-card {
      border: 1px solid #dde6d6;
      background: #fbfdf9;
      padding: 8px 11px;
      vertical-align: top;
      border-radius: 4px;
    }
    .criteria-label {
      color: #74835f;
      font-size: 8.4px;
      font-weight: 800;
      letter-spacing: .5px;
      text-transform: uppercase;
    }
    .criteria-value {
      color: #1f3a2c;
      font-size: 11px;
      font-weight: 700;
      margin-top: 3px;
    }

    /* ---------- Summary metrics ---------- */
    .summary {
      width: 100%;
      border-collapse: separate;
      border-spacing: 8px;
      margin: 0 0 12px;
    }
    .metric {
      border: 1px solid #d4e0cb;
      background: #fbfdf9;
      padding: 9px 12px;
      vertical-align: top;
      border-left: 4px solid #5d8c6c;
      border-radius: 3px;
    }
    .metric-empty { border: 1px solid #ffffff; background: #ffffff; }
    .metric-label {
      color: #4b6048;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: .6px;
      text-transform: uppercase;
    }
    .metric-value {
      color: #245138;
      font-size: 17px;
      line-height: 21px;
      font-weight: 800;
      margin-top: 4px;
    }

    /* ---------- Data table ---------- */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.4px;
      table-layout: fixed;
      border: 1px solid #bed0b4;
      box-shadow: 0 1px 0 #e8efe3;
    }
    .data-table th {
      background: #467235;
      color: #ffffff;
      text-align: center;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .35px;
      border: 1px solid #365a28;
      padding: 6px 5px;
      vertical-align: middle;
    }
    .data-table td {
      border: 1px solid #d6dfd0;
      padding: 4px 5px;
      vertical-align: middle;
      color: #1d2b22;
      overflow-wrap: break-word;
      word-wrap: break-word;
      line-height: 13.5px;
      text-align: center;
    }
    .data-table td:first-child { text-align: left; }
    .data-table tbody tr:nth-child(even) td { background: #f6f9f2; }
    .data-table tbody tr:hover td { background: #eef5e9; }
    .data-table tr { page-break-inside: avoid; }

    .totals-wrap { display: block; }
    .totals-table {
      width: 46%;
      border-collapse: collapse;
      font-size: 10.2px;
      page-break-inside: avoid;
      border: 1px solid #c9d5c1;
    }
    .totals-table th, .totals-table td {
      border: 1px solid #d6dfd0;
      padding: 8px 10px;
    }
    .total-label {
      width: 66%;
      background: #f1f6ec;
      color: #2c4a37;
      text-align: left;
      font-size: 9.3px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .35px;
    }
    .total-value {
      background: #ffffff;
      color: #245138;
      font-weight: 800;
      text-align: right;
      font-size: 11px;
    }
    .total-row-strong .total-label { background: #467235; color: #ffffff; }
    .total-row-strong .total-value { background: #f1f6ec; color: #1d3a2b; font-size: 12px; }

    .empty {
      border: 1px dashed #c9d5c1;
      background: #fbfdf9;
      color: #5e6d5f;
      padding: 30px;
      text-align: center;
      font-size: 11.5px;
      font-weight: 600;
    }

    .footer {
      width: 100%;
      border-collapse: collapse;
      margin-top: 18px;
      color: #6f7a6e;
      font-size: 9px;
    }
    .footer td { border-top: 1.5px solid #dde6d6; padding-top: 9px; }
    .right { text-align: right; }
  </style>
</head>
<body>
  <div class="page-frame">
    <table class="report-shell">
      <tr class="hero">
        <td>
          <table class="hero-grid">
            <tr>
              <td style="width:56px;">
                <table style="border-collapse:collapse;"><tr><td class="brand-mark">TF</td></tr></table>
              </td>
              <td class="hero-copy">
                <div class="kicker">Tea Factory Supplier Management</div>
                <h1>${escapeHtml(title)}</h1>
                <div class="report-note">Operational report generated from the current dashboard filters.</div>
              </td>
              <td class="hero-meta">
                <div class="hero-meta-line">Generated</div>
                <div class="hero-meta-value">${escapeHtml(generatedAt)}</div>
                <div class="hero-meta-line">Rows</div>
                <div class="hero-meta-value">${escapeHtml(rows.length)}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div class="body-pad">
      ${summary.length > 0 ? `
        <div class="section-block">
          <div class="section-title">Key Summary</div>
          <table class="summary">${buildSummaryRows(summary)}</table>
        </div>
      ` : ''}

      <div class="section-block">
        <div class="section-title">Detailed Records</div>
        ${rows.length === 0 ? '<div class="empty">No records available for this report.</div>' : `
          <table class="data-table">
            <colgroup>
              ${columns.map(column => `<col style="width:${columnWidthPercent(column, columns)}" />`).join('')}
            </colgroup>
            <thead>
              <tr>${columns.map(column => `<th>${escapeHtml(column.label)}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map(row => `<tr>${columns.map(column => `<td>${escapeHtml(getCellValue(row, column))}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        `}
      </div>

      ${totals.length > 0 ? `
        <div class="section-block">
          <div class="section-title">Report Totals</div>
          <table class="totals-table">${buildTotalRows(totals)}</table>
        </div>
      ` : ''}

      <table class="footer">
        <tr>
          <td>Prepared by Tea Factory Supplier Management</td>
          <td class="right">Generated from verified dashboard records</td>
        </tr>
      </table>
    </div>
  </div>
</body>
</html>`
}

export const downloadDocReport = (report) => {
  const html = buildReportHtml(report)
  const blob = new Blob([html], { type: 'application/msword;charset=utf-8' })

  downloadBlob(blob, `${report.filename || 'report'}-${timestamp()}.doc`)
}

/**
 * PDF export: rendered through the browser's native print pipeline using the
 * exact same polished HTML/CSS as the DOC report, instead of hand-drawn PDF
 * bytes. This gives real text measurement, real wrapping, and real
 * pagination — the user picks "Save as PDF" in the print dialog.
 */
const pdfEscape = (value) => String(value ?? '')
  .replace(/\\/g, '\\\\')
  .replace(/\(/g, '\\(')
  .replace(/\)/g, '\\)')
  .replace(/[\r\n\t]+/g, ' ')

const pdfSafeText = (value) => String(value ?? '').replace(/[^\x20-\x7E]/g, ' ').trim()

const splitLongWord = (word, maxLength) => {
  const parts = []
  for (let index = 0; index < word.length; index += maxLength) {
    parts.push(word.slice(index, index + maxLength))
  }
  return parts
}

const wrapPdfText = (value, maxChars, maxLines = 3) => {
  const cleanText = pdfSafeText(value)
  if (!cleanText) return ['']

  const words = cleanText.split(/\s+/).flatMap(word => (
    word.length > maxChars ? splitLongWord(word, maxChars) : [word]
  ))
  const lines = []
  let current = ''

  words.forEach(word => {
    const next = current ? `${current} ${word}` : word
    if (next.length <= maxChars) {
      current = next
      return
    }

    if (current) lines.push(current)
    current = word
  })

  if (current) lines.push(current)
  if (lines.length <= maxLines) return lines

  const visible = lines.slice(0, maxLines)
  visible[maxLines - 1] = `${visible[maxLines - 1].slice(0, Math.max(0, maxChars - 3))}...`
  return visible
}

const drawRect = (x, y, width, height, fill, stroke = null) => {
  const commands = []
  if (fill) commands.push(`${fill.join(' ')} rg`)
  if (stroke) commands.push(`${stroke.join(' ')} RG`)
  commands.push(`${x} ${y} ${width} ${height} re`)
  commands.push(fill ? (stroke ? 'B' : 'f') : 'S')
  return commands.join('\n')
}

const drawText = (text, x, y, size = 8, options = {}) => {
  const font = options.bold ? 'F2' : 'F1'
  const color = options.color || [0.12, 0.18, 0.15]
  return `BT /${font} ${size} Tf ${color.join(' ')} rg ${x} ${y} Td (${pdfEscape(pdfSafeText(text))}) Tj ET`
}

const drawCenteredText = (text, x, y, width, size = 8, options = {}) => {
  const cleanText = pdfSafeText(text)
  const approxWidth = cleanText.length * size * 0.46
  return drawText(cleanText, x + Math.max(3, (width - approxWidth) / 2), y, size, options)
}

const getPdfColumnWidths = (columns, usableWidth) => {
  const total = columns.reduce((sum, column) => sum + Number(column.width || 1), 0) || columns.length || 1
  return columns.map(column => (Number(column.width || 1) / total) * usableWidth)
}

const chunkRowsForPdf = (rows, firstPageCapacity, nextPageCapacity) => {
  if (rows.length === 0) return [[]]

  const pages = []
  let cursor = 0
  let capacity = firstPageCapacity

  while (cursor < rows.length) {
    pages.push(rows.slice(cursor, cursor + capacity))
    cursor += capacity
    capacity = nextPageCapacity
  }

  return pages
}

const drawPdfHeader = (commands, { title, generatedAt, rowCount, pageIndex, pageCount }) => {
  const width = 842
  const height = 595
  const margin = 28

  commands.push(drawRect(0, height - 88, width, 88, [0.95, 0.98, 0.94]))
  commands.push(drawRect(0, height - 92, width, 4, [0.83, 0.66, 0.29]))
  commands.push(drawRect(margin, height - 70, 42, 42, [0.27, 0.45, 0.21], [0.21, 0.35, 0.16]))
  commands.push(drawText('TF', margin + 13, height - 53, 13.5, { bold: true, color: [1, 1, 1] }))
  commands.push(drawText('TEA FACTORY SUPPLIER MANAGEMENT', margin + 56, height - 34, 7.4, { bold: true, color: [0.43, 0.5, 0.22] }))
  commands.push(drawText(title, margin + 56, height - 57, 18, { bold: true, color: [0.14, 0.27, 0.2] }))
  commands.push(drawText('Operational report generated from current dashboard filters', margin + 56, height - 74, 7.3, { color: [0.39, 0.45, 0.39] }))
  commands.push(drawText(`Generated: ${generatedAt}`, width - 218, height - 38, 7.4, { color: [0.22, 0.31, 0.24] }))
  commands.push(drawText(`Rows: ${rowCount}`, width - 218, height - 54, 7.4, { color: [0.22, 0.31, 0.24] }))
  commands.push(drawText(`Page ${pageIndex + 1} of ${pageCount}`, width - 218, height - 70, 7.4, { color: [0.22, 0.31, 0.24] }))
}

const drawPdfFooter = (commands) => {
  const width = 842
  const margin = 28
  const usableWidth = width - (margin * 2)

  commands.push(drawRect(margin, 34, usableWidth, 1.2, [0.85, 0.87, 0.81]))
  commands.push(drawText('Prepared by Tea Factory Supplier Management', margin, 20, 7.2, { color: [0.42, 0.46, 0.4] }))
  commands.push(drawText('Generated from verified dashboard records', width - 222, 20, 7.2, { color: [0.42, 0.46, 0.4] }))
}

const drawPdfTotals = (commands, totals, y) => {
  if (!totals?.length) return y

  commands.push(drawText('Report Totals', 28, y, 12, { bold: true, color: [0.19, 0.37, 0.28] }))
  y -= 22
  totals.slice(0, 14).forEach((item, index) => {
    const rowY = y - (index * 20)
    commands.push(drawRect(28, rowY - 14, 360, 18, [1, 1, 1], [0.76, 0.84, 0.7]))
    commands.push(drawRect(28, rowY - 14, 4, 18, [0.83, 0.66, 0.29]))
    commands.push(drawRect(288, rowY - 14, 100, 18, [0.95, 0.98, 0.92], [0.79, 0.86, 0.75]))
    commands.push(drawText(item.label, 38, rowY - 8, 8.8, { bold: true, color: [0.19, 0.33, 0.24] }))
    commands.push(drawCenteredText(item.value, 288, rowY - 8, 100, 9, { bold: true, color: [0.19, 0.37, 0.28] }))
  })

  return y - (totals.length * 20)
}

const buildPdfPageContent = (report, pageRows, pageIndex, pageCount, startIndex, isLastPage) => {
  const width = 842
  const height = 595
  const margin = 28
  const usableWidth = width - (margin * 2)
  const commands = []

  drawPdfHeader(commands, {
    title: report.title || 'Report',
    generatedAt: reportDate(),
    rowCount: report.rows?.length || 0,
    pageIndex,
    pageCount,
  })

  let y = height - 112

  if (pageIndex === 0) {
    if (report.summary?.length > 0) {
      commands.push(drawText('Key Summary', margin, y, 11, { bold: true, color: [0.19, 0.37, 0.28] }))
      y -= 16
      const columnsPerRow = report.summary.length === 5 ? 5 : 4
      const boxGap = 7
      const boxWidth = (usableWidth - (boxGap * (columnsPerRow - 1))) / columnsPerRow
      report.summary.slice(0, 8).forEach((item, index) => {
        const col = index % columnsPerRow
        const row = Math.floor(index / columnsPerRow)
        const x = margin + (col * (boxWidth + boxGap))
        const boxY = y - (row * 39) - 31
        commands.push(drawRect(x, boxY, boxWidth, 31, [1, 1, 1], [0.79, 0.86, 0.75]))
        commands.push(drawRect(x, boxY, 3, 31, [0.52, 0.66, 0.44]))
        commands.push(drawText(item.label, x + 7, boxY + 19, 6.3, { bold: true, color: [0.28, 0.38, 0.27] }))
        commands.push(drawText(item.value, x + 7, boxY + 6, 11.5, { bold: true, color: [0.19, 0.37, 0.28] }))
      })
      y -= Math.ceil(Math.min(report.summary.length, 8) / columnsPerRow) * 39
      y -= 12
    }
  }

  commands.push(drawText('Detailed Records', margin, y, 11, { bold: true, color: [0.19, 0.37, 0.28] }))
  y -= 18

  const tableColumns = report.columns?.length ? report.columns : [{ label: 'Record', value: row => JSON.stringify(row), width: 1 }]
  const columnWidths = getPdfColumnWidths(tableColumns, usableWidth)
  const headerHeight = 18
  const rowHeight = 23

  commands.push(drawRect(margin, y - headerHeight, usableWidth, headerHeight, [0.27, 0.45, 0.21], [0.21, 0.35, 0.16]))
  let headerX = margin
  tableColumns.forEach((column, index) => {
    const x = headerX
    const columnWidth = columnWidths[index]
    if (index > 0) commands.push(drawRect(x, y - headerHeight, 0.4, headerHeight, null, [0.75, 0.83, 0.72]))
    wrapPdfText(column.label, Math.max(7, Math.floor(columnWidth / 4.6)), 2).forEach((line, lineIndex) => {
      commands.push(drawCenteredText(line, x, y - 8 - (lineIndex * 7), columnWidth, 7, { bold: true, color: [1, 1, 1] }))
    })
    headerX += columnWidth
  })
  y -= headerHeight

  if (pageRows.length === 0) {
    commands.push(drawRect(margin, y - 42, usableWidth, 42, [1, 1, 1], [0.8, 0.85, 0.75]))
    commands.push(drawText('No records available for this report.', margin + 10, y - 25, 10, { color: [0.4, 0.46, 0.38] }))
  } else {
    pageRows.forEach((row, rowIndex) => {
      const fill = (startIndex + rowIndex) % 2 === 1 ? [0.97, 0.98, 0.95] : [1, 1, 1]
      commands.push(drawRect(margin, y - rowHeight, usableWidth, rowHeight, fill, [0.78, 0.82, 0.75]))
      let cellX = margin
      tableColumns.forEach((column, index) => {
        const x = cellX
        const columnWidth = columnWidths[index]
        if (index > 0) commands.push(drawRect(x, y - rowHeight, 0.25, rowHeight, null, [0.82, 0.86, 0.79]))
        const cellLines = wrapPdfText(getCellValue(row, column), Math.max(8, Math.floor(columnWidth / 3.7)), 2)
        const lineStartY = y - 9 - Math.max(0, (2 - cellLines.length) * 3.4)
        cellLines.forEach((line, lineIndex) => {
          const isFirstColumn = index === 0
          const textCommand = isFirstColumn
            ? drawText(line, x + 4, lineStartY - (lineIndex * 7.4), 7.4, { color: [0.11, 0.16, 0.13] })
            : drawCenteredText(line, x, lineStartY - (lineIndex * 7.4), columnWidth, 7.4, { color: [0.11, 0.16, 0.13] })
          commands.push(textCommand)
        })
        cellX += columnWidth
      })
      y -= rowHeight
    })
  }

  if (isLastPage && report.totals?.length > 0) {
    y -= 18
    drawPdfTotals(commands, report.totals, y)
  }

  drawPdfFooter(commands)
  return commands.join('\n')
}

const createPdf = (pageContents) => {
  const encoder = new TextEncoder()
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  ]
  const pageObjectNumbers = []

  pageContents.forEach(content => {
    const pageObjectNumber = objects.length + 1
    const contentObjectNumber = objects.length + 2
    pageObjectNumbers.push(`${pageObjectNumber} 0 R`)
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`)
    objects.push(`<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream`)
  })

  objects[1] = `<< /Type /Pages /Kids [${pageObjectNumbers.join(' ')}] /Count ${pageContents.length} >>`

  let pdf = '%PDF-1.4\n'
  const offsets = [0]

  objects.forEach((object, index) => {
    offsets.push(encoder.encode(pdf).length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })

  const xrefOffset = encoder.encode(pdf).length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  offsets.slice(1).forEach(offset => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return new Blob([pdf], { type: 'application/pdf' })
}

export const downloadPdfReport = (report) => {
  const rows = report.rows || []
  const hasTopCards = Boolean(report.summary?.length || report.subtitle)
  const firstPageCapacity = hasTopCards ? 12 : 17
  const nextPageCapacity = 17
  const rowPages = chunkRowsForPdf(rows, firstPageCapacity, nextPageCapacity)

  if (report.totals?.length && rowPages.length > 0) {
    const totalsSafeRowLimit = Math.max(5, Math.min(12, 13 - Math.ceil(report.totals.length / 2)))
    while (rowPages[rowPages.length - 1].length > totalsSafeRowLimit) {
      const overflow = rowPages[rowPages.length - 1].splice(totalsSafeRowLimit)
      rowPages.push(overflow)
    }
  }

  const pageCount = rowPages.length
  const pageContents = rowPages.map((pageRows, index) => buildPdfPageContent(
    report,
    pageRows,
    index,
    pageCount,
    index === 0 ? 0 : firstPageCapacity + ((index - 1) * nextPageCapacity),
    index === rowPages.length - 1
  ))

  downloadBlob(createPdf(pageContents), `${report.filename || 'report'}-${timestamp()}.pdf`)
  return true
}

export const printReportAsPdf = downloadPdfReport
