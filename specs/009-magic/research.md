# Research — 009-magic

Data: 2026-09-27. Fontes: código da `main` com a 008 (XP e classes da 006 com `magicSchools`, Aplicar dano com Aura,
turno, status effects, RollTables em `combat-tables`), Foundry **13.351** e o inventário do cap. VIII da 7.7a
(scratchpad `ch-magic-inventory.json` / `ch-magic-rules.md`, stat blocks conferidos no PDF pelo levantamento).

## R1. Tipo `spell` e compêndio

- **Decision**: Item `spell` com `school` (9 chaves), `level` 1–5, `tn` (`{ value: n|null, special: ""|"none"|"mentalDefense" }`),
  `action` (half|full|reaction|free|halfOrReaction), `keywords[]` (13 chaves), `range`, `target`, `area`, `duration`
  (`{ type: instant|scene|rounds|minutes|hours|days|indefinite|concentration|special, value, perLevel, expendable,
  concentration: half|reaction|"" }`), `damage` (`{ rolled, kept, type, perLevelRolled, perLevelKept }`), `save`
  (característica ou ""), `effect`, `perRaise`, `automation` (`{ effect: { changes, target: self|target } , statuses,
  auraPerRaise, capLevelMultiplier }`), `source`. No personagem: `learnedAt` (valor da escola ao aprender).
- Pack `spells` (Item) com 9 pastas por escola; gerado do inventário; texto próprio (inventário já em redação própria,
  checagem de 6-gramas = 0).

## R2. Escolas no personagem e XP

- **Decision**: `system.magic.schools.<key>.value` (0–6; o teto do Level é regra de compra, não de schema) e
  `system.magic.combos` (`[{ id, name, spells: [uuid/nome] }]`). `XP_KINDS` ganha `school` e `combo`;
  `advanceCost("school", from)` = 200 se 0, senão 100 × from; `advanceCost("combo", levels)` = 50 × soma.
  `canAdvance({ kind: "school", key })`: na classe atual, só escolas de `magicSchools` (nome → chave); em Free Study,
  as das classes concluídas; fora → recusa (Mestre sem custo); teto `from + 1 ≤ Level` → recusa `atCap`.
  `undoPlan` para `school` restaura o valor.

## R3. Vagas de magia

- **Decision**: `spellSlots({ schools, spells, extra })` (puro) → por escola `{ used, max = valor + extra }` e
  `canLearn({ spell, schools, spells })` → `{ ok, reason: noSlot|levelTooHigh|alreadyKnown }`. Extra vem de feats
  (Spell Book: +1 na escola escolhida pela subcategoria). Recusa com override do Mestre.

## R4. Focus Power (puro)

- **Decision**: `rules/magic.mjs`:
  - `castPool({ school, characteristic, strength, push })`: Unfettered (s + c)k c; Fettered ⌈(s + c)/2⌉ k min(c, rolados);
    Push (s + push + c) k c. `maxPush(tested)` 3/4.
  - `phenomenaModifier({ strength, push, tested, level, keptExploded, comboSize })` → `{ roll: bool, mod }`:
    Fettered nunca; Unfettered só com dado explodido mantido (+5 × nível sem Tested); Push sempre (+5/+10 por ponto);
    combo +5 por magia.
  - `spellTn(spell, { targetMd })`, `spellDamage(spell, { level, raises })`, `perRaiseValue` para Aura etc.
  - `keywordCheck(spell, { statuses, inCombat, hasItem })` → bloqueios (somatic, social) e avisos (verbal, focus, material).
  - `comboTest(spells, schools, characteristics)` → escola e característica menores, TN maior + 5 × (n − 1), sem Fettered.
  - `tableRow(results, total)` → linha (acima do máximo = última).

## R5. Cartão e efeitos

- **Decision**: `magic-service.castSpell(actor, spellId, { combo })`: diálogo (força, push, TN, modificadores,
  reroll do Implement), turno da 008 (ação da magia), keywords, `runTest`, cartão `spell-card` com raises/efeito; se
  dano → cartão de dano da 007/008 com `magic: true` e botão Aplicar; se `save` → botão Resistir (dono do alvo, Arcana
  + característica contra o total); se `automation.effect` → Active Effect no alvo/conjurador com duração
  (`flags.dtd40k.expiresRound` em combate ou `duration.seconds`); Phenomena → `RollTable` "Psychic Phenomena" (1d100 +
  mod) e, com 75+, "Perils of the Warp", aplicando `flags.dtd40k.effect` como na 008.
- Tabelas Phenomena/Perils entram no pack `combat-tables` (pasta "Warp"), reusando o gerador e a automação da 008.

## R6. Sustentadas

- **Decision**: `system.magic.sustained [{ id, spell, name, action: half|reaction, targetUuids, effectIds }]`; no
  `DtdCombat#_onStartTurn` do conjurador, gasta a ação no turno (008) e posta o lembrete; sem ação → termina.
  `endSustained` apaga os efeitos criados.

## R7. Implement

- **Decision**: gear "Implement" equipado → flag `hasImplement`; Implement Focus (feat) → diálogo oferece rerrolar o
  menor dado mantido uma vez; bônus de classe "−1 TN com Implement" (conclusões da 006 com texto) → modificador de TN
  opcional no diálogo quando equipado.
