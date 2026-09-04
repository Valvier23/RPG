const BATTLE_TEXT=Object.freeze({
  title:'Campo de batalla', subtitle:'Encuentro automático · sin herramientas de depuración',
  playerTeam:'Tu party', enemyTeam:'Party enemiga', start:'Iniciar combate', reset:'Restablecer', ready:'Listo para combatir',
  missingPlayer:'Guarda una party aliada en Gestión de party para combatir.', missingEnemy:'Guarda una party enemiga en Gestión de party enemiga para combatir.',
  fighting:'Combate en curso', victory:'Victoria', defeat:'Derrota', draw:'Sin vencedor', turn:'Actividad', hp:'PV', damage:'Daño', defense:'Defensa', speed:'Velocidad',
  waiting:'Esperando a ambos equipos.', startLog:'El combate ha comenzado.', attack:(attacker,target,damage)=>`${attacker} ataca a ${target}: ${damage} de daño.`, result:result=>`Resultado: ${result}.`,
});
