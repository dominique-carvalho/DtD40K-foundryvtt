# Implementation Plan: Veículos (DtD 7.7a)

**Branch**: `013-vehicles` | **Date**: 2026-09-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/013-vehicles/spec.md`

## Summary

Tipo de Item `vehicleComponent` e armas de veículo como armas da 007 com bônus fixo e escala; compêndios
`vehicle-components` e `vehicles` (16 exemplos). Tipo de ator `vehicle` com modelo próprio que expõe os caminhos que o
Aplicar da 008 lê (armadura, Resilience, HP), stats e custos derivados por regras puras (`rules/vehicle.mjs`), montador
por drop com orçamento e slots, tripulação ligada a atores, ações de veículo pelo turno do piloto, armas montadas pelo
`rollAttack` da 007 com a perícia do atirador, Evasive Maneuvers no cartão de ataque, Control Test e Out of Control,
Ramming, Jury Rig, críticos de veículo por ferimentos na cena, perseguição por cartão de chat, stunt driving e reparo.

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc

**Primary Dependencies**: Foundry VTT v13 (TypeDataModel, ActorSheetV2, Combat, ActiveEffect, DialogV2); Vitest, ESLint,
`@foundryvtt/foundryvtt-cli`

**Storage**: `system` do ator `vehicle`, componentes e armas embutidos; packs `vehicle-components` e `vehicles` de
`src/packs`

**Testing**: Vitest (`rules/vehicle.mjs`, `weapon.mjs` estendido, config, packs); roteiro manual em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: uma ação de veículo com cartão em < 1 s

**Constraints**: regras puras sem Foundry; texto próprio; reuso de 007 (ataque/dano), 008 (Aplicar, reações, turno),
011 (Backgrounds no reparo) e 012 (NPCs como tripulação)

**Scale/Scope**: 1 tipo de item, 1 tipo de ator, ~160 componentes/armas + 16 veículos, 1 módulo puro, 2 serviços, 1
ficha de ator, 1 ficha de item; ~30 arquivos

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | Páginas da 7.7a (pp. 358–385); tabelas conferidas em extração de tabela; exemplos fora do orçamento com aviso | ✅ |
| II. Nativo v13 | Tipos de Item/Actor, ActorSheetV2, packs com itens embutidos, Combat | ✅ |
| III. Pura e testada | `vehicle.mjs` com os casos do contrato; packs testados | ✅ |
| IV. Automação pragmática | Avisos em vez de bloqueios no montador; efeitos complexos de componentes como texto | ✅ |
| V. Conteúdo como dados | JSON em `src/packs`; texto próprio com 6-gramas = 0 | ✅ |
| VI. Incremental | Fase 3 (veículos); naves em feature própria | ✅ |
| Restrições | ESM + JSDoc, CSS puro, i18n pt-BR/en | ✅ |

**Re-check pós-design**: mantém todos; toca 007 (`damage.bonus`, `vehicle` na arma; `rollAttack` com arma de outro
ator) e 008 (`applyTo` para veículo, `_onEndTurn`, cartão de ataque) de forma aditiva.

## Project Structure

```text
specs/013-vehicles/ (plan, research, data-model, quickstart, contracts/, checklists/, tasks)
system.json · dtd40k.mjs
src/packs/vehicle-components/               # 8 pastas + componentes + armas
src/packs/vehicles/                          # 16 veículos com itens embutidos
scripts/assign-pack-ids.mjs                  # layouts vehicle-components e vehicles
module/config.mjs                            # VEHICLE_CATEGORIES, VEHICLE_BUDGETS, VEHICLE_COSTS, VEHICLE_CREW_ROLES
module/rules/vehicle.mjs                     # NOVO, PURO (+ tabelas Out of Control e crítico)
module/rules/weapon.mjs                      # damage.bonus
module/data/vehicle-data.mjs, vehicle-component-data.mjs, weapon-data.mjs
module/documents/vehicle-service.mjs, chase-service.mjs   # NOVOS
module/documents/attack-service.mjs, damage-service.mjs, combat.mjs
module/apps/vehicle-sheet.mjs, vehicle-component-sheet.mjs   # NOVOS
templates/actor/vehicle-sheet.hbs, templates/item/vehicle-component-sheet.hbs, templates/chat/vehicle-*.hbs,
templates/chat/chase-card.hbs, templates/dialog/vehicle-move.hbs, templates/dialog/vehicle-repair.hbs
styles/dtd40k.css · lang/*.json
tests/unit/vehicle.test.mjs, weapon.test.mjs, config.test.mjs, packs.test.mjs
```

## Complexity Tracking

| Escolha | Por quê | Alternativa rejeitada porque |
|---|---|---|
| `VehicleData` próprio (R2) | Veículo não tem características nem perícias | Herdar do personagem traria campos sem sentido |
| Armas de veículo como `weapon` (R1) | Reusa ataque, dano, qualidades e Aplicar | Um tipo novo duplicaria a 007 |
| Arma do veículo com a perícia do atirador (R4) | É a regra do livro (Skirmish/Barrage) | Rolar pelo veículo exigiria perícias no veículo |
