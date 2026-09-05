/* Motor de autobattler en tiempo real. */
const REALTIME_MANA_PER_SECOND=14,REALTIME_MOVE_INTERVAL=1,REALTIME_LOOP_MS=50;
let realtimeLastFrame=0,realtimeStatsFrame=0,realtimeElapsed=0;
STAT_NAMES.agility=GAME_CONTENT.realtimeStatNames.agility;
const derivedBeforeRealtime=derived;
derived=u=>{const values=derivedBeforeRealtime(u),rapid=u.cls==='archer'&&(u.selectedPassives||[]).includes('Disparo rápido'),attackSpeed=Math.max(.30,.32+(u.stats.agility||0)*.04)*(rapid?2:1);return{...values,attackSpeed:Math.round(attackSpeed*100)/100}};
PASSIVE_DESCRIPTIONS['Disparo rápido']='Activa: duplica la velocidad de ataque, pero cada ataque básico inflige el 50% del daño. Por sí sola mantiene el mismo daño por segundo.';


function realtimeManaMarkup(u){const mana=Math.max(0,Math.min(100,u.mana||0));return `<div class="mana-card" data-mana-card="${u.id}"><span>MANÁ</span><i class="mana-track"><b class="mana-fill" style="width:${mana}%"></b></i><b>${Math.round(mana)}%</b></div>`}
function autoAttackReady(u){const cooldown=1/derived(u).attackSpeed;return Math.max(0,Math.min(100,(1-(u.attackReadyIn||0)/cooldown)*100))}
function realtimeAttackMarkup(u){const ready=autoAttackReady(u);return `<div class="attack-card" data-attack-card="${u.id}"><span>ATAQUE</span><i class="attack-track"><b class="attack-fill" style="width:${ready}%"></b></i><b>${Math.round(ready)}%</b></div>`}
const cardBeforeRealtime=card;
card=u=>{let base=cardBeforeRealtime(u),d=derived(u);base=base.replace(/AGI\s+\d+/g,`ATQ ${d.attackSpeed.toFixed(2)}/s`).replace('habilidad lista',(u.mana||0)>=100?'habilidad lista':'cargando maná');const end=base.lastIndexOf('</div>');return end<0?base:base.slice(0,end)+realtimeManaMarkup(u)+realtimeAttackMarkup(u)+base.slice(end)};
const tokenBeforeRealtime=token;
token=u=>{const base=tokenBeforeRealtime(u),health=Math.max(0,Math.min(100,u.hp/u.maxHp*100)),mana=Math.max(0,Math.min(100,u.mana||0)),ready=autoAttackReady(u),end=base.lastIndexOf('</div>');return end<0?base:base.slice(0,end)+`<i class="token-health ${u.team}" data-health-token="${u.id}"><b style="width:${health}%"></b></i><i class="token-attack" data-attack-token="${u.id}"><b style="width:${ready}%"></b></i><i class="token-mana" data-mana-token="${u.id}"><b style="width:${mana}%"></b></i>`+base.slice(end)};
const updateDerivedBeforeRealtime=updateDerived;
updateDerived=()=>{updateDerivedBeforeRealtime();const u=units.find(x=>x.id===selectedId),host=$('#derived');if(!u||!host)return;const d=derived(u);host.innerHTML=host.innerHTML.replace(/AGI\s+\d+/,`ATQ ${d.attackSpeed.toFixed(2)}/s`)};

function updateRealtimeHud(){
  units.forEach(u=>{const health=Math.max(0,Math.min(100,u.hp/u.maxHp*100)),mana=Math.max(0,Math.min(100,u.mana||0)),ready=autoAttackReady(u),card=document.querySelector(`[data-mana-card="${u.id}"]`),attackCard=document.querySelector(`[data-attack-card="${u.id}"]`),tokenHealth=document.querySelector(`[data-health-token="${u.id}"]`),tokenMana=document.querySelector(`[data-mana-token="${u.id}"]`),tokenAttack=document.querySelector(`[data-attack-token="${u.id}"]`);if(card){card.querySelector('.mana-fill').style.width=mana+'%';card.lastElementChild.textContent=Math.round(mana)+'%'}if(attackCard){attackCard.querySelector('.attack-fill').style.width=ready+'%';attackCard.lastElementChild.textContent=Math.round(ready)+'%'}if(tokenHealth)tokenHealth.firstElementChild.style.width=health+'%';if(tokenMana)tokenMana.firstElementChild.style.width=mana+'%';if(tokenAttack)tokenAttack.firstElementChild.style.width=ready+'%'});
  if(running){$('#round').textContent=`${realtimeElapsed.toFixed(1)} s`;$('#round').classList.add('realtime-clock')}
}
function realtimeActionStats(u,type,tiles=0){if(!battleStats)return;const s=detailedUnitStats(u);s.turnsTaken++;if(type==='attack')s.turnsAttacking++;if(type==='move'){s.turnsMoving++;s.tilesMoved+=tiles;s.productiveTiles+=tiles}battleStats.turns++;}
function clearExpiredRealtimeState(u,dt){
  for(const key of ['tauntTurns','exposedTurns','furyTurns','iceDamageTurns','lightSkipTurns'])if(u[key]>0)u[key]=Math.max(0,u[key]-dt);
  if(u.hp<=0&&!u.removed){u.corpseSeconds=(u.corpseSeconds??3)-dt;u.corpseTurns=Math.max(0,Math.ceil(u.corpseSeconds));if(u.corpseSeconds<=0)u.removed=true}
}
function realtimeAttack(a,t){
  if(!t||t.hp<=0)return false;
  const d=derived(a),rapid=a.cls==='archer'&&(a.selectedPassives||[]).includes('Disparo rápido'),berserk=a.cls==='warrior'&&(a.selectedPassives||[]).includes('Berserk'),hits=[];
  combatDamageSource='basic';activeCombatTurn={actorId:a.id,attacked:false,usedAbility:false};
  if(a.cls==='archer'&&typeof archerAutoHit==='function')hits.push(archerAutoHit(a,t,rapid));
  else{const crit=Math.random()<d.crit,raw=Math.round(d.damage*(crit?1.6:1)*(berserk?1.5:1)),physicalHit=damage(a,t,raw);hits.push({physicalHit,fireHit:0,crit})}
  const total=hits.reduce((sum,hit)=>sum+(hit.physicalHit||0)+(hit.fireHit||0),0),critical=hits.some(hit=>hit.crit);
  realtimeActionStats(a,'attack');a.attackReadyIn=1/d.attackSpeed;showCombatAction(critical?'critical':berserk||rapid?'enhanced':'attack',a,t,rapid?`Disparo rápido · velocidad ×2 · 50% de daño · ${total} de daño`:`${total} de daño`);render();effect(a,t,total);logCombatAction(critical?'critical':'attack',`${a.name} ataca a ${t.name}: ${total} de daño${critical?' crítico':''}${berserk?' · Berserk +50%':''}${rapid?' · Disparo rápido: velocidad ×2, daño 50%':''}.`);activeCombatTurn=null;
  if(a.cls==='mage')units.forEach(u=>{if(u.electricMageId===a.id)delete u.electricMageId});
  return true;
}
function realtimeCast(a,t){
  if((a.mana||0)<100||!t)return false;
  const oldIce=new Map(units.map(u=>[u.id,u.iceDamageTurns||0])),oldLight=new Map(units.map(u=>[u.id,u.lightSkipTurns||0])),abilitiesBefore=battleStats?detailedUnitStats(a).abilitiesUsed:0,previousDamageSource=combatDamageSource;a.skillCooldown=0;activeCombatTurn={actorId:a.id,attacked:false,usedAbility:false};combatDamageSource='ability';
  const used=skill(a,t);combatDamageSource=previousDamageSource;activeCombatTurn=null;if(!used)return false;
  if(battleStats&&detailedUnitStats(a).abilitiesUsed===abilitiesBefore)detailedUnitStats(a).abilitiesUsed++;
  a.mana=0;a.skillCooldown=0;realtimeActionStats(a,'ability');
  units.forEach(u=>{if((u.iceDamageTurns||0)>oldIce.get(u.id))u.iceDamageTurns=4;if((u.lightSkipTurns||0)>oldLight.get(u.id))u.lightSkipTurns=1.5});
  if(a.cls==='mage'&&mageElement(a)!=='lightning')units.forEach(u=>{if(u.electricMageId===a.id)delete u.electricMageId});
  return true;
}
function realtimeMove(a,t){
  if(!t||a.moveReadyIn>0)return false;
  if(tryBackstep(a,t)){a.moveReadyIn=REALTIME_MOVE_INTERVAL;realtimeActionStats(a,'move',1);render();return true}
  const route=path(a,t);if(!route.length){if(battleStats)detailedUnitStats(a).noRouteTurns++;a.moveReadyIn=REALTIME_MOVE_INTERVAL;return false}
  const berserk=a.cls==='warrior'&&(a.selectedPassives||[]).includes('Berserk'),steps=Math.min(berserk?2:1,route.length);a.pos={...route[steps-1]};a.moveReadyIn=REALTIME_MOVE_INTERVAL;realtimeActionStats(a,'move',steps);showCombatAction('move',a,t,berserk?`Berserk · avanza ${steps}`:'Avanza');render();return true;
}
function realtimeUnitStep(a,dt,phase){
  if(a.hp<=0||a.removed)return;
  if(a.team==='dummy'){
    if(phase==='attack'){a.moveReadyIn=Math.max(0,(a.moveReadyIn||0)-dt);return}
    if(!a.randomPathing)return;
    if(a.moveReadyIn>0)return;
    const options=hexNeighbors(a.pos).filter(p=>canOccupy(a,p.x,p.y));a.moveReadyIn=REALTIME_MOVE_INTERVAL;
    if(!options.length)return;
    a.pos={...options[Math.floor(Math.random()*options.length)]};
    showCombatAction('move',a,null,'Dummy errático · ruta aleatoria');render();return;
  }
  if(phase==='attack'){a.mana=Math.min(100,(a.mana||0)+REALTIME_MANA_PER_SECOND*dt);a.attackReadyIn=Math.max(0,(a.attackReadyIn||0)-dt);a.moveReadyIn=Math.max(0,(a.moveReadyIn||0)-dt)}
  if(a.lightSkipTurns>0)return;
  let target=nearest(a);if(!target)return;
  if(phase==='attack'){
    if(a.mana>=100&&realtimeCast(a,target)){if(!running)return;return}
    if(dist(a,target)<=derived(a).range&&a.attackReadyIn<=0)realtimeAttack(a,target);
    return;
  }
  const range=derived(a).range;
  if(dist(a,target)>range){realtimeMove(a,target);return}
  if(a.attackReadyIn<=0&&a.moveReadyIn<=0&&dist(a,target)===1&&tryBackstep(a,target)){a.moveReadyIn=REALTIME_MOVE_INTERVAL;realtimeActionStats(a,'move',1);render()}
}
function realtimeLoop(){
  if(!running)return;const now=performance.now(),realDt=Math.min(.25,(now-realtimeLastFrame)/1000);realtimeLastFrame=now;const dt=realDt*speed;realtimeElapsed+=dt;if(battleStats){battleStats.elapsed=realtimeElapsed;battleStats.ticks=(battleStats.ticks||0)+1}
  units.forEach(u=>clearExpiredRealtimeState(u,dt));
  const activeUnits=[...units].filter(u=>u.hp>0&&!u.removed).sort(()=>Math.random()-.5);
  for(const unit of activeUnits){realtimeUnitStep(unit,dt,'attack');if(!running)break}
  for(const unit of activeUnits){realtimeUnitStep(unit,dt,'move');if(!running)break}
  const remainingOpponents=alive('enemy').length+alive('dummy').length;
  if(!alive('ally').length||!remainingOpponents){end();return}
  updateRealtimeHud();if(realtimeElapsed-realtimeStatsFrame>=.5){realtimeStatsFrame=realtimeElapsed;renderBattleStats();requestAnimationFrame(renderAggroFocus)}
}
schedule=()=>{};
start=()=>{saveFormation();clearInterval(timer);running=true;queue=[];roundNo=0;realtimeElapsed=0;realtimeStatsFrame=0;realtimeLastFrame=performance.now();units.forEach(u=>{u.mana=0;u.skillCooldown=0;u.attackReadyIn=Math.random()*.4;u.moveReadyIn=0;u.corpseSeconds=3;u.tauntTurns=0;u.exposedTurns=0;u.furyTurns=0;u.iceDamageTurns=0;u.lightSkipTurns=0;delete u.electricMageId});resetBattleStats();battleStats.elapsed=0;battleStats.ticks=0;$('#fight').disabled=true;$('#status').textContent=UI_TEXT.battle.realtimeStatus;$('#action').textContent=UI_TEXT.battle.realtimeAction;logCombatAction('move',UI_TEXT.battle.realtimeStart);render();timer=setInterval(realtimeLoop,REALTIME_LOOP_MS)};
end=()=>{if(!running)return;running=false;clearInterval(timer);timer=null;const win=alive('ally').length>0;if(battleStats){battleStats.finished=true;battleStats.elapsed=realtimeElapsed;battleStats.rounds=0}$('#round').classList.remove('realtime-clock');$('#round').textContent=win?UI_TEXT.battle.victory:UI_TEXT.battle.defeat;$('#action').textContent=win?UI_TEXT.battle.victoryLabel:UI_TEXT.battle.defeatLabel;$('#fight').disabled=false;$('#fight').textContent=UI_TEXT.battle.playAgain;$('#status').textContent=UI_TEXT.battle.resolved(realtimeElapsed);render();renderBattleStats()};

const renderBattleStatsBeforeRealtime=renderBattleStats;
renderBattleStats=()=>{renderBattleStatsBeforeRealtime();if(!battleStats)return;const summary=document.querySelector('#combat-stats .combat-stats-summary'),table=document.querySelector('#combat-stats .combat-stats-table');if(summary){const items=summary.querySelectorAll('span');if(items[1])items[1].innerHTML=`Duración: <b>${(battleStats.elapsed||0).toFixed(1)} s</b>`;if(items[2])items[2].innerHTML=`Acciones: <b>${battleStats.turns||0}</b>`;if(items[3])items[3].textContent='DPS = daño causado por segundo de combate'}if(table){[...table.querySelectorAll('th')].forEach(th=>{if(th.textContent.trim().startsWith('Turnos'))th.firstElementChild?th.firstElementChild.childNodes[0].textContent='Acciones ':th.textContent='Acciones';if(th.textContent.trim()==='Atacando')th.firstElementChild?th.firstElementChild.childNodes[0].textContent='Básicos ':th.textContent='Básicos';if(th.textContent.trim()==='Moviéndose')th.firstElementChild?th.firstElementChild.childNodes[0].textContent='Movimientos ':th.textContent='Movimientos'});const ordered=[...units].sort((a,b)=>{const av=battleSortValue(a,battleStatsSort.key),bv=battleSortValue(b,battleStatsSort.key),result=typeof av==='number'&&typeof bv==='number'?av-bv:String(av).localeCompare(String(bv),'es');return result*battleStatsSort.direction}),headers=[...table.querySelectorAll('thead th')],dpsIndex=headers.findIndex(th=>th.textContent.trim().startsWith('DPS'));if(dpsIndex>=0)[...table.querySelectorAll('tbody tr')].forEach((row,index)=>{const s=detailedUnitStats(ordered[index]),duration=Math.max(.1,battleStats.elapsed||realtimeElapsed);row.children[dpsIndex].textContent=(s.damageDealt/duration).toFixed(1)})}};
battleSortValue=((previous)=>((u,key)=>key==='dps'?detailedUnitStats(u).damageDealt/Math.max(.1,battleStats?.elapsed||realtimeElapsed||.1):previous(u,key)))(battleSortValue);
renderTurns=()=>{const list=[...units].filter(u=>!u.removed).sort((a,b)=>derived(b).attackSpeed-derived(a).attackSpeed);$('#turn-list').innerHTML=list.map(u=>`<span class="pill ${u.hp<=0?'dead':''}">${CLASSES[u.cls].icon} ${u.name} · ${derived(u).attackSpeed.toFixed(2)}/s · ${Math.round(u.mana||0)}% MP</span>`).join('')};
SPECIAL_DESCRIPTIONS.warrior='Furia: +80% de ataque y +30% de defensa durante 3 segundos.';
SPECIAL_DESCRIPTIONS.archer='Flecha marcada: aumenta un 50% el daño recibido por el objetivo durante 3 segundos.';
PASSIVE_DESCRIPTIONS.Berserk='Activa: no puede llevar armadura, pierde 9 DEF plana, avanza 2 hexágonos por pulso de movimiento y sus ataques infligen un 50% más de daño.';
PASSIVE_DESCRIPTIONS['Paso atrás']='Activa: cada 2 oportunidades de ataque, si un enemigo está cuerpo a cuerpo, retrocede 1 hexágono y después ataca.';
PASSIVE_DESCRIPTIONS['Afinidad sanadora']='Activa: tras cada ataque almacena el 20% del daño final infligido. Al completar 5 ataques, cura toda la reserva al aliado con menos vida dentro de radio 2.';
document.querySelector('.eyebrow').textContent=UI_TEXT.page.eyebrow;
document.querySelector('.rule').textContent=UI_TEXT.page.rule;
document.querySelector('.turns-top span').textContent=UI_TEXT.page.activity;
const renderBeforeRealtime=render;
render=()=>{renderBeforeRealtime();renderUnitNameplates($('#arena'));updateRealtimeHud()};

/* La configuración solo cambia al pedir una nueva semilla de prueba. */
const setupBeforeStableBuilds=setup;
setup=()=>{
  setupWithActionReadout();
  const box=document.querySelector('#combat-action');if(box){box.className='combat-action idle';box.innerHTML=`<span class="combat-action-icon">⌛</span><div><b>${UI_TEXT.setup.fieldReady}</b><small>${UI_TEXT.setup.configureUnits}</small></div>`}
  units.forEach(unit=>{const saved=roster.find(entry=>entry.id===unit.id);if(!saved)return;unit.selectedPassives=[...(saved.selectedPassives||[])];unit.specialSelected=saved.specialSelected;unit.specialEnabled=saved.specialEnabled;unit.equipment={...(saved.equipment||{})};const values=derived(unit);unit.maxHp=unit.team==='dummy'?1e12:values.hp;unit.hp=unit.maxHp});
  resetBattleStats();render();
};
function randomizeAutobattlerSetup(){
  if(running)return;
  roster.filter(unit=>unit.team==='ally'||unit.team==='enemy').forEach(assignRandomPassive);
  placeStartingUnits();
  formation={...formation,...Object.fromEntries(roster.filter(unit=>unit.team==='ally'||unit.team==='enemy').map(unit=>[unit.id,{...unit.pos}]))};
  setup();loadEditor();render();log(UI_TEXT.actions.randomized);
}
const randomizeButton=document.createElement('button');
randomizeButton.type='button';randomizeButton.id='randomize-builds';randomizeButton.className='secondary';randomizeButton.textContent=UI_TEXT.actions.randomize;
$('#reset').insertAdjacentElement('afterend',randomizeButton);
randomizeButton.onclick=randomizeAutobattlerSetup;
$('#new-map').onclick=()=>{if(running)return;readTerrainOptions();terrain=[];setup();log(UI_TEXT.actions.newTerrain)};
render();
