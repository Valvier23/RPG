function decoratePartyEditor(){
  document.querySelectorAll('.member-card').forEach(card=>{
    if(card.querySelector('.party-portrait'))return;
    const classId=party.find(member=>member.id===card.dataset.member)?.classId;if(!classId)return;
    const portrait=document.createElement('i'),gender=party.find(member=>member.id===card.dataset.member)?.gender||'male';portrait.className=`party-portrait p-${classId} gender-${gender}`;card.prepend(portrait);
  });
  const editor=document.querySelector('.member-editor'),classSelect=editor?.querySelector('[data-field="classId"]');
  if(editor&&classSelect&&!editor.querySelector('.party-hero-portrait')){const portrait=document.createElement('div'),member=party.find(item=>item.id===selectedId);portrait.className=`party-hero-portrait p-${classSelect.value} gender-${member?.gender||'male'}`;editor.querySelector('h2')?.insertAdjacentElement('afterend',portrait)}
  document.querySelectorAll('.stat input[data-stat]').forEach(input=>{
    if(input.parentElement?.classList.contains('stat-control'))return;
    const control=document.createElement('div');control.className='stat-control';
    const decrease=document.createElement('button');decrease.type='button';decrease.className='stat-step';decrease.textContent='−';
    const increase=document.createElement('button');increase.type='button';increase.className='stat-step';increase.textContent='+';
    input.parentElement.insertBefore(control,input);control.append(decrease,input,increase);
    const changeBy=delta=>{input.value=Math.max(0,Math.min(99,(Number(input.value)||0)+delta));input.dispatchEvent(new Event('change',{bubbles:true}))};
    decrease.onclick=()=>changeBy(-1);increase.onclick=()=>changeBy(1);
  });
}
new MutationObserver(decoratePartyEditor).observe(document.querySelector('#party-app'),{childList:true,subtree:true});
decoratePartyEditor();
