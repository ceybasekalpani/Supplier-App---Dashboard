import { getCellValue } from './reportShared'
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

export const wrapPdfText = (value, maxChars, maxLines = 3) => {
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

const wrapCellValue = (value, maxChars, maxLines) => (
  Array.isArray(value)
    ? value.flatMap(item => wrapPdfText(item, maxChars, maxLines))
    : wrapPdfText(value, maxChars, maxLines)
)

export const drawRect = (x, y, width, height, fill, stroke = null) => {
  const commands = []
  if (fill) commands.push(`${fill.join(' ')} rg`)
  if (stroke) commands.push(`${stroke.join(' ')} RG`)
  commands.push(`${x} ${y} ${width} ${height} re`)
  commands.push(fill ? (stroke ? 'B' : 'f') : 'S')
  return commands.join('\n')
}

export const drawText = (text, x, y, size = 8, options = {}) => {
  const font = options.bold ? 'F2' : 'F1'
  const color = options.color || [0.12, 0.18, 0.15]
  return `BT /${font} ${size} Tf ${color.join(' ')} rg ${x} ${y} Td (${pdfEscape(pdfSafeText(text))}) Tj ET`
}

export const drawCenteredText = (text, x, y, width, size = 8, options = {}) => {
  const cleanText = pdfSafeText(text)
  const approxWidth = cleanText.length * size * 0.46
  return drawText(cleanText, x + Math.max(3, (width - approxWidth) / 2), y, size, options)
}

export const getPdfColumnWidths = (columns, usableWidth) => {
  const total = columns.reduce((sum, column) => sum + Number(column.width || 1), 0) || columns.length || 1
  return columns.map(column => (Number(column.width || 1) / total) * usableWidth)
}

// High enough that realistic cell content (remarks, addresses, etc.) never gets
// truncated with an ellipsis - rows grow to fit their own content instead.
const MAX_CELL_LINES = 60
const MIN_CONTENT_Y = 40
const BODY_CELL_CHAR_WIDTH = 4.2
export const HEADER_CELL_CHAR_WIDTH = 5.2
const CELL_HORIZONTAL_PADDING = 8

// Character-count estimate is intentionally conservative (wider average glyph
// width than a literal average) since this PDF is hand-built with no real font
// metrics - erring wide keeps wrapped text safely inside the column instead of
// spilling past its right edge.
export const estimateMaxChars = (columnWidth, charWidth, padding = CELL_HORIZONTAL_PADDING) => (
  Math.max(6, Math.floor((columnWidth - padding) / charWidth))
)

export const measureRowPlan = (row, tableColumns, columnWidths) => {
  const cellLines = tableColumns.map((column, index) => wrapCellValue(
    getCellValue(row, column),
    estimateMaxChars(columnWidths[index], BODY_CELL_CHAR_WIDTH),
    MAX_CELL_LINES
  ))
  const maxLines = Math.max(1, ...cellLines.map(lines => lines.length))
  const height = Math.ceil(9 + (maxLines * 7.4) + 6)

  return { row, cellLines, maxLines, height }
}

const measureSummaryHeight = (summary) => {
  if (!summary?.length) return 0

  const columnsPerRow = summary.length === 5 ? 5 : 4
  const rowCount = Math.ceil(Math.min(summary.length, 8) / columnsPerRow)
  return 16 + (rowCount * 39) + 12
}

const measureLetterTextHeight = (text) => {
  if (!text) return 0
  return 34 + (wrapPdfText(text, 126, 8).length * 12)
}

const measureIntroHeight = (introText) => (introText ? 14 + measureLetterTextHeight(introText) : 0)

export const getTotalsLayout = (totalsLength) => {
  const columns = totalsLength > 7 ? 2 : 1
  return { columns, rowsPerColumn: Math.ceil(totalsLength / columns) }
}

const measureTotalsHeight = (totals) => {
  if (!totals?.length) return 0
  return 22 + (getTotalsLayout(totals.length).rowsPerColumn * 20)
}

const measureClosingHeight = (closingText) => (closingText ? 4 + measureLetterTextHeight(closingText) : 0)

const measureSignaturesHeight = (signatures, reportVariant) => (
  signatures?.length ? (reportVariant === 'letter' ? 34 : 8) + (signatures.length * 48) : 0
)

const measureTrailerHeight = (report) => (
  (report.totals?.length ? 18 + measureTotalsHeight(report.totals) : 0) +
  measureClosingHeight(report.closingText) +
  measureSignaturesHeight(report.signatures, report.reportVariant)
)

const measureContentStartY = (isFirstPage, report) => {
  let y = 595 - 112

  if (isFirstPage) {
    y -= measureSummaryHeight(report.summary)
    y -= measureIntroHeight(report.introText)
  }

  y -= 18 // table title
  y -= 18 // column header row

  return y
}

export const planPdfPages = (report, rowPlans) => {
  const pages = []
  let cursor = 0
  let pageIndex = 0

  do {
    const isFirstPage = pageIndex === 0
    let y = measureContentStartY(isFirstPage, report)
    const pageRowPlans = []

    while (cursor < rowPlans.length) {
      const candidate = rowPlans[cursor]
      if (y - candidate.height < MIN_CONTENT_Y && pageRowPlans.length > 0) break

      pageRowPlans.push(candidate)
      y -= candidate.height
      cursor++

      if (y < MIN_CONTENT_Y) break
    }

    const isLastRowPage = cursor >= rowPlans.length
    const trailerHeight = isLastRowPage ? measureTrailerHeight(report) : 0
    const hasTrailer = isLastRowPage && (trailerHeight === 0 || (y - trailerHeight) >= MIN_CONTENT_Y)

    pages.push({ rowPlans: pageRowPlans, isLastRowPage, hasTrailer, trailerOnlyPage: false })
    pageIndex++
  } while (cursor < rowPlans.length)

  const lastPage = pages[pages.length - 1]
  if (lastPage.isLastRowPage && !lastPage.hasTrailer) {
    pages.push({ rowPlans: [], isLastRowPage: true, hasTrailer: true, trailerOnlyPage: true })
  }

  return pages
}
