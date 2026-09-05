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

    const addMember = document.querySelector('#add-member');
    const removeMember = document.querySelector('#remove-member');
    if (addMember && removeMember && !addMember.parentElement?.classList.contains('member-actions')) {
      const memberActions = document.createElement('div');
      memberActions.className = 'member-actions';
      document.querySelector('.member-list')?.before(memberActions);
      memberActions.append(addMember, removeMember);
    }

    const abilities = document.querySelector('.abilities');
    const abilitiesColumn = abilities?.parentElement;
    const abilityLabel = [...(abilitiesColumn?.children || [])].find(element => element.classList.contains('section-label') && element.textContent === PARTY_TEXT.abilities);
    const abilityNotice = abilityLabel?.nextElementSibling;
    const passiveSlotsElement = abilities?.previousElementSibling?.classList.contains('passive-slots') ? abilities.previousElementSibling : null;
    if (abilities && abilityLabel && !abilities.parentElement?.classList.contains('combat-abilities')) {
      const combatAbilities = document.createElement('section');
      combatAbilities.className = 'combat-abilities';
      const combatAnchor = document.querySelector('.damage-profile') || document.querySelector('.summary');
      combatAnchor?.insertAdjacentElement('afterend', combatAbilities);
      [abilityLabel, abilityNotice, passiveSlotsElement, abilities].filter(Boolean).forEach(element => combatAbilities.append(element));
    }

    const passiveSlotsAvailable = passiveSlots(member);
    const renderedPassives = [...document.querySelectorAll('.abilities input[data-ability]:checked')].map(input => input.dataset.ability);
    const selectedPassives = new Set([...(member.selectedPassives || []), ...renderedPassives]);
    const hasFreePassiveSlot = selectedPassives.size < passiveSlotsAvailable;
    document.querySelector('.abilities')?.classList.toggle('slots-full', !hasFreePassiveSlot);
    document.querySelectorAll('.abilities .ability').forEach(label => {
      const input = label.querySelector('input[data-ability]');
      const shouldHide = Boolean(input && !hasFreePassiveSlot && !selectedPassives.has(input.dataset.ability));
      label.hidden = shouldHide;
      label.style.display = shouldHide ? 'none' : '';
    });

    if (!stats) return;

    const existingManualStats = stats.closest('.manual-stats');
    const statsLabel = existingManualStats?.querySelector(':scope > .section-label') || (stats.previousElementSibling?.classList.contains('section-label') ? stats.previousElementSibling : null);
    const editorGrid = document.querySelector('.editor-grid');
    if (statsLabel && editorGrid) {
      const manualStats = existingManualStats || document.createElement('section');
      manualStats.className = 'manual-stats';
      if (!existingManualStats) manualStats.append(statsLabel, stats);
      if (manualStats.parentElement !== editorGrid) editorGrid.append(manualStats);
    }

    if (editorGrid && !editorGrid.querySelector(':scope > .identity-panel')) {
      const sourceColumns = [...editorGrid.children].filter(element => element.tagName === 'DIV');
      const [identitySource, equipmentSource] = sourceColumns;
      const profile = identitySource?.querySelector('.profile');
      const level = [...(identitySource?.children || [])].find(element => element.classList.contains('field'));
      const equipmentLabel = equipmentSource?.querySelector('.section-label');
      const loadout = equipmentSource?.querySelector('.loadout');
      if (profile && level && equipmentLabel && loadout) {
        const identityPanel = document.createElement('section');
        identityPanel.className = 'identity-panel';
        identityPanel.append(profile, level);
        const equipmentPanel = document.createElement('section');
        equipmentPanel.className = 'equipment-panel';
        equipmentPanel.append(equipmentLabel, loadout);
        const manualStats = editorGrid.querySelector(':scope > .manual-stats');
        editorGrid.insertBefore(identityPanel, manualStats || null);
        editorGrid.insertBefore(equipmentPanel, manualStats || null);
        if (!identitySource.children.length) identitySource.remove();
        if (!equipmentSource.children.length) equipmentSource.remove();
      }
    }

    const available = Math.max(0, member.level - partyBonusUsed(member));
    let points = stats.querySelector('.stat-points');
    if (!points) {
      points = document.createElement('p');
      points.className = 'stat-points';
      stats.prepend(points);
    }
    points.textContent = available ? `Puntos de atributo disponibles: ${available}` : '';
    points.classList.toggle('is-empty', !available);
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
})();
