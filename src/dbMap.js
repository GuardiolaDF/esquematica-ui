export const dbMap = {
  // Módulo 1 - Consumos y Medios
  "mod1-1": "Formato: Cortos vs Largos", 
  "mod1-2": "Modo avión (Estudio)",
  "mod1-22": "Horas en Redes Sociales",
  "mod1-3": "Cine (Voracidad)",
  "mod1-4": "Libros (Voracidad)",
  "mod1-5": "Podcasts (Voracidad)",
  "mod1-6": "Música (Voracidad)",
  "mod1-7": "Videojuegos (Voracidad)",
  "mod1-8": "Diseño IG (Voracidad)",
  "mod1-9": "Diversidad Cultural",
  "mod1-10": "Horas: YouTube",
  "mod1-11": "Horas: Spotify",
  "mod1-12": "Horas: HBO",
  "mod1-13": "Horas: Netflix",
  "mod1-14": "Horas: Stremio",
  "mod1-15": "Horas: TikTok",
  "mod1-16": "Horas: Disney",
  "mod1-17": "Horas: Twitch",
  "mod1-18": "Horas: Mubi",
  "mod1-19": "Horas: Instagram",
  "mod1-20": "Horas: Amazon",
  "mod1-21": "Horas: Kick",
  "mod1-23": "Frecuencia uso Referencias",
  "mod1-24": "Importancia de Referencias",

  // Módulo 2 - Forma de Trabajar
  "mod2-1": "Boceto a mano",
  "mod2-2": "Perfeccionismo",
  "mod2-3": "Procrastinacion",
  "mod2-4": "Silencio para trabajar",
  "mod2-5": "Pausas programadas",
  "mod2-6": "Setup escritorio",
  "mod2-7": "Trabajo nocturno",
  "mod2-8": "Respaldo nube",
  "mod2-9": "Programas simultáneos",
  "mod2-10": "Pestañas abiertas",
  "mod2-11": "Archivos sin título",
  "mod2-12": "Versiones vs Sobrescribir",
  "mod2-13": "Notificaciones activadas",
  "mod2-14": "Comer escritorio",
  "mod2-15": "Interrupciones",
  "mod2-16": "Sindrome impostor",
  "mod2-17": "Orden archivos",

  // Módulo 3 - Ansiedad y Estrés
  "mod3-1": "Trabajo bajo presión",
  "mod3-2": "Confianza en decisiones",
  "mod3-3": "Planificación vs último momento",
  "mod3-4": "Comparacion con otros",
  "mod3-5": "Emocion dominante",
  "mod3-6": "Horas sueno habituales",
  "mod3-7": "Horas sueno pre entrega",
  "mod3-8": "Procrastinas",
  "mod3-9": "Proc: Redes",
  "mod3-10": "Proc: Ordenar",
  "mod3-11": "Proc: Gym",
  "mod3-12": "Proc: Dormir",
  "mod3-13": "Proc: Otras Tareas",
  "mod3-14": "Proc: Otros",
  "mod3-15": "Momento mayor frustracion",
  "mod3-16": "Nivel de ansiedad general",
  "mod3-17": "Emociones afectan resultado",
  "mod3-18": "Tecnicas de concentracion",
  "mod3-19": "Sintomas fisicos",

  // Consola / Demografía
  "demo-age": "Filtro: Edad",
  "demo-gender": "Filtro: Género",
  "demo-career": "Filtro: Carrera",
  "demo-xp": "Filtro: Años de experiencia",
  "demo-work": "Filtro: Trabajo",
  "demo-hours": "Filtro: Horas de trabajo",
  "demo-modality": "Filtro: Modalidad de trabajo",
  "demo-avg": "Visualizar Promedio",
  "demo-country": "Filtro: País",
  "demo-travel": "Filtro: Tiempo de Viaje",
  "demo-living": "Filtro: Convivencia"
};

export const reverseDbMap = Object.entries(dbMap).reduce((acc, [compId, dbKey]) => {
  acc[dbKey] = compId;
  return acc;
}, {});


export const dbMetadata = {
  "mod1-1": {
    label: "Formato",
    dataType: "categorical",
    routable: true,
    visualizations: ["spectrum"]
  },
  "mod1-2": {
    label: "Modo avión (Estudio)",
    dataType: "categorical",
    routable: true,
    visualizations: ["spectrum"]
  },
  "mod1-22": {
    label: "Horas en Redes Sociales",
    dataType: "numeric",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod1-3": {
    label: "Cine (Voracidad)",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod1-4": {
    label: "Libros (Voracidad)",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod1-5": {
    label: "Podcasts (Voracidad)",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod1-6": {
    label: "Música (Voracidad)",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod1-7": {
    label: "Videojuegos (Voracidad)",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod1-8": {
    label: "Diseño IG (Voracidad)",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod1-9": {
    label: "Diversidad Cultural",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod1-10": {
    label: "Horas",
    dataType: "numeric",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod1-11": {
    label: "Horas",
    dataType: "numeric",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod1-12": {
    label: "Horas",
    dataType: "numeric",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod1-13": {
    label: "Horas",
    dataType: "numeric",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod1-14": {
    label: "Horas",
    dataType: "numeric",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod1-15": {
    label: "Horas",
    dataType: "numeric",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod1-16": {
    label: "Horas",
    dataType: "numeric",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod1-17": {
    label: "Horas",
    dataType: "numeric",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod1-18": {
    label: "Horas",
    dataType: "numeric",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod1-19": {
    label: "Horas",
    dataType: "numeric",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod1-20": {
    label: "Horas",
    dataType: "numeric",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod1-21": {
    label: "Horas",
    dataType: "numeric",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod1-23": {
    label: "Frecuencia uso Referencias",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod1-24": {
    label: "Importancia de Referencias",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod2-1": {
    label: "Boceto a mano",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod2-2": {
    label: "Perfeccionismo",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod2-3": {
    label: "Procrastinacion",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod2-4": {
    label: "Silencio para trabajar",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod2-5": {
    label: "Pausas programadas",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod2-6": {
    label: "Setup escritorio",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod2-7": {
    label: "Trabajo nocturno",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod2-8": {
    label: "Respaldo nube",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod2-9": {
    label: "Programas simultáneos",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod2-10": {
    label: "Pestañas abiertas",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod2-11": {
    label: "Archivos sin título",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod2-12": {
    label: "Versiones vs Sobrescribir",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod2-13": {
    label: "Notificaciones activadas",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod2-14": {
    label: "Comer escritorio",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod2-15": {
    label: "Interrupciones",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod2-16": {
    label: "Sindrome impostor",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod2-17": {
    label: "Orden archivos",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod3-1": {
    label: "Trabajo bajo presión",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod3-2": {
    label: "Confianza en decisiones",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod3-3": {
    label: "Planificación vs último momento",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod3-4": {
    label: "Comparacion con otros",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod3-5": {
    label: "Emocion dominante",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod3-6": {
    label: "Horas sueno habituales",
    dataType: "numeric",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod3-7": {
    label: "Horas sueno pre entrega",
    dataType: "numeric",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod3-8": {
    label: "Procrastinas",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod3-9": {
    label: "Proc",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod3-10": {
    label: "Proc",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod3-11": {
    label: "Proc",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod3-12": {
    label: "Proc",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod3-13": {
    label: "Proc",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod3-14": {
    label: "Proc",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod3-15": {
    label: "Momento mayor frustracion",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod3-16": {
    label: "Nivel de ansiedad general",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod3-17": {
    label: "Emociones afectan resultado",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod3-18": {
    label: "Tecnicas de concentracion",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "mod3-19": {
    label: "Sintomas fisicos",
    dataType: "scale",
    routable: true,
    visualizations: ["spectrum", "relation"]
  },
  "demo-age": {
    label: "Filtro",
    dataType: "scale",
    routable: false,
    visualizations: ["spectrum", "relation"]
  },
  "demo-gender": {
    label: "Filtro",
    dataType: "scale",
    routable: false,
    visualizations: ["spectrum", "relation"]
  },
  "demo-career": {
    label: "Filtro",
    dataType: "scale",
    routable: false,
    visualizations: ["spectrum", "relation"]
  },
  "demo-xp": {
    label: "Filtro",
    dataType: "scale",
    routable: false,
    visualizations: ["spectrum", "relation"]
  },
  "demo-work": {
    label: "Filtro",
    dataType: "scale",
    routable: false,
    visualizations: ["spectrum", "relation"]
  },
  "demo-hours": {
    label: "Filtro",
    dataType: "scale",
    routable: false,
    visualizations: ["spectrum", "relation"]
  },
  "demo-modality": {
    label: "Filtro",
    dataType: "scale",
    routable: false,
    visualizations: ["spectrum", "relation"]
  },
  "demo-avg": {
    label: "Visualizar Promedio",
    dataType: "scale",
    routable: false,
    visualizations: ["spectrum", "relation"]
  },
  "demo-country": {
    label: "Filtro",
    dataType: "scale",
    routable: false,
    visualizations: ["spectrum", "relation"]
  },
  "demo-travel": {
    label: "Filtro",
    dataType: "scale",
    routable: false,
    visualizations: ["spectrum", "relation"]
  },
  "demo-living": {
    label: "Filtro",
    dataType: "scale",
    routable: false,
    visualizations: ["spectrum", "relation"]
  },
};