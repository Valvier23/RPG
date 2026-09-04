const currentPage = location.pathname.split('/').pop() || 'index.html';
const navigationItems = [{href:'battle.html',key:'combat',icon:'⚔'},{href:'party.html',key:'party',icon:'✦'},{href:'party-enemy.html',key:'enemyParty',icon:'♜'},{href:'index.html',key:'debug',icon:'⌘'}];
const sidebar = document.createElement('aside');
sidebar.className='app-sidebar';sidebar.setAttribute('aria-label',NAVIGATION_TEXT.label);
sidebar.innerHTML=`<div class="sidebar-mark"><span>✦</span><div><b>${NAVIGATION_TEXT.title}</b><small>${NAVIGATION_TEXT.subtitle}</small></div></div><nav>${navigationItems.map(item=>`<a href="${item.href}" class="${item.href===currentPage?'active':''}"><i>${item.icon}</i><span>${NAVIGATION_TEXT[item.key]}</span></a>`).join('')}</nav>`;
document.body.prepend(sidebar);document.body.classList.add('with-sidebar');
