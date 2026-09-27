# Research — 008-combat

Data: 2026-09-26. Fontes: código da `main` com a 007 (cartões de ataque e dano, AP por localização, `modifiers.rolls`,
`DtdActiveEffect`, iniciativa do `system.json`), código do Foundry **13.351** instalado
(`client/documents/active-effect.mjs`, `combat.mjs`) e o inventário do cap. XVII da 7.7a (scratchpad
`ch-combat-inventory.json` / `ch-combat-rules.md`, com linhas e páginas).

## R1. Aplicar dano (puro + serviço)

- **Decision**: `rules/damage.mjs` → `resolveDamage({ total, pen, type, location, magic, tearing, unarmed, armor, aura,
  resilience, hp, critical, cover })` → `{ steps, effective, wounds, hpLoss, criticalGain, critical, row, fatigue,
  coverHit }`. `armor` = AP por localização da 007 (`system.armor.locations`; braço/perna esquerda/direita → `arms`/
  `legs`); cobertura primeiro (AP − Pen), depois a armadura com a Pen que sobrar (premissa: a Pen conta uma vez contra
  cada camada); magia usa Aura no lugar do AP.
- **Serviço** `damage-service.applyDamage(message, tokens)`: para cada alvo, lê a flag `damage` da 007, resolve, grava
  `system.hp.value`, `system.critical.value`, fadiga, cobertura, e posta o registro com um botão Desfazer (Mestre) que
  guarda os valores anteriores na flag da mensagem. Jogador sem permissão: pedido via socket para o Mestre ativo
  (`game.socket` `system.dtd40k`).

## R2. Critical Damage

- **Decision**: `system.critical.value` (acumulado, um total por personagem — premissa da spec). A cada aumento, a linha
  = min(total, 5) da tabela `tipo × localização` do golpe (esquerda/direita compartilham). Linha 5 (e Energy/Gizzards 4)
  = morte.
- **Dados**: pack `combat-tables` (RollTable) com as 20 tabelas de críticos (5 resultados cada), a Shock Table e a
  tabela de Mental Traumas; texto próprio no `description` de cada resultado e automação em
  `flags.dtd40k.effect = { statuses: [id], fatigue: "1d5"|n, rounds: "1d5"|n, test: { characteristic, tn, onFail:
  "dead"|status }, dead: bool, halfAction: bool, apLoss: n }`. `rules/critical.mjs` (puro) interpreta a flag e devolve
  o plano (condições, fadiga, testes a pedir). Nativo: o Mestre também pode rolar as tabelas à mão.

## R3. Condições como status effects

- **Fato verificado (13.351)**: `ActiveEffect.fromStatusEffect` copia do `CONFIG.statusEffects` tudo menos `id/label/
  icon/hud`, inclusive `changes` e `duration`.
- **Decision**: `CONFIG.statusEffects` substituído pelas condições da DtD (`STATUS_EFFECTS` em config): blinded, bloodLoss,
  dazed, deafened, diseased, onFire, helpless, immobilized, pinned, prone, restrained, stunned, surprised, unconscious,
  dead, grappled, jaded, lostHand, lostArm, lostEye, lostFoot, lostLeg, fullDefense, fightDefensively, allOutAttack,
  healingSurge. Efeitos numéricos como `changes` (ex.: Dazed `system.modifiers.rolls.all.rolled −1`); o resto por
  `actor.statuses` lido nas regras puras (`combatState(statuses)` → flags `cannotAct`, `grantsAdvantage`,
  `autoFailBallistics`, `noDodge`, `movementBlocked`, `helpless`...).
- **Fadiga**: `system.fatigue.value > 0` → −1k0 em `modifiers.rolls.all` no `prepareDerivedData`; acima da Con →
  serviço aplica Unconscious e volta a fadiga a Con (no `_onUpdate` do ator, cliente do autor).

## R4. Iniciativa e ordem

- **Fato verificado**: `Combat#setupTurns` ordena com `this.combatants.contents.sort(this._sortCombatants)` (método não
  ligado ao `this`).
- **Decision**: `DtdCombat#_sortCombatants(a, b)`: iniciativa, depois o d10 (iniciativa − Dex − Cmp − modificador,
  `initiativeDie` puro), depois Dex; empate total → mantém e o Mestre rerrola (o livro manda rerrolar). Iniciativa
  social: ação do menu troca a fórmula para Fel + Cmp no combate marcado `flags.dtd40k.social`. Hero Point na
  iniciativa: botão no Combat Tracker (d10 = 10, −1 Hero Point).

## R5. Estado do turno

- **Decision**: `flags.dtd40k.turn` no **Combatant** `{ round, full, halves: [key], free: [key], reactions: n }`;
  `rules/turn.mjs` (puro) `canUse(state, action, { reactionsMax })` → `{ ok, reason }` e `spend(state, action)`.
  `reactionsMax` = 1 + extras dos efeitos (Full Defense +2, Fight Defensively +1 só Dodge/Parry, Resource Point +1);
  All Out Attack → 0. O estado zera quando a rodada muda. Fora de combate: sem controle.
- **Até o próximo turno**: efeitos de ação criados com `flags.dtd40k.untilTurnOf = combatantId`; o hook `updateCombat`
  (no cliente do Mestre ativo) apaga-os quando começa o turno daquele combatente e pede os testes de fim de turno
  do combatente anterior (On Fire, Blood Loss, Pinned) e decrementa durações em rodadas.

## R6. Menu de ações

- **Decision**: `COMBAT_ACTIONS` (38) num módulo de dados puro `module/rules/combat-actions.mjs`: `key, name, type
  (half|full|free|reaction|varies), subtypes, summary (inglês, redação própria), automation` com `attack` (modificador
  e opções para o diálogo da 007), `roll` (perícia/característica e TN), `effect` (status até o próximo turno),
  `reaction` (dodge/parry/refute). A ficha lista as ações por tipo (modo Jogo) e o Combat Tracker mostra o gasto do
  turno.
- **Dodge/Parry**: botões no cartão de ataque (para o dono do alvo): rola Dodge (Dex + Acrobatics) ou Parry (perícia k
  perícia + Level) e registra no cartão "SD + metade" e se o ataque ainda acerta (`rules/defense.mjs` puro).

## R7. Modificadores de situação

- **Decision**: o diálogo de ataque da 007 ganha checkboxes: Combat Advantage (automática se o alvo tem status que a
  concede), alvo correndo, ganging up (2:1, 3:1), atirar em corpo a corpo, terreno difícil/árduo, Called Shot (escolhe
  localização). Multiple Attacks (ação) rola N ataques com as penalidades de duas armas/feats.

## R8. Cura e morte

- **Decision**: `rules/healing.mjs` `woundState({ hpLost, wil, critical })` e `rest({ state, days|weeks, full, medical,
  con })` → cura; diálogo "Descanso" do Mestre na ficha. Morte = status `dead`; ao receber `dead`, se o personagem
  tem Hero Points, o dono pode queimar um (−1 no máximo, retira `dead`, aplica `unconscious`).

## R9. Social, medo, insanidade

- **Decision**: `rules/social.mjs` (Resolve por cena, Jaded, Refute), `rules/mental.mjs` (Fear TN, Shock Table com
  checks, Trauma TN, limiares de 10/20/100). Campos: `system.resolve.drainedScene`, `system.insanity { value,
  derangements: [{ name, severity }] }`. Ataque social pelo menu (característica + perícia, TN = Mental Defense do
  alvo) com botões "Gastar Resolve" / "Ceder" para o dono do alvo; "Nova cena" (da 004) zera o drenado.
