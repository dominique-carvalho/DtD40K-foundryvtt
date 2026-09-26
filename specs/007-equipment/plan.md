# Implementation Plan: Equipamento, aquisição e artefatos (DtD 7.7a)

**Branch**: `007-equipment` | **Date**: 2026-09-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/007-equipment/spec.md`

## Summary

Adicionar os tipos de Item `weapon`, `armor` e `gear` (com categorias), fichas próprias e o compêndio `equipment`
(170 itens em pastas, gerado do inventário do cap. XIII/XIV com descrições em redação própria). No personagem:
aba Equipamento com inventário, equipar/vestir/instalar; efeitos dos itens como Active Effects suprimidos quando o
item não está equipado (`DtdActiveEffect#isSuppressed`); AP por localização, penalidade de Static Defense por
proficiência e Max Dex calculados por regras puras; ataque (perícia k perícia + Level) e dano (XkY + Str,
qualidades, material) com diálogo e cartões no chat; aquisição (Wealth k Wealth contra o TN da raridade, Liquid
Wealth, Wealth Strain) e vagas do equipamento inicial; drogas com doses e vício; materiais mágicos, rating de
artefato e encaixe de hearthstone.

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc

**Primary Dependencies**: Foundry VTT v13 (TypeDataModel, ActiveEffect `isSuppressed`, ItemSheetV2,
ActorSheetV2 `TABS`, DialogV2, `renderChatMessageHTML`); Vitest, ESLint, `@foundryvtt/foundryvtt-cli`

**Storage**: Itens embutidos no ator (estado `equipped`, `quantity`, `socketedIn`); `system.wealth`,
`system.creation`, `system.addictions` no ator; pack `packs/equipment` de `src/packs/equipment`

**Testing**: Vitest (`rules/equipment.mjs`, `rules/weapon.mjs`, `rules/acquisition.mjs`, `rules/dice.mjs`,
config, packs); roteiro manual em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: equipar e ver AP/Static Defense atualizados em < 1 s; ficha com ~60 itens abre em < 1 s

**Constraints**: regras puras sem Foundry; efeitos de item só por Active Effects (desligáveis pelo Mestre);
reações de documento só no cliente do autor; nenhuma descrição copiada do livro

**Scale/Scope**: 3 tipos de item, 170 entradas + ~30 pastas, 3 módulos puros novos e 1 estendido, 3 serviços, 1 aba
nova, 2 diálogos, 2 cartões de chat; ~40 arquivos

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | Páginas da 7.7a (pp. 314–356, 431–435, 16, 180, 197); contradições (mira +2k1/+2k0, Exotic, gyrspike) como premissas; raridades desalinhadas conferidas no PDF | ✅ |
| II. Nativo v13 | TypeDataModel; derivados em `prepareDerivedData`; efeitos com `isSuppressed`; ApplicationV2/DialogV2; hook v13 do chat | ✅ |
| III. Pura e testada | `equipment.mjs`, `weapon.mjs`, `acquisition.mjs` e `dice.mjs` com os casos do contrato | ✅ |
| IV. Automação pragmática | Efeitos desligáveis; recusas com override (mechadendrites, Wealth 0, vagas iniciais); dano no alvo fica para o combate | ✅ |
| V. Conteúdo como dados | JSON em `src/packs`; descrições próprias com checagem de 6-gramas; inventário conferido no PDF | ✅ |
| VI. Incremental | Fase 1 (equipamento base); criação de armas, veículos e backgrounds fora de escopo | ✅ |
| Restrições | ESM + JSDoc, CSS puro, i18n pt-BR/en | ✅ |

**Re-check pós-design**: mantém todos. Toca 001 (dados: `rerollBelow`; rolagens somam `modifiers.rolls`), 005
(Squat Armor Proficiency ganha automação; concessões de hearthstone) e `computeDerived` (penalidade de armadura e
Max Dex) de forma aditiva.

## Project Structure

```text
specs/007-equipment/ (plan, research, data-model, quickstart, contracts/, checklists/, tasks)
system.json · dtd40k.mjs
src/packs/equipment/                        # pastas + 170 JSON
scripts/assign-pack-ids.mjs                 # layout `equipment`
module/config.mjs                           # RARITIES, CRAFTSMANSHIP, WEAPON_TYPES, WEAPON_QUALITIES, ARMOR_TYPES,
                                            # GEAR_CATEGORIES, MATERIALS, ADDICTIVITY, HIT_LOCATIONS, STARTING_SLOTS
module/rules/equipment.mjs, weapon.mjs, acquisition.mjs   # NOVOS, PUROS
module/rules/dice.mjs, derived.mjs, pool.mjs              # rerollBelow; armadura/Max Dex; modificadores de rolagem
module/data/weapon-data.mjs, armor-data.mjs, gear-data.mjs, equipment-fields.mjs   # NOVOS
module/data/character-data.mjs              # wealth, creation, addictions, armor derivado, modifiers.rolls
module/documents/active-effect.mjs          # NOVO: DtdActiveEffect#isSuppressed
module/documents/equipment-service.mjs, attack-service.mjs, acquisition-service.mjs   # NOVOS
module/documents/actor.mjs                  # rolagens somam modifiers.rolls
module/apps/equipment-sheet.mjs, equipment-context.mjs, attack-dialog.mjs            # NOVOS
module/apps/character-sheet.mjs             # aba equipment, drop, ações
templates/item/equipment-sheet.hbs (um template para os três tipos), templates/actor/parts/equipment.hbs
templates/dialog/{attack-dialog,acquire-dialog}.hbs, templates/chat/{attack-card,damage-card,acquire-card}.hbs
styles/dtd40k.css · lang/*.json
tests/unit/equipment.test.mjs, weapon.test.mjs, acquisition.test.mjs, dice.test.mjs, derived.test.mjs,
  config.test.mjs, packs.test.mjs
```

## Complexity Tracking

| Escolha | Por quê | Alternativa rejeitada porque |
|---|---|---|
| `DtdActiveEffect#isSuppressed` (R2) | Efeitos seguem o estado equipado sem criar/apagar documentos | Criar/apagar ao equipar duplica efeitos e corre entre clientes |
| Três tipos de item (R1) | Arma e armadura têm perfis que as regras leem; o resto varia por categoria | Oito tipos com fichas quase iguais |
| Dano por botão no cartão (R7) | A mesa rola o dano depois de ver o acerto e as defesas | Rolar junto desperdiça dano em ataques defendidos |
| `modifiers.rolls` (R8) | Um ponto para vício, Medkit e hearthstones em toda rolagem | Cada serviço de rolagem somaria por conta própria |
