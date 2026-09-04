(()=>{
  const style=document.createElement('style');style.textContent='.xp{display:block;margin-top:7px;text-align:left}.xp>div{display:flex;justify-content:space-between;gap:8px;font:.58rem monospace;color:#aeb7d4}.xp b{font:inherit;color:#d9e1fb}.xp i{display:block;height:5px;margin-top:3px;overflow:hidden;background:#10131e;border:1px solid #3f5274}.xp i::after{content:"";display:block;width:100%;height:100%;background:linear-gradient(90deg,#6288e6,#b091ee)}.xp-detail{max-width:360px;margin:0 0 16px}.xp-detail small{display:block;margin-top:6px;font:.62rem/1.35 monospace;color:#aaa391}';document.head.append(style);
  const bar=member=>{const p=xpProgress(member);return `<div class="xp"><div><span>PX</span><b>${member.level>=MAX_LEVEL?'NIVEL MÁXIMO':`${p.xp}/${p.needed}`}</b></div><i style="width:${p.pct}%"></i></div>`};
  if(typeof party!=='undefined'){
    const decorate=()=>{document.querySelectorAll('.member-card').forEach(card=>{const member=party.find(item=>item.id===card.dataset.member);if(member&&!card.querySelector('.xp'))card.insertAdjacentHTML('beforeend',bar(member))});const editor=document.querySelector('.member-editor');if(editor&&!editor.querySelector('.xp')){const member=party.find(item=>item.id===selectedId);if(member)editor.querySelector('h2')?.insertAdjacentHTML('afterend',`${bar(member)}<p class="xp-hint">Cada victoria concede ${XP_PER_VICTORY} PX. El coste aumenta con el nivel.</p>`)}};
    new MutationObserver(decorate).observe(document.querySelector('#party-app'),{childList:true,subtree:true});decorate();return;
  }
  if(typeof card==='function'){const baseCard=card;card=u=>baseCard(u).replace('</div></div>',`${bar(u)}</div></div>`);const baseEnd=end;end=()=>{const won=alive('ally').length>0;baseEnd();if(won){awardVictoryXp();render()}}}
})();
