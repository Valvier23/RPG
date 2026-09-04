/* Se carga después del motor de pasivas para conservar Guardia ofensiva al restaurar parties. */
const implementedBeforeOffensiveGuard = implementedPassivesFor;
implementedPassivesFor = unit => unit.cls === 'warrior'
  ? [...new Set([...implementedBeforeOffensiveGuard(unit), 'Guardia ofensiva'])]
  : implementedBeforeOffensiveGuard(unit);
