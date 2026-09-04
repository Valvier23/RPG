if(window.BATTLE_MODE==='production'){
  document.title='Campo de batalla · Squad Tactics';
  document.querySelector('.eyebrow').textContent='encuentro táctico · preparación y combate';
  document.querySelector('.rule').textContent='Recoloca las unidades antes de iniciar. Las parties se gestionan desde sus páginas dedicadas.';
  document.querySelector('.editor')?.classList.add('production-hidden');
  document.querySelectorAll('#speed,#board-cols,#board-rows,#grid-zoom,#ally-size,#enemy-size,#terrain-water,#terrain-mountain,#terrain-forest').forEach(control=>control.closest('label')?.classList.add('production-hidden'));
  document.querySelector('#apply-size')?.classList.add('production-hidden');
  document.querySelector('#new-map')?.classList.add('production-hidden');
  document.querySelector('#dummy-panel')?.classList.add('production-hidden');
  document.querySelectorAll('.team-controls,#randomize-builds,#combat-stats').forEach(element=>element.classList.add('production-hidden'));
}
