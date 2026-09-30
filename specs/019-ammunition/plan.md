# Implementation Plan: Controle de munição (DtD 7.7a)

**Branch**: `019-ammunition` | **Date**: 2026-09-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/019-ammunition/spec.md`

## Summary

Um campo `ammo` na arma (tiros no pente — vazio significa cheio, para as armas existentes —, pentes de reserva,
progresso de recarga e travada) e um módulo puro (`rules/ammo.mjs`) que decide quem conta tiros, lê o Reload da arma
(Free/Half/Full/N Full nas grafias dos packs), calcula o gasto de cada modo e o ROF efetivo, e avança a recarga. O ataque
da 007 confere e gasta os tiros (e o item dos lançadores), trava a arma no emperrar e esvazia no Overheats; o
Suppressing Fire gasta ao iniciar a zona (uma vez, também quando vem do Overwatch) e a rajada usa o ROF efetivo; a ação
Reload usa o tempo da arma com progresso; qualquer outra ação zera o progresso; o Clear Jam destrava e esvazia. A ficha
mostra tiros e reserva editáveis e um botão de recarga por arma.

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc

**Primary Dependencies**: Foundry VTT v13 (TypeDataModel da arma, ficha, turno da 008); Vitest, ESLint

**Storage**: `system.ammo = { loaded: number|null, spare: number, progress: number, jammed: boolean }` no item `weapon`

**Testing**: Vitest (`rules/ammo.mjs`); roteiro manual em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: sem custo perceptível no ataque

**Constraints**: regras puras sem Foundry; armas existentes começam cheias sem migração; armas sem pente, de veículo e de
nave inalteradas

**Scale/Scope**: 1 módulo puro, extensões em weapon-data, attack-service, zone-service, turn-service, equipment-context e
templates; ~10 arquivos

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | Pp. 318, 320, 424, 426–430, 435; 17 issues resolvidas | ✅ |
| II. Nativo v13 | Campo no modelo da arma; ficha e turno existentes | ✅ |
| III. Pura e testada | `ammo.mjs` com os casos do contrato | ✅ |
| IV. Automação pragmática | Recusa com liberação do Mestre; reserva editável; efeitos raros como nota | ✅ |
| V. Conteúdo como dados | Grafias de Reload normalizadas; nada muda nos packs | ✅ |
| VI. Incremental | `loaded` vazio = cheio (sem migração); armas sem pente iguais | ✅ |
| Restrições | ESM + JSDoc, CSS puro, i18n pt-BR/en | ✅ |

**Re-check pós-design**: mantém todos. Mudança visível para quem já joga: armas de pente passam a gastar tiros e podem
emperrar de verdade (decisão do usuário).

## Project Structure

```text
specs/019-ammunition/ (plan, research, data-model, quickstart, contracts/, checklists/, tasks)
module/data/weapon-data.mjs              # system.ammo; derivado ammo.current/ammo.max
module/rules/ammo.mjs                    # NOVO, PURO: tracksAmmo, parseReload, roundsFor, spendRounds, reloadStep
module/documents/ammo-service.mjs        # NOVO: checkAmmo/spend no ataque, reload, clearJam, resetProgress
module/documents/attack-service.mjs      # confere e gasta; ROF efetivo; trava no emperrar; Overheats; item do lançador
module/documents/zone-service.mjs        # Suppressing Fire gasta ao iniciar; rajada sem novo gasto e com o ROF efetivo
module/documents/turn-service.mjs        # Reload com o tempo da arma; zera progresso nas outras ações; Clear Jam
module/apps/equipment-context.mjs        # tiros, reserva, travada, progresso na linha da arma
templates/actor/parts/equipment.hbs      # contadores editáveis e botão Recarregar
styles/dtd40k.css · lang/*.json
tests/unit/ammo.test.mjs (NOVO)
```

## Complexity Tracking

| Escolha | Por quê | Alternativa rejeitada porque |
|---|---|---|
| `loaded` nulo = cheio (R1) | Armas existentes e dos packs começam cheias sem migração | Migração de todos os atores e packs |
