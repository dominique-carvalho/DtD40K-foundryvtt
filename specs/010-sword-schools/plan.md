# Implementation Plan: Sword Schools e Gun Kata (DtD 7.7a)

**Branch**: `010-sword-schools` | **Date**: 2026-09-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/010-sword-schools/spec.md`

## Summary

Tipo de Item `martialSchool` e compêndio `martial-schools` (9 Sword Schools e 6 Gun Kata em 2 pastas, entradas por
nível com automação); vantagens e restrições universais como dados puros. Escolas como valores no personagem
compradas com o XP da 006 (tipo `martial`, listas `swordSchools`/`gunKata`, teto Level), Martial Adept e Gunslinger
Level derivados e passivas numéricas como Active Effects. Montador de Special Attacks e Trick Shots com orçamento e
custo puros (tipo de XP `specialAttack`). Uso em combate pela ação-base da 008, com restrições de uso, teste de
perícia, modificadores de ataque/dano/Pen, qualidades, efeitos no alvo e no atacante e ajustes do Aplicar dano.

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc

**Primary Dependencies**: Foundry VTT v13 (TypeDataModel, ActiveEffect, Combat, DialogV2, ApplicationV2); Vitest,
ESLint, `@foundryvtt/foundryvtt-cli`

**Storage**: `system.martial` no ator; pack `packs/martial-schools` de `src/packs/martial-schools`

**Testing**: Vitest (`rules/martial.mjs`, `xp.mjs`, `damage.mjs` estendidos, config, packs); roteiro manual em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: montar/usar um ataque e ver o cartão em < 1 s

**Constraints**: regras puras sem Foundry; texto próprio; reuso do XP (006), ataque/dano (007), ações e Aplicar (008)

**Scale/Scope**: 1 tipo de item, 15 documentos, 1 módulo puro novo e 3 estendidos, 1 serviço, 1 aba e 1 diálogo; ~25 arquivos

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | Páginas da 7.7a (pp. 260–279, 16, 515, 423–430); problemas do livro como premissas/edge cases | ✅ |
| II. Nativo v13 | Items/compêndio, Active Effects, turno do Combat, DialogV2 | ✅ |
| III. Pura e testada | `martial.mjs` com os exemplos do livro; `xp`/`damage` estendidos; packs testados | ✅ |
| IV. Automação pragmática | Recusas com override; passivas desligáveis; vantagens complexas como texto | ✅ |
| V. Conteúdo como dados | JSON em `src/packs`; texto próprio; checagem de 6-gramas | ✅ |
| VI. Incremental | Fase 1 (Sword Schools; Gun Kata junto por ser o mesmo motor, pedido do usuário) | ✅ |
| Restrições | ESM + JSDoc, CSS puro, i18n pt-BR/en | ✅ |

**Re-check pós-design**: mantém todos; toca 007 (`rollAttack`/`rollDamage` com `special`), 008 (`useAction`,
`resolveDamage`, `applyTo`) e 006 (XP) de forma aditiva, com padrões neutros.

## Project Structure

```text
specs/010-sword-schools/ (plan, research, data-model, quickstart, contracts/, checklists/, tasks)
system.json · dtd40k.mjs
src/packs/martial-schools/                 # 2 pastas + 15 JSON
scripts/assign-pack-ids.mjs                # layout martial-schools
module/config.mjs                          # MARTIAL_SCHOOLS, MARTIAL_ENTRY_TYPES, MARTIAL_XP, XP_KINDS
module/rules/martial.mjs                   # NOVO, PURO: universais, níveis, opções, orçamento, custo, uso, modificadores
module/rules/xp.mjs · damage.mjs           # martial/specialAttack; resolve com ignoreArmor/resilience/noCritical
module/data/martial-school-data.mjs        # NOVO
module/data/character-data.mjs             # martial.schools, attacks; derivados
module/documents/martial-service.mjs       # NOVO
module/documents/xp-service.mjs, attack-service.mjs, turn-service.mjs, damage-service.mjs
module/apps/martial-school-sheet.mjs, martial-context.mjs, martial-builder.mjs   # NOVOS
module/apps/character-sheet.mjs            # aba martial, ações
templates/item/martial-school-sheet.hbs, templates/actor/parts/martial.hbs, templates/dialog/martial-builder.hbs
templates/chat/attack-card.hbs             # vantagens em texto, botão Aplicar efeitos
styles/dtd40k.css · lang/*.json
tests/unit/martial.test.mjs, xp.test.mjs, damage.test.mjs, config.test.mjs, packs.test.mjs
```

## Complexity Tracking

| Escolha | Por quê | Alternativa rejeitada porque |
|---|---|---|
| Escolas como Items do pack, valores no ator (R1/R2) | Consulta no compêndio e na ficha; XP/desfazer iguais à magia | Embutir no ator duplicaria dados a cada ajuste |
| Ataques como dados no ator (R4) | São criações do jogador sem ficha própria; orçamento puro | Item por ataque exigiria ficha e compêndio sem uso |
| `special` nos fluxos existentes (R5) | Reusa ataque, dano, turno e Aplicar | Um fluxo de ataque paralelo duplicaria a 007/008 |
