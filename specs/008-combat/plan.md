# Implementation Plan: Combate, condições, social, medo e insanidade (DtD 7.7a)

**Branch**: `008-combat` | **Date**: 2026-09-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/008-combat/spec.md`

## Summary

Botão Aplicar no cartão de dano da 007 com regra pura de dano (cobertura, AP − Pen ou Aura, Resilience, HP, Critical
Damage) e efeitos das tabelas de críticos (pack `combat-tables` de RollTables com automação em flags). Condições da
DtD como `CONFIG.statusEffects` com modificadores. `DtdCombat` com a ordem de iniciativa do livro; estado do turno
no Combatant (ação completa / meias diferentes / livres / reações) com regras puras; menu das 38 ações na ficha;
Dodge e Parry no cartão de ataque; efeitos "até o próximo turno" e testes de fim de turno pelo Combat Tracker.
Cura por descanso, morte com Hero Point, combate social (Resolve, Jaded, Refute), medo (Shock Table) e insanidade
(Trauma Test, derangements).

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc

**Primary Dependencies**: Foundry VTT v13 (TypeDataModel, ActiveEffect/status effects, Combat/Combatant, RollTable,
DialogV2, `renderChatMessageHTML`, `game.socket`); Vitest, ESLint, `@foundryvtt/foundryvtt-cli`

**Storage**: `system.critical`, `system.insanity`, `system.resolve.drainedScene` no ator; `flags.dtd40k.turn` no
Combatant; flags de dano/desfazer nas mensagens; pack `packs/combat-tables` de `src/packs/combat-tables`

**Testing**: Vitest (`rules/damage.mjs`, `critical.mjs`, `turn.mjs`, `defense.mjs`, `healing.mjs`, `social.mjs`,
`mental.mjs`, `combat-actions.mjs`, packs); roteiro manual em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: aplicar dano e ver HP/condições atualizados em < 1 s

**Constraints**: regras puras sem Foundry; escrita em atores de outros donos só pelo Mestre (socket); textos das tabelas
com redação própria

**Scale/Scope**: 7 módulos puros, 5 serviços, 1 pack (22 tabelas), 2 classes de documento, menu na ficha; ~40 arquivos

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | Páginas da 7.7a (pp. 416–452, 17); contradições (Dodge/Parry, tabela-resumo, linha do crítico) como premissas | ✅ |
| II. Nativo v13 | Status effects, Combat Tracker, RollTables, ActiveEffects, socket | ✅ |
| III. Pura e testada | 7 módulos puros com os casos do contrato; pack testado | ✅ |
| IV. Automação pragmática | Aplicar é um clique com Desfazer; recusas do turno com override; críticos complexos como texto | ✅ |
| V. Conteúdo como dados | Tabelas em JSON de RollTable com redação própria; inventário conferido no PDF | ✅ |
| VI. Incremental | Fase 1 (combate); minions, veículos e magia fora | ✅ |
| Restrições | ESM + JSDoc, CSS puro, i18n pt-BR/en | ✅ |

**Re-check pós-design**: mantém todos. Toca 007 (cartões ganham botões; diálogo de ataque ganha situações), 004 ("Nova
cena" zera Resolve drenado) e `prepareDerivedData` (fadiga, reações) de forma aditiva.

## Project Structure

```text
specs/008-combat/ (plan, research, data-model, quickstart, contracts/, checklists/, tasks)
system.json · dtd40k.mjs
src/packs/combat-tables/                    # 22 RollTables (20 críticos, Shock Table, Mental Traumas) + pastas
module/config.mjs                           # STATUS_EFFECTS, FEAR_TN, CRITICAL_LOCATIONS, …
module/rules/damage.mjs, critical.mjs, turn.mjs, defense.mjs, healing.mjs, social.mjs, mental.mjs   # NOVOS, PUROS
module/rules/combat-actions.mjs             # NOVO: dados das 38 ações
module/data/character-data.mjs              # critical, insanity, resolve.drainedScene, fadiga, estado de combate
module/documents/combat.mjs                 # NOVO: DtdCombat (ordem), DtdCombatant (estado do turno)
module/documents/damage-service.mjs, turn-service.mjs, condition-service.mjs, social-service.mjs, mental-service.mjs
module/documents/attack-service.mjs         # situações, Called Shot, Multiple Attacks, botões Dodge/Parry
module/apps/combat-actions-context.mjs, rest-dialog.mjs
templates/actor/parts/combat.hbs            # menu de ações, condições, estado mental, descanso
templates/chat/{damage-applied,defense,social-attack,fear}.hbs · templates/dialog/rest-dialog.hbs
styles/dtd40k.css · lang/*.json
tests/unit/damage.test.mjs, critical.test.mjs, turn.test.mjs, defense.test.mjs, healing.test.mjs, social.test.mjs,
  mental.test.mjs, combat-actions.test.mjs, config.test.mjs, packs.test.mjs
```

## Complexity Tracking

| Escolha | Por quê | Alternativa rejeitada porque |
|---|---|---|
| Tabelas como RollTables com flags (R2) | Conteúdo nativo que o Mestre também rola; automação separada do texto | Tabelas em código misturam conteúdo e regra |
| Estado do turno no Combatant (R5) | Some com o combate; não suja o ator | No ator ficaria preso entre combates |
| Socket para aplicar em alvo alheio (R1) | Jogadores não podem escrever em atores de outros | Obrigar o Mestre a clicar em tudo |
| Status effects da DtD no lugar dos do core (R3) | Token HUD mostra as condições do livro | Condições do core não batem com a 7.7a |
