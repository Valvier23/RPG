# Contexto del proyecto

## Resumen

`Squad Tactics` es un prototipo web de autobattler táctico en tiempo real. Usa un tablero hexagonal, equipos configurables, clases, equipo, pasivas, daño elemental, maná, movimiento automático y estadísticas de combate.

No utiliza framework ni proceso de compilación. Se sirve como HTML, CSS y JavaScript estático.

## Ejecución local

Desde la raíz del proyecto se necesita un servidor HTTP. Durante la sesión actual se está usando `http://127.0.0.1:8000` mediante Node.js.

## Archivos principales

- `index.html`: documento mínimo y orden de carga de scripts.
- `assets/css/styles.css`: todos los estilos.
- `assets/js/content/ui-text.js`: plantilla de página y textos generales ya centralizados.
- `assets/js/content/game-content.es.js`: catálogo español de clases, estadísticas, tipos de daño, equipo, competencias, pasivas, habilidades, descripciones y elementos.
- `party.html`: gestión manual de party (máximo cinco integrantes) con equipo, habilidades, estadísticas y guardado en `localStorage`.
- La party usa la clave local `squad-tactics-party-v1`; al cargar `index.html`, sus miembros sustituyen a los aliados predefinidos del combate.
- `party-enemy.html`: gestión equivalente de la party enemiga, guardada en `squad-tactics-enemy-party-v1`.
- `battle.html`: campo de batalla de producción sin controles de depuración. Reutiliza el mismo tablero hexagonal, recolocación por arrastre y motor visual del laboratorio, pero carga ambas parties guardadas; `index.html` se conserva como laboratorio de pruebas.
- `assets/js/core/`: datos numéricos, estado y reglas fundamentales.
- `assets/js/ui/`: editor y renderizado base.
- `assets/js/units/`: ficha, equipo y gestión del roster.
- `assets/js/map/`: tablero hexagonal y colocación.
- `assets/js/combat/`: combate base, habilidades y motor en tiempo real.
- `assets/js/analytics/`: telemetría y tabla de resultados.
- `TAREAS_PENDIENTES.md`: checklist de deuda y funcionalidades futuras.

## Restricciones arquitectónicas actuales

Los scripts son clásicos y comparten ámbito global. Deben cargarse en el orden actual de `index.html`.

El código evolucionó mediante decoradores: una función se guarda como `fooBeforeX` y después `foo` se redefine. Estas implementaciones anteriores no son automáticamente obsoletas; la siguiente capa las invoca. No deben eliminarse hasta consolidar la cadena completa y validarla.

El motor efectivo al final de la carga es el autobattler en tiempo real. El motor por turnos sigue siendo parte de la cadena de funciones sobre la que se apoyan extensiones posteriores.

## Internacionalización

La centralización está iniciada, pero todavía no está terminada. Los catálogos grandes y la interfaz estática están fuera de la lógica. Aún existen mensajes dinámicos y comparaciones de reglas basadas en nombres españoles dentro de módulos funcionales. La fuente de verdad de este trabajo pendiente es la sección Internacionalización de `TAREAS_PENDIENTES.md`.

Para una solución sólida, los datos de juego deben usar identificadores estables (`piercing_shot`, `fire`, etc.) y resolver sus nombres mediante `t(clave)`. Cambiar únicamente las cadenas actuales puede romper reglas que comparan nombres de pasivas.

## Validación mínima antes de entregar cambios

1. Ejecutar `node --check` sobre todos los `.js`.
2. Confirmar que `index.html` carga los scripts en orden.
3. Servir por HTTP y comprobar respuesta 200.
4. Probar visualmente configuración, arrastre, inicio, habilidades y final de combate.
