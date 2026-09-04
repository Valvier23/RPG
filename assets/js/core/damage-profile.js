/* Composición común de daño para armas, pasivas y habilidades. */
const DAMAGE_PROFILE = Object.freeze({
  elements: GAME_CONTENT.mageElements,

  selectedElement(unit, source) {
    const equipment = unit.equipment || (unit.equipment = {});
    const key = source === 'arrow' ? 'arrowElement' : 'element';
    if (!this.elements[equipment[key]]) equipment[key] = 'fire';
    return equipment[key];
  },

  basicModifiers(unit) {
    const classId = unit.classId || unit.cls;
    const passives = unit.selectedPassives || unit.abilities || [];
    const weaponModifiers = Array.isArray(unit.equipment?.damageModifiers)
      ? unit.equipment.damageModifiers
      : [];
    const passiveModifiers = [];

    if (classId === 'mage' && passives.includes('Mago elemental')) {
      passiveModifiers.push({
        type: this.selectedElement(unit, 'mage'),
        mode: 'convert',
        percent: 100,
        source: 'Mago elemental'
      });
    }
    if (classId === 'archer' && passives.includes('Flecha elemental')) {
      passiveModifiers.push({
        type: this.selectedElement(unit, 'arrow'),
        mode: 'bonus',
        percent: 30,
        source: 'Flecha elemental'
      });
    }
    return [...weaponModifiers, ...passiveModifiers];
  },

  packets(unit, rawDamage) {
    const modifiers = this.basicModifiers(unit);
    const conversions = modifiers.filter(modifier => modifier.mode === 'convert');
    const bonuses = modifiers.filter(modifier => modifier.mode === 'bonus');
    const multipliers = modifiers.filter(modifier => modifier.mode === 'multiplier');
    const requestedConversion = conversions.reduce((sum, modifier) => sum + Math.max(0, modifier.percent || 0), 0);
    const convertedPercent = Math.min(100, requestedConversion);
    const conversionScale = requestedConversion > 100 ? 100 / requestedConversion : 1;
    const packets = [{ type: 'physical', amount: rawDamage * (1 - convertedPercent / 100), source: 'base' }];

    conversions.forEach(modifier => packets.push({
      type: modifier.type,
      amount: rawDamage * Math.max(0, modifier.percent || 0) * conversionScale / 100,
      source: modifier.source
    }));
    bonuses.forEach(modifier => packets.push({
      type: modifier.type,
      amount: rawDamage * Math.max(0, modifier.percent || 0) / 100,
      source: modifier.source
    }));

    multipliers.forEach(modifier => packets.forEach(packet => {
      if (!modifier.type || modifier.type === 'all' || modifier.type === packet.type) {
        packet.amount *= 1 + (modifier.percent || 0) / 100;
      }
    }));

    return packets.filter(packet => packet.amount > 0).map(packet => ({ ...packet, amount: Math.round(packet.amount) }));
  },

  summary(unit) {
    const labels = { physical: 'Físico', ...this.elements };
    const modifiers = this.basicModifiers(unit);
    const conversions = modifiers.filter(modifier => modifier.mode === 'convert');
    const bonuses = modifiers.filter(modifier => modifier.mode === 'bonus');
    const converted = Math.min(100, conversions.reduce((sum, modifier) => sum + (modifier.percent || 0), 0));
    const parts = [];
    if (converted < 100) parts.push(`Físico ${100 - converted}%`);
    conversions.forEach(modifier => parts.push(`${labels[modifier.type] || modifier.type} ${modifier.percent}%`));
    bonuses.forEach(modifier => parts.push(`+${modifier.percent}% ${labels[modifier.type] || modifier.type}`));
    return parts.join(' · ') || 'Físico 100%';
  }
});
