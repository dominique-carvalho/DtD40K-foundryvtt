# Research — 002-race-compendium

Data: 2026-09-25. Fontes: código-fonte do Foundry **13.351** instalado
(`resources/app/client` e `resources/app/common`), pacote `@foundryvtt/foundryvtt-cli` 3.0.4
(npm) e livro 1.6 pp. 27–51, depois revisado para a **DtD 7.7a** pp. 30–63 (constituição v1.2.0;
texto extraído com `pdftotext` e conferido com a §5 de
`docs/analise-dtd.md`).

## R1. Onde os bônus raciais vivem — Active Effects na raça embutida

- **Fato verificado (v13)**: `CONFIG.ActiveEffect.legacyTransferral = false`
  (`client/config.mjs`). `Actor#allApplicableEffects()` inclui os efeitos com `transfer: true`
  dos itens embutidos; `Actor#prepareEmbeddedDocuments()` chama `applyActiveEffects()`, que roda
  **depois** de `prepareBaseData` e **antes** de `prepareDerivedData`.
- **Decision**: cada modificador racial é um `ActiveEffect` com `transfer: true` **dentro do item
  `race` embutido no personagem**. Um efeito por modificador (Size, característica, cada perícia,
  poder automatizado), para o Mestre poder desativar cada um isoladamente (FR-010). Os efeitos
  são **gerados na aplicação** a partir da escolha (função pura `buildRaceEffects`), não ficam
  no compêndio.
- **Rationale**: apagar o item remove todos os efeitos de uma vez (FR-011/FR-012, SC-003);
  refazer a escolha só troca os efeitos do item (FR-013); os derivados já leem os valores com
  efeitos aplicados porque rodam em `prepareDerivedData` (FR-014); atende à constituição II
  (modificadores persistentes via Active Effects).
- **Alternatives considered**:
  1. Efeitos direto no ator — rejeitado: exige rastrear e apagar os efeitos à mão na troca.
  2. Somar os bônus no `_source` do personagem — rejeitado: viola a constituição II e perde
     o valor distribuído pelo jogador (FR-014).
  3. Efeitos já prontos no compêndio — rejeitado: a característica e as perícias dependem da
     escolha do jogador.

## R2. Modos dos efeitos e limite de 6

- **Fato verificado (v13)**: `ActiveEffect#apply` usa `DataField#applyChange`; o
  `_applyChangeAdd` do `NumberField` é `value + delta` **sem** aplicar `min`/`max` do schema
  (`common/data/fields.mjs`). Prioridade padrão = `mode × 10` (ADD 20 antes de OVERRIDE 50).
- **Decision**:
  - Size: `OVERRIDE` em `system.size` com o Size da raça (clarificação 1: o `_source.size`
    continua sendo o Size base e volta a valer ao remover/desativar).
  - Característica e perícias: `ADD +1` em `system.characteristics.<k>.value` e
    `system.skills.<k>.value`.
  - O limite de 6 (FR-015) é aplicado em `CharacterData.prepareDerivedData` **antes** de
    calcular os derivados; o modelo registra quais valores foram limitados (`system.capped`)
    para a ficha avisar.
- **Rationale**: o core não limita; limitar no início do `prepareDerivedData` garante que os
  derivados usem o valor final já limitado.

## R3. Formulário da ficha x campos alterados por efeitos

- **Fato verificado (v13)**: `DocumentSheetV2`/`ActorSheetV2` **não** desabilitam nem
  filtram campos alterados por efeitos (não há uso de `actor.overrides` em
  `client/applications/sheets/`). Com `submitOnChange`, um `<input name="system.size">`
  mostrando o valor com efeito gravaria esse valor no `_source` (Size base perdido,
  Hero Points máximo somado duas vezes).
- **Decision**:
  - Inputs de campos que podem receber efeito (`system.size`, `system.heroPoints.max`) passam a
    exibir o valor de `actor._source` (valor base) no modo edição, com o valor final ao lado.
  - Pontos de característica/perícia (ação `setDots`) passam a ler o valor base do `_source`
    em vez de `getProperty(document, path)`; o bônus racial é `final − base` (FR-014).
  - Os modificadores de poderes (Shifty, Squat Toughness) usam campos novos
    `system.modifiers.*` que **nunca** aparecem como input na ficha.
- **Alternatives considered**: tornar os campos somente leitura quando houver efeito —
  rejeitado: o jogador precisa ajustar o Size base e o Hero Points máximo base.

## R4. Poderes automatizados

- **Decision** (efeitos gerados por `buildRaceEffects`, conforme `power.automation`):
  - `heroicHeritage` (Human, 7.7a p. 47): `ADD +1` em `system.heroPoints.max`. Na aplicação, o
    serviço também soma 1 ao `system.heroPoints.value` (`_source`). Na remoção, o atual é
    limitado ao novo máximo.
  - `shifty` (Halfling, 7.7a p. 45): `OVERRIDE` em `system.modifiers.staticDefenseFormula =
    "shifty"`; `computeDerived` passa a usar `10 + 6×Dex − 2×Size`.
  - `squatToughness` (Squat, 7.7a p. 55): `ADD +1` em `system.modifiers.resilience`;
    `computeDerived` soma esse valor à Resilience base **antes** do bônus/override do Mestre,
    que continua vencendo (FR-019).
  - `usesPerScene` (na 7.7a só o Eldarin): nenhum efeito; contador no item.
  - `none`: só texto.
- **Rationale**: o bônus/override do Mestre em `derivedMods` segue intocado e sempre aplicado
  por último.

## R5. Contador de usos por cena

- **Decision**: o item guarda `system.power.uses.spent` (usos gastos, ≥ 0). O máximo é
  calculado por `usesPerScene(level)` = 1 (Level ≤ 2), 2 (3–4), 3 (≥ 5); restantes =
  `max(0, max − spent)`. "Nova cena" zera `spent`.
- **Rationale**: guardar os gastos, e não os restantes, faz o máximo acompanhar o Level sem
  migração de dados; o pico de 3 usos cobre Level 6+ (edge case da spec).

## R6. Drop da raça e unicidade

- **Fato verificado (v13)**: `ActorSheetV2#_onDropItem(event, item)` retorna `null` se o usuário
  não é dono e, caso contrário, cria o item com `Item.implementation.create(item.toObject(),
  {parent})` (`client/applications/sheets/actor-sheet.mjs`).
- **Decision**: `CharacterSheet#_onDropItem` desvia itens `type === "race"` para o serviço
  `applyRace(actor, raceItem)`: pergunta a escolha (DialogV2; pulada se não houver o que
  escolher), apaga os itens `race` existentes, cria a nova raça com `system.choice` e os
  efeitos gerados. Cancelar não altera nada. Um `DtdItem#_preCreate` recusa (retorna `false`)
  uma segunda raça criada fora do serviço, como rede de segurança. Arrastar a raça **dentro da
  própria ficha** (`item.parent?.uuid === actor.uuid`) segue o core (só reordena) e não chama o
  serviço. Os dados da nova raça são validados **antes** de apagar a atual; uma falha de rede
  entre apagar e criar deixa o personagem sem raça (risco aceito: o Foundry não tem transação;
  basta arrastar de novo).
- **Permissões** (clarificação 2): qualquer dono do personagem; o próprio core já recusa o drop
  de não-donos.

## R7. Abas na ficha do personagem (ApplicationV2)

- **Fato verificado (v13)**: `ApplicationV2` tem `static TABS`, `tabGroups`, `_prepareTabs(group)`
  e `changeTab(tab, group)` (`client/applications/api/application.mjs`); a partial de navegação
  do core é `templates/generic/tab-navigation.hbs`.
- **Decision**: `CharacterSheet.TABS = { primary: { tabs: [main, traits], initial: "main" } }`.
  Os parts `characteristics` e `skills` passam a ser a aba `main` (um part `main` que inclui as
  duas partials existentes); novo part `traits`. Cabeçalho e rodapé ficam fora das abas. A aba
  ativa é lembrada na flag de usuário `sheetTabs[actorId]`, igual ao modo (FR-015a).

## R8. Compêndio — fonte, build e distribuição

- **Fato verificado**: `@foundryvtt/foundryvtt-cli` 3.0.4 expõe `compilePack(src, dest,
  {yaml, recursive, log})` e `extractPack`; o v13 usa LevelDB (`classic-level`). O manifesto
  aceita `packs[]` com `name`, `label`, `path`, `type`, `system`, `ownership`.
- **Decision**:
  - Fonte: `src/packs/races/*.json`, um arquivo por raça, com `_id` fixo de 16 caracteres e
    `_key: "!items!<_id>"` (formato exigido pelo CLI).
  - Build: `npm run build:packs` → `scripts/build-packs.mjs` chama `compilePack` para
    `packs/races`. O Foundry precisa estar fechado (lock do LevelDB).
  - `packs/` passa para o `.gitignore` (saída de build, binária); a instalação local roda o build
    antes de abrir o Foundry. O zip de release deverá incluir `packs/` (fica para a feature de
    empacotamento/release).
  - Manifesto: pack `races`, tipo `Item`, `ownership: { PLAYER: "OBSERVER", ASSISTANT: "OWNER" }`
    (jogadores consultam; o compêndio fica bloqueado por padrão).
- **Alternatives considered**: YAML como fonte — rejeitado para ficar alinhado ao "JSON" da
  constituição V e evitar outra dependência; versionar `packs/` — rejeitado (diffs binários).

## R9. Conteúdo das raças

- **Decision**: dados mecânicos exatos da Tabela de referência da spec; nomes de perícias
  normalizados para as chaves do sistema (`ballistics`, `intimidation`, `commonLore`);
  descrições da raça e do poder escritas do zero em inglês (2–4 frases), com `source.page`.
  Ambientação (altura, peso, idiomas, traços, nomes) entra como listas curtas.
- **Validação automática**: `tests/unit/packs.test.mjs` lê os 12 JSON e compara com uma tabela
  esperada no teste (SC-001), verifica `_id`/`_key` únicos e chaves de característica/perícia
  válidas. A verificação de "sem cópia do livro" (SC-005) é manual (quickstart).
- **Observação registrada**: Gnome (7.7a p. 43) e Halfling (7.7a p. 45) têm o mesmo bônus Int/Fel no
  livro; mantido.
- **Imagens**: ícones do core (`icons/svg/*.svg`); arte própria fora de escopo.
