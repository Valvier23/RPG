/* Rango base por grupo de arma. Los objetos futuros pueden añadir modificadores. */
function weaponRange(equipment = {}) {
  const weapon = String(equipment.weapon || '').trim().toLocaleLowerCase('es');
  let base = 1;

  if (weapon.includes('lanza') || weapon.includes('alabarda')) base = 3;
  else if (weapon.includes('espada larga') || weapon.includes('martillo de guerra') || weapon.includes('hacha de dos manos') || weapon.includes('hacha a dos manos')) base = 2;
  else if (weapon.includes('arco largo') || weapon === 'ballesta') base = 5;
  else if (weapon.includes('arco corto') || weapon.includes('ballesta de mano') || weapon.includes('bastón') || weapon.includes('varita') || weapon.includes('grimorio')) base = 4;

  const modifierTotal = (Array.isArray(equipment.rangeModifiers) ? equipment.rangeModifiers : [])
    .reduce((total, modifier) => total + (typeof modifier === 'number' ? modifier : Number(modifier?.value) || 0), 0);
  return Math.max(1, base + (Number(equipment.rangeBonus) || 0) + modifierTotal);
}
