# Contract: integração Foundry (023)

## App `CharacterBuilder` (`module/apps/character-builder.mjs`)

- `HandlebarsApplicationMixin(ApplicationV2)`, `id: "dtd40k-character-builder"`, `classes: ["dtd40k", "character-builder"]`,
  `position: { width: 960, height: 760 }`, redimensionável.
- PARTS: `steps` (lista lateral), `step` (template do passo atual), `summary`, `footer`.
- Ações: `goto(step)`, `back`, `next` (valida; bloqueia com motivos), `release` (Mestre), `finish`, `pick` (seleção em
  listas), campos com `change` gravando no rascunho.
- Abre com rascunho: diálogo "Continuar" / "Recomeçar".

## `builder-service` (`module/documents/builder-service.mjs`)

- `loadDraft()`, `saveDraft(draft)`, `clearDraft()` (flag `dtd40k.builderDraft`).
- `createActor({ name, img, ownerId })`: direto com `ACTOR_CREATE`; senão `game.users.activeGM.query("dtd40k.createCharacter", …)`.
- `applyPlan(actor, plan)`: executa as etapas em ordem; para no primeiro erro, avisa a etapa e devolve `{ ok, failed }`.
- `finish(draft)`: valida tudo, cria, aplica, apaga o rascunho, abre a ficha.

## Serviços (opções novas, padrão = comportamento atual)

| Serviço | Opção |
|---|---|
| `applyRace(actor, race, { choice })` | usa a escolha; sem diálogo |
| `applyExaltation(actor, item, { selection, replace })` | sem diálogos |
| `startClass(actor, item, { silent })` | sem confirmação de avisos |
| `addFeat(actor, feat, { selection, silent })` / `priceFeat(…, { silent })` | sem diálogos de seleção/custo |
| `addExaltedAsset(actor, asset, { silent })` / `priceExaltedAsset(…, { silent })` | sem confirmação |
| `raiseBackground(actor, key, { silent })` | sem confirmação do custo |
| `advance(actor, kind, key, { silent })` | sem diálogos |

## `dtd40k.mjs`

- `Hooks.on("renderActorDirectory")`: botão "Novo personagem" em `.header-actions`.
- `CONFIG.queries["dtd40k.createCharacter"] = ({ name, img, userId }) => …` (só o Mestre ativo atende; devolve UUID).
