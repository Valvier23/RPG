/* La ficha de party comparte el mismo rango que utiliza el combate. */
const partyDerivedBeforeWeaponRange = derived;
derived = member => ({ ...partyDerivedBeforeWeaponRange(member), range: weaponRange(member.equipment) });
