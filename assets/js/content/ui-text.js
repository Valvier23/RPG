const UI_TEXT = Object.freeze({
  setup: {
    ready: 'PREPARADO',
    configureField: 'Configura el campo',
    formationSaved: 'La formación se guardará al iniciar.',
    fieldReady: 'Campo preparado.',
    configureUnits: 'Configura las unidades antes de empezar.',
  },
  battle: {
    victory: 'VICTORIA',
    defeat: 'DERROTA',
    victoryLabel: 'Victoria',
    defeatLabel: 'Derrota',
    playAgain: 'Jugar de nuevo',
    realtimeStatus: 'Combate automático en tiempo real · maná +14%/s.',
    realtimeAction: 'Simulación en tiempo real',
    realtimeStart: '— comienza el combate en tiempo real —',
    resolved: (seconds) => `Combate resuelto en ${seconds.toFixed(1)} segundos de simulación.`,
  },
  page: {
    eyebrow: 'prototipo táctico · autobattler en tiempo real',
    rule: 'Las unidades se mueven y atacan automáticamente. La velocidad de ataque determina la frecuencia de sus ataques básicos.',
    activity: 'ACTIVIDAD EN TIEMPO REAL',
  },
  units: {
    ready: 'habilidad lista',
    chargingMana: 'cargando maná',
    neutralTarget: 'objetivo neutral',
    cleared: ' · despejado',
    corpse: (turns) => ` · cadáver ${turns}`,
  },
  actions: {
    randomize: 'Randomizar pasivas y posiciones',
    randomized: '✦ Pasivas y formaciones aleatorizadas. Reiniciar conservará esta configuración hasta la próxima aleatorización.',
    newTerrain: 'Nuevo terreno generado; se conserva la formación y las pasivas actuales.',
  },
  pathfinder: {
    show: 'Mostrar rutas',
    hide: 'Ocultar rutas',
    routeTitle: (actorName) => `${actorName}: ruta hasta la casilla de ataque`,
    targetTitle: (actorName, targetName) => `${actorName} quiere atacar a ${targetName}`,
  },
});

const PAGE_TEMPLATE = "\r\n<header><div><p class=\"eyebrow\">prototipo táctico · turnos por agilidad</p><h1>Squad Tactics</h1></div><p class=\"rule\">La Agilidad fija el orden de cada ronda. En empate, el orden se sortea de nuevo.</p></header>\r\n<section class=\"panel editor\"><h2>Editor de unidad</h2><div><label class=\"label\" for=\"unit-name\">Nombre</label><input class=\"name\" id=\"unit-name\" maxlength=\"14\"><div class=\"class-picker\" id=\"class-picker\"></div><div class=\"level-edit\"><span class=\"label\">Nivel</span><div class=\"step\"><button id=\"level-down\">−</button><b id=\"level-value\">1</b><button id=\"level-up\">+</button></div></div></div><div class=\"stat-grid\" id=\"stat-grid\"></div><div><span class=\"label\">Resultado</span><div class=\"derived\" id=\"derived\"></div></div><button id=\"save\">Guardar unidad</button><p class=\"editor-note\">Cada nivel concede un punto adicional. Cada 20 DEF reduce a la mitad el daño físico restante; los bonos planos y porcentuales cambian DEF, mientras que DUR modifica directamente su multiplicador de daño.</p></section>\r\n<section class=\"layout\"><aside class=\"panel\"><h2>Aliados</h2><div id=\"allies\" class=\"unit-list\"></div><p class=\"editor-note\">Para mover: selecciona un aliado y pulsa una casilla libre de la mitad izquierda.</p></aside>\r\n<section class=\"panel battle\"><div class=\"battle-head\"><span id=\"arena-size\">ARENA · 20 × 12</span><span id=\"round\">PREPARADO</span></div><p class=\"placement\" id=\"placement\"></p><label class=\"speed\">Velocidad <input id=\"speed\" type=\"range\" min=\".5\" max=\"2\" step=\".25\" value=\"1\"><b id=\"speed-label\">1×</b></label><label class=\"speed\">Columnas <input id=\"board-cols\" type=\"range\" min=\"10\" max=\"40\" step=\"1\" value=\"20\"><b id=\"board-cols-label\">20</b></label><label class=\"speed\">Filas <input id=\"board-rows\" type=\"range\" min=\"5\" max=\"40\" step=\"1\" value=\"12\"><b id=\"board-rows-label\">12</b></label><button id=\"apply-size\" class=\"secondary\">Aplicar tamaño</button><label class=\"speed\">Zoom visual <input id=\"grid-zoom\" type=\"range\" min=\".75\" max=\"1.7\" step=\".05\" value=\"1.15\"><b id=\"grid-zoom-label\">115%</b></label><div class=\"terrain-legend\"><span>▦ Hierba</span><span>♣ Bosque</span><span>▲ Montaña</span><span>≈ Arroyo</span><span>═ Puente</span></div><div class=\"turns\"><div class=\"turns-top\"><span>ORDEN DE ACCIÓN</span><b id=\"action\">Configura el campo</b></div><div id=\"turn-list\"></div></div><div id=\"arena-wrap\"><div id=\"arena\"></div></div><div class=\"footer\"><button id=\"fight\">Iniciar combate</button><button id=\"reset\" class=\"secondary\">Reiniciar combate</button><button id=\"new-map\" class=\"secondary\">Nuevo terreno</button><span id=\"status\" class=\"status\"></span></div></section>\r\n<aside class=\"panel\"><h2>Enemigos</h2><div id=\"enemies\" class=\"unit-list\"></div><h2 style=\"margin-top:16px\">Registro</h2><div class=\"log\" id=\"log\"></div></aside></section>\r\n";
document.querySelector('main').innerHTML = PAGE_TEMPLATE;
