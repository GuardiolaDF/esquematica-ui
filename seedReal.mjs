import * as xlsx from 'xlsx';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";

// Firebase init
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

// Excel init
const workbook = xlsx.default.readFile('Proyecto_Esquematica_BASE_Taller_Typo_2_2026.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.default.utils.sheet_to_json(sheet);

const colName = "¿Cuántas horas por día estimás que pasás en redes sociales?";

// Mapping logic
const mapValue = (str) => {
  if (str === "Menos de 1 hora") return 0;
  if (str === "De 1 a 2 hs") return 25;
  if (str === "De 2 a 4 hs") return 50;
  if (str === "De 4 a 6 hs") return 75;
  if (str === "Más de 6 horas") return 100;
  return null;
};

async function seed() {
  console.log("Limpiando DB antigua...");
  const snapshot = await getDocs(collection(db, 'setups'));
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
  }
  
  console.log("Insertando datos reales...");
  let count = 0;
  for (const row of data) {
    const valStr = row[colName];
    const num = mapValue(valStr);
    
    if (num !== null) {
      await addDoc(collection(db, 'setups'), {
        values: { "¿Cuántas horas por día estimás que pasás en redes sociales?": num },
        timestamp: new Date()
      });
      count++;
    }
  }
  
  console.log(`¡Listo! Se insertaron ${count} respuestas exitosamente.`);
  process.exit(0);
}

seed();
