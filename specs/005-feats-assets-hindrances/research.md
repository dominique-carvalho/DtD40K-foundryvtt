# Research — 005-feats-assets-hindrances

Data: 2026-09-26. Fontes: código da `main` com a 004 (`FeatData`, `asset.mjs`, `asset-service.mjs`,
`exaltation-service.mjs`, `race-service.mjs`, `derived.mjs`, ficha), Foundry **13.351** instalado
(`resources/app/common`, `resources/app/client`) e o inventário do cap. 7 da 7.7a extraído do PDF
(274 entradas + 14 concessões; scratchpad `ch7-inventory.json` / `ch7-grants.json`, gerado por
`build-ch7.js`).

## R1. Estender `FeatData` sem migrar a 004

- **Decision**: o tipo `feat` ganha categorias `feat`, `racialFeat`, `asset`, `hindrance` (além de
  `exaltedAsset`). Campos existentes mantidos com o mesmo significado: `group` continua sendo o **grupo
  de Exalted Asset** (só `exaltedAsset`), `prerequisites.race` passa a valer também para feats raciais,
  `xpCost` = custo (feat/asset 100; hindrance 0), `automation` ganha valores novos. Campos novos:
  `featGroup` (feat de grupo: `enabled`, `options[]`), `repeatable`,
  `requires[]` (dependências), `xpGranted` (hindrance 100), `grants[]` (concessões) e `selection`
  (subcategoria e escolhas de automação, preenchidas no personagem).
- **Rationale**: nenhum dado da 004 muda de sentido; os 75 JSON do `exalted-assets` só ganham os campos
  novos com valores padrão (o TypeDataModel preenche ao carregar; os JSON são atualizados para os testes
  e para os 3 assets que concedem feats).
- **Alternatives considered**: renomear `group` para `assetGroup` (rejeitado: quebra dados da 004 e
  exige migração); tipos de Item separados por categoria (rejeitado: constituição VI, duplicação).

## R2. Nome completo, repetição e duplicatas

- **Decision**: `fullName(feat)` puro = `name` ou `name (subcategoria)`. Um feat está "presente" quando
  há outro item `feat` com a mesma categoria e o mesmo `fullName`. Não repetível e presente → erro
  `notRepeatable`; repetível ou de grupo com o mesmo `fullName` → `duplicate`. O nome do item embutido
  no personagem é gravado já com a subcategoria (a ficha, o chat e os links mostram "Peer (Nobility)").
- **Rationale**: é a regra do livro (p. 174: cada escolha do grupo é uma "especialidade" diferente;
  p. 106: a maioria só uma vez), e comparar pelo nome completo funciona também com texto livre.

## R3. Validação (pura) e avisos

- **Decision**: `validateFeatAdd({ feat, selection, owned, race })` → `{ errors[], warnings[] }`.
  - Erros (recusa, Mestre pode confirmar mesmo assim — constituição IV): `notRepeatable`, `duplicate`,
    `wrongRace` (feat racial de outra raça), `noRace` (feat racial sem raça), `hindranceLimit` (já há 2
    hindrances, p. 179), `noSubcategory` (grupo sem escolha).
  - Avisos (pedem confirmação, sem erro): `missingDependency` (lista de `requires` ausentes: feat pelo
    nome, ou poder racial pelo nome — Elven Accuracy, Warp Step).
  - Informativos (sem confirmação): `creationOnly` para asset e hindrance (FR-009); `extraHindrances`
    para Sturdy (2) e Veteran o' the Wheel (1, Mestre define).
- Exalted Assets continuam validados por `validateAssetAdd` da 004 (limite de um exceto Paragon).

## R4. Automação — alvos dos efeitos

- **Fatos verificados (v13)**: `ArrayField#_applyChangeAdd` faz `value.push(...delta)` e
  `_castChangeDelta` aceita JSON ou texto simples (`common/data/fields.mjs` L2002–2017), então um efeito
  ADD em `system.skills.<k>.specialties` **acrescenta** a especialidade. Prioridade padrão = modo × 10;
  o Size racial é OVERRIDE (50).
- **Decision** (`buildFeatEffects(system, selection)`, puro; um efeito por modificador, desligável):

  | automation | Change |
  |---|---|
  | `soundConstitution` | `system.modifiers.hpMax` ADD 1 |
  | `discipline` | `system.modifiers.resolveMax` ADD 1 |
  | `paranoia` | `system.modifiers.initiative` ADD 2 |
  | `farsighted` | `system.modifiers.resolveMax` ADD 3 · `system.modifiers.mentalDefense` ADD 5 |
  | `halflingAgility` | `system.modifiers.staticDefense` ADD 4 |
  | `noOneTougher` | `system.modifiers.staticDefenseCharacteristic` OVERRIDE `con` |
  | `madeOfMettle` | `system.characteristics.<sel>.value` ADD 1 |
  | `beneficialMutation` | `…<sel>.value` ADD 2 · `…<sel2>.value` ADD −1 |
  | `matron` | str ADD 1 · dex ADD −1 · fel ADD −1 · `system.size` ADD 2 **priority 60** |
  | `sturdy` | `system.modifiers.resilience` ADD 1 |
  | `sand` | `system.modifiers.fatigueMax` ADD 2 |
  | `nineLives` | `system.heroPoints.max` ADD 1 (serviço: atual +1 ao adicionar) |
  | `veteran` | `…characteristics.<sel>.value` ADD 1 · `…skills.<skill>.value` ADD 1 |
  | `skillFocus` | `system.skills.<skill>.specialties` ADD `<texto>` |
  | `noisyCricket` | `system.skills.acrobatics.specialties` ADD `Jumping` |

  Os valores de Exalted Assets (`actionHero` etc.) continuam em `buildAssetEffects` da 004;
  `buildFeatEffects` delega para ele.
- **Novos modificadores do ator** (nunca inputs da ficha, 002 R3): `resolveMax`, `mentalDefense`,
  `staticDefense`, `fatigueMax`, `initiative` (inteiros, 0) e `staticDefenseCharacteristic`
  (`dex`|`con`, padrão `dex`). `computeDerived` soma/usa esses valores **antes** do bônus/override do
  Mestre. Iniciativa: a fórmula do combate passa a `1d10 + @characteristics.dex.value +
  @characteristics.cmp.value + @modifiers.initiative` e a ficha mostra o mesmo bônus.
- **Menor característica** (Made of Mettle, Beneficial Mutation): `lowestCharacteristics(characteristics)`
  puro devolve as empatadas na menor, pelos valores finais no momento da adição; uma só → sem diálogo.

## R5. Especialidades vindas de efeitos

- **Problema**: a ficha remove especialidades por índice sobre `getProperty(document, path)` (valor com
  efeitos) e grava de volta — gravaria a especialidade do feat no `_source`.
- **Decision**: a ficha passa a ler a lista **base** do `_source` para adicionar/remover e marca as
  extras (final − base) como "do feat", sem botão de remover (mesmo princípio da 002 R3). Remover o feat
  remove o efeito e, com ele, a especialidade.

## R6. Concessões de feats — dados

- **Decision**: campo `grants[]` = `{ name, subcategory, choose }` em **três** tipos:
  - `RaceData.grants` (Aasimar: Jaded, Fearless; Gnome: 7 Weapon Proficiency + 5 Armor Proficiency);
  - `ExaltationData.grants` com `rank` (Atlantean: Speak Language (Syrneth), rank 1; Promethean: 5 Armor
    Proficiency, rank 1 — Integrated Armor);
  - `FeatData.grants` (You Will Not Falter, Tuning, Ventrue, Academy, Kenjutsu, K'sten'mannav,
    Lightning Bug).
  `choose: true` = subcategoria pedida ao jogador (Tuning "(Any)", Academy). Os JSON de Aasimar, Gnome,
  Atlantean, Promethean e dos 3 Exalted Assets são atualizados (fonte das features 002/004).
- **Rationale**: dados no conteúdo, não em código; o Mestre pode editar concessões em raças/exaltações
  próprias.

## R7. Concessões — ciclo de vida central no `DtdItem`

- **Fato verificado (v13)**: `ClientDocument#_onCreate(data, options, userId)` e `_onDelete(options,
  userId)` rodam em **todos** os clientes; filtrar `userId === game.user.id` executa a reação uma vez, no
  cliente que fez a operação.
- **Decision**:
  - O item concedido guarda `flags.dtd40k.grantedBy = [<id do item de origem>, …]` (lista: duas origens
    podem conceder o mesmo feat, ex.: Gnome e Promethean) e `flags.dtd40k.purchased = true` quando o
    jogador também o comprou.
  - `DtdItem#_onCreate` (no cliente do autor): se o item embutido tem `grants` (raça, exaltação com
    `rank ≤ Power Stat`, feat/asset), chama `grantFeats(actor, origin)`.
  - `DtdItem#_onDelete` (no cliente do autor): `releaseGrants(actor, originId)` tira o id de
    `grantedBy` de cada item; apaga os que ficam sem origem e sem `purchased`. Cadeias (Perfection →
    asset → feats) se resolvem porque apagar o asset dispara o `_onDelete` dele.
  - Comprar um feat já concedido marca `purchased` em vez de duplicar (US4-9); conceder um feat já
    comprado só acrescenta a origem.
  - A flag `grantedBy: "perfection"` da 004 continua válida para o asset racial (string).
- `grantFeats` resolve os nomes no pack `dtd40k.feats` pelo índice e busca os documentos com
  `pack.getDocuments({ _id__in })` (operador documentado em
  `client/documents/collections/compendium-collection.mjs` L403). Nome ausente no pack → aviso e segue.
- **Alternatives considered**: chamar a concessão em cada serviço (race/exaltation/asset/feat —
  rejeitado: cinco pontos de entrada e perde exclusões feitas pelo menu de contexto do core).

## R8. Diálogo de escolha do feat

- **Decision**: um único `templates/dialog/feat-choice.hbs` montado conforme o que o feat pede:
  subcategoria (lista do livro + texto livre, obrigatória), característica (as empatadas na menor ou
  todas), segunda característica (Beneficial Mutation, diferente da primeira), perícia (27) e texto da
  especialidade. Validação pura `validateFeatSelection`. Cancelar não altera nada. A mesma janela serve
  às concessões `choose` (Academy pede duas vezes, com as já escolhidas excluídas).

## R9. Compêndio `feats`

- **Decision**: `src/packs/feats/` plano (build sem `recursive`, 004 R9): pastas `folder-feats.json`,
  `folder-racial-feats.json`, 16 `folder-racial-<race>.json` (com `folder` = id de "Racial Feats"),
  `folder-assets.json`, `folder-hindrances.json` + 274 JSON (`feat-<slug>`, `racial-<race>-<slug>`,
  `asset-<slug>`, `hindrance-<slug>`). Manifesto: pack `feats` ("Feats"), mesmo `ownership`.
- `packs.test.mjs` valida contagens, pastas, categoria, raça, página, grupo/opções, repetível, XP,
  automação e concessões contra tabelas no teste (SC-001).
- Conteúdo redigido por agentes a partir do PDF com checagem de n-gramas ≥ 6 palavras (SC-005), como na
  004. Depois de cada build, conferir o pack compilado (memória: validar o artefato, não só a fonte).

## R10. Ficha

- **Decision**: aba Traits ganha a partial `feats.hbs` com três seções (Feats — inclusive raciais —,
  Assets, Hindrances), cada entrada com nome completo, badge de origem ("concedido por Aasimar"), aviso
  de raça incompatível, resumo e modificadores com caixa do Mestre; remover só para itens comprados (ou
  para o Mestre). Contexto em `module/apps/feats-context.mjs`. Drop: `feat` com categoria diferente de
  `exaltedAsset` vai para `addFeat`; `exaltedAsset` continua em `addExaltedAsset`.
