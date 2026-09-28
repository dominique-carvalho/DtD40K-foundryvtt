# Implementation Plan: Naves (DtD 7.7a)

**Branch**: `014-ships` | **Date**: 2026-09-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/014-ships/spec.md`

## Summary

Tipo de Item `shipComponent` (cascos, bases customizáveis, oficiais, consoles, escudos, padrões e tipos de arma, tubo e
torpedos) e compêndios `ship-components` e `ships` (6 naves de NPC). Tipos de ator `ship` (modelo próprio com casco,
customização, oficiais ligados a atores, componentes embutidos, hangar e estado de combate) e `squadron` (caças). Regras
puras em `rules/ship.mjs` (BP, slots, customização, perfil de arma, escudo e Disruption, Crit Chart, ramming, boarding,
Warp, bombardeio, caças, reparo). O combate de naves tem escala própria: a nave é o combatente (iniciativa Sensors +
Acceleration + 1d10), com uma ação de Manoeuver e uma por departamento por turno, reserva de Crew por rodada, ataques
por cartão de chat e Aplicar próprio (escudo → Hull → crítico). Extras: viagem pelo Warp por cartão, esquadrões de
caças, bombardeio com dano de escala pessoal (Aplicar da 008) e hangar com veículos da 013.

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc

**Primary Dependencies**: Foundry VTT v13 (TypeDataModel, ActorSheetV2, ItemSheetV2, Combat/Combatant, DialogV2,
ChatMessage flags); Vitest, ESLint, `@foundryvtt/foundryvtt-cli`

**Storage**: `system` dos atores `ship` e `squadron`, componentes embutidos; packs `ship-components` (Item) e `ships`
(Actor) a partir de `src/packs`

**Testing**: Vitest (`rules/ship.mjs`, config, packs); roteiro manual em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: uma ação de nave com cartão em < 1 s

**Constraints**: regras puras sem Foundry; texto próprio (6-gramas = 0); reuso de 001 (rolagem R&K e cartões), 008
(combate, iniciativa, recusa com override do Mestre, Aplicar para o bombardeio), 011 (Holdings/Wealth/Backing/Followers),
012 (NPCs como oficiais), 013 (veículos no hangar; padrão de montador e avisos)

**Scale/Scope**: 1 tipo de item, 2 tipos de ator, ~110 itens + 6 naves, 1 módulo puro, 4 serviços (ship, ship-combat,
warp, squadron), 3 fichas; ~35 arquivos

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | Páginas da 7.7a (pp. 386–415); tabelas conferidas em extração de tabela; 45 issues resolvidas na research | ✅ |
| II. Nativo v13 | Tipos de Item/Actor, ActorSheetV2, Combat/Combatant, packs com itens embutidos | ✅ |
| III. Pura e testada | `ship.mjs` com os casos do contrato; packs testados | ✅ |
| IV. Automação pragmática | Avisos em vez de bloqueios; efeitos complexos de consoles, oficiais e encontros como texto | ✅ |
| V. Conteúdo como dados | JSON em `src/packs`; texto próprio com 6-gramas = 0 | ✅ |
| VI. Incremental | Fecha a fase 3 (veículos e naves) | ✅ |
| Restrições | ESM + JSDoc, CSS puro, i18n pt-BR/en | ✅ |

**Re-check pós-design**: mantém todos; toca a 008 de forma aditiva (fórmula de iniciativa do `ship`/`squadron` no
`DtdCombatant`, hooks de início de turno e de rodada no `DtdCombat`) e a 013 só por leitura (veículos no hangar).

## Project Structure

```text
specs/014-ships/ (plan, research, data-model, quickstart, contracts/, checklists/, tasks)
system.json · dtd40k.mjs
src/packs/ship-components/                 # pastas: Hulls, Custom Hulls, Officers, 5 de Consoles, Shields, Weapons, Torpedoes
src/packs/ships/                           # 6 naves de NPC com componentes embutidos
scripts/assign-pack-ids.mjs                # layouts ship-components e ships
module/config.mjs                          # SHIP_CATEGORIES, SHIP_BUDGETS, HULL_CLASSES, CONSOLE_TYPES, SHIP_DEPARTMENTS…
module/rules/ship.mjs                      # NOVO, PURO (+ SHIP_ACTIONS, SHIP_CRIT, WARP_*, WEAPON_TYPES_SHIP)
module/data/ship-component-data.mjs, ship-data.mjs, squadron-data.mjs   # NOVOS
module/documents/ship-service.mjs          # montador, oficiais, hangar, reparo, porto
module/documents/ship-combat-service.mjs   # ações, ataques, Aplicar de nave, escudos, críticos, boarding, ramming
module/documents/squadron-service.mjs      # caças: deploy, ataque, dano, docking
module/documents/warp-service.mjs          # viagem pelo Warp e bombardeio
module/documents/combat.mjs                # iniciativa e início de turno/rodada das naves
module/apps/ship-sheet.mjs, ship-component-sheet.mjs, squadron-sheet.mjs, ship-action-dialog.mjs   # NOVOS
templates/actor/ship/*.hbs, templates/actor/squadron-sheet.hbs, templates/item/ship-component-sheet.hbs,
templates/chat/ship-*.hbs, templates/chat/warp-card.hbs, templates/dialog/ship-*.hbs
styles/dtd40k.css · lang/*.json
tests/unit/ship.test.mjs, config.test.mjs, packs.test.mjs
```

## Complexity Tracking

| Escolha | Por quê | Alternativa rejeitada porque |
|---|---|---|
| Nave como combatente, turno próprio (R4) | O livro dá iniciativa e turno da nave; as ações são por departamento, não por personagem | Agir pelos turnos dos oficiais quebraria a ordem de iniciativa das naves |
| Aplicar de nave separado (R5) | Escudo, Disruption, Hull e Crit Chart não têm AP, Resilience nem locais | Estender o Aplicar da 008 misturaria escalas |
| Ator `squadron` (R7) | Caças precisam de token, SD e Hull próprios no mapa | Guardar caças só no estado da nave não deixa outras naves mirarem neles |
| Tipos de arma como seleção na arma (R3) | Padrão × tipo dá 35 combinações; o livro calcula o perfil | 35 itens no compêndio duplicariam os dados |
