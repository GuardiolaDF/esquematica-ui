import * as xlsx from 'xlsx';

const workbook = xlsx.default.readFile('Proyecto_Esquematica_BASE_Taller_Typo_2_2026.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.default.utils.sheet_to_json(sheet);

const colName = "¿Cuántas horas por día estimás que pasás en redes sociales?";

const uniqueValues = {};
data.forEach(row => {
    const val = row[colName];
    if (val) {
        uniqueValues[val] = (uniqueValues[val] || 0) + 1;
    }
});

console.log("Valores únicos para Redes Sociales y sus conteos:");
console.log(uniqueValues);
