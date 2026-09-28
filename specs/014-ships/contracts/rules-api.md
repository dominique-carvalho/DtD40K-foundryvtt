# Contract — `module/rules/ship.mjs` (puro)

Sem globais do Foundry. Testes em `tests/unit/ship.test.mjs`, `config.test.mjs`, `packs.test.mjs`.

| Função | Entrada → saída | Casos de teste |
|---|---|---|
| `shipBudget(holdings)` | → BP | 1 → 50; 5 → 250; 0 → 0; 6 → 250 |
| `staticDefense({ maneuverability, acceleration })` | → SD | Sultana 5/10 → 25; Belle −5/−5 → 0 |
| `initiativeBonus({ sensors, acceleration })` | → bônus | Wanderer 10/5 → 15 |
| `customHull(base, upgrades)` | → stats + `{ cpSpent, warnings }` | Destroyer + 2 Hull + 1 arma à frente → Hull 65, 3 à frente, 6/11 CP; 3 Hull extra na Escort já com 6 → aviso Upgrade Limit; Battleship base +2 à frente → aviso Total Limit |
| `consoleBonuses(consoles)` | → modificadores | 2 Hardened Armor → Hull +20; Large Engine Core → Speed +2, Acc +5; Enhanced Sensors → Sensors +5 |
| `shipStats(hull, custom, consoles, crits)` | → stats finais | Essex + 2 Hardened Armor → Hull 95 (Military Cruiser); Sensors Damaged → −20 |
| `bpSpent(components, customBase)` | → BP | Steamboat 10 + Standard Mk I 5 + Lance Las 10 + 5 oficiais 25 → 50 |
| `slotUsage(hull, components)` | → `{ consoles, weapons, warnings }` | Tactical sem slot Tactical livre → ocupa Universal; sem Universal → aviso |
| `weaponProfile(pattern, type)` | → perfil | Lance + Plasma → 9k3, Dis 4, Acc 0, Crit 2, 10, 15 BP; Turret + Melta → 3k1, Dis 0, Crit −1, 2, 5 BP; Array + Positron → 2k2, Dis 4, Acc 5, Crit 1, 20, 15 BP; Heavy Lance + Plasma → 10k4, Dis 5, Acc −5, Crit 4, 20, 20 BP |
| `shipPool({ crew, kept, stat })` | → `{ rolled, kept, flat }` | 8/3/5 → 8k3+5; 4/0/0 → 4k1; 12 → rolled 10 |
| `crewAvailable({ max, temp, committed, deployed })` | → Crew | 16/0/8/0 → 8; 16/2/10/6 → 2 |
| `commitCrew({ temp, committed }, n)` | → novo estado | temp 2, pede 3 → temp 0, committed +1 |
| `shieldHit({ value, disruption, collapsed, damage, dis })` | → `{ value, disruption, collapsed, toHull }` | 75/0, 20, Dis 4 → 55/4; 10/4, 25 → 0 colapsado, toHull 0; colapsado, 30 → toHull 30 |
| `shieldRegen({ value, max, regen, disruption, collapsed })` | → valor | 55/75/10/4 → 61; colapsado → igual; 74/75/10/0 → 75 |
| `multiphasicHit(layers, damage, dis)` | → camadas | 4 × 20, 25 → camada 1 a 0 (excesso perdido), Dis na camada 1 |
| `critRow(total)` | → linha | 0 → Armor Scuffing; 5 → Venting Plasma; 13 → Secondary Explosion; 15 → Secondary Explosion |
| `critModifier(state, consoles, extra)` | → soma | Reinforced Bulkheads −3; Hull Breached +2; Brace −1 e −1 por 2 raises |
| `ramDamage(hullClass, { prow })` | → pool e crit | Destroyer → 3k3, crit +3; Destroyer com Prow → 4k4 e +5 no alvo, sem dano próprio |
| `boardingLoss({ committed, checks })` | → Crew perdida | 10/2 → 7; 6/0 → 3; 10/9 → 10 |
| `boardingRange({ assaultShuttles, teleportarium, targetShielded })` | → VU | base 1; shuttles 3; teleportarium e alvo sem escudo 5 |
| `fighterPool({ count, ballistics })` / `fighterDamage(count)` | → pools | 6/3 → 6k3; 6 → 3k3; 1 → 1k1 |
| `warpVoyage(distance)` | → `{ tn, warpTime, realTime }` | moderate → 20, 1d10 dias, 1d10 semanas |
| `warpCourse(outcome)` | → modificador do passo 3 | falha → −10; 2 raises → +10 |
| `warpSteer({ outcome, relay })` | → `{ encounters, timeDivisor, encounterModifier, offCourse, timeMultiplier }` | sucesso 2 raises com Relay → 1 encontro, ÷2; falha 2 checks → +2, fora do curso; sem Relay → tempo ×2 |
| `warpEncounterModifier({ chaplain, warpsbane, ancientHelm, failed })` | → soma | Chaplain + Warpsbane → −3; Helm + falha → +4 |
| `warpEncounter(total)` / `warpPerilous(d5)` | → linha | ≤2 All's Well; 7 The Vanishing; 11+ perigoso |
| `bombardScatter(checks)` | → pool em km | 0 → 1k1; 2 → 3k1 |
| `fieldRepair(raises)` | → pool de Hull | 0 → 1k1; 1 → 2k2 |
| `emergencyRepair(raises)` | → dados de Hull temporário | 0 → 1d10; 2 → 2d10 |
