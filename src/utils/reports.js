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

// Some columns (e.g. quantity breakdowns) return an array of strings so each
// entry renders on its own line instead of being run together in one line.
const renderCellHtml = (value) => (
  Array.isArray(value)
    ? value.map(item => `<div>${escapeHtml(item)}</div>`).join('')
    : escapeHtml(value)
)

const wrapCellValue = (value, maxChars, maxLines) => (
  Array.isArray(value)
    ? value.flatMap(item => wrapPdfText(item, maxChars, maxLines))
    : wrapPdfText(value, maxChars, maxLines)
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

const buildSignatureHtml = (signatures) => {
  const items = signatures || []
  if (items.length === 0) return ''

  return `
    <div class="section-block signature-section">
      <table class="signature-table">
        <tbody>
          ${items.map(item => `
            <tr>
              <td>
                <div class="signature-line"></div>
                <div class="signature-label">Date</div>
              </td>
              <td>
                <div class="signature-line"></div>
                <div class="signature-label">${escapeHtml(item)}</div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
}

export const buildReportHtml = ({ title, introText = '', closingText = '', tableTitle = 'Detailed Records', reportVariant = '', columns, rows, summary = [], totals = [], signatures = [] }) => {
  const generatedAt = reportDate()
  const isLetter = reportVariant === 'letter'

  return `<!doctype html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4 landscape; margin: 14mm 12mm; }
    @page Section1 {
      size: 842.0pt 595.0pt;
      mso-page-orientation: landscape;
      margin: 40.0pt 34.0pt 40.0pt 34.0pt;
    }
    div.Section1 { page: Section1; }
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

    .letter-text {
      border: 1px solid #d9e4d3;
      background: #fbfdf9;
      color: #263a2d;
      font-size: 12px;
      line-height: 19px;
      padding: 12px 14px;
      margin: 0;
      white-space: pre-line;
    }

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

    .signature-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 18px 24px;
      page-break-inside: avoid;
    }
    .signature-table td {
      width: 50%;
      vertical-align: bottom;
      color: #243a2d;
      font-size: 10.5px;
      font-weight: 700;
    }
    .signature-line {
      border-bottom: 1.4px solid #405548;
      height: 22px;
      margin-bottom: 5px;
    }
    .signature-label {
      color: #475c4d;
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .35px;
    }

    .letter-report .page-frame {
      border: 1px solid #cfd9c8;
      background: #ffffff;
    }
    .letter-report .body-pad { padding: 22px 28px 24px; }
    .letter-report .hero-grid td { padding: 16px 24px; }
    .letter-report h1 {
      font-size: 21px;
      text-transform: uppercase;
      letter-spacing: .4px;
    }
    .letter-report .report-note { display: none; }
    .letter-report .section-title {
      border-left: 0;
      padding-left: 0;
      color: #1f3327;
      font-size: 12px;
      letter-spacing: .55px;
    }
    .letter-report .letter-text {
      border: 0;
      background: #ffffff;
      padding: 0;
      font-size: 12.8px;
      line-height: 22px;
      color: #18271e;
    }
    .letter-report .summary {
      border-spacing: 0;
      margin-bottom: 18px;
    }
    .letter-report .metric {
      border: 1px solid #c8d2c0;
      border-left: 0;
      background: #ffffff;
      padding: 10px 14px;
    }
    .letter-report .metric:first-child { border-left: 1px solid #c8d2c0; }
    .letter-report .metric-label { color: #455943; }
    .letter-report .metric-value { color: #183a27; }
    .letter-report .data-table {
      font-size: 12px;
      border: 1.4px solid #566b5b;
      box-shadow: none;
    }
    .letter-report .data-table th {
      background: #edf4e9;
      color: #16261d;
      border: 1px solid #566b5b;
      padding: 9px 8px;
      font-size: 11px;
    }
    .letter-report .data-table td {
      border: 1px solid #748377;
      padding: 9px 10px;
      font-size: 12px;
      line-height: 17px;
      color: #16261d;
      background: #ffffff;
    }
    .letter-report .data-table td:first-child {
      text-align: center;
      font-weight: 700;
    }
    .letter-report .data-table tbody tr:nth-child(even) td { background: #ffffff; }
    .letter-report .signature-section {
      margin-top: 52px;
    }
    .letter-report .signature-table {
      border-spacing: 0;
      margin-top: 38px;
    }
    .letter-report .signature-table td {
      width: 50%;
      padding: 0 26px 0 0;
    }
    .letter-report .signature-table td:last-child {
      padding: 0 0 0 80px;
    }
  </style>
</head>
<body class="${isLetter ? 'letter-report' : ''}">
  <div class="Section1">
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

      ${introText ? `
        <div class="section-block">
          <div class="section-title">Release Statement</div>
          <p class="letter-text">${escapeHtml(introText)}</p>
        </div>
      ` : ''}

      <div class="section-block">
        <div class="section-title">${escapeHtml(tableTitle)}</div>
        ${rows.length === 0 ? '<div class="empty">No records available for this report.</div>' : `
          <table class="data-table">
            <colgroup>
              ${columns.map(column => `<col style="width:${columnWidthPercent(column, columns)}" />`).join('')}
            </colgroup>
            <thead>
              <tr>${columns.map(column => `<th>${escapeHtml(column.label)}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map(row => `<tr>${columns.map(column => `<td>${renderCellHtml(getCellValue(row, column))}</td>`).join('')}</tr>`).join('')}
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

      ${closingText ? `
        <div class="section-block">
          <p class="letter-text">${escapeHtml(closingText)}</p>
        </div>
      ` : ''}

      ${buildSignatureHtml(signatures)}

      <table class="footer">
        <tr>
          <td>Prepared by Tea Factory Supplier Management</td>
          <td class="right">Generated from verified dashboard records</td>
        </tr>
      </table>
    </div>
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

// High enough that realistic cell content (remarks, addresses, etc.) never gets
// truncated with an ellipsis - rows grow to fit their own content instead.
const MAX_CELL_LINES = 60
const MIN_CONTENT_Y = 40
const BODY_CELL_CHAR_WIDTH = 4.2
const HEADER_CELL_CHAR_WIDTH = 5.2
const CELL_HORIZONTAL_PADDING = 8

// Character-count estimate is intentionally conservative (wider average glyph
// width than a literal average) since this PDF is hand-built with no real font
// metrics - erring wide keeps wrapped text safely inside the column instead of
// spilling past its right edge.
const estimateMaxChars = (columnWidth, charWidth, padding = CELL_HORIZONTAL_PADDING) => (
  Math.max(6, Math.floor((columnWidth - padding) / charWidth))
)

const measureRowPlan = (row, tableColumns, columnWidths) => {
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

const planPdfPages = (report, rowPlans) => {
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

const getTotalsLayout = (totalsLength) => {
  const columns = totalsLength > 7 ? 2 : 1
  return { columns, rowsPerColumn: Math.ceil(totalsLength / columns) }
}

const drawPdfTotals = (commands, totals, y) => {
  if (!totals?.length) return y

  commands.push(drawText('Report Totals', 28, y, 12, { bold: true, color: [0.19, 0.37, 0.28] }))
  y -= 22

  const { rowsPerColumn } = getTotalsLayout(totals.length)
  const columnGap = 395

  totals.forEach((item, index) => {
    const column = Math.floor(index / rowsPerColumn)
    const rowInColumn = index % rowsPerColumn
    const colX = 28 + (column * columnGap)
    const rowY = y - (rowInColumn * 20)

    commands.push(drawRect(colX, rowY - 14, 360, 18, [1, 1, 1], [0.76, 0.84, 0.7]))
    commands.push(drawRect(colX, rowY - 14, 4, 18, [0.83, 0.66, 0.29]))
    commands.push(drawRect(colX + 260, rowY - 14, 100, 18, [0.95, 0.98, 0.92], [0.79, 0.86, 0.75]))
    commands.push(drawText(item.label, colX + 10, rowY - 8, 8.8, { bold: true, color: [0.19, 0.33, 0.24] }))
    commands.push(drawCenteredText(item.value, colX + 260, rowY - 8, 100, 9, { bold: true, color: [0.19, 0.37, 0.28] }))
  })

  return y - (rowsPerColumn * 20)
}

const drawPdfLetterText = (commands, text, y) => {
  if (!text) return y

  const margin = 28
  const usableWidth = 842 - (margin * 2)
  const lines = wrapPdfText(text, 126, 8)

  commands.push(drawRect(margin, y - 20 - (lines.length * 12), usableWidth, 24 + (lines.length * 12), [0.98, 0.99, 0.97], [0.8, 0.86, 0.76]))
  lines.forEach((line, index) => {
    commands.push(drawText(line, margin + 12, y - 18 - (index * 12), 9.2, { color: [0.14, 0.22, 0.17] }))
  })

  return y - 34 - (lines.length * 12)
}

const drawPdfSignatures = (commands, signatures, y) => {
  if (!signatures?.length) return y

  const margin = 28
  const usableWidth = 842 - (margin * 2)
  const colWidth = 220
  const dateX = margin + 18
  const signatureX = margin + usableWidth - colWidth - 18

  signatures.forEach((label, index) => {
    const rowY = y - (index * 48)

    commands.push(drawRect(dateX, rowY, colWidth, 0.8, [0.25, 0.33, 0.28]))
    commands.push(drawText('Date', dateX, rowY - 13, 7.8, { bold: true, color: [0.28, 0.36, 0.3] }))
    commands.push(drawRect(signatureX, rowY, colWidth, 0.8, [0.25, 0.33, 0.28]))
    commands.push(drawText(label, signatureX, rowY - 13, 7.8, { bold: true, color: [0.28, 0.36, 0.3] }))
  })

  return y - (signatures.length * 48)
}

const buildPdfPageContent = (report, tableColumns, columnWidths, pagePlan, pageIndex, pageCount, startRowIndex) => {
  const width = 842
  const height = 595
  const margin = 28
  const usableWidth = width - (margin * 2)
  const commands = []
  const isFirstPage = pageIndex === 0

  drawPdfHeader(commands, {
    title: report.title || 'Report',
    generatedAt: reportDate(),
    rowCount: report.rows?.length || 0,
    pageIndex,
    pageCount,
  })

  let y = height - 112

  if (isFirstPage) {
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

    if (report.introText) {
      commands.push(drawText('Release Statement', margin, y, 11, { bold: true, color: [0.19, 0.37, 0.28] }))
      y -= 14
      y = drawPdfLetterText(commands, report.introText, y)
    }
  }

  if (!pagePlan.trailerOnlyPage) {
    commands.push(drawText(report.tableTitle || 'Detailed Records', margin, y, 11, { bold: true, color: [0.19, 0.37, 0.28] }))
    y -= 18

    const headerHeight = 18

    commands.push(drawRect(margin, y - headerHeight, usableWidth, headerHeight, [0.27, 0.45, 0.21], [0.21, 0.35, 0.16]))
    let headerX = margin
    tableColumns.forEach((column, index) => {
      const x = headerX
      const columnWidth = columnWidths[index]
      if (index > 0) commands.push(drawRect(x, y - headerHeight, 0.4, headerHeight, null, [0.75, 0.83, 0.72]))
      wrapPdfText(column.label, estimateMaxChars(columnWidth, HEADER_CELL_CHAR_WIDTH, 6), 2).forEach((line, lineIndex) => {
        commands.push(drawCenteredText(line, x, y - 8 - (lineIndex * 7), columnWidth, 7, { bold: true, color: [1, 1, 1] }))
      })
      headerX += columnWidth
    })
    y -= headerHeight

    if (pagePlan.rowPlans.length === 0) {
      commands.push(drawRect(margin, y - 42, usableWidth, 42, [1, 1, 1], [0.8, 0.85, 0.75]))
      commands.push(drawText('No records available for this report.', margin + 10, y - 25, 10, { color: [0.4, 0.46, 0.38] }))
    } else {
      pagePlan.rowPlans.forEach((plan, rowIndex) => {
        const rowHeight = plan.height
        const fill = (startRowIndex + rowIndex) % 2 === 1 ? [0.97, 0.98, 0.95] : [1, 1, 1]
        commands.push(drawRect(margin, y - rowHeight, usableWidth, rowHeight, fill, [0.78, 0.82, 0.75]))
        let cellX = margin
        tableColumns.forEach((column, index) => {
          const x = cellX
          const columnWidth = columnWidths[index]
          if (index > 0) commands.push(drawRect(x, y - rowHeight, 0.25, rowHeight, null, [0.82, 0.86, 0.79]))
          const cellLines = plan.cellLines[index]
          const lineStartY = y - 9 - Math.max(0, (plan.maxLines - cellLines.length) * 3.7)
          cellLines.forEach((line, lineIndex) => {
            const isFirstColumn = index === 0
            const shouldCenter = column.align === 'center'
            const textCommand = shouldCenter
              ? drawCenteredText(line, x, lineStartY - (lineIndex * 7.4), columnWidth, 7.4, { color: [0.11, 0.16, 0.13] })
              : isFirstColumn
              ? drawText(line, x + 4, lineStartY - (lineIndex * 7.4), 7.4, { color: [0.11, 0.16, 0.13] })
              : drawCenteredText(line, x, lineStartY - (lineIndex * 7.4), columnWidth, 7.4, { color: [0.11, 0.16, 0.13] })
            commands.push(textCommand)
          })
          cellX += columnWidth
        })
        y -= rowHeight
      })
    }
  }

  if (pagePlan.hasTrailer) {
    if (report.totals?.length > 0) {
      y -= 18
      y = drawPdfTotals(commands, report.totals, y)
    }

    if (report.closingText) {
      y -= 4
      y = drawPdfLetterText(commands, report.closingText, y)
    }

    if (report.signatures?.length > 0) {
      y -= report.reportVariant === 'letter' ? 34 : 8
      drawPdfSignatures(commands, report.signatures, y)
    }
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
  const width = 842
  const margin = 28
  const usableWidth = width - (margin * 2)
  const tableColumns = report.columns?.length ? report.columns : [{ label: 'Record', value: row => JSON.stringify(row), width: 1 }]
  const columnWidths = getPdfColumnWidths(tableColumns, usableWidth)
  const rowPlans = (report.rows || []).map(row => measureRowPlan(row, tableColumns, columnWidths))
  const pages = planPdfPages(report, rowPlans)
  const pageCount = pages.length

  let startRowIndex = 0
  const pageContents = pages.map((pagePlan, index) => {
    const content = buildPdfPageContent(report, tableColumns, columnWidths, pagePlan, index, pageCount, startRowIndex)
    startRowIndex += pagePlan.rowPlans.length
    return content
  })

  downloadBlob(createPdf(pageContents), `${report.filename || 'report'}-${timestamp()}.pdf`)
  return true
}

export const printReportAsPdf = downloadPdfReport
