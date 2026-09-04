# Organización del código

Los scripts se cargan en el orden declarado en `index.html`. Se mantienen como
scripts clásicos porque varias capas históricas amplían funciones anteriores y
dependen de compartir el mismo ámbito global.

- `content/ui-text.js`: textos generales de interfaz y mensajes reutilizables.
- `content/game-content.es.js`: contenido español de dominio, incluidos tipos de daño.
- `core/data-and-state.js`: catálogos de clases, equipo y estado inicial.
- `core/rules-and-grid.js`: estadísticas derivadas y reglas básicas del tablero.
- `ui/base-interface.js`: renderizado base, editor y selección.
- `units/loadout-editor.js`: equipo, pasivas y ficha de unidad.
- `units/roster-management.js`: altas, bajas y configuración de equipos.
- `map/hex-grid-and-placement.js`: geometría hexagonal y colocación por arrastre.
- `combat/turn-engine.js`: motor de combate original por turnos.
- `combat/abilities-and-effects.js`: habilidades, efectos y reglas avanzadas.
- `combat/realtime-engine.js`: bucle definitivo del autobattler en tiempo real.
- `analytics/battle-statistics.js`: métricas y tabla de resultados.

Los nombres, descripciones y catálogos propios del dominio viven junto a su
módulo correspondiente. Los textos transversales de interfaz viven en
`content/ui-text.js` para poder modificarlos o traducirlos sin tocar el motor.
