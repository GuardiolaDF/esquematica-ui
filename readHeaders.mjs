import * as xlsx from 'xlsx';
const workbook = xlsx.default.readFile('Proyecto_Esquematica_BASE_Taller_Typo_2_2026.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.default.utils.sheet_to_json(sheet, { header: 1 });
const headers = data[0];
headers.forEach((h, i) => console.log(`${i}: ${h}`));
