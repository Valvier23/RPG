function partyBonusUsed(member){return Object.keys(member.stats).reduce((total,key)=>total+(member.stats[key]-member.baseStats[key]),0)}
function synchronizeBattleMember(member,classChanged=false){
  const classId=member.classId,base={...GAME_CONTENT.classBases[classId]},special=GAME_CONTENT.specialPassiveNames[classId];
  if(classChanged){
    member.baseStats=base;
    member.stats={...base};
    member.selectedPassives=[special];
    member.abilities=[special];
  }else{
    member.baseStats={...base,...(member.baseStats||{})};
    Object.keys(base).forEach(key=>member.stats[key]=Math.max(member.baseStats[key],member.stats[key]??member.baseStats[key]));
    let excess=partyBonusUsed(member)-member.level;
    for(const key of Object.keys(member.stats).reverse()){
      if(excess<=0)break;
      const available=member.stats[key]-member.baseStats[key],reduction=Math.min(available,excess);
      member.stats[key]-=reduction;
      excess-=reduction;
    }
  }
  const available=sheets[classId]?.passives||[];
  const chosen=Array.isArray(member.selectedPassives)?member.selectedPassives:(member.abilities||[]);
  const slots=Math.min(4,available.length,1+Math.floor((Math.max(1,member.level)-1)/3));
  member.selectedPassives=chosen.filter(ability=>available.includes(ability)).slice(0,slots);
  member.abilities=[...member.selectedPassives];
  member.specialSelected=member.selectedPassives.includes(special);
  member.specialEnabled=true;
}
party.forEach(member=>synchronizeBattleMember(member));render();
document.querySelector('#party-app').addEventListener('change',event=>{const member=party.find(item=>item.id===selectedId);if(!member)return;const element=event.target;const classChanged=element.matches('[data-field="classId"]');if(element.matches('[data-field="level"], [data-stat], [data-ability], [data-field="classId"]')){synchronizeBattleMember(member,classChanged);dirty=true;render()}});
