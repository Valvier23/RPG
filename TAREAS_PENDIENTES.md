# Tareas pendientes

## Internacionalización

- [x] Separar la estructura HTML, CSS y JavaScript.
- [x] Crear un catálogo de contenido español para clases, estadísticas, equipo, pasivas, habilidades, elementos y tipos de daño.
- [x] Mover `DAMAGE_TYPES` al catálogo `game-content.es.js`.
- [x] Mover la plantilla estática de la interfaz fuera de `index.html`.
- [ ] Crear una función estable `t(clave, variables)` con fallback y avisos para claves ausentes.
- [ ] Sustituir los mensajes y plantillas dinámicas que aún están incrustados en funciones de UI, combate y analítica.
- [ ] Separar identificadores internos de los nombres traducidos de pasivas y equipo. Actualmente varias reglas comparan el nombre español.
- [ ] Añadir un segundo catálogo de idioma para validar que ningún texto dependa del español.
- [ ] Añadir selector de idioma y refresco de la interfaz sin reiniciar el combate.
- [ ] Añadir una comprobación automática que falle si aparecen textos visibles fuera de `assets/js/content/`.

## Arquitectura y deuda técnica

- [x] Separar el script original por subsistemas.
- [x] Extraer al CSS los estilos que se inyectaban desde JavaScript.
- [x] Eliminar `cellsAt`, función sin referencias.
- [ ] Consolidar las cadenas de decoradores `*Before*` en implementaciones finales explícitas.
- [ ] Eliminar las implementaciones históricas solo después de consolidar y probar cada cadena.
- [ ] Convertir los scripts clásicos en módulos ES con imports y exports explícitos.
- [ ] Encapsular el estado global del combate en un objeto o store.
- [ ] Separar reglas puras de combate del acceso al DOM.
- [ ] Añadir pruebas para daño, resistencias, pathfinding, pasivas y finalización del combate.
- [ ] Añadir una prueba de humo de navegador para carga, configuración y combate completo.

## Funcionalidades de jugador

- [x] Crear una página de gestión manual de party, limitada a cinco integrantes y con guardado local.
- [x] Conectar la party guardada con los aliados del campo de batalla y compartir reglas de nivel, estadísticas, equipo y pasivas.
- [x] Separar el campo de batalla de producción del laboratorio de depuración y conectarlo a parties aliadas y enemigas guardadas.
- [ ] Crear una pantalla de inicio con partida nueva, continuar partida y configuración.
- [ ] Permitir guardar varias composiciones de equipo con nombre.
- [ ] Permitir duplicar, renombrar y eliminar composiciones.
- [ ] Añadir importación y exportación de equipos mediante JSON descargable.
- [ ] Añadir historial de combates con resultado, duración y estadísticas.
- [ ] Permitir repetir un combate usando la misma semilla de mapa.
- [ ] Añadir pausa, reanudación y velocidad configurable durante el autobattler.
- [ ] Añadir modo de observación sin edición de unidades.
- [ ] Añadir herramienta para comparar dos unidades antes de iniciar el combate.

## Gameplay y combate

- [ ] Diseñar condiciones de victoria y derrota adicionales a eliminar todo el equipo.
- [ ] Añadir objetivos de misión: escolta, supervivencia, captura y control de zonas.
- [ ] Añadir iniciativa, prioridades y comportamiento configurable por unidad.
- [ ] Añadir estados alterados completos: quemadura, congelación, veneno, silencio y aturdimiento.
- [ ] Añadir duración, acumulación, resistencia y limpieza de estados alterados.
- [ ] Completar interacciones elementales entre fuego, hielo, viento, rayo y luz.
- [ ] Añadir ataques de área con selección y previsualización de casillas.
- [ ] Añadir línea de visión y bloqueo de proyectiles por terreno y unidades.
- [ ] Añadir cobertura, altura y ventajas tácticas del terreno.
- [ ] Añadir daño crítico, daño mínimo y mitigación con reglas visibles para el jugador.
- [ ] Añadir telemetría de cada acción para poder revisar por qué ocurrió un resultado.
- [ ] Añadir repetición paso a paso de un combate terminado.
- [ ] Equilibrar clases, pasivas, resistencias, alcance, movilidad y tiempos de recarga.

## Progresión y construcción de unidades

- [ ] Definir un sistema de experiencia y subida de nivel durante una campaña.
- [ ] Convertir las pasivas en un árbol de decisiones con requisitos y coste.
- [ ] Permitir respetar o reiniciar puntos de estadísticas y pasivas.
- [ ] Añadir estadísticas derivadas visibles con explicación de cada fórmula.
- [ ] Implementar ranuras de arma secundaria, accesorio y consumible.
- [ ] Añadir rareza, estadísticas y efectos únicos al equipamiento.
- [ ] Añadir inventario, obtención, venta y mejora de equipo.
- [ ] Añadir sinergias entre clases, pasivas y piezas de equipo.
- [ ] Añadir unidades neutrales, jefes y variantes de élite.

## Mapas y contenido

- [ ] Crear un selector de mapas con dificultad y descripción.
- [ ] Añadir semillas visibles para reproducir mapas generados.
- [ ] Añadir biomas y conjuntos de reglas de terreno por mapa.
- [ ] Añadir obstáculos, puertas, zonas de peligro y casillas interactivas.
- [ ] Añadir editor de mapas para colocar terreno y posiciones iniciales.
- [ ] Añadir encuentros de campaña y recompensas entre combates.
- [ ] Añadir tutorial guiado para colocación, estadísticas, pasivas y combate.
- [ ] Añadir desafíos diarios o escenarios con reglas modificadas.

## IA y sistemas de simulación

- [ ] Definir perfiles de IA: agresiva, defensiva, apoyo, control y cazadora de objetivos.
- [ ] Mejorar selección de objetivos con amenaza, alcance, peligro y valor táctico.
- [ ] Evitar bloqueos y oscilaciones de movimiento en mapas congestionados.
- [ ] Añadir predicción de daño y evaluación de riesgo para decisiones de IA.
- [ ] Permitir que la IA use objetos, consumibles y habilidades de apoyo.
- [ ] Añadir determinismo opcional mediante semilla para depuración y repeticiones.
- [ ] Añadir límites de seguridad para bucles, rutas imposibles y combates interminables.

## UX, accesibilidad y presentación

- [ ] Añadir panel de ayuda contextual para reglas, iconos, estados y fórmulas.
- [ ] Añadir leyenda interactiva del terreno y modo de alto contraste.
- [ ] Añadir navegación completa por teclado y foco visible.
- [ ] Añadir etiquetas accesibles y anuncios para cambios de vida, turno y resultado.
- [ ] Añadir filtros para pasivas, equipo, clases y estadísticas.
- [ ] Añadir previsualización de alcance, ruta, daño y casillas afectadas.
- [ ] Añadir animaciones y efectos de sonido configurables.
- [ ] Añadir diseño responsive para móvil y tablet.
- [ ] Añadir mensajes de error y validación para nombres, equipos y configuraciones inválidas.

## Sistemas de aplicación

- [ ] Añadir configuración persistente: idioma, volumen, velocidad, zoom y accesibilidad.
- [ ] Añadir guardado automático y recuperación ante cierre accidental.
- [ ] Añadir versión de datos guardados y migraciones.
- [ ] Añadir estadísticas globales de campaña y de cada unidad.
- [ ] Añadir sistema de logros y objetivos desbloqueables.
- [ ] Añadir soporte para contenido configurable sin editar JavaScript.
- [ ] Añadir validación de datos de clases, mapas, equipo y pasivas al cargar.
- [ ] Añadir exportación de informes de combate en HTML o CSV.

## Funcionalidad futura identificada

- [ ] Completar las pasivas descritas pero todavía no implementadas.
- [ ] Persistir configuraciones y formaciones entre sesiones.
- [ ] Permitir importar y exportar equipos.
- [ ] Mejorar accesibilidad y navegación mediante teclado.
