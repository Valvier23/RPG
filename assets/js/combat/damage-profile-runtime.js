/* Adaptación del motor actual al sistema común de paquetes de daño. */
mageElement = unit => DAMAGE_PROFILE.selectedElement(unit, 'mage');

archerAutoHit = (attacker, target) => {
  const values = derived(attacker);
  const passives = attacker.selectedPassives || [];
  const distance = dist(attacker, target);
  const hawk = passives.includes('Ojo de halcón');
  const elemental = passives.includes('Flecha elemental');
  const expert = passives.includes('Tirador experto');
  const piercing = passives.includes('Disparo perforante') && !(attacker.piercingTargets || []).includes(target.id);
  if (piercing) attacker.piercingTargets = [...(attacker.piercingTargets || []), target.id];
  const fixation = fixationMultiplier(attacker, target);
  const expertBonus = expert ? distance * .10 : 0;
  const crit = Math.random() < values.crit + expertBonus;
  const raw = Math.round(values.damage * (crit ? 1.6 : 1) * (piercing ? 3.5 : 1) * fixation);
  const applied = DAMAGE_PROFILE.packets(attacker, raw).map(packet => ({
    ...packet,
    dealt: packet.type === 'physical'
      ? damage(attacker, target, packet.amount)
      : elementalDamage(attacker, target, packet.amount, packet.type)
  }));
  const physicalHit = applied.filter(packet => packet.type === 'physical').reduce((sum, packet) => sum + packet.dealt, 0);
  const elementalHit = applied.filter(packet => packet.type !== 'physical').reduce((sum, packet) => sum + packet.dealt, 0);
  return { physicalHit, fireHit: elementalHit, damagePackets: applied, piercing, fixation, crit, hawk, elemental, expert, expertBonus };
};

PASSIVE_DESCRIPTIONS['Flecha elemental'] =
  'Activa: permite elegir un elemento y añade un 30% del daño del ataque básico como daño elemental.';

const renderFichaBeforeDamageProfile = renderFicha;
renderFicha = () => {
  renderFichaBeforeDamageProfile();
  const unit = units.find(entry => entry.id === selectedId);
  const host = document.querySelector('#visual-state');
  if (!unit || !host || host.querySelector('.damage-profile')) return;

  const passives = unit.selectedPassives || [];
  const elementalArrow = unit.cls === 'archer' && passives.includes('Flecha elemental');
  const profile = document.createElement('div');
  profile.className = `damage-profile ${elementalArrow ? 'elemental-weapon' : ''}`;
  profile.innerHTML = `<div><b>Perfil ofensivo</b><small>${DAMAGE_PROFILE.summary(unit)}</small></div>`;

  if (elementalArrow) {
    const current = DAMAGE_PROFILE.selectedElement(unit, 'arrow');
    const options = Object.entries(DAMAGE_PROFILE.elements).map(([id, name]) => `<option value="${id}" ${id === current ? 'selected' : ''}>${name}</option>`).join('');
    const selector = document.createElement('label');
    selector.innerHTML = `<span>Elemento de flecha</span><select aria-label="Elemento de Flecha elemental">${options}</select>`;
    selector.querySelector('select').onchange = event => {
      unit.equipment.arrowElement = event.target.value;
      const saved = roster.find(entry => entry.id === unit.id);
      if (saved) saved.equipment = { ...unit.equipment };
      renderFicha();
      render();
    };
    profile.append(selector);
  }

  host.querySelector('.loadout')?.insertAdjacentElement('afterend', profile);
};
