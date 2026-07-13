export const REPORT_STYLES = `
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
`
