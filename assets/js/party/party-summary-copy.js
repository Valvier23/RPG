(() => {
  const resetCharacter = () => {
    const member = party.find(item => item.id === selectedId);
    if (!member) return;

    member.stats = { ...member.baseStats };
    member.selectedPassives = [];
    member.abilities = [];
    member.specialSelected = false;
    member.specialEnabled = true;
    synchronizeBattleMember(member);
    dirty = true;
    render();
  };

  const decorateSummary = () => {
    const member = party.find(item => item.id === selectedId);
    const stats = document.querySelector('.stats');
    document.querySelector('#save-party')?.remove();
    if (!member) return;

    if (member.classId === 'warrior' && (member.selectedPassives || []).includes('Guardia ofensiva')) {
      const damage = Math.max(2, Math.round(8 + member.stats.power * 5 + member.stats.defense * .33));
      const damageValue = document.querySelector('.summary')?.children[1]?.querySelector('b');
      if (damageValue) damageValue.textContent = damage;
    }

    const actions = document.querySelector('.editor-actions');
    if (actions && !actions.querySelector('#reset-member')) {
      const reset = document.createElement('button');
      reset.id = 'reset-member';
      reset.type = 'button';
      reset.className = 'secondary';
      reset.textContent = 'Reiniciar personaje';
      reset.addEventListener('click', resetCharacter);
      actions.prepend(reset);
    }

    const passiveSlotsAvailable = passiveSlots(member);
    const selectedPassives = new Set(member.selectedPassives || []);
    const hasFreePassiveSlot = selectedPassives.size < passiveSlotsAvailable;
    document.querySelectorAll('.abilities .ability').forEach(label => {
      const input = label.querySelector('input[data-ability]');
      const shouldHide = Boolean(input && !hasFreePassiveSlot && !selectedPassives.has(input.dataset.ability));
      label.hidden = shouldHide;
      label.style.display = shouldHide ? 'none' : '';
    });

    if (!stats) return;

    const available = Math.max(0, member.level - partyBonusUsed(member));
    let points = stats.previousElementSibling;
    if (!available) {
      if (points?.classList.contains('stat-points')) points.remove();
      return;
    }
    if (!points?.classList.contains('stat-points')) {
      points = document.createElement('p');
      points.className = 'stat-points';
      stats.before(points);
    }
    points.textContent = `Puntos de atributo disponibles: ${available}`;
  };

  const renderWithoutSummary = render;
  render = () => {
    renderWithoutSummary();
    decorateSummary();
    localStorage.setItem(PARTY_STORAGE_KEY, JSON.stringify(party));
    dirty = false;
    const saveState = document.querySelector('.save-state');
    if (saveState) saveState.textContent = 'Guardado automáticamente';
  };

  decorateSummary();
  requestAnimationFrame(() => {
    app.classList.remove('party-loading');
    app.classList.add('party-ready');
  });
})();
