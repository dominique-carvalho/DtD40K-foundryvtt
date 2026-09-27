# Research — 012-npcs-minions

Data: 2026-09-27. Fontes: código da `main` com a 011 (modelo `character` com `derivedMods.<key>.override`, Level que
cai no valor guardado sem classes, `armorProfile`, ataque/dano da 007, Aplicar/condições/turno/Fear Test/social da
008, magia da 009), Foundry **13.351** e o inventário do cap. XX da 7.7a (scratchpad `ch-antagonists-inventory.json`:
20 traits, 47 fichas conferidas contra as fórmulas, 4 squads; texto próprio com 6-gramas = 0).

## R1. Tipo `npc`

- **Decision**: `NpcData extends CharacterData` (mesmo schema, mais `npc`: `category`, `description`, `traits[{ key,
  value }]`, `abilities[{ name, effect }]`, `feats[]`, `gear[]`, `armor[{ name, ap, locations }]`, `alternate`,
  `resource { type, value, max }`, `source`). Os valores impressos (SD, MD, HP, Resilience, Speed) entram como
  `derivedMods.<key>.override`, então `computeDerived` devolve o número do livro; Level fica em `system.level` (sem
  classes, `characterLevel` usa o valor guardado).
- **Rationale**: todo fluxo que lê `actor.system` (rolagens, ataque, dano, condições, turno, magia) funciona sem
  duplicar. **Alternatives**: modelo próprio reimplementando os derivados.
- **Tipos**: os serviços que hoje exigem `character` passam a aceitar `npc` onde faz sentido (dano, condições, turno,
  magia, social como alvo, equipamento); classes, raça, exaltação, feats, XP, Backgrounds e escolas marciais continuam
  só de `character`.

## R2. Armas e armadura do bloco

- **Decision**: ataques como Items `weapon` embutidos, com `flags.dtd40k.npcDamage = true` (o dano impresso já inclui a
  Força: `rollDamage` usa Força 0). `weaponType` por nome/alcance (pistola, pesada, básica, corpo a corpo), qualidades
  mapeadas para `WEAPON_QUALITIES` (Two Hands → `twoHands`, Arm Mounted → `armMounted` etc.); arma do pack da 007 com o
  mesmo nome empresta `group`. O NPC é **proficiente** em todas (`isProficient` → true para `npc`).
- **Armadura**: `npc.armor` (do bloco) + traits (Armor Plating X, Machine X, Daemonic = Con) somados em
  `armor.locations` no `prepareDerivedData`; entradas duplicadas no livro (Subdermal Plating/Armor Plating, Machine
  Toughness/Machine) ficam só na armadura (o gerador tira o trait de armadura quando o bloco já a lista).

## R3. Traits

- **Decision** (`rules/npc.mjs`, puro): `TRAITS` (20, com automação), `traitArmor(traits, con)`, `traitAura`,
  `immunities(traits)` (Undead/Stuff of Nightmares: `stunned`, `bloodLoss`), `regeneration(traits)`, `fearRating`,
  `isAmorphous`, `isMindless`. Pontos de uso: `toggleCondition` recusa as imunidades; `DtdCombat#_onStartTurn` cura a
  Regeneration; `rollAttack` põe a localização no corpo contra Amorphous; `socialAttack` recusa alvo Mindless; ficha
  do NPC com botão de medo (cartão com "Fear Test (X)" para o herói de quem clica: o personagem do usuário ou o token
  controlado); Caster: `magic.schools` do bloco e `magic.state.sanctioned = true`.

## R4. Compêndio `antagonists`

- **Decision**: pack de Actors (47 `npc` + 4 `minionSquad`), 10 pastas por categoria + "Minion Squads"; armas
  embutidas com `_key` `!actors.items!<ator>.<item>` (o `assign-pack-ids` ganha o layout `antagonists`, `collection:
  "actors"`). Descrições e habilidades em texto próprio; gerador no scratchpad.

## R5. Minion Squad

- **Decision**: tipo `minionSquad` (`MinionSquadData`): `threatRating` 1–5, `count` 0–6, `melee`/`ranged` `{ rating 0–5,
  type, weapon }`, `allyUuid`, `description`; derivados `derived.staticDefense = 5 × TR`, `derived.speed = TR`,
  `range = 10 × TR`, `defeated = count 0`. Regras puras (`rules/minions.mjs`): `squadPool({ count, attacking, tr })`,
  `minionDamage({ rating, raises })`, `casualties({ raises, blast })`, `allyBonus(squads, fellowship)`.
- **Ataque da squad** (`minion-service.attack`): `runTest` com a parada e a SD do alvo; cartão com botão de dano →
  cartão de dano da 008 (`total = 5 × (DR + raises)`, Pen 0, localização corpo), aplicado pelo Aplicar.
- **Baixas**: `rollDamage` passa `raises` e `blast` na flag `damage` (aditivo); `damage-service.applyDamage` num
  `minionSquad` remove `casualties` minions e posta o resultado (desfazer da 008 também guarda `count`).
- **Aliados**: a squad guarda o herói (`allyUuid`); `withRollModifiers` de um personagem, em testes de perícia, soma
  `allyBonus` (maior TR + 1 por minion além do primeiro, no máximo Fellowship minions) como bônus fixo.
- Sem controle de ações da 008 para squads.
