/* Guardia ofensiva: pasiva compartida entre la gestión de party y el combate. */
if (!LAB_IMPLEMENTED_PASSIVES.warrior.includes('Guardia ofensiva')) {
  LAB_IMPLEMENTED_PASSIVES.warrior.push('Guardia ofensiva');
}
GAME_CONTENT.passiveDescriptions['Guardia ofensiva'] =
  'Convierte el 33% de los puntos de Defensa en ataque adicional.';

/* Amplía el validador de pasivas del combate sin cambiar las demás clases. */
if (typeof implementedPassivesFor === 'function') {
  const implementedBeforeOffensiveGuard = implementedPassivesFor;
  implementedPassivesFor = unit => unit.cls === 'warrior'
    ? [...new Set([...implementedBeforeOffensiveGuard(unit), 'Guardia ofensiva'])]
    : implementedBeforeOffensiveGuard(unit);
}
