# Research — 022 Traits, ataques especiais, esquadrões, feats e formas de NPC

Base: [inventory.json](inventory.json) (regras pp. 520–544, código da 012, APIs do Foundry 13.351, issues N1–N21).

## R1 — Valores impressos (N1)

- **Decisão**: o Speed é "fixado" quando `derivedMods.speed.override` não é nulo (todos os 47 NPCs do compêndio).
  Quadruped (×2) e Crawler (÷2) só multiplicam o Speed calculado. O deslocamento de voo é o valor do Flyer, ou 2× o
  Speed sem valor; o de nado do Amphibious é 2× o Speed. HP e SD nunca são recalculados por traits.
- **Por quê**: os blocos já trazem os traits somados (Ferocious Creature 16 = 8 × 2).

## R2 — Velocidades por ação (N17)

- **Decisão**: `npcSpeeds()` (puro) devolve `{ walk, fly, swim }`. A ficha mostra os três; o token usa `fly` como ação
  padrão do Flyer. O Foundry não limita o deslocamento por ação; o sistema não força limite (só exibe).

## R3 — Token derivado do ator (N7, N10, N11)

- **Decisão**: `DtdTokenDocument extends TokenDocument` (registrado em `CONFIG.Token.documentClass`):
  - `_inferMovementAction()`: `"phase"` se o ator tem Phasing e está Incorpóreo; `"fly"` se tem Flyer; senão o padrão.
  - `_prepareDetectionModes()`: com Dark Sight e visão ligada, `sight.visionMode = "darkvision"` e alcance ilimitado
    (só em memória).
  - `_onRelatedUpdate()`: `reset()` e `object?.initializeSources()` quando o ator muda (o núcleo só atualiza barras).
- **Phasing nas paredes**: ação de movimento `phase` registrada em `init` (`walls: null`, `canSelect` só para tokens
  incorpóreos com Phasing). O `constrainMovementPath` do núcleo já pula paredes quando `walls` é nulo, para arrastar,
  teclado e script (inventário §3).
- **Crawler e terreno (N12)**: `DtdToken extends Token` sobrescreve `_getMovementCostFunction` para o Crawler usar o
  custo base (terreno difícil não pesa).
- **Alternativa rejeitada**: gravar no token-modelo e nos tokens — exige migração e sincronia; Active Effects não
  alcançam campos do token.

## R4 — Escuridão e distância com elevação (N9, N10)

- **Decisão**: a situação do ataque ganha `darkness` (checkbox no diálogo). `situationModifiers` soma +5 ao TN
  ("concealment", p. 433) se o atacante não tem Dark Sight.
- **Distância**: `distance3d()` (puro) combina a distância no plano (medida pelo Foundry) com a diferença de elevação.
  O ataque compara com o alcance da arma (curto/normal/longo; corpo a corpo = alcance de reach) e põe um aviso no
  diálogo e no cartão. Não recusa (o livro não tem regra 3D).

## R5 — Queda de quem voa (N9)

- **Decisão**: hook `createActiveEffect` para os status `stunned`, `unconscious` e `prone`: se algum token do ator
  está com elevação > 0, o Mestre recebe um cartão com a elevação e o botão de queda, que abre a escolha de categoria
  da 018 (o livro não liga altura a categoria) e zera a elevação do token.

## R6 — Phasing e Incorpóreo (N7, N8)

- **Decisão**: status novo `incorporeal`. Ação "Incorpóreo" (meia ação) na aba Combate do NPC com Phasing alterna o
  status. No dano: alvo incorpóreo e arma sem `magic` e sem a qualidade Power Field → dano zero com aviso; o Mestre
  aplica mesmo assim. Magias causam dano normal (premissa). Stealth para se esconder em objetos: +2 raises como
  modificador sugerido no diálogo de rolagem quando incorpóreo.

## R7 — Auto-Stabilized (N16)

- **Decisão**: `attack-service` usa `braced: true` por padrão; `turn-service` passa `as: "half"` para
  `fullAutoBurst` e `suppressingFire`.

## R8 — Abilities estruturadas (N2, N21)

- **Decisão**: cada ability ganha `kind`:
  - `text`: como hoje.
  - `area`: ação, forma (cone, explosão, linha) e tamanho em metros, resistência (característica + perícia
    opcional + TN), falha → condição e duração, dano opcional, usos por cena. Ex.: Mind Blast (meia ação, cone 18 m,
    Willpower TN 25, Stunned 1 rodada).
  - `aura`: gatilho (`charge`, `allOutAttack`, `turnStart`), alcance (corpo a corpo), resistência e falha. Ex.:
    Frightful Presence (gatilho Charge/All Out Attack; usa o teste de medo da 012 pelo rating de Fear); calor do Fire
    Elemental (`turnStart`, Constitution TN 15, falha = 1 Fatigue).
  - `onHit`: arma nomeada e efeito no acerto. Ex.: Gauss Weapon (+1 dano crítico via `extraCritical` da 018).
  - `spell`: magia nomeada e rolagem (característica + perícia). Ex.: Possession (Charisma + Arcana, Dominate).
- Dragon Breath vira uma **arma** (perfil do Flamer, como o poder racial do Dragonborn) nos dois NPCs; a ability fica
  como texto de referência.
- Área usa o template e `tokensInZone` da 017; o cartão lista os alvos com botão "Resistir" (rola pelo dono do alvo)
  e "Aplicar" (Mestre, via socket). Usos por cena zeram no "Nova cena".

## R9 — Minion Squad no turno (N14)

- **Decisão**: o esquadrão usa o `turnState` da 008 pelo combatente. Ações: Mover (meia: TR; completa: 2×TR), Correr
  (completa), Atacar corpo a corpo ou à distância (meia, uma por turno), sem reações. O cartão do ataque ganha os
  botões de Dodge/Parry (como o ataque de NPC). Iniciativa 1d10 + TR (012). Alcance 10×TR (N13).

## R10 — Feats de NPC (N6)

- **Decisão**: `hasFeat(actor, name)` passa a ler itens de feat **e** `system.npc.feats` (sem o sufixo "×2" e com a
  especialização entre parênteses). As checagens por nome existentes passam a usar o helper. Nenhum Active Effect é
  criado para feats de NPC.

## R11 — Formas (N4, N5, N20)

- **Decisão**: `npc.forms[]` com `{ id, name, kind: "shift"|"variant", cost: {amount}, action, duration,
  characteristics, size, derived {staticDefense, hpMax, speed, resilience}, armor[], traits[], abilities[] }` e
  `npc.activeForm`, `npc.formRounds`. O `prepareDerivedData` do NPC aplica a forma ativa por cima dos valores base.
  Armas próprias da forma são itens com `flags.dtd40k.form`; só aparecem com a forma ativa.
  - Zoanoid: `shift`, custo 1 do recurso (Rage), ação completa, duração editável (padrão Con rodadas); valores
    entre colchetes relidos do livro.
  - Elemental: quatro `variant` (sem custo, escolhidas na ficha): Earth (+6 armadura), Air (Phasing), Fire (calor e
    dano E), Water (Regeneration 1).

## R12 — Resource Stat e edição (N3, N18, N19)

- **Decisão**: `npc.resource` é a fonte da verdade; botões gastar e recuperar (1 por clique) com linha no chat. A aba
  Antagonista, em modo Edição, ganha editores de traits (chave + valor), abilities (nome, efeito, tipo e campos do
  tipo), feats (lista) e formas.
