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

const parseProgramas = (val) => {
  if (val === 1) return 0;
  if (val === 2) return 25;
  if (val === 3) return 50;
  if (val === 4) return 75;
  if (val === '5 o más') return 100;
  return 50;
}

const parsePestanas = (val) => {
  if (val === 'De 1 a 5') return 0;
  if (val === 'De 6 a 10') return 25;
  if (val === 'De 11 a 20') return 50;
  if (val === 'Más de 20') return 75;
  if (val === 'Más de 50') return 100;
  return 50;
}

const parseVersiones = (val) => {
  if (!val) return 50;
  if (val === 'Sobre escribo el archivo') return 0;
  return 100;
}

const parseNotif = (val) => {
  if (val === 'Silenciadas') return 0;
  if (val === 'Activadas') return 100;
  return 50;
}

async function seed() {
  console.log("Limpiando DB...");
  const snapshot = await getDocs(collection(db, 'setups'));
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
  }
  
  console.log("Masticando Excel e inyectando Todos los Módulos...");
  let count = 0;
  for (const row of data) {
    const docData = {};
    
    // M1
    const formato = parseOrdinal(row["En cuanto a duración prefiero:  5=Formatos largos / 1=Formatos cortos"]);
    if (formato !== null) docData["Formato: Cortos vs Largos"] = 100 - formato; // Inverted: Largo (5) -> 0 (Zen/Left)
    
    const rrss = parseRRSS(row["¿Cuántas horas por día estimás que pasás en redes sociales?"]);
    if (rrss !== null) docData["Horas en Redes Sociales"] = rrss;
    
    docData["Cine (Voracidad)"] = parseCount(row["Nombrá las últimas 5 películas que viste."], 5);
    docData["Música (Voracidad)"] = parseCount(row["Nombrá hasta 5 músicos, bandas o artistas musicales que escuches habitualmente."], 5);
    docData["Libros (Voracidad)"] = parseCount(row["Nombrá hasta 5 libros que recuerdes o te hayan marcado."], 5);
    docData["Diseño IG (Voracidad)"] = parseCount(row["Nombrá hasta 5 cuentas de Instagram que sigas por interés visual/estético."], 5);
    docData["Podcasts (Voracidad)"] = parseCount(row["Nombrá hasta 3 podcasts que escuchaste."], 3);
    docData["Videojuegos (Voracidad)"] = parseCount(row["Nombrá hasta 3 videojuegos que juegues o hayas jugado con frecuencia."], 3);
    docData["Diversidad Cultural"] = parseCount(row["¿Cuáles consumos culturales tenés? "], 8);
    
    const plataformas = row["¿En qué plataforma consumís más contenido audiovisual?"] || "";
    const activePlats = [];
    if (plataformas.toLowerCase().includes("youtube")) activePlats.push("Horas: YouTube");
    if (plataformas.toLowerCase().includes("netflix")) activePlats.push("Horas: Netflix");
    if (plataformas.toLowerCase().includes("tiktok")) activePlats.push("Horas: TikTok");
    if (plataformas.toLowerCase().includes("instagram")) activePlats.push("Horas: Instagram");
    if (plataformas.toLowerCase().includes("spotify")) activePlats.push("Horas: Spotify");
    if (plataformas.toLowerCase().includes("hbo")) activePlats.push("Horas: HBO");
    if (plataformas.toLowerCase().includes("stremio")) activePlats.push("Horas: Stremio");
    if (plataformas.toLowerCase().includes("twitch")) activePlats.push("Horas: Twitch");
    if (plataformas.toLowerCase().includes("mubi")) activePlats.push("Horas: Mubi");
    if (plataformas.toLowerCase().includes("amazon") || plataformas.toLowerCase().includes("prime")) activePlats.push("Horas: Amazon");
    if (plataformas.toLowerCase().includes("disney")) activePlats.push("Horas: Disney");
    if (plataformas.toLowerCase().includes("kick")) activePlats.push("Horas: Kick");

    // Distribute hours randomly based on overall RRSS usage (or default 50 if missing)
    const baseHours = rrss !== null ? rrss : 50;
    
    // Initialize all to 0
    const allPlatforms = ["YouTube", "Netflix", "TikTok", "Instagram", "Spotify", "HBO", "Stremio", "Twitch", "Mubi", "Amazon", "Disney", "Kick"];
    allPlatforms.forEach(p => docData[`Horas: ${p}`] = 0);

    if (activePlats.length > 0) {
      // Allocate the base hours among the active platforms
      activePlats.forEach(p => {
        // Just give them a high usage rating (randomized between 50 and 100) if they mentioned it
        // Or we can just assign the baseHours directly, with a bit of jitter
        const jitter = Math.floor(Math.random() * 20) - 10;
        docData[p] = Math.max(0, Math.min(100, baseHours + jitter));
      });
    }
    
    docData["Frecuencia uso Referencias"] = parseFrecuencia(row["¿Con qué frecuencia visitás sitios de referencia de diseño?"]);
    const impRef = parseOrdinal(row["¿Cuánta importancia le das a utilizar referencias? 5=mucha / 1=nada"]);
    if (impRef !== null) docData["Importancia de Referencias"] = impRef;
    
    // M2
    const boceto = parseOrdinal(row["Frecuencia de boceto a mano 5=Siempre boceto a mano / 1=No boceto a mano"]);
    if (boceto !== null) docData["Boceto a mano"] = boceto;

    const silencio = parseOrdinal(row["¿Qué tanto silencio necesitás para trabajar? 5=Silecnio total / 1=Ningún silencio"]);
    if (silencio !== null) docData["Silencio para trabajar"] = silencio;

    docData["Programas simultáneos"] = parseProgramas(row["¿Cuántos programas tenés abiertos en simultáneo?"]);
    docData["Pestañas abiertas"] = parsePestanas(row["¿Cuántas pestañas tenés abiertas en este momento?"]);
    
    const archivos = parseOrdinal(row["¿Tenés un sistema de nombres/carpetas para tus archivos o es más caótico?"]);
    if (archivos !== null) docData["Archivos sin título"] = 100 - archivos; // Invert: 5=Orden (0% Chaos), 1=Caos (100%)

    docData["Versiones vs Sobrescribir"] = parseVersiones(row["¿Guardás versiones anteriores de un proyecto o sobrescribís siempre el mismo archivo?"]);
    docData["Notificaciones activadas"] = parseNotif(row["¿Trabajás con notificaciones activadas o silenciadas?"]);

    // Invented variables (Mock data 0-100)
    docData["Perfeccionismo"] = Math.floor(Math.random() * 5) * 25; 
    docData["Procrastinacion"] = Math.floor(Math.random() * 5) * 25; 
    docData["Interrupciones"] = Math.floor(Math.random() * 5) * 25; 
    docData["Sindrome impostor"] = Math.floor(Math.random() * 5) * 25; 
    docData["Orden archivos"] = Math.floor(Math.random() * 5) * 25; 

    docData["Pausas programadas"] = Math.random() > 0.5 ? 100 : 0;
    docData["Setup escritorio"] = Math.random() > 0.5 ? 100 : 0;
    docData["Trabajo nocturno"] = Math.random() > 0.5 ? 100 : 0;
    docData["Respaldo nube"] = Math.random() > 0.5 ? 100 : 0;
    docData["Comer escritorio"] = Math.random() > 0.5 ? 100 : 0;

    // M3
    const bajoPresion = parseOrdinal(row["Trabajo mejor: 5=Con tiempo / 1=Bajo presión"]);
    if (bajoPresion !== null) docData["Trabajo bajo presión"] = 100 - bajoPresion; // 1=Presion (100%), 5=Con tiempo (0%)

    const confianza = parseOrdinal(row["¿Cuánta confianza sentís generalmente en tus decisiones de diseño?"]);
    if (confianza !== null) docData["Confianza en decisiones"] = confianza;

    const planificacion = parseOrdinal(row["Dejás el trabajo para último momento 5=Casi siempre / 1=Casi nunca"]);
    if (planificacion !== null) docData["Planificación vs último momento"] = planificacion; // 5=Ultimo momento (100%)

    // Sueño (Parseamos los strings a números limpios)
    const sleepNormalStr = row["¿Cuántas horas dormís habitualmente?"];
    const sleepPreStr = row["¿Cuántas horas dormís habitualmente antes de una entrega?"];
    const parseHours = (str) => {
      if (!str) return null;
      const num = parseInt(str.toString().replace(/[^0-9]/g, ''), 10);
      return isNaN(num) ? null : num;
    };
    const sleepNormal = parseHours(sleepNormalStr);
    const sleepPre = parseHours(sleepPreStr);
    if (sleepNormal !== null) docData["Horas sueno habituales"] = sleepNormal;
    if (sleepPre !== null) docData["Horas sueno pre entrega"] = sleepPre;

    // Variables generadas aleatoriamente (algunas son texto en la DB, binarizamos o mockeamos)
    docData["Comparacion con otros"] = Math.floor(Math.random() * 5) * 25; 
    
    // Emoción dominante (5 opciones) -> 0, 25, 50, 75, 100
    docData["Emocion dominante"] = Math.floor(Math.random() * 5) * 25; 
    
    // Switch de procrastinación
    const proc = Math.random() > 0.3 ? 100 : 0; // 70% procrastina
    docData["Procrastinas"] = proc;
    if (proc === 100) {
      docData["Proc: Redes"] = Math.random() > 0.2 ? 100 : 0;
      docData["Proc: Ordenar"] = Math.random() > 0.5 ? 100 : 0;
      docData["Proc: Gym"] = Math.random() > 0.8 ? 100 : 0;
      docData["Proc: Dormir"] = Math.random() > 0.6 ? 100 : 0;
      docData["Proc: Otras Tareas"] = Math.random() > 0.5 ? 100 : 0;
      docData["Proc: Otros"] = Math.random() > 0.8 ? 100 : 0;
    } else {
      docData["Proc: Redes"] = 0; docData["Proc: Ordenar"] = 0; docData["Proc: Gym"] = 0;
      docData["Proc: Dormir"] = 0; docData["Proc: Otras Tareas"] = 0; docData["Proc: Otros"] = 0;
    }

    docData["Momento mayor frustracion"] = Math.floor(Math.random() * 100);
    docData["Nivel de ansiedad general"] = Math.floor(Math.random() * 100);

    docData["Emociones afectan resultado"] = Math.random() > 0.4 ? 100 : 0;
    docData["Tecnicas de concentracion"] = Math.random() > 0.6 ? 100 : 0;
    docData["Sintomas fisicos"] = Math.random() > 0.3 ? 100 : 0;

    // Demographics
    const age = parseInt(row["Edad"]) || null;
    let ageGroup = "TODAS";
    if (age) {
      if (age <= 22) ageGroup = "18-22";
      else if (age <= 25) ageGroup = "23-25";
      else if (age <= 28) ageGroup = "26-28";
      else if (age <= 32) ageGroup = "29-32";
      else ageGroup = "33+";
    }

    // Trabajo
    const trabStr = String(row["¿Trabajás?"]).toLowerCase();
    const trabaja = (trabStr.includes('sí') || trabStr.includes('si')) ? 'SÍ' : 'NO';

    // Horas de trabajo (sólo si trabaja)
    const horasStr = String(row["Si trabajás, ¿cuántas horas diarias?"] || "").toLowerCase();
    let horasTrabajo = 'N/A';
    if (trabaja === 'SÍ') {
      if (horasStr.includes('menos de 4')) horasTrabajo = '<4';
      else if (horasStr.includes('4 a 6')) horasTrabajo = '4-6';
      else if (horasStr.includes('6 a 8')) horasTrabajo = '6-8';
      else if (horasStr.includes('más de 8')) horasTrabajo = '>8';
      else horasTrabajo = '4-6'; // fallback
    }

    // Modalidad
    const modStr = String(row["Si trabajás, ¿qué tipo modelo laboral usás?"] || "").toLowerCase();
    let modalidad = 'N/A';
    if (trabaja === 'SÍ') {
      if (modStr.includes('híbrido') || modStr.includes('hibrido')) modalidad = 'Híbrido';
      else if (modStr.includes('remoto')) modalidad = 'Remoto';
      else if (modStr.includes('presencial')) modalidad = 'Presencial';
      else modalidad = 'Presencial';
    }

    // Convivencia
    const viveStr = String(row["¿Con quién vivís?"] || "").toLowerCase();
    let convivencia = 'Familia';
    if (viveStr.includes('solo') || viveStr.includes('sola')) convivencia = 'Solo';
    else if (viveStr.includes('pareja') || viveStr.includes('amigues') || viveStr.includes('amigos')) convivencia = 'Pares';
    else convivencia = 'Familia'; // 'Con mis padres' u otros familiares

    // Viaje a FADU
    const viajeStr = String(row["¿Cuánto tiempo viajás para llegar a FADU los viernes?"] || "").toLowerCase();
    let tiempoViaje = '<1H';
    const minMatch = viajeStr.match(/\d+/);
    if (viajeStr.includes('hora') || viajeStr.includes('hs') || viajeStr.includes('hr')) {
      if (minMatch) {
         const hrs = parseInt(minMatch[0]);
         if (hrs >= 2) tiempoViaje = '>2H';
         else tiempoViaje = '1-2H';
      } else {
         if (viajeStr.includes('media')) tiempoViaje = '<1H';
         else if (viajeStr.includes('dos')) tiempoViaje = '>2H';
         else tiempoViaje = '1-2H';
      }
    } else {
      if (minMatch) {
         const mins = parseInt(minMatch[0]);
         if (mins >= 120) tiempoViaje = '>2H';
         else if (mins >= 60) tiempoViaje = '1-2H';
         else tiempoViaje = '<1H';
      }
    }

    const demographics = {
      edad: age,
      edadGroup: ageGroup,
      genero: row["Género"] === 'Femenino' ? 'F' : (row["Género"] === 'Masculino' ? 'M' : 'O'),
      nacionalidad: String(row["¿En qué país naciste?"]).toLowerCase().includes('argen') ? 'Argentino' : 'Extranjero',
      trabaja,
      horasTrabajo,
      modalidad,
      convivencia,
      tiempoViaje
    };

    await addDoc(collection(db, 'setups'), {
      values: docData,
      demographics,
      timestamp: new Date()
    });
    count++;
  }
  
  console.log(`¡Listo! Se insertaron ${count} encuestas con los Módulos 1, 2 y 3 procesados.`);
  process.exit(0);
}

seed();
