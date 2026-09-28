# Implementation Plan: Criação de armas (DtD 7.7a)

**Branch**: `015-weapon-crafting` | **Date**: 2026-09-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/015-weapon-crafting/spec.md`

## Summary

Dados do capítulo (5 templates, 18 tipos, 68 mods, tabela de disponibilidade) num módulo puro de dados e regras
(`rules/weapon-creation.mjs`) que monta o perfil de uma arma da 007 a partir de template + tipo + mods e calcula a
raridade e o TN. Um montador (ApplicationV2) aberto pelo Mestre no diretório de itens e pelo jogador na aba Equipamento
cria o item `weapon` com o registro da montagem (`system.custom`). O ataque e o dano da 007 leem os mods da arma e
aplicam os condicionais (Red-Dot Sight, Motion Predict, Breacher, Unstable, Nonlethal, Orgone Array). A arma de
jogador nasce pendente; o Mestre aprova (pronta ou para fabricar) e a fabricação passa por um teste de Wealth e um de
Crafts no TN da raridade.

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc

**Primary Dependencies**: Foundry VTT v13 (ApplicationV2 + HandlebarsApplicationMixin, ItemSheetV2, DialogV2,
hooks do diretório de itens); Vitest, ESLint

**Storage**: `system.custom` do item `weapon` (montagem, notas, estado da fabricação); sem pack novo — os dados são
constantes do módulo puro (como as tabelas da 013/014)

**Testing**: Vitest (`rules/weapon-creation.mjs`, `weapon.mjs` estendido, conferência contra o pack de equipamento);
roteiro manual em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: prévia do montador atualizada em < 100 ms por escolha

**Constraints**: regras puras sem Foundry; texto próprio (6-gramas = 0); reuso de 007 (item de arma, qualidades,
`rollAttack`/`rollDamage`, teste de Wealth e raridades), 011 (Wealth como Background)

**Scale/Scope**: 1 módulo puro de dados/regras, 1 aplicação (montador), extensões aditivas em 4 arquivos da 007
(modelo da arma, regras da arma, ataque, ficha/equipamento); ~15 arquivos

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | Páginas da 7.7a (pp. 516–519); tabelas conferidas em três extrações; 28 issues resolvidas na research | ✅ |
| II. Nativo v13 | Item `weapon` da 007, ApplicationV2, hooks do diretório | ✅ |
| III. Pura e testada | `weapon-creation.mjs` com os casos do contrato | ✅ |
| IV. Automação pragmática | Numéricos e condicionais automatizados; especiais como nota; o Mestre ajusta | ✅ |
| V. Conteúdo como dados | Tabelas do capítulo como constantes versionadas; notas em texto próprio | ✅ |
| VI. Incremental | Estende a 007 sem mudar armas existentes | ✅ |
| Restrições | ESM + JSDoc, CSS puro, i18n pt-BR/en | ✅ |

**Re-check pós-design**: mantém todos; toca a 007 de forma aditiva (`system.custom` opcional na arma; condicionais no
ataque só quando há mods; equipar/atacar recusa arma pendente ou em fabricação).

## Project Structure

```text
specs/015-weapon-crafting/ (plan, research, data-model, quickstart, contracts/, checklists/, tasks)
dtd40k.mjs                                  # botões do montador (diretório de itens, aba Equipamento), registro
module/rules/weapon-creation.mjs            # NOVO, PURO: TEMPLATES, TYPES, MODS, AVAILABILITY, buildWeapon, …
module/rules/weapon.mjs                     # attackPool/damagePool: condicionais e Nonlethal
module/data/weapon-data.mjs                 # system.custom (montagem, notas, estado)
module/apps/weapon-builder.mjs              # NOVO: montador (ApplicationV2)
module/apps/equipment-sheet.mjs             # notas, estado, aprovação, fabricação, reabrir no montador
module/documents/weapon-craft-service.mjs   # NOVO: criar, aprovar, fabricar (Wealth + Crafts)
module/documents/attack-service.mjs         # Red-Dot, Motion Predict, Breacher, Unstable, Orgone, notas
module/documents/equipment-service.mjs      # recusa equipar arma pendente ou em fabricação
module/documents/acquisition-service.mjs    # teste de Wealth exportado para os materiais
templates/apps/weapon-builder.hbs, templates/item/equipment-sheet.hbs, templates/chat/attack-card.hbs
styles/dtd40k.css · lang/*.json
tests/unit/weapon-creation.test.mjs, weapon.test.mjs
```

## Complexity Tracking

| Escolha | Por quê | Alternativa rejeitada porque |
|---|---|---|
| Dados como constantes, sem pack (R1) | Templates, tipos e mods não são itens do jogo, são peças do montador | Um compêndio de 90 itens que ninguém arrasta seria ruído |
| Arma resultante = `weapon` da 007 (R2) | Reusa ataque, dano, qualidades, aquisição e ficha | Um tipo novo duplicaria a 007 |
| Condicionais lidos dos mods na hora do ataque (R4) | Mantém o perfil limpo e editável; o Mestre pode tirar um mod | Gravar bônus fixos no perfil perderia a condição |
