# Contract — `module/rules/weapon-creation.mjs` (puro) e extensões de `weapon.mjs`

Sem globais do Foundry. Testes em `tests/unit/weapon-creation.test.mjs` e `weapon.test.mjs`.

| Função | Entrada → saída | Casos de teste |
|---|---|---|
| `availability(cost)` | → `{ cost, rarity, tn }` | 2 → rare 20; 0 → common 10; −4 → worthless 0; 9 → glittergold 50 |
| `compatibleMods(family, letter)` | → mods permitidos | ranged F inclui Cone Effect, Explosive Rounds, Heavy Warhead; não inclui Adv. Rifling; melee A inclui Two Hands |
| `modLimit(family, letter)` | → 2 ou 3 | ranged L → 2; ranged S → 3; melee S → 3 |
| `buildWeapon({ family, template, type, damageType, mods })` | → `{ system, cost, availability, warnings, notes, conditions }` | Basic + Las + Extended Clip + Red-Dot Sight → 3k2 E, Pen 0, S/-, 40 m, pente 48, Full, Reliable, custo +2 (Rare 20), condição `redDotSight`; Pistol + Bolter + High Caliber + Magnum Rounds → 5k2 X, Pen 2, +2; Cannon + Plasma → 3k3 E, Pen 6, recarga 4 Full, custo 0; Heavy Rifle + Ordinary + Sawed Off + Low Ammo → alcance 30, pente 20, custo −3 (Worthless 0); Melee + Chain + Two Hands → 2k3 R, Tearing e Two Hands, +2; Melee + Syrneth (R) + Incendiary + Power Field + Extra Pen I → E, Pen 5, Incendiary, Power Field, +5; Basic + Ordinary + Burst Fire + Machine Gun → S/6 com aviso `rofOverride`; Basic + Las + Bullet Hose → rajada 2, Inaccurate; três mods em Las → aviso `tooMany`; Adv. Rifling em Flamer → `incompatible` |
| `reloadStep(value, "double" \| "half")` | → texto | Full → 2 Full; 2 Full → 4 Full; Full → Half; Half → Half (metade) |
| `unstableDamage(total, d10)` | → dano | 20, 1 → 10; 20, 10 → 40; 21, 1 → 10; 20, 5 → 20 |
| `attackPool` (weapon.mjs) | `mods` → +1k0 | Red-Dot em tiro simples +1k0, em rajada 0; Motion Predict em rajada +1k0 |
| `damagePool` (weapon.mjs) | `mods` | Breacher a curta distância +1k0, normal 0; Nonlethal → `explodeOn` 11 |
