// Información "para humanos" de cada variable, que muestra el panel «Variable seleccionada» del visualizador.
//   cell:     columna del Excel de la que se toma la variable (Proyecto_Esquematica_BASE…xlsx, encabezado en la fila 1,
//             p. ej. 'DO' → «DO-1»). Es null cuando la variable todavía es un dato de prueba generado (seedAll.mjs):
//             cuando se conecte a una pregunta real, alcanza con completar acá la columna.
//   question: la pregunta explicada en forma semántica, para que quien carga datos (o mira el modo colectivo)
//             entienda qué responde ese control.

const v = (cell, question) => ({ cell, question });
const mock = (question) => ({ cell: null, question });

const platform = (cell, name) => v(cell, `¿Cuánto tiempo pasás en ${name}?`);

export const variableInfo = {
  // ── Módulo 1 · Consumos culturales
  'mod1-1': v('DW', '¿Preferís contenidos de formato largo o de formato corto?'),
  'mod1-2': mock('¿Usás el modo avión para concentrarte cuando estudiás?'),
  'mod1-3': v('DP', '¿Cuántas películas viste últimamente?'),
  'mod1-4': v('DR', '¿Cuántos libros recordás que te hayan marcado?'),
  'mod1-5': v('DT', '¿Cuántos podcasts escuchás?'),
  'mod1-6': v('DQ', '¿Cuántos músicos o bandas escuchás habitualmente?'),
  'mod1-7': v('DU', '¿Cuántos videojuegos jugás con frecuencia?'),
  'mod1-8': v('DS', '¿Cuántas cuentas de diseño seguís en Instagram?'),
  'mod1-9': v('DO', '¿Qué variedad de consumos culturales tenés?'),
  'mod1-10': platform('DV', 'YouTube'),
  'mod1-11': platform('DV', 'Spotify'),
  'mod1-12': platform('DV', 'HBO'),
  'mod1-13': platform('DV', 'Netflix'),
  'mod1-14': platform('DV', 'Stremio'),
  'mod1-15': platform('DV', 'TikTok'),
  'mod1-16': platform('DV', 'Disney+'),
  'mod1-17': platform('DV', 'Twitch'),
  'mod1-18': platform('DV', 'Mubi'),
  'mod1-19': platform('DV', 'Instagram'),
  'mod1-20': platform('DV', 'Amazon Prime'),
  'mod1-21': platform('DV', 'Kick'),
  'mod1-22': v('DX', '¿Cuántas horas por día pasás en redes sociales?'),
  'mod1-23': v('BY', '¿Con qué frecuencia visitás sitios de referencia de diseño?'),
  'mod1-24': v('CB', '¿Cuánta importancia le das a usar referencias?'),

  // ── Módulo 2 · Modos de trabajo
  'mod2-1': v('BW', '¿Con qué frecuencia bocetás a mano?'),
  'mod2-2': mock('¿Qué tan perfeccionista sos cuando diseñás?'),
  'mod2-3': mock('¿Cuánto procrastinás cuando tenés que trabajar?'),
  'mod2-4': v('CS', '¿Cuánto silencio necesitás para trabajar?'),
  'mod2-5': mock('¿Hacés pausas programadas mientras trabajás?'),
  'mod2-6': mock('¿Tenés un escritorio armado para diseñar?'),
  'mod2-7': mock('¿Trabajás de noche?'),
  'mod2-8': mock('¿Respaldás tus archivos en la nube?'),
  'mod2-9': v('CQ', '¿Cuántos programas tenés abiertos a la vez?'),
  'mod2-10': v('CO', '¿Cuántas pestañas tenés abiertas?'),
  'mod2-11': v('DK', '¿Qué tan caótica es la organización de tus archivos («Sin título»)?'),
  'mod2-12': v('DJ', '¿Guardás versiones anteriores o sobrescribís siempre el mismo archivo?'),
  'mod2-13': v('CP', '¿Trabajás con las notificaciones activadas?'),
  'mod2-14': mock('¿Comés mientras trabajás en el escritorio?'),
  'mod2-15': mock('¿Cuánto te interrumpen cuando diseñás?'),
  'mod2-16': mock('¿Sentís síndrome del impostor al diseñar?'),
  'mod2-17': mock('¿Qué tan ordenados tenés tus archivos?'),

  // ── Módulo 3 · Salud mental
  'mod3-1': v('CL', '¿Trabajás mejor bajo presión o con tiempo?'),
  'mod3-2': v('EC', '¿Cuánta confianza sentís al tomar decisiones de diseño?'),
  'mod3-3': v('CM', '¿Dejás el trabajo para el último momento?'),
  'mod3-4': mock('¿Te comparás con otros diseñadores?'),
  'mod3-5': mock('¿Qué emoción sentís más mientras diseñás?'),
  'mod3-6': v('CV', '¿Cuántas horas dormís habitualmente?'),
  'mod3-7': v('CW', '¿Cuántas horas dormís antes de una entrega?'),
  'mod3-8': mock('¿Procrastinás cuando tenés que diseñar?'),
  'mod3-9': mock('¿Procrastinás mirando redes sociales?'),
  'mod3-10': mock('¿Procrastinás ordenando cosas?'),
  'mod3-11': mock('¿Procrastinás yendo al gimnasio?'),
  'mod3-12': mock('¿Procrastinás durmiendo?'),
  'mod3-13': mock('¿Procrastinás haciendo otras tareas?'),
  'mod3-14': mock('¿Procrastinás con otras cosas?'),
  'mod3-15': mock('¿En qué momento del proyecto sentís mayor frustración?'),
  'mod3-16': mock('¿Qué nivel de ansiedad sentís en general?'),
  'mod3-17': mock('¿Tus emociones afectan el resultado de tu trabajo?'),
  'mod3-18': mock('¿Usás alguna técnica para concentrarte?'),
  'mod3-19': mock('¿Sentís síntomas físicos de estrés?'),

  // ── Consola · filtros demográficos
  'demo-age': v('B', '¿Qué edad tenés?'),
  'demo-gender': v('G', '¿Con qué género te identificás?'),
  'demo-country': v('E', '¿En qué país naciste?'),
  'demo-work': v('I', '¿Trabajás?'),
  'demo-hours': v('L', 'Si trabajás, ¿cuántas horas por día?'),
  'demo-modality': v('K', 'Si trabajás, ¿en qué modalidad?'),
  'demo-travel': v('S', '¿Cuánto tiempo viajás para llegar a la facultad?'),
  'demo-living': v('P', '¿Con quién vivís?'),
  'demo-avg': mock('¿Qué nivel de estrés tiene el grupo en general?'),
};

// Código que se muestra, como la celda del encabezado: columna + fila 1 → «DO-1».
export const cellCode = (compId) => {
  const cell = variableInfo[compId]?.cell;
  return cell ? `${cell}-1` : '—';
};

// Campo de `demographics` que corresponde a cada filtro de la consola y valores que cuentan como "sin respuesta".
const DEMOGRAPHIC_FIELD = {
  'demo-age': ['edadGroup', ['TODAS']],
  'demo-gender': ['genero', []],
  'demo-country': ['nacionalidad', []],
  'demo-work': ['trabaja', []],
  'demo-hours': ['horasTrabajo', ['N/A']],
  'demo-modality': ['modalidad', ['N/A']],
  'demo-travel': ['tiempoViaje', ['N/A']],
  'demo-living': ['convivencia', ['N/A']],
};

const isAnswer = (x) => x !== undefined && x !== null && x !== '' && !(typeof x === 'number' && Number.isNaN(x));

// Cuántos usuarios respondieron la variable, sobre el total de la muestra.
export const responseStats = (compId, allSetups, dbMap) => {
  const total = allSetups?.length || 0;
  if (!total || !compId) return { answered: 0, total, percent: null };

  let answered = 0;
  if (DEMOGRAPHIC_FIELD[compId]) {
    const [field, empties] = DEMOGRAPHIC_FIELD[compId];
    answered = allSetups.filter(s => { const x = s.demographics?.[field]; return isAnswer(x) && !empties.includes(x); }).length;
  } else if (compId === 'demo-avg') {
    answered = allSetups.filter(s => isAnswer(s.values?.['Nivel de ansiedad general'])).length;
  } else if (dbMap[compId]) {
    answered = allSetups.filter(s => isAnswer(s.values?.[dbMap[compId]])).length;
  }
  return { answered, total, percent: Math.round((answered / total) * 100) };
};
