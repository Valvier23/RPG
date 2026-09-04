/* Las antiguas habilidades de clase se presentan y persisten como pasivas normales. */
(()=>{
  const migrateName=name=>name==='Bola de fuego'?'Mago elemental':name==='Desafío'?'Provocar':name;
  const restoreTeam=(team,key)=>{try{const saved=JSON.parse(localStorage.getItem(key));if(!Array.isArray(saved))return;saved.forEach((member,index)=>{const id=`${team==='ally'?'party':'enemy-party'}-${member.id||index}`,unit=roster.find(item=>item.id===id),live=units.find(item=>item.id===id);if(!unit)return;const special=SPECIAL_PASSIVE_NAMES[unit.cls],raw=[...(member.selectedPassives||member.abilities||[])].map(migrateName);if(member.specialSelected===true&&!raw.includes(special))raw.unshift(special);const selected=[...new Set(raw)].filter(passive=>implementedPassivesFor(unit).includes(passive)).slice(0,Math.min(4,1+Math.floor((unit.level-1)/3)));for(const target of [unit,live].filter(Boolean)){target.selectedPassives=[...selected];target.specialSelected=selected.includes(special);target.specialEnabled=true}})}catch{}};
  restoreTeam('ally','squad-tactics-party-v1');restoreTeam('enemy','squad-tactics-enemy-party-v1');
  const baseRenderFicha=renderFicha;renderFicha=()=>{baseRenderFicha();const host=document.querySelector('#visual-state');host?.querySelector('[data-special-passive]')?.remove()};
  loadEditor();render();
})();
