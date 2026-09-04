(() => {
  const ELEMENTS = DAMAGE_PROFILE.elements;
  const PASSIVE_ELEMENTS = {
    'Mago elemental': { source: 'mage', key: 'element' },
    'Flecha elemental': { source: 'arrow', key: 'arrowElement' }
  };

  const options = current => Object.entries(ELEMENTS)
    .map(([id, name]) => `<option value="${id}" ${id === current ? 'selected' : ''}>${name}</option>`)
    .join('');

  const saveElement = (member, config, element) => {
    member.equipment[config.key] = element;
    member.equipment[`${config.key}Confirmed`] = true;
    dirty = true;
    render();
  };

  const openElementModal = (member, passive, config) => {
    if (document.querySelector('.element-modal')) return;
    const current = DAMAGE_PROFILE.selectedElement(member, config.source);
    const modal = document.createElement('div');
    modal.className = 'element-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', `Elegir elemento para ${passive}`);
    modal.innerHTML = `<div class="element-modal-card"><span class="section-label">${passive}</span><h3>Elige un tipo de daño</h3><p>Podrás cambiarlo después desde la propia pasiva.</p><div class="element-modal-options">${Object.entries(ELEMENTS).map(([id, name]) => `<button type="button" data-element="${id}" class="element-${id} ${id === current ? 'current' : ''}">${name}</button>`).join('')}</div></div>`;
    modal.querySelectorAll('[data-element]').forEach(button => button.onclick = () => {
      modal.remove();
      saveElement(member, config, button.dataset.element);
    });
    document.body.append(modal);
    modal.querySelector('[data-element]')?.focus();
  };

  const decorate = () => {
    const member = party.find(item => item.id === selectedId);
    const loadout = document.querySelector('.loadout');
    if (!member || !loadout) return;

    const selected = new Set(member.selectedPassives || []);
    if (!document.querySelector('.damage-profile')) {
      const profile = document.createElement('div');
      profile.className = 'damage-profile';
      profile.innerHTML = `<div><b>Perfil ofensivo</b><small>${DAMAGE_PROFILE.summary(member)}</small></div>`;
      loadout.insertAdjacentElement('afterend', profile);
    }

    Object.entries(PASSIVE_ELEMENTS).forEach(([passive, config]) => {
      if (!selected.has(passive)) return;
      const input = [...document.querySelectorAll('.abilities input[data-ability]')].find(item => item.dataset.ability === passive);
      const card = input?.closest('.ability');
      if (card && !card.querySelector('[data-passive-element]')) {
        const current = DAMAGE_PROFILE.selectedElement(member, config.source);
        const control = document.createElement('div');
        control.className = 'passive-element-control elemental-weapon';
        control.innerHTML = `<span>Tipo de daño</span><select data-passive-element="${passive}" aria-label="Tipo de daño de ${passive}">${options(current)}</select>`;
        control.addEventListener('click', event => event.stopPropagation());
        const select = control.querySelector('select');
        select.addEventListener('change', event => {
          event.stopPropagation();
          saveElement(member, config, select.value);
        });
        card.append(control);
      }
      if (!member.equipment[`${config.key}Confirmed`]) openElementModal(member, passive, config);
    });
  };

  document.addEventListener('pointerdown', event => {
    const card = event.target.closest?.('.ability');
    const input = card?.querySelector('input[data-ability]');
    const config = input && PASSIVE_ELEMENTS[input.dataset.ability];
    const member = party.find(item => item.id === selectedId);
    if (member && config && !input.checked && !input.disabled) member.equipment[`${config.key}Confirmed`] = false;
  }, true);

  new MutationObserver(decorate).observe(document.querySelector('#party-app'), { childList: true, subtree: true });
  decorate();
})();
