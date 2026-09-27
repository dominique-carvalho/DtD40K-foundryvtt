# Research — 010-sword-schools

Data: 2026-09-27. Fontes: código da `main` com a 009 (XP e classes da 006 com `swordSchools`/`gunKata`, armas da 007
com `group`/`weaponType`/`qualities`, `rollAttack`/`rollDamage`, ações e turno da 008, `resolveDamage`,
`toggleCondition` com `untilTurnOf`/`expiresRound`), Foundry **13.351** e o inventário dos caps. IX e X da 7.7a
(scratchpad `ch-martial-inventory.json`, 15 escolas × 9 entradas conferidas com `pdftotext -table`).

## R1. Tipo `martialSchool` e compêndio

- **Decision**: Item `martialSchool` com `key` (camelCase, igual à chave de `MARTIAL_SCHOOLS`), `kind`
  (`sword`|`gunKata`), `keySkill` (chave de perícia), `weaponGroup` (grupo da 007 ou ""), `summary` e `entries[]`
  (`{ id, rank 1–5, type: action|weapon|flaw|skill|advantage|mastery, name, cost: int|null, perPoint, variableCost[],
  effect, automation }`). Pack `martial-schools` (Item) com 2 pastas (Sword Schools, Gun Kata), prefixos
  `dtdMFd`/`dtdM`. Entradas com `id` estável (slug do nome) para os ataques referenciarem.
- **Universais** (5 vantagens + 7 restrições, compartilhadas) em `rules/martial.mjs` como dados puros
  (`UNIVERSAL_ADVANTAGES`, `UNIVERSAL_RESTRICTIONS`, efeito em inglês próprio, rótulos i18n) — são 12 linhas fixas usadas
  pela regra do orçamento e pelos testes; a aba mostra a lista.
- **Rationale**: as escolas são conteúdo consultável (ficha, compêndio) como raças/classes; o personagem guarda só o
  valor. **Alternatives**: escolas embutidas no ator (duplicação e migração a cada ajuste do pack).

## R2. Escolas no personagem e XP

- **Decision**: `system.martial.schools.<key>.value` (0–6) para as 15 chaves de `MARTIAL_SCHOOLS` (`key → { name, kind,
  skill }`); derivados `martial.adeptLevel` (maior Sword School) e `martial.gunslingerLevel` (maior Gun Kata).
  `XP_KINDS` ganha `martial` e `specialAttack`. `advanceCost("martial", from)` = mesmo custo da escola de magia (200 /
  100 × from); `canAdvance({ kind: "martial", key, level, from })`: teto Level (`atCap`), lista `swordSchools` ou
  `gunKata` da classe atual (Free Study: concluídas) comparando pelo nome; `undoPlan` restaura
  `system.martial.schools.<key>.value`.
- **Dados das escolas em tempo de uso**: `martial-service.schoolData()` carrega os 15 documentos do pack uma vez
  (cache por sessão, invalidado se o pack mudar) — o `_prepareContext` da ficha já é assíncrono.

## R3. Passivas (Masteries)

- **Decision**: entradas `mastery` com `automation.changes` (Active Effect) — Ox Body (`system.modifiers.hpMax` +4) e
  Hair Trigger (`system.modifiers.initiative` +2). Wind Step (raise livre na iniciativa) fica texto: a iniciativa da
  008 soma um valor fixo, não raises. `martial-service.syncPassives(actor)` cria/remove os efeitos (flag
  `dtd40k.martialPassive = "<escola>:<entrada>"`, desligáveis pelo Mestre) após comprar ou desfazer; as demais passivas
  aparecem como texto na aba.

## R4. Montador e orçamento (puro)

- **Decision**: `system.martial.attacks[]` (`{ id, name, kind: special|trick, action, advantages: [{ ref, count,
  choice }], restrictions: [{ ref, count }], paid, history: [definição anterior], state: { lastRound, usedScene,
  ready } }`); `ref` = `universal:<slug>` ou `<escola>:<entrada>`.
  - `options({ schools, ranks, kind })` → ações (Standard Attack + ações do nível 1 das escolas com valor ≥ 1),
    vantagens e restrições disponíveis (nível ≤ valor; Gun Kata só em `trick`, Sword Schools só em `special`,
    universais em ambos).
  - `points(entry, count, choice)` (repetível × quantidade; custo variável pela escolha: Revitalizing Strike 1/3,
    Exit Wound Kata X).
  - `budget({ advantages, restrictions, level })` → `{ ok, reason: "" | noLevel | overCap | needRestrictions, missing }`:
    vantagens ≤ 2 × nível; excesso sobre o nível ≤ restrições.
  - `attackCost({ points, paid })` = 50 × max(0, points − paid).
- **Rationale**: tudo o que o livro calcula é puro e testável (exemplos pp. 261 e 273).

## R5. Uso em combate

- **Decision**: `martial-service.useAttack(actor, attackId, { weaponId })`:
  1. `usageCheck(attack, context)` (puro) → bloqueios com override do Mestre: grupo de arma
     (`requiresWeaponGroup`; Brawl = Unarmed/desarmado), tipo (`pistol`, `heavy` pelo `weaponType`; `primitive` pelo
     grupo), sem arma, Difficult Strike (`state.lastRound === round − 1`), Last Resort (`state.usedScene`), alvo
     Helpless/Surprised (Death Blow, When Suddenly…), HP ≤ metade (Blaze of Glory); lembretes não verificáveis
     (engajado, alvo que se moveu).
  2. Ação-base pelo `turn-service.useAction(actor, key, { weaponId, special })` estendido: `special` segue para
     `rollAttack` / `multipleAttacks` (vantagens só no primeiro ataque); ações de preparo (Aim, Feint, Ready, Aid
     Another) e Suppressing Fire só gastam a ação e marcam `state.ready` (o próximo ataque pela aba usa uma Standard
     Attack com as vantagens, até o fim do próximo turno).
  3. Restrição de perícia: `actor.rollSkill(skill, { tn: SD do alvo })`; falha → cartão "o ataque falha", sem rolar.
  4. `attackModifiers(attack, entries)` (puro) → `{ attack: {rolled, kept}, damage: {rolled, kept}, pen, penZero,
     noStrength, explodeOn, qualities: [{key, value}], onHit: [...], onMiss: [...], self: [...], resolve:
     { ignoreArmor, resilienceMod, resilienceMultiplier, noCritical }, damagePerRaise, texts: [...] }`.
- **`rollAttack(actor, itemId, { special })`**: soma `special.attack` na parada; guarda `special` na flag `attack`;
  o cartão lista as vantagens de texto e, se o alvo tiver Blast/Flame, o aviso do alvo mais próximo; ao errar aplica
  `onMiss` (Death From Above: Prone). **`rollDamage`**: soma dano/Pen, zera Pen, tira a Força, `explodeOn` 9, soma
  `damagePerRaise × raises`, acrescenta as qualidades ao perfil (as automatizadas da 007 — Tearing, Razor Sharp,
  Accurate, Storm — passam a valer; as demais aparecem no cartão) e passa `resolve` na flag `damage`.
- **Efeitos ao acertar**: botão "Aplicar efeitos" no cartão de ataque (dono do alvo ou Mestre, pelo mesmo pedido por
  socket da 008): Dazed por raise, Prone, Blood Loss, fadiga, com `toggleCondition`/`addFatigue`. **No atacante**, ao
  usar: −10 SD (Opening the Path) e +5 AP (Stone Skin) como Active Effects com `untilTurnOf`; fadiga (Weight of the
  Mountain).
- **`resolveDamage`** ganha `ignoreArmor`, `resilienceMod` (mín. 1), `resilienceMultiplier` (arredonda para cima) e
  `noCritical` (ferimentos além do HP não viram Critical Damage) — aditivo, padrões neutros.

## R6. Estado por rodada e cena

- **Decision**: `state.lastRound` gravado no uso em combate; `state.usedScene` zerado ao fim do combate (hook
  `deleteCombat` no Mestre) ou pela ação "Nova cena" da aba (Mestre). Fora de combate, Difficult Strike não é conferido.

## R7. Vantagens em texto

- **Decision**: vantagens com `automation.text` (teleporte, trilha de fogo, ataques extras, reações de aliados, drenar
  recursos, usar a arma do oponente, movimento forçado, desarme) aparecem no cartão de ataque com o efeito próprio.
