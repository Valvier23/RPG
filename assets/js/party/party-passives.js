/* Cupos de pasivas: niveles 1, 4, 7 y 10; el máximo es cuatro. */
function passiveSlots(member){return Math.min(4,(sheets[member.classId]?.passives||[]).length,1+Math.floor((Math.max(1,member.level)-1)/3))}
function synchronizeBattleMember(member,classChanged=false){
  const classId=member.classId,base={...GAME_CONTENT.classBases[classId]},special=GAME_CONTENT.specialPassiveNames[classId];
  if(classChanged){member.baseStats=base;member.stats={...base};member.abilities=[special]}else{
    member.baseStats={...base,...(member.baseStats||{})};Object.keys(base).forEach(key=>member.stats[key]=Math.max(member.baseStats[key],member.stats[key]??member.baseStats[key]));
  }
  const chosen=Array.isArray(member.selectedPassives)?member.selectedPassives:(member.abilities||[]),available=sheets[classId].passives||[];
  member.selectedPassives=chosen.filter(ability=>available.includes(ability)).slice(0,passiveSlots(member));
  member.abilities=[...member.selectedPassives];member.specialSelected=member.selectedPassives.includes(special);member.specialEnabled=true;
}
const partyRenderBase=render;
render=()=>{
  partyRenderBase();
  const member=party.find(item=>item.id===selectedId),host=document.querySelector('.abilities');
  if(!member||!host)return;
  const hint=host.previousElementSibling;
  if(hint?.classList.contains('notice'))hint.textContent='Equipa pasivas para definir el estilo de combate. Los huecos se desbloquean en los niveles 1, 4, 7 y 10.';
  const slots=passiveSlots(member),selectedPassives=new Set(member.selectedPassives||[]),selected=selectedPassives.size,full=selected>=slots;
  const label=document.createElement('p');
  label.className='passive-slots';
  label.textContent=`Pasivas equipadas: ${selected}/${slots} · ${slots>=4?'Todos los huecos desbloqueados':`Siguiente desbloqueo: nivel ${1+slots*3}`}`;
  host.before(label);
  host.querySelectorAll('input[data-ability]').forEach(input=>{
    const selectedNow=selectedPassives.has(input.dataset.ability),card=input.closest('.ability');
    input.disabled=!selectedNow&&full;
    if(card){card.hidden=full&&!selectedNow;card.style.setProperty('display',full&&!selectedNow?'none':'','important')}
  });
};
document.querySelector('#party-app').addEventListener('change',event=>{const input=event.target,member=party.find(item=>item.id===selectedId);if(!member)return;if(input.matches?.('[data-stat]')){event.stopImmediatePropagation();const stat=input.dataset.stat,base=member.baseStats[stat],current=member.stats[stat],used=partyBonusUsed(member),usedElsewhere=used-(current-base),available=Math.max(0,member.level-usedElsewhere),requested=Math.max(base,Number(input.value)||base);member.stats[stat]=Math.min(requested,base+available);dirty=true;render();return}if(input.matches?.('[data-field="level"]')){event.stopImmediatePropagation();const minimum=Math.max(1,partyBonusUsed(member)),requested=Number(input.value)||minimum;member.level=Math.min(MAX_LEVEL,Math.max(minimum,requested));synchronizeBattleMember(member);dirty=true;render();return}if(!input.matches?.('[data-ability]'))return;event.stopImmediatePropagation();const passive=input.dataset.ability,selected=new Set(member.selectedPassives||[]);if(input.checked&&selected.size<passiveSlots(member))selected.add(passive);else if(!input.checked)selected.delete(passive);const special=GAME_CONTENT.specialPassiveNames[member.classId];member.selectedPassives=[...selected];member.abilities=[...member.selectedPassives];member.specialSelected=member.selectedPassives.includes(special);member.specialEnabled=true;dirty=true;render()},true);
const PARTY_RESISTANCES={warrior:{fire:0,ice:0,lightning:0,wind:0,light:0},archer:{fire:0,ice:0,lightning:0,wind:5,light:0},mage:{fire:10,ice:0,lightning:0,wind:0,light:5},assassin:{fire:0,ice:0,lightning:0,wind:0,light:0},tank:{fire:10,ice:0,lightning:0,wind:0,light:0}};
const partyRenderPolished=render;
render=()=>{partyRenderPolished();const member=party.find(item=>item.id===selectedId);if(!member)return;const talisman=document.querySelector('[data-equipment="talisman"]');if(talisman&&talisman.tagName==='INPUT'){const select=document.createElement('select'),talismans=[...new Set(Object.values(sheets).map(sheet=>sheet.talisman))];select.dataset.equipment='talisman';select.innerHTML=talismans.map(item=>`<option value="${item}" ${item===member.equipment.talisman?'selected':''}>${item}</option>`).join('');select.onchange=()=>{member.equipment.talisman=select.value;dirty=true;render()};talisman.replaceWith(select)}const level=document.querySelector('[data-field="level"]');if(level&&!level.parentElement.classList.contains('level-control')){const control=document.createElement('div');control.className='level-control';const down=document.createElement('button'),up=document.createElement('button');down.type=up.type='button';down.textContent='−';up.textContent='+';level.parentElement.insertBefore(control,level);control.append(down,level,up);const change=delta=>{level.value=Math.min(MAX_LEVEL,Math.max(1,(Number(level.value)||1)+delta));level.dispatchEvent(new Event('change',{bubbles:true}))};down.onclick=()=>change(-1);up.onclick=()=>change(1)}const summary=document.querySelector('.summary');if(summary&&!summary.querySelector('.extended-stat')){const rapid=member.classId==='archer'&&(member.selectedPassives||member.abilities||[]).includes('Disparo rápido'),speed=((.32+member.stats.agility*.04)*(rapid?2:1)).toFixed(2),damagePerHit=Math.round(Number(summary.children[1]?.querySelector('b')?.textContent||0)*(rapid?.5:1)),crit=Math.min(45,5+member.stats.dexterity*2.5).toFixed(0),r=PARTY_RESISTANCES[member.classId]||{};summary.insertAdjacentHTML('beforeend',`<div class="extended-stat"><span>Vel. ataque${rapid?' ×2':''}</span><b>${speed}/s</b></div>${rapid?`<div class="extended-stat"><span>Daño por impacto</span><b>${damagePerHit} (50%)</b></div>`:''}<div class="extended-stat"><span>Crítico</span><b>${crit}%</b></div><div class="extended-stat resistance-stat"><span>Resistencias elementales</span><b>Fuego ${r.fire||0}% · Hielo ${r.ice||0}% · Rayo ${r.lightning||0}% · Viento ${r.wind||0}% · Luz ${r.light||0}%</b></div>`)}};
party.forEach(member=>synchronizeBattleMember(member));render();
