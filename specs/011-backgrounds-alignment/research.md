# Research — 011-backgrounds-alignment

Data: 2026-09-27. Fontes: código da `main` com a 010 (Devotion 0–10 na ficha, Wealth e itens iniciais por raridade da
007, XP e histórico da 006, derangements da 008, hindrance Night Terrors da 005, `combat-tables` com as tabelas do
Warp), Foundry **13.351** e o inventário dos caps. XI–XII da 7.7a (scratchpad `ch-alignment-inventory.json`, texto
próprio com 6-gramas = 0).

## R1. Tipo `deity` e compêndio

- **Decision**: Item `deity` com `key`, `pantheon` (`ruinousPowers|blessedPantheon|grayCouncil`), `summary`,
  `commandments[3]`, `keywords[5]`, `directivesTitle`, `directives[5]`, `cults[{ name, summary }]`, `source`, `description`
  (HTML com o resumo). Pack `deities` (Item) com 3 pastas, prefixos `dtdDFd`/`dtdD`. No personagem, o deus embutido é o
  alinhamento (um só, como a raça da 002).
- **Degeneration** entra no pack `combat-tables` (pasta "Alignment"; `flags.dtd40k.table.kind = "degeneration"`), com
  `flags.dtd40k.effect` em cada linha: `{ characteristic, value }`, `{ hindrance }`, `{ derangement: "minor" }`,
  `{ social: { rolled: -2 } }` ou `{ text: true }`. Reusa o gerador e o `tableRow` da 009.
- **Alternatives**: RollTable própria num pack novo (um pack só para uma tabela).

## R2. Backgrounds no personagem

- **Decision**: `system.backgrounds` = `{ allies, contacts, fame, followers, holdings, inheritance, mentor, status }`
  (`{ value 0–5 }`), `artifacts[{ id, name, value }]`, `backings[{ id, name, value }]`, `inheritancePicks` (contagens por
  raridade: ubiquitous, veryCommon, common, uncommon, rare, veryRare, mythicRare, anyNonArtifact). **Wealth** continua
  em `system.wealth.value` (007) e é mostrado e comprado como Background. Constante `BACKGROUNDS` (11 chaves, múltiplos);
  as descrições por valor são conteúdo em inglês (texto próprio), como dados em `rules/backgrounds.mjs`, e os rótulos
  vão para o i18n.
- **Compra** (puro, `rules/backgrounds.mjs`): `creationDots(backgrounds, wealth)` = Σ min(valor, 3) de todas as
  instâncias; `backgroundCost({ to, dotsUsed })` = 0 se `to ≤ 3` e `dotsUsed < 7`; 50 se `to ≤ 3`; 100 se `to ≥ 4`.
  `canRaise({ creation, isGM, to, artifactTotal })` → recusa fora da criação (Mestre ajusta sem XP), `artifactCap`
  (> 5 na criação). XP: novo tipo `background` no `XP_KINDS`, histórico com `from`/`to`, desfazer restaura o valor.
- **Mestre fora da criação**: campos numéricos no modo Edição, sem XP.

## R3. Inheritance

- **Decision**: `inheritanceFits(level, picks)` (puro). Cada opção do nível 1 ocupa uma "vaga" (1 Uncommon, ou até 2
  Common, 4 Very Common, 8 Ubiquitous); Rare ocupa 2 vagas, Very Rare 4, Mythic Rare 8, qualquer item não-artefato 16;
  o nível n tem 2^(n−1) vagas. Como os blocos são potências de 2, cabe se Σ blocos ≤ 2^(n−1), com cada tipo de nível 1
  arredondado para cima em vagas (ex.: 3 Common = 2 vagas). As picks somam às vagas de itens iniciais da 007
  (`startingSlots(items, extra)`, `startingSlotFor` aceita as novas raridades; `anyNonArtifact` recebe o que não coube).

## R4. Contacts

- **Decision**: rolagem (Contacts + característica) k característica, como um teste de perícia, com a característica
  escolhida (Charisma ou Fellowship) no diálogo de rolagem da 001; cartão no chat.

## R5. Alignment Check e Devotion

- **Decision** (`rules/alignment.mjs`, puro):
  - `alignmentCheck({ d10, bonus, devotion })` → `{ total, pass }` (total ≥ Devotion).
  - `afterFailure(devotion)` → `{ devotion: devotion − 1, second: devotion − 1 ≤ 6 && devotion − 1 > 0, outOfPlay }`.
  - `recover({ pass, devotion })` → `{ devotion: min(10, +1), cures: devotion }` (cura a Degeneration registrada no ponto
    anterior ao novo valor, i.e. no valor antigo).
  - `changeAlignment({ from, to, devotion, changes })` → `{ devotion, degenerationAt: 7|null, refused }`.
  - `degenerationRow(results, roll, owned)` → linha; repetida → nova rolagem (o serviço repete até 20 vezes).
- **Serviço** `alignment-service`: `setAlignment` (drop; troca pergunta), `rollAlignmentCheck(actor, { recover })`
  (diálogo: bônus, modo de rolagem; bônus de efeitos em `system.modifiers.alignmentCheck`), `applyDegeneration(actor,
  point)`, `cureDegeneration(actor, point)`. Estado: `system.alignment = { changes: 0–1, degenerations: [{ point, name,
  row, effectIds, itemIds, derangement }] }`; `outOfPlay` derivado de Devotion 0.
- **Devotion por XP**: nenhuma (decisão do usuário).

## R6. Efeitos da Degeneration

- **Decision**: característica −1 → Active Effect `system.characteristics.<c>.value` ADD −1 (flag
  `dtd40k.degeneration`); **bloqueio de XP**: `canAdvance` recebe `blocked` (características com Degeneration ativa) →
  `degenerated`, com override do Mestre. Night Terrors → hindrance do pack de feats, sem XP (flag de origem;
  já tendo → rolar de novo). Derangement menor → entrada na lista da 008 com o nome da Degeneration. Social −2k0 →
  Active Effect com `system.modifiers.rolls.skills.<s>.rolled` −2 nas perícias do grupo social. Curar remove os efeitos,
  o item e o derangement criados.
