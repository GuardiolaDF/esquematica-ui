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

// Helpers
const parseCount = (str, max) => {
  if (!str) return 0;
  const items = str.split(',').map(s => s.trim()).filter(s => s.length > 0);
  const count = items.length;
  return Math.min(100, (count / max) * 100);
};

const parseRRSS = (str) => {
  if (str === "Menos de 1 hora") return 0;
  if (str === "De 1 a 2 hs") return 25;
  if (str === "De 2 a 4 hs") return 50;
  if (str === "De 4 a 6 hs") return 75;
  if (str === "Más de 6 horas") return 100;
  return null;
};

const parseOrdinal = (val) => {
  const num = parseInt(val);
  if (isNaN(num)) return null;
  return (num - 1) * 25;
};

const parseFrecuencia = (str) => {
  if (str === 'Diariamente') return 100;
  if (str === '3 veces por semana') return 75;
  if (str === '1 vez por semana') return 50;
  if (str === '1 vez al mes') return 25;
  if (str === 'Solo cuando lo necesito por trabajo o estudios') return 10;
  if (str === 'No los visito') return 0;
  return 0;
};

async function seed() {
  console.log("Limpiando DB...");
  const snapshot = await getDocs(collection(db, 'setups'));
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
  }
  
  console.log("Masticando Excel e inyectando Módulo 1 completo...");
  let count = 0;
  for (const row of data) {
    const docData = {};
    
    // M1-1: Rotary (Formato)
    const formato = parseOrdinal(row["En cuanto a duración prefiero:  5=Formatos largos / 1=Formatos cortos"]);
    if (formato !== null) docData["Formato: Cortos vs Largos"] = formato;
    
    // M1-22: Horizontal Fader (RRSS)
    const rrss = parseRRSS(row["¿Cuántas horas por día estimás que pasás en redes sociales?"]);
    if (rrss !== null) docData["Horas en Redes Sociales"] = rrss;
    
    // M1 Faders 1-7 (Voracidad)
    docData["Cine (Voracidad)"] = parseCount(row["Nombrá las últimas 5 películas que viste."], 5);
    docData["Música (Voracidad)"] = parseCount(row["Nombrá hasta 5 músicos, bandas o artistas musicales que escuches habitualmente."], 5);
    docData["Libros (Voracidad)"] = parseCount(row["Nombrá hasta 5 libros que recuerdes o te hayan marcado."], 5);
    docData["Diseño IG (Voracidad)"] = parseCount(row["Nombrá hasta 5 cuentas de Instagram que sigas por interés visual/estético."], 5);
    docData["Podcasts (Voracidad)"] = parseCount(row["Nombrá hasta 3 podcasts que escuchaste."], 3);
    docData["Videojuegos (Voracidad)"] = parseCount(row["Nombrá hasta 3 videojuegos que juegues o hayas jugado con frecuencia."], 3);
    docData["Diversidad Cultural"] = parseCount(row["¿Cuáles consumos culturales tenés? "], 8); // Maximo 8 tipos distintos aprox para dar 100%
    
    // M1 Pads 1-4 (Plataformas)
    const plataformas = row["¿En qué plataforma consumís más contenido audiovisual?"] || "";
    docData["Plataforma: YouTube"] = plataformas.includes("Youtube") ? 100 : 0;
    docData["Plataforma: Netflix"] = plataformas.includes("Netflix") ? 100 : 0;
    docData["Plataforma: TikTok"] = plataformas.includes("TikTok") ? 100 : 0;
    docData["Plataforma: Instagram"] = plataformas.includes("Instagram") ? 100 : 0;
    
    // M1 Knobs (Referencias)
    docData["Frecuencia uso Referencias"] = parseFrecuencia(row["¿Con qué frecuencia visitás sitios de referencia de diseño?"]);
    const impRef = parseOrdinal(row["¿Cuánta importancia le das a utilizar referencias? 5=mucha / 1=nada"]);
    if (impRef !== null) docData["Importancia de Referencias"] = impRef;
    
    // --- CÁLCULO DEL ÍNDICE DE CAOS GLOBAL PARA ESTE USUARIO ---
    // Usamos variables de M2 y M3 para determinar su nivel de estrés/caos real
    const sleepPreEntrega = parseInt(row["¿Cuántas horas dormís habitualmente antes de una entrega?"]) || 0;
    const chaosSleep = Math.max(0, 100 - (sleepPreEntrega * 12.5)); // 0hs = 100 caos, 8hs = 0 caos
    
    const procrastination = parseOrdinal(row["Dejás el trabajo para último momento 5=Casi siempre / 1=Casi nunca"]) || 50; // 5 = 100 caos, 1 = 0 caos
    
    const pressure = parseOrdinal(row["Trabajo mejor: 5=Con tiempo / 1=Bajo presión"]) || 50;
    const chaosPressure = 100 - pressure; // 1 (bajo presion) = 100 caos, 5 (con tiempo) = 0 caos
    
    const rrssHours = parseRRSS(row["¿Cuántas horas por día estimás que pasás en redes sociales?"]) || 50;
    
    // Promediamos estos 4 factores para obtener su "Nota de Caos" (0 = Zen, 100 = Caos)
    const chaosIndex = (chaosSleep + procrastination + chaosPressure + rrssHours) / 4;
    
    await addDoc(collection(db, 'setups'), {
      values: docData,
      chaosIndex: chaosIndex, // Guardamos el índice junto a los datos!
      timestamp: new Date()
    });
    count++;
  }
  
  console.log(`¡Listo! Se insertaron ${count} encuestas con TODO el Módulo 1 procesado.`);
  process.exit(0);
}

seed();
