import * as xlsx from 'xlsx';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArM4hYO9njIYa_RbLZmT5lHTVqix9PEl0",
  authDomain: "esquematica-ui.firebaseapp.com",
  projectId: "esquematica-ui",
  storageBucket: "esquematica-ui.firebasestorage.app",
  messagingSenderId: "534362941049",
  appId: "1:534362941049:web:e8302f6459349e2e5416a8"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const workbook = xlsx.default.readFile('Proyecto_Esquematica_BASE_Taller_Typo_2_2026.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.default.utils.sheet_to_json(sheet);

const colRRSS = "¿Cuántas horas por día estimás que pasás en redes sociales?";
const colFormat = "En cuanto a duración prefiero:  5=Formatos largos / 1=Formatos cortos";

const mapRRSS = (str) => {
  if (str === "Menos de 1 hora") return 0;
  if (str === "De 1 a 2 hs") return 25;
  if (str === "De 2 a 4 hs") return 50;
  if (str === "De 4 a 6 hs") return 75;
  if (str === "Más de 6 horas") return 100;
  return null;
};

// 1 a 5 mapeado a 0 a 100
const mapFormat = (val) => {
  const num = parseInt(val);
  if (isNaN(num)) return null;
  return (num - 1) * 25; // 1=0, 2=25, 3=50, 4=75, 5=100
};

async function seed() {
  console.log("Limpiando DB antigua...");
  const snapshot = await getDocs(collection(db, 'setups'));
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
  }
  
  console.log("Insertando datos combinados...");
  let count = 0;
  for (const row of data) {
    const rrss = mapRRSS(row[colRRSS]);
    const format = mapFormat(row[colFormat]);
    
    // Solo insertamos si tenemos al menos uno
    if (rrss !== null || format !== null) {
      const docData = {};
      if (rrss !== null) docData[colRRSS] = rrss;
      if (format !== null) docData[colFormat] = format;
      
      await addDoc(collection(db, 'setups'), {
        values: docData,
        timestamp: new Date()
      });
      count++;
    }
  }
  
  console.log(`¡Listo! Se insertaron ${count} encuestas con los 2 parámetros.`);
  process.exit(0);
}

seed();
