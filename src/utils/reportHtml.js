import { downloadBlob, escapeHtml, getCellValue, reportDate, timestamp } from './reportShared'
import { REPORT_STYLES } from './reportStyles'

// Some columns (e.g. quantity breakdowns) return an array of strings so each
// entry renders on its own line instead of being run together in one line.
const renderCellHtml = (value) => (
  Array.isArray(value)
    ? value.map(item => `<div>${escapeHtml(item)}</div>`).join('')
    : escapeHtml(value)
)

const columnWidthPercent = (column, columns) => {
  const total = columns.reduce((sum, item) => sum + Number(item.width || 1), 0) || columns.length || 1
  return `${(Number(column.width || 1) / total) * 100}%`
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
  <style>${REPORT_STYLES}</style>
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
