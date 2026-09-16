export const RACK_LAYOUT = [
  // Columna Izquierda (3 Módulos, 1/3 de alto cada uno)
  { id: 'mod-1', component: 'ControlModule', gridArea: '1 / 1 / 2 / 5', title: 'Módulo 1' },
  { id: 'mod-2', component: 'Module2', gridArea: '2 / 1 / 3 / 5', title: 'Módulo 2' },
  { id: 'mod-3', component: 'Module3', gridArea: '3 / 1 / 4 / 5', title: 'Módulo 3' },
  
  // Visualizador Central (Ocupa el resto de las 8 columnas a la derecha y las 3 filas completas)
  { id: 'mod-vis', component: 'DataVisualizer', gridArea: '1 / 5 / 4 / 13', title: 'Visualizador' },
  
  // Consola (Superpuesta, anclada abajo)
  { 
    id: 'mod-cons', 
    component: 'ConsoleModule', 
    gridArea: '3 / 5 / 4 / 13', 
    title: 'Consola', 
    height: '69.23%',
    alignSelf: 'end',
    className: 'z-10 shadow-[0_0_50px_rgba(0,0,0,0.8)]' 
  },
];
