# Research — 006-classes-xp

Data: 2026-09-26. Fontes: código da `main` com a 005 (feats, concessões, modificadores, `DtdItem`, ficha e
modos), Foundry **13.351**, e o inventário do cap. 6 da 7.7a extraído do PDF (103 classes e regras de XP; scratchpad
`ch6-classes.json` / `ch6-xp-rules.md`).

## R1. Tipo de item `class`

- **Decision**: `ClassData` com `level` (1–5), `track`, `source`, `description`, `prerequisites`
  (`skills: [{ keys[], value }]` — `keys` com mais de uma chave = "Weaponry or Ballistics"; `feats: [nome]`;
  `schools: [{ name, value }]`; `text`), `characteristics` (chaves) + `anyCharacteristic`, `skills` (chaves),
  `feats: [{ name, subcategory, mandatory, orGroup }]`, `magicSchools`, `swordSchools`, `gunKata` (strings),
  `completion` (`text`, `automation`, `value`, `skillGroup`, `grants`) e o estado no personagem: `status`
  (`current` | `completed`), `startedAt` (ordem) e `completion.selection` (escolha do bônus).
- **Rationale**: dados do livro no item, como raça/exaltação; o estado mora na cópia embutida (002/004).
- **Alternatives considered**: guardar classes como lista no ator (rejeitado: o compêndio precisa de itens
  arrastáveis e o bônus precisa de efeitos no item).

## R2. Level derivado das classes

- **Fato verificado (v13)**: no `prepareDerivedData` do TypeDataModel do ator, `this.parent.items` já está
  preparado (`prepareEmbeddedDocuments` roda antes — 004 R2).
- **Decision**: no início de `CharacterData.prepareDerivedData`, se o ator tem itens `class`,
  `this.level = max(level)`; senão fica o valor guardado (editável). Tudo que usa Level (Resilience, exaltação,
  Power Stat) já roda depois e usa o valor calculado. Na ficha, o input de Level só aparece sem classes.
- **Alternatives considered**: Active Effect OVERRIDE no Level por classe (rejeitado: vários efeitos
  concorrendo; o máximo é uma conta, não um modificador).

## R3. Progresso e conclusão (puros)

- **Decision**: `classProgress(classSystem, ownedFeats)` → `{ entries: [{ name, subcategory, mandatory, orGroup,
  owned, blocked }], required: n, done: n, complete }`. Um feat da lista está "tido" quando existe feat do ator
  com o mesmo nome base (sem diferenciar maiúsculas) e, se a lista fixa a subcategoria (≠ "Any"/vazio), com a
  mesma subcategoria. Grupo `orGroup`: cumprido quando qualquer alternativa é tida; as outras ficam `blocked`
  (p. 106). Grupos com todas as alternativas opcionais não contam.
- **Sincronização**: `syncClassCompletion(actor)` roda no `DtdItem#_onCreate` de feats (cliente do autor,
  como as concessões da 005) e depois de compras; quando a classe atual fica completa, marca `completed` e
  aplica o bônus. A conclusão é permanente (o Mestre desfaz pela ficha — FR-011).

## R4. Bônus de conclusão

- **Decision**: `completion.automation` ∈ `none`, `hpMax`, `initiative`, `resolveMax`, `staticDefense`,
  `specialty`, `skillDot`, com `value` e `skillGroup` (`any`|`social`); concessões em `completion.grants`
  (mesmo formato da 005). `buildCompletionEffects(completion)` (puro) gera os Active Effects nos
  modificadores da 005 (`hpMax`, `initiative`, `resolveMax`, `staticDefense`), em especialidade (ADD em
  `system.skills.<k>.specialties`, 005 R5) ou em perícia (ADD 1). Os efeitos são criados no item da classe
  **ao concluir** (desligáveis pelo Mestre) e somem com a classe ou ao desfazer a conclusão.
- **Concessões**: `grantFeats` da 005 passa a ler, para `class`, `completion.grants` só quando
  `status === "completed"`; a conclusão chama `grantFeats(actor, classItem)` e desfazer chama
  `releaseGrants`. A trilha Druid (mesmos feats em 5 classes) fica com uma cópia por feat e várias origens.
- **Bard (+1 perícia com valor < Level)**: a escolha filtra as perícias pelo valor final antes do bônus.

## R5. Custos e elegibilidade (puros)

- **Decision** (`module/rules/xp.mjs`):
  - `advanceCost(kind, from)`: characteristic 200; skill 100 se `from = 0`, senão 50; feat 100; asset 100;
    powerStat 300 (pp. 15–16).
  - `canAdvance({ kind, key, classes, race, feat })` → `{ allowed, multiplier, reason }`:
    - com classe atual: característica/perícia só se estiverem na lista dela (`anyCharacteristic` = todas);
      feat só se estiver na lista, não tido e não bloqueado por "A ou B";
    - Free Study (todas as classes concluídas): listas das classes concluídas a custo normal; características
      e perícias fora delas a custo × 2; feats opcionais das concluídas; demais feats recusados;
    - feat racial da própria raça: sempre permitido (p. 179); Power Stat: sempre (teto Level, 004);
    - sem classe: recusado ("escolha uma classe"), com override do Mestre.
  - `xpTotals({ starting, log, hindranceXp })` → `{ total, spent, available }`.
- Recusa sempre pode ser liberada pelo Mestre (constituição IV); liberação do Mestre não cobra.

## R6. XP no ator

- **Decision**: `CharacterData.xp = { starting: 600, log: [...] }`; cada entrada `{ id, type: purchase|award,
  kind, key, label, from, to, cost, itemId, reason, user, date }`. `total/spent/available` derivados
  (`system.xp.totals`), com o XP dos hindrances somado dos itens `feat` de categoria `hindrance`.
- **Desfazer** (`undoEntry`): característica/perícia/Power Stat voltam de `to` para `from` no `_source` só se o
  valor atual ainda é `to` (senão o Mestre confirma devolver só o XP); feat/asset apagam o item (`itemId`),
  o que também libera concessões (005). Dono desfaz a última; Mestre, qualquer uma.
- **Alternatives considered**: histórico em itens próprios (rejeitado: poluiria o inventário e o drop).

## R7. Modo de avanço na ficha

- **Decision**: terceiro modo da ficha, `advance`, ao lado de `edit` e `play` (flag de usuário, como hoje).
  Mostra, ao lado de cada característica e perícia, o custo do próximo ponto e um botão `+` quando
  `canAdvance` permite (ou o motivo em tooltip); no cartão da exaltação, `+` no Power Stat. Os pontos não
  são clicáveis nesse modo. Edição livre continua no modo `edit`, sem cobrança (FR-017).
- **Painel de classe** (aba nova `class` ou seção na aba Traits): classe atual com progresso, botões
  "comprar" nos feats que faltam (busca no pack `feats`, já com a subcategoria da lista), classes
  concluídas com o bônus e o XP (totais, histórico com desfazer, "conceder XP" para o Mestre).

## R8. Cobrança de feats e assets arrastados

- **Decision**: `feat-service.addFeat` (005) chama `chargeForFeat(actor, feat, selection)` depois das
  validações: asset → 100; feat/racialFeat → `canAdvance` (permitido → 100 com confirmação e checagem de
  saldo; recusado → aviso e override do Mestre sem cobrança); hindrance → nada. Concessões nunca passam
  por aqui. A entrada do histórico guarda o `itemId` para desfazer.

## R9. Compêndio `classes`

- **Decision**: `src/packs/classes/` plano com 19 pastas (18 trilhas + "Other") e 103 JSON gerados a partir do
  inventário por script (`scripts/build-classes-source.mjs`, one-shot, no scratchpad), mapeando nomes do livro
  para chaves (`CHARACTERISTICS`, `SKILLS`; "Tech-Use" → `techUse`, typos normalizados) e feats para o nome
  canônico do pack `feats` (comparação sem maiúsculas). As **descrições** (1–3 frases, redação própria) são
  escritas por agentes a partir do livro, com checagem de n-gramas. IDs com `scripts/assign-feat-ids.mjs`
  generalizado (`--pack classes`).
- `packs.test.mjs`: contagem por Level e pasta, trilhas, Swordsman/Initiate/Fighter campo a campo, todo feat da
  lista existe no pack `feats`, toda chave de característica/perícia é válida, automações do bônus.
