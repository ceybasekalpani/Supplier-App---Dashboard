import { downloadBlob, reportDate, timestamp } from './reportShared'
import {
  drawCenteredText, drawRect, drawText, estimateMaxChars, getPdfColumnWidths, getTotalsLayout,
  HEADER_CELL_CHAR_WIDTH, measureRowPlan, planPdfPages, wrapPdfText,
} from './reportPdfDraw'

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
