const fs = require('fs');
const path = require('path');
const fflate = require('fflate');

const OUT_DIR = path.join(__dirname, '..', 'public', 'sample-docs');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Helper to create a valid minimal .docx file
function createDocx(title, subtitle, sections) {
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  let bodyXml = `
    <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="36"/><w:color w:val="0F172A"/></w:rPr><w:t>${escapeXml(title)}</w:t></w:r></w:p>
    <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:i/><w:sz w:val="24"/><w:color w:val="475569"/></w:rPr><w:t>${escapeXml(subtitle)}</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
  `;

  for (const s of sections) {
    bodyXml += `
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="1E293B"/></w:rPr><w:t>${escapeXml(s.heading)}</w:t></w:r></w:p>
      <w:p><w:r><w:rPr><w:sz w:val="22"/><w:color w:val="334155"/></w:rPr><w:t>${escapeXml(s.text)}</w:t></w:r></w:p>
      <w:p><w:r><w:t></w:t></w:r></w:p>
    `;
  }

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyXml}
  </w:body>
</w:document>`;

  const files = {
    '[Content_Types].xml': fflate.strToU8(contentTypes),
    '_rels/.rels': fflate.strToU8(rootRels),
    'word/document.xml': fflate.strToU8(documentXml),
  };

  return fflate.zipSync(files);
}

// Helper to create a valid minimal .xlsx file
function createXlsx(sheetName, headers, rows) {
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const wbRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

  let sheetData = '';
  // Header row
  sheetData += `<row r="1">`;
  headers.forEach((h, i) => {
    const col = String.fromCharCode(65 + i);
    sheetData += `<c r="${col}1" t="inlineStr"><is><t>${escapeXml(h)}</t></is></c>`;
  });
  sheetData += `</row>`;

  // Data rows
  rows.forEach((row, rowIndex) => {
    const rNum = rowIndex + 2;
    sheetData += `<row r="${rNum}">`;
    row.forEach((val, i) => {
      const col = String.fromCharCode(65 + i);
      const isNum = typeof val === 'number';
      if (isNum) {
        sheetData += `<c r="${col}${rNum}"><v>${val}</v></c>`;
      } else {
        sheetData += `<c r="${col}${rNum}" t="inlineStr"><is><t>${escapeXml(String(val))}</t></is></c>`;
      }
    });
    sheetData += `</row>`;
  });

  const worksheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    ${sheetData}
  </sheetData>
</worksheet>`;

  const files = {
    '[Content_Types].xml': fflate.strToU8(contentTypes),
    '_rels/.rels': fflate.strToU8(rootRels),
    'xl/_rels/workbook.xml.rels': fflate.strToU8(wbRels),
    'xl/workbook.xml': fflate.strToU8(workbook),
    'xl/worksheets/sheet1.xml': fflate.strToU8(worksheet),
  };

  return fflate.zipSync(files);
}

// Helper to create a valid minimal PDF file
function createPdf(title, subtitle, lines) {
  const content = [
    'BT',
    '/F1 18 Tf',
    '50 750 Td',
    `(${escapePdf(title)}) Tj`,
    '/F1 12 Tf',
    '0 -25 Td',
    `(${escapePdf(subtitle)}) Tj`,
    '/F1 10 Tf',
  ];

  let currentY = -25;
  for (const line of lines) {
    content.push(`0 -18 Td`);
    content.push(`(${escapePdf(line)}) Tj`);
  }
  content.push('ET');

  const stream = content.join('\n');
  const streamLen = Buffer.byteLength(stream);

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLen} >>
stream
${stream}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000${(300 + streamLen).toString().padStart(3, '0')} 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${370 + streamLen}
%%EOF`;

  return Buffer.from(pdf, 'utf-8');
}

function escapeXml(unsafe) {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapePdf(text) {
  return String(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

// 1. SOR Word Document
const sorDocx = createDocx(
  'CUSTOMER STATEMENT OF REQUIREMENTS (SOR)',
  'Hexense Labs Private Limited · Tata Motors Limited EV Fleet Division · Doc ID: HLPL-AI4T-SAL-SOR-01',
  [
    { heading: '1.0 Scope & Purpose', text: 'This Customer Statement of Requirements (SOR) establishes the functional, environmental, and statutory requirements for the Tata Ace EV 4G AIS-140 Telematics Gateway (50,000 units).' },
    { heading: '2.0 Hardware & Environmental Specifications', text: 'STM32 automotive MCU, Quectel 4G LTE Cat-1 cellular modem with 2G fallback, Indian NavIC/GPS positioning, 9V-36V operating voltage with ISO 7637-2 transient protection, IP67 enclosure, and CAN 2.0B / J1939 telematics bus.' },
    { heading: '3.0 Quality Governance & Standards', text: 'Compliant with IATF 16949:2016 §8.2.1, ISO 9001:2015 §8.2, AIS-140 Annexure 3 & 8, and ISO 16750-2 environmental tests.' },
    { heading: '4.0 Commercial Deliverables', text: 'Annual commitment: 50,000 units at ₹4,067 per unit. Total contract value: ₹20,33,50,000 ($2.45M). Batch 01 pilot: 5,000 units.' },
    { heading: '5.0 Signatories & Acceptance', text: 'Authorized by Priya Sharma (Sales & BD Lead), Avery Vale (Hardware Lead), and accepted by Rohan Verma (Tata Motors Fleet Manager).' }
  ]
);
fs.writeFileSync(path.join(OUT_DIR, 'HLPL-AI4T-SAL-SOR-01.docx'), sorDocx);
console.log('Created HLPL-AI4T-SAL-SOR-01.docx');

// 2. Bilateral NDA Word & PDF
const ndaDocx = createDocx(
  'BILATERAL MUTUAL NON-DISCLOSURE AGREEMENT',
  'Tata Motors Limited & Hexense Labs Private Limited · Doc ID: HLPL-AI4T-SAL-mNDA-01',
  [
    { heading: '1.0 Purpose', text: 'Governing mutual exchange of proprietary automotive CAN protocol specifications, vehicle telemetry architectures, and battery management data under ISO/IEC 27001 §A.13.' },
    { heading: '2.0 Confidential Information', text: 'Includes schematics, Gerber files, firmware source code, commercial pricing tiers, and battery cell telemetry parameters.' },
    { heading: '3.0 Term & Obligations', text: 'Valid for 5 years from execution date. Data must be stored on encrypted systems adhering to automotive ISO 27001 standards.' }
  ]
);
fs.writeFileSync(path.join(OUT_DIR, 'HLPL-AI4T-SAL-mNDA-01.docx'), ndaDocx);
console.log('Created HLPL-AI4T-SAL-mNDA-01.docx');

const ndaPdf = createPdf(
  'MUTUAL NON-DISCLOSURE AGREEMENT (mNDA-01)',
  'Tata Motors Ltd & Hexense Labs Pvt Ltd · ISO/IEC 27001 §A.13',
  [
    'Document ID: HLPL-AI4T-SAL-mNDA-01 | Effective Date: 10 Aug 2026',
    'Scope: Proprietary CAN telemetry & AIS-140 EV architecture protection.',
    'Classification: Legally Binding Bilateral Confidential Agreement.',
    'Status: Fully Executed & Active across Pune and Noida Tech Centers.'
  ]
);
fs.writeFileSync(path.join(OUT_DIR, 'HLPL-AI4T-SAL-mNDA-01.pdf'), ndaPdf);
console.log('Created HLPL-AI4T-SAL-mNDA-01.pdf');

// 3. Commercial Quotation Excel (.xlsx)
const quoXlsx = createXlsx(
  'Commercial Quotation',
  ['Line Item', 'Description', 'Tier 1 (1k Units)', 'Tier 2 (10k Units)', 'Tier 3 (50k Locked)', 'Unit Savings', 'Annual Total'],
  [
    ['01', 'HLPL-AI4T-01 4G AIS-140 Gateway', '₹4,650', '₹4,320', '₹4,067', '12.5%', '₹20,33,50,000'],
    ['02', 'High-Voltage Battery BMS Cable Harness', '₹420', '₹380', '₹345', '17.8%', '₹1,72,50,000'],
    ['03', 'IP67 Sealed Mounting Bracket Kit', '₹180', '₹150', '₹128', '28.8%', '₹64,00,000'],
    ['04', 'Cloud Telematics MQTT Broker Licence (36 Mo)', 'Included', 'Included', 'Included', '100%', 'Included'],
    ['05', 'Total Commercial Contract Value', '', '', '', '', '₹22,70,00,000']
  ]
);
fs.writeFileSync(path.join(OUT_DIR, 'HLPL-AI4T-SAL-QUO-01.xlsx'), quoXlsx);
console.log('Created HLPL-AI4T-SAL-QUO-01.xlsx');

// 4. ARAI TAC #842 Type Approval Certificate PDF
const tacPdf = createPdf(
  'AUTOMOTIVE RESEARCH ASSOCIATION OF INDIA (ARAI)',
  'Type Approval Certificate (TAC) under AIS-140 Annexure 3 & 8',
  [
    'Certificate Number: ARAI/TAC/2026/842 | Date of Issue: 05 Oct 2026',
    'Manufacturer: Hexense Labs Private Limited (Plant 2 Greater Noida)',
    'Device: 4G Intelligent Telematics Gateway Model HLPL-AI4T-01',
    'Vehicle Fitment Category: M & N Commercial Vehicles (Tata Ace EV)',
    'Standards Verified: AIS-140:2018 (NavIC/GPS, Emergency SOS, Dual IP)',
    'Environmental Compliance: IP67 (ISO 20653) & ISO 7637-2 Electrical Pulses',
    'Result: TYPE APPROVED FOR MASS SERIAL PRODUCTION & VEHICLE REGISTRATION'
  ]
);
fs.writeFileSync(path.join(OUT_DIR, 'QA-TAC-01-AIS140-Certificate.pdf'), tacPdf);
console.log('Created QA-TAC-01-AIS140-Certificate.pdf');

// 5. Pre-Delivery Inspection (PDI) 100% Quality Release Excel (.xlsx)
const pdiXlsx = createXlsx(
  'PDI 100% Release Matrix',
  ['Batch Serial ID', 'IMEI Number', 'eSIM ICCID', 'FW Rev', 'RF Power (dBm)', 'CAN J1939 Ping', 'Sleep Current (uA)', 'PDI Verdict'],
  [
    ['AI4T-2610-0001', '864201061234001', '8991001234567890001', 'v2.1.4', '23.4 dBm', '0 Errors (100%)', '18.2 uA', 'PASSED'],
    ['AI4T-2610-0002', '864201061234002', '8991001234567890002', 'v2.1.4', '23.2 dBm', '0 Errors (100%)', '17.8 uA', 'PASSED'],
    ['AI4T-2610-0003', '864201061234003', '8991001234567890003', 'v2.1.4', '23.6 dBm', '0 Errors (100%)', '19.1 uA', 'PASSED'],
    ['AI4T-2610-0004', '864201061234004', '8991001234567890004', 'v2.1.4', '23.1 dBm', '0 Errors (100%)', '18.4 uA', 'PASSED'],
    ['AI4T-2610-0005', '864201061234005', '8991001234567890005', 'v2.1.4', '23.5 dBm', '0 Errors (100%)', '17.9 uA', 'PASSED'],
    ['Batch Summary', '5,000 Units Tested on Automated Jig', '', '100% Passed', '0 PPM Defect Rate', 'IATF 16949 §8.6', 'Cleared for Shipment', 'RELEASED']
  ]
);
fs.writeFileSync(path.join(OUT_DIR, 'TST-PDI-01-Quality-Release.xlsx'), pdiXlsx);
console.log('Created TST-PDI-01-Quality-Release.xlsx');

// 6. Commercial Tax Invoice & Dispatch Authorization Excel (.xlsx)
const invXlsx = createXlsx(
  'Tax Invoice HLPL-INV-01',
  ['Invoice Item', 'HSN Code', 'Qty', 'Unit Rate', 'Taxable Amount', 'CGST (9%)', 'SGST (9%)', 'Total Amount (INR)'],
  [
    ['HLPL-AI4T-01 Telematics Gateway (Batch 01)', '85269190', 5000, 4067, 20335000, 1830150, 1830150, 23995300],
    ['Battery & BMS Interface Cable Assembly', '85443000', 5000, 345, 1725000, 155250, 155250, 2035500],
    ['Freight & Transit Insurance (Safexpress Direct)', '996511', 1, 85000, 85000, 7650, 7650, 100300],
    ['Total Invoice Value', '', 10001, '', 22145000, 1993050, 1993050, 26131100]
  ]
);
fs.writeFileSync(path.join(OUT_DIR, 'FIN-INV-01-Commercial-Tax-Invoice.xlsx'), invXlsx);
console.log('Created FIN-INV-01-Commercial-Tax-Invoice.xlsx');

// 7. Vehicle Field Installation & Mounting Manual Word (.docx)
const mntDocx = createDocx(
  'VEHICLE FIELD INSTALLATION & MOUNTING MANUAL',
  'Tata Ace EV Commercial Fleet Integration Guide · Doc ID: HLPL-OBD4-SIT-MNT-01',
  [
    { heading: '1.0 Mounting Location', text: 'Secure the IP67 telematics gateway behind the passenger dashboard A-pillar using M5 vibration-damped hex bolts torqued to 4.5 Nm.' },
    { heading: '2.0 Wiring & Pinout Guide', text: 'Pin 1: Constant +12V/24V Battery. Pin 2: Ground. Pin 3: Vehicle Ignition Sense. Pin 4: CAN-High (J1939 250 kbps). Pin 5: CAN-Low.' },
    { heading: '3.0 LED Diagnostic Indicators', text: 'Green LED solid: 4G Cellular Registered. Blue LED 1 Hz flash: GPS/NavIC Lock (3D fix). Orange LED: CAN Bus Telemetry streaming.' },
    { heading: '4.0 Commissioning & QR Scan', text: 'Scan QR code on device housing using Hexense Mobile Technician App to link IMEI to vehicle VIN.' }
  ]
);
fs.writeFileSync(path.join(OUT_DIR, 'HLPL-OBD4-SIT-MNT-01-Mounting-Guide.docx'), mntDocx);
console.log('Created HLPL-OBD4-SIT-MNT-01-Mounting-Guide.docx');

console.log('ALL SAMPLE AUTOMOTIVE DELIVERABLES CREATED SUCCESSFULLY IN public/sample-docs/!');
