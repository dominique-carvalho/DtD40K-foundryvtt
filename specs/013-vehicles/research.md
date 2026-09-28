# Research — 013-vehicles

Data: 2026-09-27. Fontes: código da `main` com a 012 (armas e `rollAttack`/`rollDamage` da 007; `resolveDamage`,
Aplicar, reações e turno da 008; Backgrounds da 011; tipos `npc`/`minionSquad` e pack de Actors com itens embutidos da
012), Foundry **13.351** e o inventário do cap. XV da 7.7a (scratchpad `ch-vehicles-inventory.json`: componentes,
37 linhas de armas, 16 veículos com SD/HP conferidos e custos recalculados; texto próprio com 6-gramas = 0).

## R1. Componentes e armas

- **Decision**: Item `vehicleComponent` com `category` (`drivetrain|frame|armor|control|accommodation|accessory|
  modification|weaponUpgrade`), `cost` (VP; pode ser negativo), `slots` (null = sem slot), `perPurchase`, `quantity`,
  `drive { rating, controlSkill, minMomentum, flying }`, `frame { hp, resilience }`, `armor { ap }`, `effect`,
  `automation` (livre). Armas de veículo são Items `weapon` da 007 com dois campos novos, aditivos: `damage.bonus`
  (o "+10") e `vehicle { scale: ""|Vhcl|Hybrid, slots, cost }`. Munições e modos (LBX, HV, Ultra, Maximal, Inferno,
  Swarm, TC Warhead, Cluster, Homing) são `vehicleComponent` `weaponUpgrade` com efeito em texto.
- Pack `vehicle-components` (Item) em 8 pastas; pack `vehicles` (Actor) com os 16 exemplos, componentes e armas
  embutidos (layout com `collection: "actors"` como na 012).

## R2. Ator `vehicle`

- **Decision**: `VehicleData` (TypeDataModel próprio): `size`, `speed`, `acceleration`, `maneuver`, `momentum` 0–10,
  `budget { tier }` (rarity ou holdings), `hp { value, temp }`, `activeDrive` (id), `crew [{ role, actorUuid,
  weaponIds }]`, `state { flipped, destroyed, sceneWounds, juryRigUsed, stalled, lockedRounds, disabled[], explodeRound,
  extraReaction, lastMoveRound }`, `printed { vp, slots }` (valores impressos dos exemplos), `description`, `source`.
  Derivados (`prepareDerivedData`, com regras puras de `rules/vehicle.mjs`): `hp.max`/`derived.resilience` do frame,
  `armor.locations` (todos os locais = AP da armadura), `drive` (tração ativa: rating, perícia, voo), `derived.staticDefense`,
  `move` (Speed × DR × Momentum), `slots { used, max }`, `vp { cost, budget }`, avisos.
- **Rationale**: veículo não tem características nem perícias; herdar do personagem traria campos sem sentido.
  O Aplicar da 008 lê `system.armor.locations`, `system.derived.resilience`, `system.hp` — o veículo expõe os mesmos
  caminhos.

## R3. Regras puras (`rules/vehicle.mjs`)

- `baseCost({ maneuver, acceleration, speed, size })` pelas tabelas; `vehicleCost(stats, components)` (+ componentes ×
  quantidade; Flawed −10 por falha); `slotsUsed(components)`; `budgetVp(tier)`.
- `staticDefense({ size, speed, maneuver, momentum })`; `moveRange({ speed, driveRating, momentum })`.
- `moveMomentum({ momentum, delta })`, `punchIt({ momentum, acceleration, mode })` (limites 0–10).
- `controlTn(momentum)` = 5 × Momentum; `outOfControl(d10)` → linha; `ramming({ size, momentum, speed })` → `{ rolled:
  min(10, ⌊size/2⌋), kept: momentum, flat: speed }`; `evasiveBonus(total)` = ⌊total/2⌋.
- `critEvery(before, after)` → quantos críticos (a cada 5 ferimentos na cena); `vehicleCrit(d10)` → linha.
- `juryRigHp(raises)` = 1 + raises; `repairDays({ size, raises, success })` (÷2 no sucesso e por raise, mín. 1);
  `repairTn({ size, hpLost })`; `repairDice({ dots, crafts })`.
- `chaseRound(results)` → quem avança; `chaseModifiers({ obstacle, repeated })` → +2 raises / −2 checks.

## R4. Ações e combate

- **Decision** `vehicle-service`: as ações usam `takeAction` do piloto (turno da 008): `move(vehicle, delta)`,
  `punchIt(vehicle, mode, { stunt })`, `skirmish(vehicle, weaponId, gunner)`, `barrage(vehicle, [a, b], gunners)`,
  `ram(vehicle)`, `juryRig(vehicle, engineer)`, `embark(vehicle, actor, role)`, `switchDrive`. Fim do turno do piloto sem
  Move/Punch It → Momentum 0 (`DtdCombat#_onEndTurn`, pelo `state.lastMoveRound`).
- **Armas montadas**: `rollAttack(gunner, weaponId, { weaponOwner: vehicle, vehicle: true })` (aditivo): a arma vem do
  veículo; `vehicle: true` desliga proficiência, Weapon Focus/Specialization e os bônus de efeito do atirador; dano sem
  Força e com `damage.bonus`.
- **Evasive Maneuvers**: no cartão de ataque, alvo `vehicle` troca o Dodge por "Evasive" (piloto: perícia de controle +
  Maneuver; metade soma à SD, como a reação da 008), com Momentum ≥ 1 e a reação do piloto.
- **Control Test**: perícia de controle do piloto + Maneuver (bônus fixo) contra 5 × Momentum; falha rola Out of Control e
  aplica (Turn Over: HP −Momentum, virado, Momentum 0); chamado por Ramming, terreno difícil (botão) e crítico.
- **Dano**: `damage-service.applyTo` aceita `vehicle` (AP de todos os locais, Resilience do frame, sem crítico; 0 HP =
  destruído) e conta `sceneWounds`; cada múltiplo de 5 rola o crítico (efeitos simples; explosão pendente um round;
  piloto 1k1 via cartão de dano). Nova cena (botão do Mestre, fim do combate) zera `sceneWounds`.

## R5. Perseguição, stunts, reparo

- **Perseguição**: estado num ChatMessage (`flags.dtd40k.chase`: participantes, perícia escolhida, pernas, rodada,
  obstáculo resolvido); botões "Rolar rodada" (Mestre) e por participante "Obstáculo bem resolvido"; cada rodada rola a
  perícia de cada um com os modificadores de `chaseModifiers` e posta o placar.
- **Stunt driving**: o diálogo de Move/Punch It oferece stunt (dados) e, com 2+, a opção; Barrel Roll = +1 reação até o
  próximo turno (efeito no piloto com `untilTurnOf`).
- **Reparo**: diálogo com o engenheiro, pontos dedicados e o teste de Crafts; aplica HP, limpa HP temporários, sistemas
  desligados e `juryRigUsed`.
