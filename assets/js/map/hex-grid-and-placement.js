/* Tablero hexagonal pointy-top (coordenadas offset por filas impares). */
const HEX_DIRECTIONS=[{x:1,y:0,z:-1},{x:1,y:-1,z:0},{x:0,y:-1,z:1},{x:-1,y:0,z:1},{x:-1,y:1,z:0},{x:0,y:1,z:-1}];
function offsetToCube(pos){const x=pos.x-(pos.y-(pos.y&1))/2,z=pos.y;return{x,y:-x-z,z}}
function cubeToOffset(cube){return{x:cube.x+(cube.z-(cube.z&1))/2,y:cube.z}}
function hexDistancePos(a,b){const ac=offsetToCube(a),bc=offsetToCube(b);return Math.max(Math.abs(ac.x-bc.x),Math.abs(ac.y-bc.y),Math.abs(ac.z-bc.z))}
function hexNeighbors(pos){const cube=offsetToCube(pos);return HEX_DIRECTIONS.map(d=>cubeToOffset({x:cube.x+d.x,y:cube.y+d.y,z:cube.z+d.z})).filter(p=>p.x>=0&&p.x<W&&p.y>=0&&p.y<H)}
function hexCellsInRadius(center,radius){const cube=offsetToCube(center),cells=[];for(let dx=-radius;dx<=radius;dx++)for(let dy=Math.max(-radius,-dx-radius);dy<=Math.min(radius,-dx+radius);dy++){const dz=-dx-dy,p=cubeToOffset({x:cube.x+dx,y:cube.y+dy,z:cube.z+dz});if(p.x>=0&&p.x<W&&p.y>=0&&p.y<H)cells.push(p)}return cells}
function hexDirectionAway(from,to){const fc=offsetToCube(from),tc=offsetToCube(to),vx=tc.x-fc.x,vy=tc.y-fc.y,vz=tc.z-fc.z;return HEX_DIRECTIONS.slice().sort((a,b)=>(b.x*vx+b.y*vy+b.z*vz)-(a.x*vx+a.y*vy+a.z*vz))[0]}
function advanceHex(pos,direction){const c=offsetToCube(pos);return cubeToOffset({x:c.x+direction.x,y:c.y+direction.y,z:c.z+direction.z})}
dist=(a,b)=>hexDistancePos(a.pos,b.pos);
path=(a,t)=>{const q=[{x:a.pos.x,y:a.pos.y,p:[]}],seen=new Set([key(a.pos.x,a.pos.y)]),range=derived(a).range;while(q.length){const n=q.shift(),probe={...a,pos:{x:n.x,y:n.y}};if(dist(probe,t)<=range)return n.p;for(const next of hexNeighbors(n)){const k=key(next.x,next.y);if(seen.has(k)||!canOccupy(a,next.x,next.y))continue;seen.add(k);q.push({...next,p:[...n.p,next]})}}return[]};


function layoutHexArena(){const arena=$('#arena');if(!arena)return;const cols=W+.5,rows=H*.75+.25;arena.style.aspectRatio=`${cols*.8660254}/${rows}`;arena.querySelectorAll('[data-cell]').forEach(cell=>{const [x,y]=cell.dataset.cell.split(',').map(Number);cell.style.left=`${(x+(y&1)*.5)/cols*100}%`;cell.style.top=`${y*.75/rows*100}%`;cell.style.width=`${1/cols*100}%`;cell.style.height=`${1/rows*100}%`});const label=$('#arena-size');if(label)label.textContent=`ARENA HEXAGONAL · ${W} × ${H}`}
const renderBeforeHexGrid=render;
render=()=>{renderBeforeHexGrid();layoutHexArena()};

/* Habilidades cuya geometría depende de las seis direcciones del tablero. */
tryBackstep=(a,t)=>{const active=a.cls==='archer'&&(a.selectedPassives||[]).includes('Paso atrás');if(!active)return false;a.backstepTurns=(a.backstepTurns||0)+1;if(a.backstepTurns%2!==0||dist(a,t)!==1)return false;const options=hexNeighbors(a.pos).filter(p=>canOccupy(a,p.x,p.y)&&hexDistancePos(p,t.pos)>1).sort((p,q)=>hexDistancePos(q,t.pos)-hexDistancePos(p,t.pos));if(!options.length)return false;a.pos=options[0];return true};
resolveHealingAffinity=a=>{a.healingAffinityPending=false;if(a.cls!=='mage'||!(a.selectedPassives||[]).includes('Afinidad sanadora')||!a.healingAffinityDamage)return;a.healingAffinityAttacks=(a.healingAffinityAttacks||0)+1;if(a.healingAffinityAttacks<5)return;const fragmented=(a.selectedPassives||[]).includes('Fragmentación'),candidates=alive(a.team).filter(u=>u.hp<u.maxHp&&hexDistancePos(a.pos,u.pos)<=2).sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp||x.hp-y.hp);if(!candidates.length)return;const targets=fragmented?[candidates[0],candidates[1]||candidates[0]]:[candidates[0]],amount=Math.round(a.healingAffinityDamage*(fragmented?.75:1));a.healingAffinityAttacks=0;a.healingAffinityDamage=0;targets.forEach((target,index)=>{const healed=Math.min(Math.max(0,target.maxHp-target.hp),amount);if(!healed)return;target.hp+=healed;logCombatAction('enhanced',`✚ ${a.name} libera Afinidad sanadora${fragmented?` fragmentada ${index+1}/2`:''} sobre ${target.name}: +${healed} HP.`)});showCombatAction('enhanced',a,targets[0],fragmented?'Afinidad fragmentada · 2 curas al 75%':`Afinidad sanadora · ${targets[0].name}`);render()};
function hexWindPush(a,t,spellDamage){const direction=hexDirectionAway(a.pos,t.pos);for(let i=0;i<3;i++){const next=advanceHex(t.pos,direction),blocker=units.find(u=>u.id!==t.id&&!u.removed&&u.hp>0&&u.pos.x===next.x&&u.pos.y===next.y);if(!passable(next.x,next.y)||blocker){const collisionRaw=Math.max(1,Math.round(spellDamage*.30)),targetHit=elementalSpellDamage(a,t,collisionRaw,'wind'),blockerHit=blocker?elementalSpellDamage(a,blocker,collisionRaw,'wind'):0;return{note:blocker?`${t.name} choca con ${blocker.name}: ${targetHit} + ${blockerHit} de daño de colisión`:`${t.name} choca con un muro: ${targetHit} de daño de colisión`,hits:[[t,targetHit],...(blocker?[[blocker,blockerHit]]:[])]}}t.pos=next}return{note:`${t.name} es empujado 3 hexágonos`,hits:[]}}
elementalImpactCells=(a,center,element)=>{if(element==='fire'||element==='lightning')return hexCellsInRadius(center.pos,1);if(element==='wind'){const direction=hexDirectionAway(a.pos,center.pos),cells=[{...center.pos}];let cursor={...center.pos};for(let i=0;i<3;i++){cursor=advanceHex(cursor,direction);if(cursor.x<0||cursor.x>=W||cursor.y<0||cursor.y>=H)break;cells.push({...cursor});if(!passable(cursor.x,cursor.y))break}return cells}return[{...center.pos}]};

const skillBeforeHexAbilities=skill;
skill=(a,t)=>{
  if(a.skillCooldown)return skillBeforeHexAbilities(a,t);
  const d=derived(a),enemyTeam=a.team==='ally'?'enemy':'ally',foes=[...alive(enemyTeam),...alive('dummy')].filter((u,i,list)=>list.findIndex(x=>x.id===u.id)===i);
  let custom=false,used=false,previousSource=combatDamageSource;
  if(a.cls==='assassin'&&dist(a,t)<=4){custom=true;const spots=hexNeighbors(t.pos).filter(p=>canOccupy(a,p.x,p.y)).sort((p,q)=>hexDistancePos(p,a.pos)-hexDistancePos(q,a.pos));if(spots.length){a.pos=spots[0];spendSkill(a);showCombatAction('skill',a,t,'Salto sombrío');specialEffect(a);render();used=true}}
  else if(a.cls==='tank'){custom=true;const affected=alive(enemyTeam).filter(x=>hexDistancePos(a.pos,x.pos)<=1);if(affected.length){affected.forEach(x=>{x.tauntTarget=a.id;x.tauntTurns=3;x.aggroTargetId=a.id;delete x.avoidAggroTargetId});spendSkill(a);showCombatAction('skill',a,null,`Provocar · ${affected.length} provocados`);logCombatAction('skill',`✦ ${a.name} usa Provocar sobre ${affected.map(x=>x.name).join(', ')}.`);specialEffect(a);render();used=true}}
  else if(a.cls==='mage'&&(a.selectedPassives||[]).includes('Mago elemental')&&dist(a,t)<=d.range){custom=true;combatDamageSource='ability';const element=mageElement(a),fragmented=(a.selectedPassives||[]).includes('Fragmentación'),candidates=foes.filter(x=>dist(a,x)<=d.range),alternatives=candidates.filter(x=>x.id!==t.id).sort((x,y)=>dist(y,t)-dist(x,t)||dist(a,x)-dist(a,y)),centers=fragmented?[t,alternatives[0]||t]:[t],spellRaw=Math.round(d.damage*.8*(fragmented?.75:1)),labels={fire:'Bola de fuego',lightning:'Tormenta eléctrica',wind:'Ráfaga de viento',ice:'Lanza de hielo',light:'Destello de luz'},allResults=[],notes=[],visuals=[];spendSkill(a);centers.forEach((center,index)=>{const cells=elementalImpactCells(a,center,element),affected=(element==='fire'||element==='lightning')?foes.filter(x=>x.hp>0&&hexDistancePos(x.pos,center.pos)<=1):center.hp>0?[center]:[],results=affected.map(x=>[x,elementalSpellDamage(a,x,spellRaw,element)]);allResults.push(...results);if(element==='lightning'){affected.forEach(x=>x.electricMageId=a.id);notes.push('vulnerabilidad eléctrica +20% hasta la próxima acción del mago')}if(element==='ice'&&center.hp>0){center.iceDamageTurns=2;notes.push(`${center.name}: daño −50% durante 2 turnos propios`)}if(element==='light'&&center.hp>0){center.lightSkipTurns=1;notes.push(`${center.name}: pierde su siguiente acción`)}const centerDamage=results.find(([x])=>x.id===center.id)?.[1]||0,windResult=element==='wind'&&center.hp>0?hexWindPush(a,center,centerDamage):null;if(windResult){notes.push(windResult.note);allResults.push(...windResult.hits)}visuals.push({center,value:centerDamage,cells,element});if(fragmented)notes.push(`${labels[element]} ${index+1}/2 sobre ${center.name}`)});const total=allResults.reduce((sum,[,value])=>sum+value,0);showCombatAction('skill',a,t,`${labels[element]}${fragmented?' fragmentada':''} · ${total} de daño`);logCombatAction('skill',`✹ ${a.name} usa ${labels[element]}${fragmented?' fragmentada':''}: ${total} de daño.${notes.length?` ${notes.join(' · ')}.`:''}`);render();specialEffect(a);visuals.forEach((visual,index)=>setTimeout(()=>playElementalSpellVisual(a,visual),index*140));used=true}
  if(!custom)return skillBeforeHexAbilities(a,t);
  combatDamageSource=previousSource;
  if(used&&battleStats){detailedUnitStats(a).abilitiesUsed++;if(activeCombatTurn?.actorId===a.id)activeCombatTurn.usedAbility=true}
  return used;
};

/* Corrige la telemetría: un paso diagonal visual también es un único paso hexagonal. */
const takeTurnBeforeHexMetrics=takeTurn;
takeTurn=()=>{const actor=running?(queue.length?queue[0]:null):null,start=actor?{...actor.pos}:null,before=actor&&battleStats?detailedUnitStats(actor).tilesMoved:0;takeTurnBeforeHexMetrics();if(actor&&start&&battleStats){const stats=detailedUnitStats(actor),reported=stats.tilesMoved-before,actual=hexDistancePos(start,actor.pos);if(reported!==actual)stats.tilesMoved+=actual-reported;renderBattleStats()}};

/* Recolocación precombate por arrastre: solo se destaca el destino bajo el cursor. */
let activeUnitDrag=null;
function validPlacementCell(unit,cell){if(!unit||!cell)return false;const [x,y]=cell.dataset.cell.split(',').map(Number),boundary=Math.floor(W*.45)-1;if(unit.team==='dummy')return canOccupy(unit,x,y);return (unit.team==='ally'?x<=boundary:x>=W-1-boundary)&&canOccupy(unit,x,y)}
function clearDragTarget(){document.querySelectorAll('#arena .drop-target').forEach(cell=>cell.classList.remove('drop-target'))}
function renderHexGridLines(arena){
  arena?.querySelector('.hex-grid-lines')?.remove();if(!arena)return;
  const ar=arena.getBoundingClientRect(),edges=new Map(),round=value=>Math.round(value),key=point=>`${round(point.x)},${round(point.y)}`;
  arena.querySelectorAll('[data-cell]').forEach(cell=>{const rect=cell.getBoundingClientRect(),left=rect.left-ar.left,top=rect.top-ar.top,w=rect.width,h=rect.height,points=[{x:left+w/2,y:top},{x:left+w,y:top+h/4},{x:left+w,y:top+h*3/4},{x:left+w/2,y:top+h},{x:left,y:top+h*3/4},{x:left,y:top+h/4}];points.forEach((point,index)=>{const next=points[(index+1)%points.length],a=key(point),b=key(next),id=a<b?`${a}|${b}`:`${b}|${a}`;if(!edges.has(id))edges.set(id,{from:point,to:next})})});
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','hex-grid-lines');svg.setAttribute('viewBox',`0 0 ${ar.width} ${ar.height}`);svg.setAttribute('preserveAspectRatio','none');edges.forEach(edge=>{const line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('x1',edge.from.x);line.setAttribute('y1',edge.from.y);line.setAttribute('x2',edge.to.x);line.setAttribute('y2',edge.to.y);line.setAttribute('stroke','#152016');line.setAttribute('stroke-width','1.15');line.setAttribute('stroke-linecap','butt');svg.append(line)});arena.append(svg);
}
function renderUnitNameplates(arena){
  arena.querySelectorAll('.unit-nameplate').forEach(plate=>plate.remove());
  const ar=arena.getBoundingClientRect();
  units.filter(unit=>!unit.removed).forEach(unit=>{const cell=arena.querySelector(`[data-cell="${unit.pos.x},${unit.pos.y}"]`);if(!cell)return;const rect=cell.getBoundingClientRect(),plate=document.createElement('span');plate.className=`unit-nameplate ${unit.team==='enemy'?'enemy':''}`;plate.textContent=unit.name;plate.style.left=`${rect.left-ar.left+rect.width/2}px`;plate.style.top=`${rect.top-ar.top+rect.height*.87}px`;arena.append(plate)});
}
function renderPlacementOutline(arena,team){
  arena.querySelectorAll('.placement-outline').forEach(outline=>outline.remove());
  if(team!=='ally'&&team!=='enemy')return;
  const boundary=Math.floor(W*.45)-1,cells=[...arena.querySelectorAll('[data-cell]')].filter(cell=>{const [x]=cell.dataset.cell.split(',').map(Number);return team==='ally'?x<=boundary:x>=W-1-boundary}),selected=new Set(cells.map(cell=>cell.dataset.cell)),ar=arena.getBoundingClientRect();
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class',`placement-outline ${team}`);svg.setAttribute('viewBox',`0 0 ${ar.width} ${ar.height}`);svg.setAttribute('preserveAspectRatio','none');const color=team==='ally'?'#78bfff':'#ef7b80';
  cells.forEach(cell=>{const [x,y]=cell.dataset.cell.split(',').map(Number),odd=y&1,neighbors=odd?[[x+1,y-1],[x+1,y],[x+1,y+1],[x,y+1],[x-1,y],[x,y-1]]:[[x,y-1],[x+1,y],[x,y+1],[x-1,y+1],[x-1,y],[x-1,y-1]],rect=cell.getBoundingClientRect(),left=rect.left-ar.left,top=rect.top-ar.top,w=rect.width,h=rect.height,points=[{x:left+w/2,y:top},{x:left+w,y:top+h/4},{x:left+w,y:top+h*3/4},{x:left+w/2,y:top+h},{x:left,y:top+h*3/4},{x:left,y:top+h/4}];points.forEach((point,index)=>{if(selected.has(neighbors[index].join(',')))return;const next=points[(index+1)%points.length],line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('x1',point.x);line.setAttribute('y1',point.y);line.setAttribute('x2',next.x);line.setAttribute('y2',next.y);line.setAttribute('stroke',color);line.setAttribute('stroke-width','2');line.setAttribute('stroke-linecap','butt');svg.append(line)})});arena.append(svg);
}
function enableUnitDragPlacement(){
  const arena=$('#arena');if(!arena||running)return;
  const selected=units.find(unit=>unit.id===selectedId),boundary=Math.floor(W*.45)-1,cols=W+.5;
  arena.classList.remove('placement-field','ally','enemy');
  if(selected&&(selected.team==='ally'||selected.team==='enemy')){arena.classList.add('placement-field',selected.team);arena.style.setProperty('--placement-edge',`${((selected.team==='ally'?boundary+1:W-1-boundary)+(H>1?.25:0))/cols*100}%`)}
  arena.querySelectorAll('[data-cell]').forEach(cell=>{const [x]=cell.dataset.cell.split(',').map(Number);cell.onclick=null;cell.classList.remove('placeable','placement-zone','placement-tint','ally','enemy');if(selected&&(selected.team==='ally'?x<=boundary:selected.team==='enemy'?x>=W-1-boundary:false))cell.classList.add('placement-tint',selected.team)});
  renderUnitNameplates(arena);
  renderPlacementOutline(arena,selected?.team);
  arena.querySelectorAll('.token:not(.dead)').forEach(token=>{
    token.onpointerdown=event=>{
      if(event.button!==0)return;
      const unit=units.find(u=>u.id===token.dataset.select);if(!unit)return;
      const startX=event.clientX,startY=event.clientY,state={unit,token,startX,startY,dragging:false,ghost:null,target:null,suppressClick:false};activeUnitDrag=state;
      const move=moveEvent=>{
        if(!activeUnitDrag||activeUnitDrag!==state)return;
        if(!state.dragging&&Math.hypot(moveEvent.clientX-startX,moveEvent.clientY-startY)<6)return;
        if(!state.dragging){state.dragging=true;state.suppressClick=true;state.ghost=token.cloneNode(true);state.ghost.className='token unit-drag-ghost';document.body.append(state.ghost);token.classList.add('drag-origin');document.body.style.userSelect='none'}
        state.ghost.style.left=moveEvent.clientX+'px';state.ghost.style.top=moveEvent.clientY+'px';clearDragTarget();
        const cell=document.elementFromPoint(moveEvent.clientX,moveEvent.clientY)?.closest?.('#arena [data-cell]');
        if(validPlacementCell(unit,cell)){cell.classList.add('drop-target');state.target=cell}else state.target=null;
      };
      const finish=upEvent=>{
        window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',finish);
        if(activeUnitDrag!==state)return;
        activeUnitDrag=null;clearDragTarget();document.body.style.userSelect='';token.classList.remove('drag-origin');state.ghost?.remove();
        if(state.dragging){upEvent.preventDefault();const cell=state.target;if(validPlacementCell(unit,cell)){const [x,y]=cell.dataset.cell.split(',').map(Number);unit.pos={x,y};selectedId=unit.id;saveFormation();render()}}
      };
      window.addEventListener('pointermove',move);window.addEventListener('pointerup',finish,{once:true});
    };
    token.addEventListener('click',event=>{if(activeUnitDrag?.suppressClick){event.preventDefault();event.stopImmediatePropagation();activeUnitDrag.suppressClick=false}},true);
  });
}
const renderBeforeDragPlacement=render;
render=()=>{renderBeforeDragPlacement();renderHexGridLines($('#arena'));enableUnitDragPlacement()};
