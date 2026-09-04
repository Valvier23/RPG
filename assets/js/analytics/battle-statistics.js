/* Estadísticas de combate: resumen persistente al final de la página. */

document.querySelector('main').insertAdjacentHTML('beforeend','<section class="panel combat-stats"><h2>Análisis del combate</h2><div id="combat-stats"></div></section>');
let battleStats;
function resetBattleStats(){battleStats={turns:0,rounds:0,finished:false,units:new Map(units.map(u=>[u.id,{hitsTaken:0,damageTaken:0,damageDealt:0,turnsTaken:0}]))};renderBattleStats()}
function unitBattleStats(u){if(!battleStats.units.has(u.id))battleStats.units.set(u.id,{hitsTaken:0,damageTaken:0,damageDealt:0,turnsTaken:0});return battleStats.units.get(u.id)}
function renderBattleStats(){const host=$('#combat-stats');if(!host||!battleStats)return;const phase=battleStats.finished?'Combate terminado':running?'Combate en curso':'Aún no se ha iniciado un combate',summary=`<div class="combat-stats-summary"><span><b>${phase}</b></span><span>Rondas: <b>${battleStats.rounds||roundNo}</b></span><span>Turnos resueltos: <b>${battleStats.turns}</b></span></div>`,rows=units.map(u=>{const s=unitBattleStats(u),state=u.hp<=0?'Derrotada':`En pie · ${Math.ceil(u.hp)}/${u.maxHp} HP`,passives=(u.selectedPassives||[]).join(', ')||'—';return `<tr class="${u.team}"><td>${u.team==='enemy'?'Enemigo':'Aliado'}</td><td>${u.name}</td><td>${passives}</td><td>${state}</td><td>${s.hitsTaken}</td><td>${Math.round(s.damageTaken)}</td><td>${Math.round(s.damageDealt)}</td><td>${s.turnsTaken}</td></tr>`}).join('');host.innerHTML=summary+(rows?`<table class="combat-stats-table"><thead><tr><th>Equipo</th><th>Unidad</th><th>Pasivas</th><th>Estado final</th><th>Impactos recibidos</th><th>Daño recibido</th><th>Daño causado</th><th>Turnos</th></tr></thead><tbody>${rows}</tbody></table>`:'<p class="combat-stats-empty">Configura e inicia un combate para generar estadísticas.</p>')}
const setupBeforeCombatStats=setup;
setup=()=>{setupBeforeCombatStats();resetBattleStats()};
const damageBeforeCombatStats=damage;
damage=(a,t,raw)=>{const targetWasAlive=t?.hp>0,dealt=damageBeforeCombatStats(a,t,raw);if(battleStats&&targetWasAlive&&raw>0){const target=unitBattleStats(t);target.hitsTaken++;target.damageTaken+=Math.max(0,dealt);if(a){const attacker=unitBattleStats(a);attacker.damageDealt+=Math.max(0,dealt)}}return dealt};
const takeTurnBeforeCombatStats=takeTurn;
takeTurn=()=>{if(running&&battleStats){battleStats.turns++;const actor=queue[0];if(actor)unitBattleStats(actor).turnsTaken++}takeTurnBeforeCombatStats();renderBattleStats()};
const endBeforeCombatStats=end;
end=()=>{endBeforeCombatStats();if(battleStats){battleStats.finished=true;battleStats.rounds=roundNo;renderBattleStats()}};
resetBattleStats();

/* Formación inicial por rol y pasivas aleatorias para ambos equipos. */
const RANDOM_PASSIVE_POOL={
  warrior:['Furia','Berserk','Sangre caliente'],
  archer:['Flecha marcada','Ojo de halcón','Flecha elemental','Tirador experto','Disparo perforante','Paso atrás','Fijación','Disparo rápido'],
  mage:['Mago elemental','Mago de combate','Afinidad sanadora','Fragmentación'],
  assassin:['Salto sombrío'],
  tank:['Desafío']
};
function assignRandomPassive(u){const choices=(RANDOM_PASSIVE_POOL[u.cls]||[]).filter(p=>implementedPassivesFor(u).includes(p));if(!choices.length)return;const passive=choices[Math.floor(Math.random()*choices.length)];u.selectedPassives=[passive];u.specialSelected=passive===SPECIAL_PASSIVE_NAMES[u.cls];u.specialEnabled=true;if(u.cls==='mage'&&passive==='Mago elemental')u.equipment={...(u.equipment||{}),element:Object.keys(MAGE_ELEMENTS)[Math.floor(Math.random()*Object.keys(MAGE_ELEMENTS).length)]}}
function tacticalRows(count){const middle=(H-1)/2,rows=Array.from({length:H},(_,row)=>row);return rows.sort((a,b)=>(Math.abs(a-middle)+Math.random()*2)-(Math.abs(b-middle)+Math.random()*2)).slice(0,count)}
function formationRole(cls){return cls==='tank'?0:cls==='warrior'?1:cls==='assassin'?2:3}
placeStartingUnits=()=>{const frontColumn=Math.max(0,Math.floor(W*.45)-1);for(const team of ['ally','enemy']){const side=roster.filter(u=>u.team===team).sort((a,b)=>formationRole(a.cls)-formationRole(b.cls)||a.name.localeCompare(b.name)),rows=tacticalRows(side.length);side.forEach((u,index)=>{const rank=formationRole(u.cls),variation=Math.random()<.5?0:1,depth=Math.min(frontColumn,rank+variation),x=team==='ally'?frontColumn-depth:W-1-frontColumn+depth;u.pos={x:Math.max(0,Math.min(W-1,x)),y:rows[index]}})}};
const setupBeforeTacticalTeams=setup;
setup=()=>{setupBeforeTacticalTeams();units.filter(u=>u.team==='ally'||u.team==='enemy').forEach(assignRandomPassive);units.filter(u=>u.team!=='dummy').forEach(u=>{u.maxHp=derived(u).hp;u.hp=u.maxHp});resetBattleStats();render()};
formation={};placeStartingUnits();setup();loadEditor();render();log('Formación táctica aplicada: frente blindado, flanco móvil y retaguardia a distancia.');

const speedControl=$('#speed'),speedLabel=$('#speed-label'),megaTurbo=document.createElement('button');
speedControl.max='10';speedControl.step='.25';
megaTurbo.type='button';megaTurbo.className='secondary mega-turbo';megaTurbo.textContent='Mega turbo ×10';
speedControl.closest('label').insertAdjacentElement('afterend',megaTurbo);
megaTurbo.onclick=()=>{speed=10;speedControl.value='10';speedLabel.textContent='10×';if(running)schedule()};
const battleStatsSort={key:'team',direction:1};
function battleSortValue(u,key){const s=unitBattleStats(u);if(key==='team')return u.team==='ally'?0:u.team==='enemy'?1:2;if(key==='name')return u.name;if(key==='class')return CLASSES[u.cls]?.label||u.cls;if(key.startsWith('passive-'))return (u.selectedPassives||[])[+key.slice(8)]||'';if(key==='state')return u.hp;return s[key]??''}
function sortableHeader(label,key){const active=battleStatsSort.key===key,arrow=active?(battleStatsSort.direction>0?' ↑':' ↓'):'';return `<th><button class="combat-sort" data-combat-sort="${key}">${label}${arrow}</button></th>`}
renderBattleStats=()=>{const host=$('#combat-stats');if(!host||!battleStats)return;const phase=battleStats.finished?'Combate terminado':running?'Combate en curso':'Aún no se ha iniciado un combate',passiveColumns=Math.max(0,...units.map(u=>(u.selectedPassives||[]).length)),summary=`<div class="combat-stats-summary"><span><b>${phase}</b></span><span>Rondas: <b>${battleStats.rounds||roundNo}</b></span><span>Turnos resueltos: <b>${battleStats.turns}</b></span></div>`,ordered=[...units].sort((a,b)=>{const av=battleSortValue(a,battleStatsSort.key),bv=battleSortValue(b,battleStatsSort.key),result=typeof av==='number'&&typeof bv==='number'?av-bv:String(av).localeCompare(String(bv),'es');return result*battleStatsSort.direction}),headers=[sortableHeader('Equipo','team'),sortableHeader('Unidad','name'),sortableHeader('Clase','class'),...Array.from({length:passiveColumns},(_,i)=>sortableHeader(`Pasiva ${i+1}`,`passive-${i}`)),sortableHeader('Estado final','state'),sortableHeader('Impactos recibidos','hitsTaken'),sortableHeader('Daño recibido','damageTaken'),sortableHeader('Daño causado','damageDealt'),sortableHeader('Turnos','turnsTaken')].join(''),rows=ordered.map(u=>{const s=unitBattleStats(u),state=u.hp<=0?'Derrotada':`En pie · ${Math.ceil(u.hp)}/${u.maxHp} HP`,passives=Array.from({length:passiveColumns},(_,i)=>`<td>${(u.selectedPassives||[])[i]||'—'}</td>`).join('');return `<tr class="${u.team}"><td>${u.team==='enemy'?'Enemigo':u.team==='ally'?'Aliado':'Neutral'}</td><td>${u.name}</td><td>${CLASSES[u.cls]?.label||u.cls}</td>${passives}<td>${state}</td><td>${s.hitsTaken}</td><td>${Math.round(s.damageTaken)}</td><td>${Math.round(s.damageDealt)}</td><td>${s.turnsTaken}</td></tr>`}).join('');host.innerHTML=summary+(rows?`<div class="combat-stats-scroll"><table class="combat-stats-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`:'<p class="combat-stats-empty">Configura e inicia un combate para generar estadísticas.</p>')};

$('#combat-stats').addEventListener('click',event=>{const button=event.target.closest('[data-combat-sort]');if(!button)return;const key=button.dataset.combatSort;battleStatsSort.direction=battleStatsSort.key===key?-battleStatsSort.direction:1;battleStatsSort.key=key;renderBattleStats()});
renderBattleStats();
/* Reparto de objetivos y rutas: evitar persecuciones cruzadas y atascos sin romper el aggro fijado. */
function isMeleeUnit(u){return ['tank','warrior','assassin'].includes(u.cls)}
function canReachAttackPosition(a,t){return dist(a,t)<=derived(a).range||path(a,t).length>0}
function activeFocusers(target,team,exclude){return units.filter(u=>u.id!==exclude.id&&u.team===team&&u.hp>0&&isMeleeUnit(u)&&u.aggroTargetId===target.id).length}
nearest=a=>{
  if(a.team==='dummy')return null;
  const dummies=alive('dummy'),candidates=dummies.length?dummies:alive(a.team==='ally'?'enemy':'ally');
  if(!candidates.length){delete a.aggroTargetId;return null}
  const forced=candidates.find(t=>a.tauntTarget===t.id&&a.tauntTurns>0);
  if(forced){a.aggroTargetId=forced.id;return forced}
  const current=candidates.find(t=>t.id===a.aggroTargetId);
  if(current&&canReachAttackPosition(a,current))return current;
  if(current)delete a.aggroTargetId;
  const reachable=candidates.filter(t=>canReachAttackPosition(a,t)),pool=reachable.length?reachable:candidates;
  const nearestDistance=Math.min(...pool.map(t=>dist(a,t))),closest=pool.filter(t=>dist(a,t)===nearestDistance);
  let chosen=closest.sort((x,y)=>x.id.localeCompare(y.id))[0];
  if(isMeleeUnit(a)){
    const nearby=pool.filter(t=>dist(a,t)<=nearestDistance+2),unclaimed=nearby.filter(t=>activeFocusers(t,a.team,a)===0);
    if(unclaimed.length)chosen=unclaimed.sort((x,y)=>dist(a,x)-dist(a,y)||x.id.localeCompare(y.id))[0];
  }
  a.aggroTargetId=chosen.id;
  return chosen;
};

/* Telemetría detallada: acciones y procedencia del daño. */
function detailedUnitStats(u){const s=unitBattleStats(u),defaults={turnsMoving:0,turnsAttacking:0,abilitiesUsed:0,basicDamage:0,abilityDamage:0,hitsDealt:0,basicHits:0,abilityHits:0,kills:0};for(const [key,value] of Object.entries(defaults))if(s[key]==null)s[key]=value;return s}
let combatDamageSource='basic',activeCombatTurn=null;
const damageBeforeDetailedStats=damage;
damage=(a,t,raw)=>{const targetWasAlive=t?.hp>0,dealt=damageBeforeDetailedStats(a,t,raw),effective=Math.max(0,dealt);if(battleStats&&a&&targetWasAlive&&raw>0){const s=detailedUnitStats(a),ability=combatDamageSource==='ability';s.hitsDealt++;s[ability?'abilityHits':'basicHits']++;s[ability?'abilityDamage':'basicDamage']+=effective;if(t.hp<=0)s.kills++;if(activeCombatTurn?.actorId===a.id)activeCombatTurn.attacked=true}return dealt};
const skillBeforeDetailedStats=skill;
skill=(a,t)=>{const previousSource=combatDamageSource;combatDamageSource='ability';const used=skillBeforeDetailedStats(a,t);combatDamageSource=previousSource;if(used&&battleStats){detailedUnitStats(a).abilitiesUsed++;if(activeCombatTurn?.actorId===a.id)activeCombatTurn.usedAbility=true}return used};
takeTurn=()=>{
  if(!running)return;
  if(!queue.length)refreshQueue();
  const actor=queue[0];
  if(!actor)return;
  if(actor.hp<=0){takeTurnBeforeCombatStats();renderBattleStats();return}
  battleStats.turns++;
  const actorStats=detailedUnitStats(actor),start={...actor.pos};
  actorStats.turnsTaken++;
  activeCombatTurn={actorId:actor.id,attacked:false,usedAbility:false};
  combatDamageSource='basic';
  takeTurnBeforeCombatStats();
  if(actor.pos.x!==start.x||actor.pos.y!==start.y)actorStats.turnsMoving++;
  if(activeCombatTurn.attacked)actorStats.turnsAttacking++;
  activeCombatTurn=null;
  renderBattleStats();
};
battleSortValue=(u,key)=>{const s=detailedUnitStats(u);if(key==='team')return u.team==='ally'?0:u.team==='enemy'?1:2;if(key==='name')return u.name;if(key==='class')return CLASSES[u.cls]?.label||u.cls;if(key.startsWith('passive-'))return (u.selectedPassives||[])[+key.slice(8)]||'';if(key==='state')return u.hp;if(key==='dps')return s.turnsTaken?s.damageDealt/s.turnsTaken:0;if(key==='damagePerHit')return s.hitsDealt?s.damageDealt/s.hitsDealt:0;return s[key]??''};
renderBattleStats=()=>{const host=$('#combat-stats');if(!host||!battleStats)return;const phase=battleStats.finished?'Combate terminado':running?'Combate en curso':'Aún no se ha iniciado un combate',passiveColumns=Math.max(0,...units.map(u=>(u.selectedPassives||[]).length)),summary=`<div class="combat-stats-summary"><span><b>${phase}</b></span><span>Rondas: <b>${battleStats.rounds||roundNo}</b></span><span>Turnos resueltos: <b>${battleStats.turns}</b></span><span>DPS = daño causado por turno propio</span></div>`,ordered=[...units].sort((a,b)=>{const av=battleSortValue(a,battleStatsSort.key),bv=battleSortValue(b,battleStatsSort.key),result=typeof av==='number'&&typeof bv==='number'?av-bv:String(av).localeCompare(String(bv),'es');return result*battleStatsSort.direction}),headers=[sortableHeader('Equipo','team'),sortableHeader('Unidad','name'),sortableHeader('Clase','class'),...Array.from({length:passiveColumns},(_,i)=>sortableHeader(`Pasiva ${i+1}`,`passive-${i}`)),sortableHeader('Estado final','state'),sortableHeader('Turnos','turnsTaken'),sortableHeader('Atacando','turnsAttacking'),sortableHeader('Moviéndose','turnsMoving'),sortableHeader('Habilidades','abilitiesUsed'),sortableHeader('Impactos causados','hitsDealt'),sortableHeader('Impactos recibidos','hitsTaken'),sortableHeader('Daño básico','basicDamage'),sortableHeader('Daño habilidades','abilityDamage'),sortableHeader('Daño total','damageDealt'),sortableHeader('DPS','dps'),sortableHeader('Daño/impacto','damagePerHit'),sortableHeader('Daño recibido','damageTaken'),sortableHeader('Bajas','kills')].join(''),rows=ordered.map(u=>{const s=detailedUnitStats(u),state=u.hp<=0?'Derrotada':`En pie · ${Math.ceil(u.hp)}/${u.maxHp} HP`,passives=Array.from({length:passiveColumns},(_,i)=>`<td>${(u.selectedPassives||[])[i]||'—'}</td>`).join(''),dps=s.turnsTaken?s.damageDealt/s.turnsTaken:0,damagePerHit=s.hitsDealt?s.damageDealt/s.hitsDealt:0;return `<tr class="${u.team}"><td>${u.team==='enemy'?'Enemigo':u.team==='ally'?'Aliado':'Neutral'}</td><td>${u.name}</td><td>${CLASSES[u.cls]?.label||u.cls}</td>${passives}<td>${state}</td><td>${s.turnsTaken}</td><td>${s.turnsAttacking}</td><td>${s.turnsMoving}</td><td>${s.abilitiesUsed}</td><td>${s.hitsDealt}</td><td>${s.hitsTaken}</td><td>${Math.round(s.basicDamage)}</td><td>${Math.round(s.abilityDamage)}</td><td>${Math.round(s.damageDealt)}</td><td>${dps.toFixed(1)}</td><td>${damagePerHit.toFixed(1)}</td><td>${Math.round(s.damageTaken)}</td><td>${s.kills}</td></tr>`}).join('');host.innerHTML=summary+(rows?`<div class="combat-stats-scroll"><table class="combat-stats-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`:'<p class="combat-stats-empty">Configura e inicia un combate para generar estadísticas.</p>')};
renderBattleStats();

/* Métricas compactas para diagnosticar pathfinding. */
const detailedUnitStatsBeforePathfinding=detailedUnitStats;
detailedUnitStats=u=>{const s=detailedUnitStatsBeforePathfinding(u),defaults={tilesMoved:0,productiveTiles:0,stalledTurns:0,noRouteTurns:0,targetChanges:0,inRangeIdleTurns:0};for(const [key,value] of Object.entries(defaults))if(s[key]==null)s[key]=value;return s};
const nearestBeforePathTelemetry=nearest;
nearest=a=>{const previous=a.aggroTargetId,target=nearestBeforePathTelemetry(a);if(battleStats&&previous&&target&&previous!==target.id)detailedUnitStats(a).targetChanges++;return target};
const takeTurnBeforePathTelemetry=takeTurn;
takeTurn=()=>{
  if(!running)return;
  if(!queue.length)refreshQueue();
  const actor=queue[0];
  if(!actor||actor.hp<=0){takeTurnBeforePathTelemetry();return}
  const target=nearest(actor),stats=detailedUnitStats(actor),start={...actor.pos},range=derived(actor).range,startDistance=target?dist(actor,target):0,route=target&&startDistance>range?path(actor,target):[],attacksBefore=stats.turnsAttacking,abilitiesBefore=stats.abilitiesUsed;
  takeTurnBeforePathTelemetry();
  const travelled=Math.abs(actor.pos.x-start.x)+Math.abs(actor.pos.y-start.y),attacked=stats.turnsAttacking>attacksBefore,usedAbility=stats.abilitiesUsed>abilitiesBefore;
  stats.tilesMoved+=travelled;
  if(target&&travelled){const endDistance=dist(actor,target),progress=Math.max(0,startDistance-endDistance);stats.productiveTiles+=Math.min(travelled,progress)}
  if(target&&startDistance>range&&!travelled&&!attacked&&!usedAbility)stats.stalledTurns++;
  if(target&&startDistance>range&&!route.length)stats.noRouteTurns++;
  if(target&&startDistance<=range&&!attacked&&!usedAbility)stats.inRangeIdleTurns++;
  renderBattleStats();
};
const battleSortValueBeforePathfinding=battleSortValue;
battleSortValue=(u,key)=>{const s=detailedUnitStats(u);if(key==='movementEfficiency')return s.tilesMoved?s.productiveTiles/s.tilesMoved:0;return ['tilesMoved','stalledTurns','noRouteTurns','targetChanges'].includes(key)?s[key]:battleSortValueBeforePathfinding(u,key)};
const renderBattleStatsBeforePathfinding=renderBattleStats;
renderBattleStats=()=>{
  renderBattleStatsBeforePathfinding();
  const table=$('#combat-stats .combat-stats-table');if(!table)return;
  const ordered=[...units].sort((a,b)=>{const av=battleSortValue(a,battleStatsSort.key),bv=battleSortValue(b,battleStatsSort.key),result=typeof av==='number'&&typeof bv==='number'?av-bv:String(av).localeCompare(String(bv),'es');return result*battleStatsSort.direction});
  table.querySelector('thead tr').insertAdjacentHTML('beforeend',[sortableHeader('Casillas','tilesMoved'),sortableHeader('Atascado','stalledTurns'),sortableHeader('Sin ruta','noRouteTurns'),sortableHeader('Cambios foco','targetChanges'),sortableHeader('Efic. mov.','movementEfficiency')].join(''));
  [...table.querySelectorAll('tbody tr')].forEach((row,index)=>{const s=detailedUnitStats(ordered[index]),efficiency=s.tilesMoved?`${Math.round(s.productiveTiles/s.tilesMoved*100)}%`:'—';row.insertAdjacentHTML('beforeend',`<td>${s.tilesMoved}</td><td>${s.stalledTurns}</td><td>${s.noRouteTurns}</td><td>${s.targetChanges}</td><td>${efficiency}</td>`)});
  const columns=table.querySelectorAll('thead th').length,fontSize=Math.max(.38,.54-Math.max(0,columns-18)*.018);table.style.fontSize=`${fontSize}rem`;table.querySelectorAll('th').forEach(th=>th.style.fontSize=`${Math.max(.36,fontSize-.03)}rem`);
};
renderBattleStats();
/* Pathfinding híbrido: aggro estable mientras progresa y retarget ante persecuciones improductivas. */
function routeCostToAttack(a,t){if(dist(a,t)<=derived(a).range)return 0;const route=path(a,t);return route.length||Infinity}
function selectReachableTarget(a,candidates,avoidId){let pool=candidates.filter(t=>t.id!==avoidId);if(!pool.length)pool=candidates;const scored=pool.map(t=>({target:t,cost:routeCostToAttack(a,t),claims:activeFocusers(t,a.team,a)})),reachable=scored.filter(x=>Number.isFinite(x.cost));if(reachable.length){const nearestCost=Math.min(...reachable.map(x=>x.cost)),nearby=reachable.filter(x=>x.cost<=nearestCost+2);return nearby.sort((x,y)=>isMeleeUnit(a)?x.claims-y.claims||x.cost-y.cost||x.target.id.localeCompare(y.target.id):x.cost-y.cost||x.target.id.localeCompare(y.target.id))[0].target}if(!scored.length)return null;return scored.sort((x,y)=>dist(a,x.target)-dist(a,y.target)||x.target.id.localeCompare(y.target.id))[0].target}
nearest=a=>{
  if(a.team==='dummy')return null;
  const dummies=alive('dummy'),candidates=dummies.length?dummies:alive(a.team==='ally'?'enemy':'ally');
  if(!candidates.length){delete a.aggroTargetId;return null}
  const previous=a.aggroTargetId,forced=candidates.find(t=>a.tauntTarget===t.id&&a.tauntTurns>0);
  if(forced){a.aggroTargetId=forced.id;if(battleStats&&previous&&previous!==forced.id)detailedUnitStats(a).targetChanges++;return forced}
  const current=candidates.find(t=>t.id===a.aggroTargetId);
  if(current&&canReachAttackPosition(a,current)&&current.id!==a.avoidAggroTargetId)return current;
  const chosen=selectReachableTarget(a,candidates,a.avoidAggroTargetId);
  delete a.avoidAggroTargetId;
  if(!chosen){delete a.aggroTargetId;return null}
  a.aggroTargetId=chosen.id;
  if(battleStats&&previous&&previous!==chosen.id)detailedUnitStats(a).targetChanges++;
  return chosen;
};
takeTurn=()=>{
  if(!running)return;
  if(!queue.length)refreshQueue();
  const actor=queue[0];
  if(!actor||actor.hp<=0){takeTurnBeforePathTelemetry();return}
  const oldTarget=units.find(u=>u.id===actor.aggroTargetId&&u.hp>0);
  if(oldTarget&&actor.pursuitTargetId===oldTarget.id){const currentDistance=dist(actor,oldTarget),progressed=currentDistance<(actor.pursuitStartDistance??Infinity);actor.unproductiveChaseTurns=actor.pursuitAttackedLastTurn||progressed?0:(actor.unproductiveChaseTurns||0)+1;if(actor.unproductiveChaseTurns>=2){actor.avoidAggroTargetId=oldTarget.id;delete actor.aggroTargetId;actor.unproductiveChaseTurns=0}}
  const target=nearest(actor),retargeted=oldTarget&&target&&oldTarget.id!==target.id,stats=detailedUnitStats(actor),start={...actor.pos},range=derived(actor).range,startDistance=target?dist(actor,target):0,route=target&&startDistance>range?path(actor,target):[],attacksBefore=stats.turnsAttacking,abilitiesBefore=stats.abilitiesUsed;
  if(retargeted)logCombatAction('move',`↻ ${actor.name} abandona una persecución improductiva y cambia el foco a ${target.name}.`);
  takeTurnBeforePathTelemetry();
  const travelled=Math.abs(actor.pos.x-start.x)+Math.abs(actor.pos.y-start.y),attacked=stats.turnsAttacking>attacksBefore,usedAbility=stats.abilitiesUsed>abilitiesBefore;
  stats.tilesMoved+=travelled;
  if(target&&travelled){const endDistance=dist(actor,target),progress=Math.max(0,startDistance-endDistance);stats.productiveTiles+=Math.min(travelled,progress)}
  if(target&&startDistance>range&&!travelled&&!attacked&&!usedAbility)stats.stalledTurns++;
  if(target&&startDistance>range&&!route.length)stats.noRouteTurns++;
  if(target&&startDistance<=range&&!attacked&&!usedAbility)stats.inRangeIdleTurns++;
  actor.pursuitTargetId=target?.id||null;actor.pursuitStartDistance=startDistance;actor.pursuitAttackedLastTurn=attacked;
  renderBattleStats();
};
