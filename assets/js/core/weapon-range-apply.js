/* La simulación y el laboratorio consultan el rango del arma equipada. */
const derivedBeforeWeaponRange = derived;
derived = unit => ({ ...derivedBeforeWeaponRange(unit), range: weaponRange(unit.equipment) });
