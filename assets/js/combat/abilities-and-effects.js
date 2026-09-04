/* Lectura visual de acciones de combate. */
document.querySelector('.turns').insertAdjacentHTML('afterend','<div id="combat-action" class="combat-action idle"><span class="combat-action-icon">⌛</span><div><b>Campo preparado</b><small>Inicia el combate para ver las acciones.</small></div></div>');

function showCombatAction(kind,actor,target,detail){const config={move:['➜','MOVIMIENTO'],attack:['⚔','ATAQUE BÁSICO'],critical:['✦','GOLPE CRÍTICO'],skill:['✹','HABILIDAD'],enhanced:['◎','ATAQUE POTENCIADO']}[kind]||['•','ACCIÓN'],box=document.querySelector('#combat-action'),targetText=target?`Objetivo: ${target.name}`:'';box.className=`combat-action ${kind} pulse`;box.innerHTML=`<span class="combat-action-icon">${config[0]}</span><div><b>${config[1]} · ${actor?.name||''}</b><small>${[detail,targetText].filter(Boolean).join(' · ')}</small></div>`;document.querySelector('#action').textContent=actor?`${actor.name} · ${config[1].toLowerCase()}`:'Configura el campo';setTimeout(()=>box.classList.remove('pulse'),220)}
function logCombatAction(kind,text){log(`<span class="log-action ${kind}">${text}</span>`)}
const skillWithActionPresentation=skill;skill=(a,t)=>{const used=skillWithActionPresentation(a,t);if(used){const name=SPECIAL_PASSIVE_NAMES[a.cls]||'Habilidad';showCombatAction('skill',a,t,name);logCombatAction('skill',`✹ ${a.name} usa ${name}${t?` contra ${t.name}`:''}.`)}return used};
takeTurn=()=>{if(!running)return;if(!queue.length)refreshQueue();const a=queue.shift();if(!a||a.hp<=0){renderTurns();return}advanceCorpses();advanceEffects();const t=nearest(a);if(!t){end();return}if(skill(a,t)){if(!alive(t.team).length)end();return}const d=derived(a);if(dist(a,t)>d.range){const p=path(a,t);if(p[0])a.pos=p[0];showCombatAction('move',a,t,'Avanza hacia');logCombatAction('move',`➜ ${a.name} avanza hacia ${t.name}.`);render();return}const crit=Math.random()<d.crit,hit=damage(a,t,Math.round(d.damage*(crit?1.6:1))),hawk=a.cls==='archer'&&(a.selectedPassives||[]).includes('Ojo de halcón'),kind=crit?'critical':hawk?'enhanced':'attack',detail=hawk?'Ojo de halcón activo':`${hit} de daño`;chargeAttack(a);showCombatAction(kind,a,t,detail);render();effect(a,t,hit);logCombatAction(kind,`${crit?'✦ ':hawk?'◎ ':''}${a.name} ataca a ${t.name}: ${hit} de daño${crit?' crítico':''}${hawk?' · Ojo de halcón':''}.`);if(!alive(t.team).length)end()};
const setupWithActionReadout=setup;setup=()=>{setupWithActionReadout();const box=document.querySelector('#combat-action');if(box){box.className='combat-action idle';box.innerHTML='<span class="combat-action-icon">⌛</span><div><b>Campo preparado</b><small>Configura las unidades antes de empezar.</small></div>'}};

/* Pasiva funcional: Flecha elemental (fuego provisional). */
CLASS_FICHAS.archer.passives=CLASS_FICHAS.archer.passives.map(p=>p==='Flecha incendiaria'?'Flecha elemental':p);PASSIVE_DESCRIPTIONS['Flecha elemental']='Activa: los ataques básicos añaden un 30% de daño de fuego.';
const renderFichaWithElementalArrow=renderFicha;renderFicha=()=>{const u=units.find(x=>x.id===selectedId);if(u?.selectedPassives?.includes('Flecha incendiaria'))u.selectedPassives=u.selectedPassives.map(p=>p==='Flecha incendiaria'?'Flecha elemental':p);renderFichaWithElementalArrow();const host=document.querySelector('#visual-state');if(u?.cls!=='archer'||!host)return;const b=[...host.querySelectorAll('[data-passive]')].find(x=>x.dataset.passive==='Flecha incendiaria'||x.dataset.passive==='Flecha elemental');if(!b)return;const active=(u.selectedPassives||[]).includes('Flecha elemental'),available=u.level>=3;b.dataset.passive='Flecha elemental';b.disabled=!available;b.classList.toggle('active',active);b.classList.toggle('unavailable',!available);b.innerHTML=`<span>${active?'✓ ':''}Flecha elemental</span><small>Activa: los ataques básicos añaden un 30% de daño de fuego.${available?'':' · Se desbloquea en nivel 3.'}</small>`};
function elementalDamage(a,t,raw,type){const res=t.resistances?.[type]||0,value=Math.max(1,Math.round(raw*(1-res/100)*(t.exposedTurns?1.5:1)));t.hp=Math.max(0,t.hp-value);killCheck(t);return value}
takeTurn=()=>{if(!running)return;if(!queue.length)refreshQueue();const a=queue.shift();if(!a||a.hp<=0){renderTurns();return}advanceCorpses();advanceEffects();const t=nearest(a);if(!t){end();return}if(skill(a,t)){if(!alive(t.team).length)end();return}const d=derived(a);if(dist(a,t)>d.range){const p=path(a,t);if(p[0])a.pos=p[0];showCombatAction('move',a,t,'Avanza hacia');logCombatAction('move',`➜ ${a.name} avanza hacia ${t.name}.`);render();return}const crit=Math.random()<d.crit,baseRaw=Math.round(d.damage*(crit?1.6:1)),physicalHit=damage(a,t,baseRaw),hawk=a.cls==='archer'&&(a.selectedPassives||[]).includes('Ojo de halcón'),elemental=a.cls==='archer'&&(a.selectedPassives||[]).includes('Flecha elemental'),fireHit=elemental?elementalDamage(a,t,Math.round(baseRaw*.30),'fire'):0,kind=crit?'critical':(hawk||elemental)?'enhanced':'attack',detail=elemental?`Fuego +${fireHit} (30%)`:hawk?'Ojo de halcón activo':`${physicalHit} de daño`;chargeAttack(a);showCombatAction(kind,a,t,detail);render();effect(a,t,physicalHit+fireHit);logCombatAction(kind,`${crit?'✦ ':hawk||elemental?'◎ ':''}${a.name} ataca a ${t.name}: ${physicalHit} físico${elemental?` + ${fireHit} fuego`:''}${crit?' crítico':''}${hawk?' · Ojo de halcón':''}${elemental?' · Flecha elemental':''}.`);if(!alive(t.team).length)end()};
loadEditor();render();

/* La habilidad especial no ocupa huecos de pasiva adicional. */
function normalizeSelectedPassives(u){const allowed=CLASS_FICHAS[u.cls]?.passives||[],limit=Math.max(0,passiveLimit(u.level)-1);u.selectedPassives=(u.selectedPassives||[]).filter(p=>allowed.includes(p)).slice(0,limit);const r=roster.find(x=>x.id===u.id);if(r)r.selectedPassives=[...u.selectedPassives]}
syncPassives=u=>normalizeSelectedPassives(u);
const renderFichaWithoutSpecialCount=renderFicha;renderFicha=()=>{const u=units.find(x=>x.id===selectedId);if(u)normalizeSelectedPassives(u);renderFichaWithoutSpecialCount()};
units.forEach(normalizeSelectedPassives);roster.forEach(normalizeSelectedPassives);loadEditor();render();

/* Todas las habilidades, incluida la de clase, son pasivas que ocupan hueco. */
function implementedPassivesFor(u){const special=SPECIAL_PASSIVE_NAMES[u.cls],extra=u.cls==='archer'?['Ojo de halcón','Flecha elemental','Tirador experto','Disparo perforante']:[];return[special,...extra]}
function normalizeAllPassiveChoices(u){const allowed=implementedPassivesFor(u),limit=passiveLimit(u.level);u.selectedPassives=(u.selectedPassives||[]).filter(p=>allowed.includes(p)).slice(0,limit);u.specialSelected=u.selectedPassives.includes(SPECIAL_PASSIVE_NAMES[u.cls]);u.specialEnabled=true;const r=roster.find(x=>x.id===u.id);if(r){r.selectedPassives=[...u.selectedPassives];r.specialSelected=u.specialSelected;r.specialEnabled=true}}
syncPassives=u=>normalizeAllPassiveChoices(u);normalizeSelectedPassives=u=>normalizeAllPassiveChoices(u);
const renderFichaWithUnifiedPassives=renderFicha;renderFicha=()=>{const u=units.find(x=>x.id===selectedId);if(!u)return;normalizeAllPassiveChoices(u);renderFichaWithUnifiedPassives();const host=document.querySelector('#visual-state'),limit=passiveLimit(u.level),selected=u.selectedPassives||[],toggle=p=>{const now=[...(u.selectedPassives||[])];u.selectedPassives=now.includes(p)?now.filter(x=>x!==p):now.length<limit?[...now,p]:now;normalizeAllPassiveChoices(u);loadEditor();render()};const caption=host.querySelector('.passive-caption');if(caption)caption.textContent=`Pasivas de ${CLASSES[u.cls].label} · nivel ${u.level} · ${selected.length}/${limit} activas.`;const special=host.querySelector('[data-special-passive]'),specialName=SPECIAL_PASSIVE_NAMES[u.cls];if(special){const on=selected.includes(specialName);special.disabled=false;special.classList.toggle('active',on);special.innerHTML=`<span>${on?'✓ ':''}${specialName}</span><small>${SPECIAL_DESCRIPTIONS[u.cls]||'Habilidad de clase.'}</small>`;special.onclick=()=>toggle(specialName)};host.querySelectorAll('[data-passive]').forEach(b=>{const p=b.dataset.passive,available=implementedPassivesFor(u).includes(p),on=selected.includes(p);if(!available)return;b.disabled=false;b.classList.toggle('active',on);b.classList.remove('unavailable');b.onclick=()=>toggle(p)})};
const addUnitWithoutDefaultPassive=addTeamUnit;addTeamUnit=team=>{addUnitWithoutDefaultPassive(team);const u=units.find(x=>x.id===selectedId);if(u){u.selectedPassives=[];u.specialSelected=false;normalizeAllPassiveChoices(u);loadEditor();render()}};
roster.forEach(u=>{u.selectedPassives=[];u.specialSelected=false;u.specialEnabled=true});units.forEach(u=>{u.selectedPassives=[];u.specialSelected=false;u.specialEnabled=true});loadEditor();render();

/* Tirador experto: crítico por distancia sin límite artificial. */
takeTurn=()=>{if(!running)return;if(!queue.length)refreshQueue();const a=queue.shift();if(!a||a.hp<=0){renderTurns();return}advanceCorpses();advanceEffects();const t=nearest(a);if(!t){end();return}if(skill(a,t)){if(!alive(t.team).length)end();return}const d=derived(a);if(dist(a,t)>d.range){const p=path(a,t);if(p[0])a.pos=p[0];showCombatAction('move',a,t,'Avanza hacia');logCombatAction('move',`➜ ${a.name} avanza hacia ${t.name}.`);render();return}const distance=dist(a,t),hawk=a.cls==='archer'&&(a.selectedPassives||[]).includes('Ojo de halcón'),elemental=a.cls==='archer'&&(a.selectedPassives||[]).includes('Flecha elemental'),expert=a.cls==='archer'&&(a.selectedPassives||[]).includes('Tirador experto'),expertBonus=expert?distance*.10:0,crit=Math.random()<(d.crit+expertBonus),baseRaw=Math.round(d.damage*(crit?1.6:1)),physicalHit=damage(a,t,baseRaw),fireHit=elemental?elementalDamage(a,t,Math.round(baseRaw*.30),'fire'):0,kind=crit?'critical':(hawk||elemental||expert)?'enhanced':'attack',detail=expert?`Tirador experto +${Math.round(expertBonus*100)} pp CRIT a ${distance} casillas`:elemental?`Fuego +${fireHit} (30%)`:hawk?'Ojo de halcón activo':`${physicalHit} de daño`;chargeAttack(a);showCombatAction(kind,a,t,detail);render();effect(a,t,physicalHit+fireHit);logCombatAction(kind,`${crit?'✦ ':hawk||elemental||expert?'◎ ':''}${a.name} ataca a ${t.name}: ${physicalHit} físico${elemental?` + ${fireHit} fuego`:''}${crit?' crítico':''}${hawk?' · Ojo de halcón':''}${elemental?' · Flecha elemental':''}${expert?` · Tirador experto +${Math.round(expertBonus*100)} pp`:''}.`);if(!alive(t.team).length)end()};
/* Disparo perforante: un único primer impacto de 3,5× por objetivo. */
takeTurn=()=>{if(!running)return;if(!queue.length)refreshQueue();const a=queue.shift();if(!a||a.hp<=0){renderTurns();return}advanceCorpses();advanceEffects();const t=nearest(a);if(!t){end();return}if(skill(a,t)){if(!alive(t.team).length)end();return}const d=derived(a);if(dist(a,t)>d.range){const p=path(a,t);if(p[0])a.pos=p[0];showCombatAction('move',a,t,'Avanza hacia');logCombatAction('move',`➜ ${a.name} avanza hacia ${t.name}.`);render();return}const distance=dist(a,t),passives=a.selectedPassives||[],hawk=a.cls==='archer'&&passives.includes('Ojo de halcón'),elemental=a.cls==='archer'&&passives.includes('Flecha elemental'),expert=a.cls==='archer'&&passives.includes('Tirador experto'),piercing=a.cls==='archer'&&passives.includes('Disparo perforante')&&!(a.piercingTargets||[]).includes(t.id);if(piercing)a.piercingTargets=[...(a.piercingTargets||[]),t.id];const expertBonus=expert?distance*.10:0,crit=Math.random()<(d.crit+expertBonus),multiplier=piercing?3.5:1,baseRaw=Math.round(d.damage*(crit?1.6:1)*multiplier),physicalHit=damage(a,t,baseRaw),fireHit=elemental?elementalDamage(a,t,Math.round(baseRaw*.30),'fire'):0,kind=piercing?'skill':crit?'critical':(hawk||elemental||expert)?'enhanced':'attack',detail=piercing?'Disparo perforante · primer impacto ×3,5':expert?`Tirador experto +${Math.round(expertBonus*100)} pp CRIT a ${distance} casillas`:elemental?`Fuego +${fireHit} (30%)`:hawk?'Ojo de halcón activo':`${physicalHit} de daño`;chargeAttack(a);showCombatAction(kind,a,t,detail);render();effect(a,t,physicalHit+fireHit);logCombatAction(kind,`${piercing?'✹ ':crit?'✦ ':hawk||elemental||expert?'◎ ':''}${a.name} ataca a ${t.name}: ${physicalHit} físico${elemental?` + ${fireHit} fuego`:''}${piercing?' · Disparo perforante ×3,5':''}${crit?' crítico':''}${hawk?' · Ojo de halcón':''}${elemental?' · Flecha elemental':''}${expert?` · Tirador experto +${Math.round(expertBonus*100)} pp`:''}.`);if(!alive(t.team).length)end()};

/* Paso atrás: retirada táctica cada dos turnos propios, seguida de ataque. */
PASSIVE_DESCRIPTIONS['Paso atrás']='Activa: cada 2 turnos propios, si un enemigo está cuerpo a cuerpo, retrocede 1 casilla válida y después ataca.';
const implementedPassivesBeforeBackstep=implementedPassivesFor;implementedPassivesFor=u=>{const passives=implementedPassivesBeforeBackstep(u);return u.cls==='archer'?[...passives,'Paso atrás']:passives};
function tryBackstep(a,t){const active=a.cls==='archer'&&(a.selectedPassives||[]).includes('Paso atrás');if(!active)return false;a.backstepTurns=(a.backstepTurns||0)+1;if(a.backstepTurns%2!==0||dist(a,t)!==1)return false;const options=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:a.pos.x+dx,y:a.pos.y+dy})).filter(p=>canOccupy(a,p.x,p.y)&&Math.abs(p.x-t.pos.x)+Math.abs(p.y-t.pos.y)>1).sort((p,q)=>(Math.abs(q.x-t.pos.x)+Math.abs(q.y-t.pos.y))-(Math.abs(p.x-t.pos.x)+Math.abs(p.y-t.pos.y)));if(!options.length)return false;a.pos=options[0];return true}
takeTurn=()=>{if(!running)return;if(!queue.length)refreshQueue();const a=queue.shift();if(!a||a.hp<=0){renderTurns();return}advanceCorpses();advanceEffects();let t=nearest(a);if(!t){end();return}const steppedBack=tryBackstep(a,t);if(steppedBack){logCombatAction('move',`↩ ${a.name} usa Paso atrás y se aleja de ${t.name}.`);render()}if(skill(a,t)){if(!alive(t.team).length)end();return}const d=derived(a);if(dist(a,t)>d.range){if(steppedBack){showCombatAction('enhanced',a,t,'Paso atrás · retirada táctica; objetivo fuera de alcance');render();return}const p=path(a,t);if(p[0])a.pos=p[0];showCombatAction('move',a,t,'Avanza hacia');logCombatAction('move',`➜ ${a.name} avanza hacia ${t.name}.`);render();return}const distance=dist(a,t),passives=a.selectedPassives||[],hawk=a.cls==='archer'&&passives.includes('Ojo de halcón'),elemental=a.cls==='archer'&&passives.includes('Flecha elemental'),expert=a.cls==='archer'&&passives.includes('Tirador experto'),piercing=a.cls==='archer'&&passives.includes('Disparo perforante')&&!(a.piercingTargets||[]).includes(t.id);if(piercing)a.piercingTargets=[...(a.piercingTargets||[]),t.id];const expertBonus=expert?distance*.10:0,crit=Math.random()<(d.crit+expertBonus),multiplier=piercing?3.5:1,baseRaw=Math.round(d.damage*(crit?1.6:1)*multiplier),physicalHit=damage(a,t,baseRaw),fireHit=elemental?elementalDamage(a,t,Math.round(baseRaw*.30),'fire'):0,kind=piercing?'skill':crit?'critical':(hawk||elemental||expert||steppedBack)?'enhanced':'attack',detail=piercing?'Disparo perforante · primer impacto ×3,5':steppedBack?`Paso atrás · ${physicalHit} físico tras retirarse`:expert?`Tirador experto +${Math.round(expertBonus*100)} pp CRIT a ${distance} casillas`:elemental?`Fuego +${fireHit} (30%)`:hawk?'Ojo de halcón activo':`${physicalHit} de daño`;chargeAttack(a);showCombatAction(kind,a,t,detail);render();effect(a,t,physicalHit+fireHit);logCombatAction(kind,`${piercing?'✹ ':crit?'✦ ':hawk||elemental||expert||steppedBack?'◎ ':''}${a.name} ataca a ${t.name}: ${physicalHit} físico${elemental?` + ${fireHit} fuego`:''}${steppedBack?' · Paso atrás':''}${piercing?' · Disparo perforante ×3,5':''}${crit?' crítico':''}${hawk?' · Ojo de halcón':''}${elemental?' · Flecha elemental':''}${expert?` · Tirador experto +${Math.round(expertBonus*100)} pp`:''}.`);if(!alive(t.team).length)end()};

/* Fijación: daño creciente y compuesto en impactos consecutivos al mismo objetivo. */
CLASS_FICHAS.archer.passives=CLASS_FICHAS.archer.passives.map(p=>p==='Cazador paciente'?'Fijación':p);
PASSIVE_DESCRIPTIONS['Fijación']='Activa: cada ataque consecutivo contra el mismo objetivo inflige un 10% más de daño, de forma compuesta.';
const implementedPassivesBeforeFixation=implementedPassivesFor;implementedPassivesFor=u=>{const passives=implementedPassivesBeforeFixation(u);return u.cls==='archer'?[...passives,'Fijación']:passives};
function fixationMultiplier(a,t){if(a.cls!=='archer'||!(a.selectedPassives||[]).includes('Fijación'))return 1;if(a.fixationTargetId===t.id)a.fixationHits=(a.fixationHits||0)+1;else{a.fixationTargetId=t.id;a.fixationHits=1}return Math.pow(1.1,a.fixationHits-1)}
const skillBeforeFixation=skill;skill=(a,t)=>{const hasFixation=a.cls==='archer'&&(a.selectedPassives||[]).includes('Fijación'),hasMarkedArrow=(a.selectedPassives||[]).includes(SPECIAL_PASSIVE_NAMES.archer);if(hasFixation&&hasMarkedArrow&&!a.skillCooldown&&dist(a,t)<=derived(a).range){const multiplier=fixationMultiplier(a,t),hit=damage(a,t,Math.round(derived(a).damage*multiplier));t.exposedTurns=3;spendSkill(a);specialEffect(a);showCombatAction('skill',a,t,`Flecha marcada · Fijación ×${multiplier.toFixed(2)}`);render();effect(a,t,hit);logCombatAction('skill',`✹ ${a.name} usa Flecha marcada contra ${t.name}: ${hit} de daño · Fijación ×${multiplier.toFixed(2)}.`);return true}return skillBeforeFixation(a,t)};
takeTurn=()=>{if(!running)return;if(!queue.length)refreshQueue();const a=queue.shift();if(!a||a.hp<=0){renderTurns();return}advanceCorpses();advanceEffects();const t=nearest(a);if(!t){end();return}const steppedBack=tryBackstep(a,t);if(steppedBack){logCombatAction('move',`↩ ${a.name} usa Paso atrás y se aleja de ${t.name}.`);render()}if(skill(a,t)){if(!alive(t.team).length)end();return}const d=derived(a);if(dist(a,t)>d.range){if(steppedBack){showCombatAction('enhanced',a,t,'Paso atrás · retirada táctica; objetivo fuera de alcance');render();return}const p=path(a,t);if(p[0])a.pos=p[0];showCombatAction('move',a,t,'Avanza hacia');logCombatAction('move',`➜ ${a.name} avanza hacia ${t.name}.`);render();return}const distance=dist(a,t),passives=a.selectedPassives||[],hawk=a.cls==='archer'&&passives.includes('Ojo de halcón'),elemental=a.cls==='archer'&&passives.includes('Flecha elemental'),expert=a.cls==='archer'&&passives.includes('Tirador experto'),piercing=a.cls==='archer'&&passives.includes('Disparo perforante')&&!(a.piercingTargets||[]).includes(t.id);if(piercing)a.piercingTargets=[...(a.piercingTargets||[]),t.id];const focusMultiplier=fixationMultiplier(a,t),focused=focusMultiplier>1,expertBonus=expert?distance*.10:0,crit=Math.random()<(d.crit+expertBonus),multiplier=(piercing?3.5:1)*focusMultiplier,baseRaw=Math.round(d.damage*(crit?1.6:1)*multiplier),physicalHit=damage(a,t,baseRaw),fireHit=elemental?elementalDamage(a,t,Math.round(baseRaw*.30),'fire'):0,kind=piercing?'skill':crit?'critical':(hawk||elemental||expert||steppedBack||focused)?'enhanced':'attack',detail=piercing?`Disparo perforante ×3,5${focused?` · Fijación ×${focusMultiplier.toFixed(2)}`:''}`:focused?`Fijación ×${focusMultiplier.toFixed(2)} · daño compuesto`:steppedBack?`Paso atrás · ${physicalHit} físico tras retirarse`:expert?`Tirador experto +${Math.round(expertBonus*100)} pp CRIT a ${distance} casillas`:elemental?`Fuego +${fireHit} (30%)`:hawk?'Ojo de halcón activo':`${physicalHit} de daño`;chargeAttack(a);showCombatAction(kind,a,t,detail);render();effect(a,t,physicalHit+fireHit);logCombatAction(kind,`${piercing?'✹ ':crit?'✦ ':hawk||elemental||expert||steppedBack||focused?'◎ ':''}${a.name} ataca a ${t.name}: ${physicalHit} físico${elemental?` + ${fireHit} fuego`:''}${steppedBack?' · Paso atrás':''}${piercing?' · Disparo perforante ×3,5':''}${focused?` · Fijación ×${focusMultiplier.toFixed(2)}`:''}${crit?' crítico':''}${hawk?' · Ojo de halcón':''}${elemental?' · Flecha elemental':''}${expert?` · Tirador experto +${Math.round(expertBonus*100)} pp`:''}.`);if(!alive(t.team).length)end()};

/* Disparo rápido: dos autoataques reales, cada uno al 50% de daño. */
CLASS_FICHAS.archer.passives=CLASS_FICHAS.archer.passives.map(p=>p==='Emboscada'?'Disparo rápido':p);
PASSIVE_DESCRIPTIONS['Disparo rápido']='Activa: cada ataque básico dispara dos veces. Cada impacto inflige el 50% del daño y aplica efectos de impacto por separado.';
const implementedPassivesBeforeRapidShot=implementedPassivesFor;implementedPassivesFor=u=>{const passives=implementedPassivesBeforeRapidShot(u);return u.cls==='archer'?[...passives,'Disparo rápido']:passives};
function archerAutoHit(a,t,halfDamage){const d=derived(a),passives=a.selectedPassives||[],distance=dist(a,t),hawk=passives.includes('Ojo de halcón'),elemental=passives.includes('Flecha elemental'),expert=passives.includes('Tirador experto'),piercing=passives.includes('Disparo perforante')&&!(a.piercingTargets||[]).includes(t.id);if(piercing)a.piercingTargets=[...(a.piercingTargets||[]),t.id];const fixation=fixationMultiplier(a,t),expertBonus=expert?distance*.10:0,crit=Math.random()<(d.crit+expertBonus),raw=Math.round(d.damage*(crit?1.6:1)*(halfDamage?.5:1)*(piercing?3.5:1)*fixation),physicalHit=damage(a,t,raw),fireHit=elemental?elementalDamage(a,t,Math.round(raw*.30),'fire'):0;return{physicalHit,fireHit,piercing,fixation,crit,hawk,elemental,expert,expertBonus}}
takeTurn=()=>{if(!running)return;if(!queue.length)refreshQueue();const a=queue.shift();if(!a||a.hp<=0){renderTurns();return}advanceCorpses();advanceEffects();const t=nearest(a);if(!t){end();return}const steppedBack=tryBackstep(a,t);if(steppedBack){logCombatAction('move',`↩ ${a.name} usa Paso atrás y se aleja de ${t.name}.`);render()}if(skill(a,t)){if(!alive(t.team).length)end();return}const d=derived(a);if(dist(a,t)>d.range){if(steppedBack){showCombatAction('enhanced',a,t,'Paso atrás · retirada táctica; objetivo fuera de alcance');render();return}const p=path(a,t);if(p[0])a.pos=p[0];showCombatAction('move',a,t,'Avanza hacia');logCombatAction('move',`➜ ${a.name} avanza hacia ${t.name}.`);render();return}const rapid=a.cls==='archer'&&(a.selectedPassives||[]).includes('Disparo rápido'),hits=[];for(let i=0;i<(rapid?2:1)&&t.hp>0;i++){const hit=a.cls==='archer'?archerAutoHit(a,t,rapid):(()=>{const crit=Math.random()<d.crit,physicalHit=damage(a,t,Math.round(d.damage*(crit?1.6:1)));return{physicalHit,fireHit:0,crit,piercing:false,fixation:1,hawk:false,elemental:false,expert:false,expertBonus:0}})();hits.push(hit);render();effect(a,t,hit.physicalHit+hit.fireHit);logCombatAction(hit.piercing?'skill':hit.crit?'critical':rapid||hit.fixation>1?'enhanced':'attack',`${rapid?`↠ ${a.name} impacto ${i+1}/2`: `${a.name} ataca`} a ${t.name}: ${hit.physicalHit} físico${hit.fireHit?` + ${hit.fireHit} fuego`:''}${hit.piercing?' · Disparo perforante ×3,5':''}${hit.fixation>1?` · Fijación ×${hit.fixation.toFixed(2)}`:''}${hit.crit?' · crítico':''}.`)}chargeAttack(a);const total=hits.reduce((sum,hit)=>sum+hit.physicalHit+hit.fireHit,0),last=hits[hits.length-1],kind=rapid?'enhanced':last.piercing?'skill':last.crit?'critical':'attack',detail=rapid?`Disparo rápido · 2 impactos · ${total} de daño`:last.piercing?'Disparo perforante · primer impacto ×3,5':`${total} de daño`;showCombatAction(kind,a,t,detail);if(!alive(t.team).length)end()};

/* Mago de combate: hechicero de primera línea con armamento marcial. */
CLASS_FICHAS.mage.passives=CLASS_FICHAS.mage.passives.map(p=>p==='Conflagración'?'Mago de combate':p);
CLASS_PROFICIENCIES.mage.weapons=['Espada corta','Espada larga','Escudo'];
PASSIVE_DESCRIPTIONS['Mago de combate']='Activa: alcance 1, +50 HP, +6 DEF plana, +15% resistencia física y +10% a cada resistencia elemental. Al golpear cuerpo a cuerpo, renueva una barrera del 10% de su vida máxima.';
const implementedPassivesBeforeBattleMage=implementedPassivesFor;implementedPassivesFor=u=>{const passives=implementedPassivesBeforeBattleMage(u);return u.cls==='mage'?[...passives,'Mago de combate']:passives};
const derivedBeforeBattleMage=derived;derived=u=>{const d=derivedBeforeBattleMage(u);if(u.cls==='mage'&&(u.selectedPassives||[]).includes('Mago de combate')){d.hp+=50;d.range=1}return d};
const damageBeforeBattleMage=damage;damage=(a,t,raw)=>{const battleMage=t.cls==='mage'&&(t.selectedPassives||[]).includes('Mago de combate');if(!battleMage)return damageBeforeBattleMage(a,t,raw);const base=t.resistances,boosted={...base,physical:(base.physical||0)+15,fire:(base.fire||0)+10,ice:(base.ice||0)+10,lightning:(base.lightning||0)+10,wind:(base.wind||0)+10,light:(base.light||0)+10};t.resistances=boosted;const value=damageBeforeBattleMage(a,t,raw);t.resistances=base;const absorbed=Math.min(t.arcaneBarrier||0,value);if(absorbed){t.arcaneBarrier-=absorbed;t.hp+=absorbed;if(t.hp>0){delete t.corpseTurns;t.removed=false}}return value-absorbed};
const effectBeforeBattleMage=effect;effect=(a,t,value)=>{if(a.cls==='mage'&&(a.selectedPassives||[]).includes('Mago de combate')&&dist(a,t)===1&&value>0){a.arcaneBarrier=Math.round(derived(a).hp*.10);logCombatAction('enhanced',`◈ ${a.name} renueva Guardia arcana: ${a.arcaneBarrier} de barrera.`)}effectBeforeBattleMage(a,t,value)};
const shieldCard=card;card=u=>{const base=shieldCard(u),shield=Math.max(0,u.arcaneBarrier||0);if(!shield)return base;const shieldMax=Math.max(1,u.arcaneBarrierMax||Math.round(derived(u).hp*.10)),capacity=u.maxHp+shieldMax,hpPct=Math.max(0,Math.min(100,u.hp/capacity*100)),shieldPct=Math.max(0,Math.min(100-hpPct,shield/capacity*100)),oldPct=Math.max(0,u.hp/u.maxHp*100);return base.replace(`<div class="bar"><i style="width:${oldPct}%"></i></div>`,`<div class="bar combined-bar" title="Vida: ${Math.ceil(u.hp)}/${u.maxHp} · Escudo: ${Math.ceil(shield)}/${shieldMax}"><i class="health-segment" style="width:${hpPct}%"></i><b class="shield-segment" style="left:${hpPct}%;width:${shieldPct}%"></b></div>`)};
const effectWithShieldCap=effect;effect=(a,t,value)=>{const battleMage=a.cls==='mage'&&(a.selectedPassives||[]).includes('Mago de combate')&&dist(a,t)===1&&value>0;if(battleMage){a.arcaneBarrierMax=Math.round(derived(a).hp*.10);a.arcaneBarrier=a.arcaneBarrierMax;logCombatAction('enhanced',`◈ ${a.name} renueva Guardia arcana: ${a.arcaneBarrier} de barrera.`);render()}effectBeforeBattleMage(a,t,value)};


/* Aggro persistente: una unidad conserva su objetivo hasta que muere o una habilidad fuerza el cambio. */
function dropAggro(target,duration=2){
  if(!target)return;
  target.aggroDropTurns=Math.max(target.aggroDropTurns||0,duration);
  units.forEach(u=>{
    if(u.aggroTargetId===target.id)delete u.aggroTargetId;
    if(u.tauntTarget===target.id){delete u.tauntTarget;u.tauntTurns=0}
  });
}
const advanceEffectsBeforeAggro=advanceEffects;
advanceEffects=()=>{
  advanceEffectsBeforeAggro();
  for(const u of units)if(u.aggroDropTurns>0)--u.aggroDropTurns;
};
nearest=a=>{
  if(a.team==='dummy')return null;
  const dummies=alive('dummy');
  const candidates=dummies.length?dummies:alive(a.team==='ally'?'enemy':'ally');
  if(!candidates.length){delete a.aggroTargetId;return null}
  const forced=candidates.find(t=>a.tauntTarget===t.id&&a.tauntTurns>0);
  if(forced){a.aggroTargetId=forced.id;return forced}
  const current=candidates.find(t=>t.id===a.aggroTargetId);
  if(current)return current;
  const visible=candidates.filter(t=>!t.aggroDropTurns);
  const pool=visible.length?visible:candidates;
  const chosen=[...pool].sort((x,y)=>dist(a,x)-dist(a,y)||x.id.localeCompare(y.id))[0];
  a.aggroTargetId=chosen.id;
  return chosen;
};

/* Capa opcional para visualizar el objetivo fijado por cada unidad. */
let aggroFocusVisible=false;

const focusToggle=document.createElement('button');
focusToggle.id='focus-toggle';
focusToggle.className='secondary';
focusToggle.type='button';
focusToggle.textContent=UI_TEXT.pathfinder.show;
$('#status').before(focusToggle);
const previewTarget=actor=>{
  const candidates=alive(actor.team==='ally'?'enemy':'ally');
  return [...candidates].sort((a,b)=>dist(actor,a)-dist(actor,b)||a.id.localeCompare(b.id))[0]||null;
};
function renderAggroFocus(){
  const arena=$('#arena');
  arena?.querySelector('.aggro-focus-layer')?.remove();
  if(!aggroFocusVisible||!arena)return;
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
  svg.classList.add('aggro-focus-layer');
  svg.setAttribute('viewBox',`0 0 ${arena.clientWidth} ${arena.clientHeight}`);
  const arenaRect=arena.getBoundingClientRect();
  const center=element=>{const r=element.getBoundingClientRect();return{x:r.left+r.width/2-arenaRect.left,y:r.top+r.height/2-arenaRect.top}};
  alive().filter(actor=>actor.team!=='dummy').forEach(actor=>{
    const target=running?(units.find(u=>u.id===actor.aggroTargetId&&u.hp>0)||nearest(actor)):previewTarget(actor),from=arena.querySelector(`[data-select="${actor.id}"]`),to=target&&arena.querySelector(`[data-select="${target.id}"]`);
    if(!target||!from||!to)return;
    const route=path(actor,target),destination=route.length?route[route.length-1]:actor.pos,destinationCell=arena.querySelector(`[data-cell="${destination.x},${destination.y}"]`),start=center(from),finish=destinationCell?center(destinationCell):start,targetPoint=center(to),team=actor.team;
    const routePoints=[start,...route.map(step=>{const cell=arena.querySelector(`[data-cell="${step.x},${step.y}"]`);return cell?center(cell):null}).filter(Boolean)];
    if(routePoints.length>1){const routeLine=document.createElementNS(ns,'polyline');routeLine.classList.add('aggro-route',team);routeLine.setAttribute('points',routePoints.map(p=>`${p.x},${p.y}`).join(' '));const routeTitle=document.createElementNS(ns,'title');routeTitle.textContent=UI_TEXT.pathfinder.routeTitle(actor.name);routeLine.append(routeTitle);svg.append(routeLine)}
    const targetLine=document.createElementNS(ns,'line');targetLine.classList.add('aggro-target-line',team);targetLine.setAttribute('x1',finish.x);targetLine.setAttribute('y1',finish.y);targetLine.setAttribute('x2',targetPoint.x);targetLine.setAttribute('y2',targetPoint.y);const targetTitle=document.createElementNS(ns,'title');targetTitle.textContent=UI_TEXT.pathfinder.targetTitle(actor.name,target.name);targetLine.append(targetTitle);svg.append(targetLine);
    const dot=document.createElementNS(ns,'circle');dot.classList.add('aggro-focus-dot',team);dot.setAttribute('cx',finish.x);dot.setAttribute('cy',finish.y);dot.setAttribute('r','5');svg.append(dot);
  });
  arena.append(svg);
}
focusToggle.onclick=()=>{
  aggroFocusVisible=!aggroFocusVisible;
  focusToggle.classList.toggle('active',aggroFocusVisible);
  focusToggle.textContent=aggroFocusVisible?UI_TEXT.pathfinder.hide:UI_TEXT.pathfinder.show;
  renderAggroFocus();
};
const renderBeforeAggroFocus=render;
render=()=>{renderBeforeAggroFocus();requestAnimationFrame(renderAggroFocus)};
const startBeforeAggroFocus=start;
start=()=>{startBeforeAggroFocus();alive().filter(u=>u.team!=='dummy').forEach(nearest);render()};
const takeTurnBeforeAggroFocus=takeTurn;
takeTurn=()=>{takeTurnBeforeAggroFocus();requestAnimationFrame(renderAggroFocus)};
window.addEventListener('resize',()=>requestAnimationFrame(renderAggroFocus));
$('#grid-zoom').addEventListener('input',()=>requestAnimationFrame(renderAggroFocus));

/* Berserk: guerrero sin armadura, defensa reducida, embestida y daño aumentado. */
CLASS_FICHAS.warrior.passives.push('Berserk');
PASSIVE_DESCRIPTIONS.Berserk='Activa: no puede llevar armadura, pierde 9 DEF plana, avanza hasta 2 casillas y, si entra en alcance tras moverse, ataca en el mismo turno. Sus ataques infligen un 50% más de daño.';
const implementedPassivesBeforeBerserk=implementedPassivesFor;
implementedPassivesFor=u=>u.cls==='warrior'?[...implementedPassivesBeforeBerserk(u),'Berserk']:implementedPassivesBeforeBerserk(u);
const derivedBeforeBerserk=derived;
derived=u=>derivedBeforeBerserk(u);
const renderFichaBeforeBerserk=renderFicha;
renderFicha=()=>{
  renderFichaBeforeBerserk();
  const u=units.find(x=>x.id===selectedId),armor=$('[data-slot="armor"]');
  if(!u||!armor||u.cls!=='warrior'||!(u.selectedPassives||[]).includes('Berserk'))return;
  u.equipment={...(u.equipment||{}),armor:'Sin armadura'};
  const r=roster.find(x=>x.id===u.id);if(r)r.equipment={...u.equipment};
  armor.innerHTML='<option selected>Sin armadura</option>';
  armor.disabled=true;
  armor.previousElementSibling.textContent='Armadura · bloqueada por Berserk';
};
const takeTurnBeforeBerserk=takeTurn;
takeTurn=()=>{
  if(!running)return;
  if(!queue.length)refreshQueue();
  const a=queue.shift();
  if(!a||a.hp<=0){renderTurns();requestAnimationFrame(renderAggroFocus);return}
  advanceCorpses();advanceEffects();
  const t=nearest(a);
  if(!t){end();return}
  const berserk=a.cls==='warrior'&&(a.selectedPassives||[]).includes('Berserk');
  const steppedBack=tryBackstep(a,t);
  if(steppedBack){logCombatAction('move',`↩ ${a.name} usa Paso atrás y se aleja de ${t.name}.`);render()}
  if(skill(a,t)){if(!alive(t.team).length)end();return}
  const d=derived(a);
  if(dist(a,t)>d.range){
    if(steppedBack){showCombatAction('enhanced',a,t,'Paso atrás · retirada táctica; objetivo fuera de alcance');render();return}
    const p=path(a,t),steps=berserk?Math.min(2,p.length):Math.min(1,p.length);
    if(steps){a.pos=p[steps-1];showCombatAction('move',a,t,berserk?`Berserk · avanza ${steps} casillas`:'Avanza hacia');logCombatAction('move',`➜ ${a.name}${berserk?' embiste':' avanza'} hacia ${t.name}.`);render()}
    if(!berserk||dist(a,t)>d.range)return;
  }
  const distance=dist(a,t),passives=a.selectedPassives||[],hawk=a.cls==='archer'&&passives.includes('Ojo de halcón'),elemental=a.cls==='archer'&&passives.includes('Flecha elemental'),expert=a.cls==='archer'&&passives.includes('Tirador experto'),piercing=a.cls==='archer'&&passives.includes('Disparo perforante')&&!(a.piercingTargets||[]).includes(t.id),rapid=a.cls==='archer'&&passives.includes('Disparo rápido');
  if(piercing)a.piercingTargets=[...(a.piercingTargets||[]),t.id];
  const hits=[];
  for(let i=0;i<(rapid?2:1)&&t.hp>0;i++){
    const hit=a.cls==='archer'?archerAutoHit(a,t,rapid):(()=>{const crit=Math.random()<d.crit,raw=Math.round(d.damage*(crit?1.6:1)*(berserk?1.5:1)),physicalHit=damage(a,t,raw);return{physicalHit,fireHit:0,crit,piercing:false,fixation:1,hawk:false,elemental:false,expert:false}})();
    hits.push(hit);render();effect(a,t,hit.physicalHit+hit.fireHit);
  }
  chargeAttack(a);
  const total=hits.reduce((sum,hit)=>sum+hit.physicalHit+hit.fireHit,0),last=hits[hits.length-1],kind=berserk?'enhanced':rapid?'enhanced':last.piercing?'skill':last.crit?'critical':'attack',detail=berserk?`Berserk · ${total} de daño (+50%)`:rapid?`Disparo rápido · 2 impactos · ${total} de daño`:last.piercing?'Disparo perforante · primer impacto ×3,5':`${total} de daño`;
  showCombatAction(kind,a,t,detail);logCombatAction(kind,`${berserk?'⚔ ':''}${a.name} ataca a ${t.name}: ${total} de daño${berserk?' · Berserk +50%':''}.`);
  if(!alive(t.team).length)end();
  requestAnimationFrame(renderAggroFocus);
};
units.forEach(normalizeAllPassiveChoices);roster.forEach(normalizeAllPassiveChoices);loadEditor();render();

/* Sangre caliente: robo de vida basado en el daño final infligido. */
PASSIVE_DESCRIPTIONS['Sangre caliente']='Activa: recupera vida equivalente al 20% del daño final infligido por sus ataques.';
const implementedPassivesBeforeHotBlood=implementedPassivesFor;
implementedPassivesFor=u=>u.cls==='warrior'?[...implementedPassivesBeforeHotBlood(u),'Sangre caliente']:implementedPassivesBeforeHotBlood(u);
const damageBeforeHotBlood=damage;
damage=(a,t,raw)=>{
  const dealt=damageBeforeHotBlood(a,t,raw);
  if(a.cls==='warrior'&&(a.selectedPassives||[]).includes('Sangre caliente')&&dealt>0){
    const healed=Math.min(Math.max(0,a.maxHp-a.hp),Math.ceil(dealt*.20));
    if(healed){a.hp+=healed;logCombatAction('enhanced',`♥ ${a.name} recupera ${healed} HP con Sangre caliente.`)}
  }
  return dealt;
};
units.forEach(normalizeAllPassiveChoices);roster.forEach(normalizeAllPassiveChoices);loadEditor();render();

/* Afinidad sanadora: convierte daño mágico acumulado en una cura periódica de apoyo. */
CLASS_FICHAS.mage.passives=CLASS_FICHAS.mage.passives.map(p=>p==='Barrera arcana'?'Afinidad sanadora':p);
PASSIVE_DESCRIPTIONS['Afinidad sanadora']='Activa: tras cada ataque almacena el 20% del daño final infligido. Al completar 5 ataques, cura toda la reserva al aliado con menor porcentaje de vida dentro de un área de 5×5.';
const implementedPassivesBeforeHealingAffinity=implementedPassivesFor;
implementedPassivesFor=u=>u.cls==='mage'?[...implementedPassivesBeforeHealingAffinity(u),'Afinidad sanadora']:implementedPassivesBeforeHealingAffinity(u);
function resolveHealingAffinity(a){
  a.healingAffinityPending=false;
  if(a.cls!=='mage'||!(a.selectedPassives||[]).includes('Afinidad sanadora')||!a.healingAffinityDamage)return;
  a.healingAffinityAttacks=(a.healingAffinityAttacks||0)+1;
  if(a.healingAffinityAttacks<5)return;
  const target=alive(a.team).filter(u=>Math.abs(u.pos.x-a.pos.x)<=2&&Math.abs(u.pos.y-a.pos.y)<=2).sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp||x.hp-y.hp)[0];
  if(!target)return;
  const healed=Math.min(Math.max(0,target.maxHp-target.hp),Math.round(a.healingAffinityDamage));
  a.healingAffinityAttacks=0;
  a.healingAffinityDamage=0;
  if(!healed)return;
  target.hp+=healed;
  showCombatAction('enhanced',a,target,`Afinidad sanadora · +${healed} HP`);
  logCombatAction('enhanced',`✚ ${a.name} libera Afinidad sanadora sobre ${target.name}: +${healed} HP.`);
  render();
}
const damageBeforeHealingAffinity=damage;
damage=(a,t,raw)=>{
  const dealt=damageBeforeHealingAffinity(a,t,raw);
  if(a.cls==='mage'&&(a.selectedPassives||[]).includes('Afinidad sanadora')&&dealt>0){
    a.healingAffinityDamage=(a.healingAffinityDamage||0)+dealt*.20;
    if(!a.healingAffinityPending){a.healingAffinityPending=true;queueMicrotask(()=>resolveHealingAffinity(a))}
  }
  return dealt;
};
units.forEach(normalizeAllPassiveChoices);roster.forEach(normalizeAllPassiveChoices);loadEditor();render();

/* Fragmentación: duplica las magias con objetivo, al 75% de potencia por lanzamiento. */
PASSIVE_DESCRIPTIONS['Fragmentación']='Activa: Bola de fuego y Afinidad sanadora se lanzan dos veces al 75% de potencia, buscando objetivos diferentes siempre que sea posible.';
const implementedPassivesBeforeFragmentation=implementedPassivesFor;
implementedPassivesFor=u=>u.cls==='mage'?[...implementedPassivesBeforeFragmentation(u),'Fragmentación']:implementedPassivesBeforeFragmentation(u);
const skillBeforeFragmentation=skill;
skill=(a,t)=>{
  const fragmented=a.cls==='mage'&&(a.selectedPassives||[]).includes('Fragmentación')&&(a.selectedPassives||[]).includes(SPECIAL_PASSIVE_NAMES.mage);
  if(!fragmented||a.skillCooldown||dist(a,t)>derived(a).range)return skillBeforeFragmentation(a,t);
  const foes=alive(a.team==='ally'?'enemy':'ally'),range=derived(a).range,candidates=foes.filter(x=>dist(a,x)<=range);
  const first=t,alternatives=candidates.filter(x=>x!==first&&x.id!==first.id).sort((x,y)=>dist(y,first)-dist(x,first)||dist(a,x)-dist(a,y)||x.id.localeCompare(y.id)),second=alternatives[0]||first,spellTargets=[first,second];
  spendSkill(a);
  spellTargets.forEach((center,index)=>{
    const hits=foes.filter(x=>x.hp>0&&Math.abs(x.pos.x-center.pos.x)<=1&&Math.abs(x.pos.y-center.pos.y)<=1),impactDamage=Math.round(derived(a).damage*.8*.75);
    fireballCasting=true;
    const results=hits.map(x=>[x,damage(a,x,impactDamage)]);
    const centerDamage=results.find(([x])=>x.id===center.id)?.[1]||0;
    effect(a,center,centerDamage);
    fireballCasting=false;
    const total=results.reduce((sum,[,value])=>sum+value,0);
    logCombatAction('skill',`✹ ${a.name} lanza Bola de fuego fragmentada ${index+1}/2 sobre ${center.name}: ${total} de daño de fuego total.`);
  });
  specialEffect(a);showCombatAction('skill',a,first,`Fragmentación · ${first.name} + ${second.name}`);render();
  return true;
};
const resolveHealingAffinityBeforeFragmentation=resolveHealingAffinity;
resolveHealingAffinity=a=>{
  const fragmented=a.cls==='mage'&&(a.selectedPassives||[]).includes('Fragmentación');
  if(!fragmented)return resolveHealingAffinityBeforeFragmentation(a);
  a.healingAffinityPending=false;
  if(!(a.selectedPassives||[]).includes('Afinidad sanadora')||!a.healingAffinityDamage)return;
  a.healingAffinityAttacks=(a.healingAffinityAttacks||0)+1;
  if(a.healingAffinityAttacks<5)return;
  const candidates=alive(a.team).filter(u=>u.hp<u.maxHp&&Math.abs(u.pos.x-a.pos.x)<=2&&Math.abs(u.pos.y-a.pos.y)<=2).sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp||x.hp-y.hp);
  if(!candidates.length)return;
  const targets=[candidates[0],candidates[1]||candidates[0]],amount=Math.round(a.healingAffinityDamage*.75);
  a.healingAffinityAttacks=0;
  a.healingAffinityDamage=0;
  targets.forEach((target,index)=>{
    const healed=Math.min(Math.max(0,target.maxHp-target.hp),amount);
    if(!healed)return;
    target.hp+=healed;
    logCombatAction('enhanced',`✚ ${a.name} libera Afinidad sanadora fragmentada ${index+1}/2 sobre ${target.name}: +${healed} HP.`);
  });
  showCombatAction('enhanced',a,targets[0],`Afinidad fragmentada · 2 curas al 75%`);
  render();
};
units.forEach(normalizeAllPassiveChoices);roster.forEach(normalizeAllPassiveChoices);loadEditor();render();

/* Bola de fuego unificada: los dummies también son objetivos y reciben daño de área. */
const skillBeforeDummyFireball=skill;
skill=(a,t)=>{
  const fireball=a.cls==='mage'&&(a.selectedPassives||[]).includes(SPECIAL_PASSIVE_NAMES.mage)&&!a.skillCooldown&&dist(a,t)<=derived(a).range;
  if(!fireball)return skillBeforeDummyFireball(a,t);
  const enemyTeam=a.team==='ally'?'enemy':'ally',foes=[...alive(enemyTeam),...alive('dummy')].filter((u,i,list)=>list.findIndex(x=>x.id===u.id)===i),fragmented=(a.selectedPassives||[]).includes('Fragmentación'),range=derived(a).range,candidates=foes.filter(x=>dist(a,x)<=range),first=t,alternatives=candidates.filter(x=>x!==first&&x.id!==first.id).sort((x,y)=>dist(y,first)-dist(x,first)||dist(a,x)-dist(a,y)||x.id.localeCompare(y.id)),second=alternatives[0]||first,spellTargets=fragmented?[first,second]:[first],power=fragmented?.75:1;
  spendSkill(a);
  spellTargets.forEach((center,index)=>{
    const hits=foes.filter(x=>x.hp>0&&Math.abs(x.pos.x-center.pos.x)<=1&&Math.abs(x.pos.y-center.pos.y)<=1),impactDamage=Math.round(derived(a).damage*.8*power);
    fireballCasting=true;
    const results=hits.map(x=>[x,damage(a,x,impactDamage)]),centerDamage=results.find(([x])=>x.id===center.id)?.[1]||0;
    effect(a,center,centerDamage);
    fireballCasting=false;
    const total=results.reduce((sum,[,value])=>sum+value,0);
    logCombatAction('skill',`✹ ${a.name} lanza Bola de fuego${fragmented?` fragmentada ${index+1}/2`:''} sobre ${center.name}: ${total} de daño de fuego total.`);
  });
  specialEffect(a);showCombatAction('skill',a,first,fragmented?`Fragmentación · ${first.name} + ${second.name}`:`Bola de fuego · ${first.name}`);render();
  return true;
};

/* Mago elemental: el elemento elegido modifica hechizo especial y autoataques. */
const MAGE_ELEMENTS=GAME_CONTENT.mageElements;
SPECIAL_PASSIVE_NAMES.mage='Mago elemental';
SPECIAL_DESCRIPTIONS.mage='Elige un elemento para sus autoataques y su hechizo especial.';
units.concat(roster).forEach(u=>{if(u.cls==='mage')u.selectedPassives=(u.selectedPassives||[]).map(p=>p==='Bola de fuego'?'Mago elemental':p)});
function mageElement(a){return MAGE_ELEMENTS[a.equipment?.element]?a.equipment.element:'fire'}
function elementalSpellDamage(a,t,raw,element){
  const previous=mageElementContext;mageElementContext=element;
  const value=damage(a,t,raw);
  mageElementContext=previous;
  return value;
}
function windPush(a,t,spellDamage){
  const dx=t.pos.x-a.pos.x,dy=t.pos.y-a.pos.y,step=Math.abs(dx)>=Math.abs(dy)?{x:Math.sign(dx)||1,y:0}:{x:0,y:Math.sign(dy)||1};
  for(let i=0;i<3;i++){
    const next={x:t.pos.x+step.x,y:t.pos.y+step.y},blocker=units.find(u=>u.id!==t.id&&!u.removed&&u.hp>0&&u.pos.x===next.x&&u.pos.y===next.y);
    if(!passable(next.x,next.y)||blocker){
      const collisionRaw=Math.max(1,Math.round(spellDamage*.30)),targetHit=elementalSpellDamage(a,t,collisionRaw,'wind'),blockerHit=blocker?elementalSpellDamage(a,blocker,collisionRaw,'wind'):0;
      return{note:blocker?`${t.name} choca con ${blocker.name}: ${targetHit} + ${blockerHit} de daño de colisión`:`${t.name} choca con un muro: ${targetHit} de daño de colisión`,hits:[[t,targetHit],...(blocker?[[blocker,blockerHit]]:[])]};
    }
    t.pos=next;
  }
  return{note:`${t.name} es empujado 3 casillas`,hits:[]};
}
function elementalImpactCells(a,center,element){
  if(element==='fire'){
    const cells=[];for(let y=center.pos.y-1;y<=center.pos.y+1;y++)for(let x=center.pos.x-1;x<=center.pos.x+1;x++)if(x>=0&&x<W&&y>=0&&y<H)cells.push({x,y});return cells;
  }
  if(element==='lightning')return [[0,0],[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:center.pos.x+dx,y:center.pos.y+dy})).filter(p=>p.x>=0&&p.x<W&&p.y>=0&&p.y<H);
  if(element==='wind'){
    const dx=center.pos.x-a.pos.x,dy=center.pos.y-a.pos.y,step=Math.abs(dx)>=Math.abs(dy)?{x:Math.sign(dx)||1,y:0}:{x:0,y:Math.sign(dy)||1},cells=[{...center.pos}],cursor={...center.pos};
    for(let i=0;i<3;i++){cursor.x+=step.x;cursor.y+=step.y;if(cursor.x<0||cursor.x>=W||cursor.y<0||cursor.y>=H)break;cells.push({...cursor});if(!passable(cursor.x,cursor.y))break}return cells;
  }
  return [{...center.pos}];
}
let mageElementContext=null;
const damageBeforeElementalMage=damage;
damage=(a,t,raw)=>{
  if(a.iceDamageTurns>0)raw=Math.round(raw*.50);
  if(t.electricMageId)raw=Math.round(raw*1.20);
  const elemental=a.cls==='mage'&&(a.selectedPassives||[]).includes('Mago elemental'),element=mageElementContext||mageElement(a);
  if(!elemental)return damageBeforeElementalMage(a,t,raw);
  const resistances=t.resistances||{},savedFire=resistances.fire;
  resistances.fire=resistances[element]??0;
  const savedCasting=fireballCasting;fireballCasting=true;
  const dealt=damageBeforeElementalMage(a,t,raw);
  fireballCasting=savedCasting;resistances.fire=savedFire;
  return dealt;
};
const skillBeforeElementalMage=skill;
skill=(a,t)=>{
  const active=a.cls==='mage'&&(a.selectedPassives||[]).includes('Mago elemental')&&!a.skillCooldown&&dist(a,t)<=derived(a).range;
  if(!active)return skillBeforeElementalMage(a,t);
  const element=mageElement(a),foes=[...alive(a.team==='ally'?'enemy':'ally'),...alive('dummy')].filter((u,i,list)=>list.findIndex(x=>x.id===u.id)===i),fragmented=(a.selectedPassives||[]).includes('Fragmentación'),range=derived(a).range,candidates=foes.filter(x=>dist(a,x)<=range),alternatives=candidates.filter(x=>x!==t&&x.id!==t.id).sort((x,y)=>dist(y,t)-dist(x,t)||dist(a,x)-dist(a,y)||x.id.localeCompare(y.id)),centers=fragmented?[t,alternatives[0]||t]:[t],spellRaw=Math.round(derived(a).damage*.80*(fragmented?.75:1));
  spendSkill(a);
  const labels={fire:'Bola de fuego',lightning:'Tormenta eléctrica',wind:'Ráfaga de viento',ice:'Lanza de hielo',light:'Destello de luz'},allResults=[],notes=[],visuals=[];
  centers.forEach((center,index)=>{
    const impactCells=elementalImpactCells(a,center,element);
    const affected=element==='fire'?foes.filter(x=>x.hp>0&&Math.abs(x.pos.x-center.pos.x)<=1&&Math.abs(x.pos.y-center.pos.y)<=1):element==='lightning'?foes.filter(x=>x.hp>0&&(x.pos.x===center.pos.x&&Math.abs(x.pos.y-center.pos.y)<=1||x.pos.y===center.pos.y&&Math.abs(x.pos.x-center.pos.x)<=1)):center.hp>0?[center]:[];
    const results=affected.map(x=>[x,elementalSpellDamage(a,x,spellRaw,element)]);allResults.push(...results);
    if(element==='lightning'){affected.forEach(x=>x.electricMageId=a.id);notes.push('vulnerabilidad eléctrica +20% hasta la próxima acción del mago')}
    if(element==='ice'&&center.hp>0){center.iceDamageTurns=2;notes.push(`${center.name}: daño −50% durante 2 turnos propios`)}
    if(element==='light'&&center.hp>0){center.lightSkipTurns=1;notes.push(`${center.name}: pierde su siguiente acción`)}
    const centerDamage=results.find(([x])=>x.id===center.id)?.[1]||0;
    const windResult=element==='wind'&&center.hp>0?windPush(a,center,centerDamage):null;
    if(windResult){notes.push(windResult.note);allResults.push(...windResult.hits)}
    visuals.push({center,value:centerDamage,cells:impactCells,element});
    if(fragmented)notes.push(`${labels[element]} ${index+1}/2 sobre ${center.name}`);
  });
  const total=allResults.reduce((sum,[,value])=>sum+value,0);
  showCombatAction('skill',a,t,`${labels[element]}${fragmented?' fragmentada':''} · ${total} de daño`);
  logCombatAction('skill',`✹ ${a.name} usa ${labels[element]}${fragmented?' fragmentada':''}: ${total} de daño.${notes.length?` ${notes.join(' · ')}.`:''}`);
  render();
  specialEffect(a);
  visuals.forEach((visual,index)=>setTimeout(()=>playElementalSpellVisual(a,visual),index*140));
  return true;
};
const takeTurnBeforeElementalStatuses=takeTurn;
takeTurn=()=>{
  if(!running)return;
  if(!queue.length)refreshQueue();
  const actor=queue[0];
  if(!actor)return;
  if(actor.lightSkipTurns>0){
    queue.shift();advanceCorpses();advanceEffects();actor.lightSkipTurns--;
    showCombatAction('enhanced',actor,null,'Destello de luz · turno perdido');
    logCombatAction('enhanced',`☀ ${actor.name} pierde su acción por Destello de luz.`);
    render();requestAnimationFrame(renderAggroFocus);return;
  }
  takeTurnBeforeElementalStatuses();
  if(actor.iceDamageTurns>0)actor.iceDamageTurns--;
  if(actor.cls==='mage')units.forEach(u=>{if(u.electricMageId===actor.id)delete u.electricMageId});
  requestAnimationFrame(renderAggroFocus);
};
const renderFichaBeforeElementalMage=renderFicha;
renderFicha=()=>{
  renderFichaBeforeElementalMage();
  const u=units.find(x=>x.id===selectedId),select=$('[data-slot="weapon"]');
  if(!u||u.cls!=='mage'||!(u.selectedPassives||[]).includes('Mago elemental')||!select)return;
  u.equipment={...(u.equipment||{}),element:mageElement(u)};
  select.previousElementSibling.textContent='Elemento · seleccionar';
  select.innerHTML=Object.entries(MAGE_ELEMENTS).map(([id,label])=>`<option value="${id}" ${u.equipment.element===id?'selected':''}>${label}</option>`).join('');
  select.onchange=()=>{u.equipment.element=select.value;const r=roster.find(x=>x.id===u.id);if(r)r.equipment={...u.equipment};renderFicha()};
};
units.forEach(normalizeAllPassiveChoices);roster.forEach(normalizeAllPassiveChoices);loadEditor();render();

/* Efectos visuales propios para cada elemento del Mago elemental. */

const effectBeforeElementalVisuals=effect;
effect=(a,t,value)=>{
  if(a.cls!=='mage'||!(a.selectedPassives||[]).includes('Mago elemental'))return effectBeforeElementalVisuals(a,t,value);
  const arena=$('#arena'),from=arena?.querySelector(`[data-select="${a.id}"]`),to=arena?.querySelector(`[data-select="${t.id}"]`);
  if(!arena||!from||!to)return;
  const ar=arena.getBoundingClientRect(),f=from.getBoundingClientRect(),g=to.getBoundingClientRect(),x=f.left+f.width/2-ar.left,y=f.top+f.height/2-ar.top,dx=g.left+g.width/2-ar.left-x,dy=g.top+g.height/2-ar.top-y,element=mageElement(a),trace=document.createElement('i');
  trace.className=`element-trace basic-element basic-${element}`;trace.style.left=(x-7)+'px';trace.style.top=(y-7)+'px';
  from.classList.add('attacking');to.classList.add('hit');if(value>0)to.insertAdjacentHTML('beforeend',`<span class="damage">-${value}</span>`);arena.append(trace);
  trace.animate([{transform:'translate(0,0) scale(.65)',opacity:.5},{transform:`translate(${dx}px,${dy}px) scale(1)`,opacity:1}],{duration:360,easing:'ease-out',fill:'forwards'});
  setTimeout(()=>{from.classList.remove('attacking');to.classList.remove('hit');trace.remove()},700);
};
function playElementalSpellVisual(a,{center,value,cells,element}){
  const arena=$('#arena'),from=arena?.querySelector(`[data-select="${a.id}"]`),to=arena?.querySelector(`[data-select="${center.id}"]`);if(!arena||!from||!to)return;
  cells.forEach(pos=>{const cell=arena.querySelector(`[data-cell="${pos.x},${pos.y}"]`);if(!cell)return;const mark=document.createElement('i');mark.className=`spell-impact ${element}`;cell.append(mark);setTimeout(()=>mark.remove(),800)});
  const ar=arena.getBoundingClientRect(),f=from.getBoundingClientRect(),g=to.getBoundingClientRect(),x=f.left+f.width/2-ar.left,y=f.top+f.height/2-ar.top,dx=g.left+g.width/2-ar.left-x,dy=g.top+g.height/2-ar.top-y,length=Math.hypot(dx,dy),core=document.createElement('i');
  core.className=`element-trace spell-core ${element}`;core.style.left=x+'px';core.style.top=y+'px';core.style.setProperty('--angle',Math.atan2(dy,dx)+'rad');
  if(element==='wind'){core.animate([{transform:`rotate(${Math.atan2(dy,dx)}rad) translateX(0) scale(.7)`,opacity:.25},{transform:`rotate(${Math.atan2(dy,dx)}rad) translateX(${length}px) scale(1.5)`,opacity:1}],{duration:520,easing:'ease-out',fill:'forwards'})}else core.style.width=length+'px';
  from.classList.add('attacking');to.classList.add('hit');if(value>0)to.insertAdjacentHTML('beforeend',`<span class="damage">-${value}</span>`);arena.append(core);
  setTimeout(()=>{from.classList.remove('attacking');to.classList.remove('hit');core.remove()},780);
}
const specialEffectBeforeElementalVisuals=specialEffect;
specialEffect=a=>{
  if(a.cls!=='mage'||!(a.selectedPassives||[]).includes('Mago elemental'))return specialEffectBeforeElementalVisuals(a);
  const token=$('#arena')?.querySelector(`[data-select="${a.id}"]`);if(!token)return;
  token.classList.add('special');token.insertAdjacentHTML('beforeend',`<span class="special-pop">✦ ${MAGE_ELEMENTS[mageElement(a)].toUpperCase()}</span>`);setTimeout(()=>token.classList.remove('special'),950);
};

const cardBeforeElementalStates=card;
card=u=>{
  const states=[];
  if(u.electricMageId)states.push('<span class="elemental-state lightning">⚡ +20% daño</span>');
  if(u.iceDamageTurns>0)states.push(`<span class="elemental-state ice">❄ daño −50% · ${u.iceDamageTurns}</span>`);
  if(u.lightSkipTurns>0)states.push('<span class="elemental-state light">☀ siguiente turno perdido</span>');
  const base=cardBeforeElementalStates(u);
  return states.length?base.replace('</div><div class="bar">',`${states.join('')}</div><div class="bar">`):base;
};
loadEditor();render();

/* Variación de enemigos y resumen de habilidades en las cards. */
const ENEMY_PASSIVE_POOL={
  warrior:['Furia','Berserk','Sangre caliente'],
  archer:['Flecha marcada','Ojo de halcón','Flecha elemental','Tirador experto','Disparo perforante','Paso atrás','Fijación','Disparo rápido'],
  mage:['Mago elemental','Mago de combate','Afinidad sanadora'],
  assassin:['Salto sombrío'],
  tank:['Desafío']
};
function assignEnemyPassive(u){
  const available=(ENEMY_PASSIVE_POOL[u.cls]||[]).filter(p=>implementedPassivesFor(u).includes(p));
  if(!available.length)return;
  const passive=available[Math.floor(Math.random()*available.length)];
  u.selectedPassives=[passive];
  u.specialSelected=passive===SPECIAL_PASSIVE_NAMES[u.cls];
  u.specialEnabled=true;
  if(u.cls==='mage'&&passive==='Mago elemental')u.equipment={...(u.equipment||{}),element:Object.keys(MAGE_ELEMENTS)[Math.floor(Math.random()*Object.keys(MAGE_ELEMENTS).length)]};
}
const setupBeforeEnemyPassives=setup;
setup=()=>{setupBeforeEnemyPassives();units.filter(u=>u.team==='enemy').forEach(assignEnemyPassive);render()};

const cardBeforeAbilitySummary=card;
card=u=>{
  const base=cardBeforeAbilitySummary(u),maxCharge=5,cooldown=Math.max(0,u.skillCooldown||0),charge=Math.max(0,maxCharge-cooldown),passives=u.selectedPassives||[],labels=passives.length?passives.map(p=>`<span class="${p===SPECIAL_PASSIVE_NAMES[u.cls]?'special':''}">${p}</span>`).join(''):'<span>Sin pasiva</span>',summary=`<div class="spell-charge" title="La habilidad recupera carga al realizar ataques básicos"><span>HAB</span><i><b style="width:${charge/maxCharge*100}%"></b></i><b>${charge}/${maxCharge}</b></div><div class="spell-passives">${labels}</div>`;
  return base.replace('</div><div class="bar">',`${summary}</div><div class="bar">`);
};
setup();loadEditor();render();
