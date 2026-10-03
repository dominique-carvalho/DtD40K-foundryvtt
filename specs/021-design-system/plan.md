# Implementation Plan: Design system Scriptorium Machina (fichas e chat)

**Branch**: `021-design-system` | **Date**: 2026-10-03 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/021-design-system/spec.md`

## Summary

O CSS do sistema passa a ter camadas: fontes, tokens (Vellum e Cogitator, ligados ao tema do Foundry), componentes,
o CSS atual convertido para tokens, chat e os dois layouts. A ficha de personagem ganha duas subclasses registradas no
seletor do Foundry: **Cogitador** (padrão) e **Iluminura**. Elas trocam só o cabeçalho, as abas e a aba principal e
herdam todas as ações da ficha atual, que sai do registro. Os cartões de chat são estilizados pela raiz. As outras
fichas e os diálogos herdam tokens e componentes sem mudar de layout. As fontes OFL vão em `fonts/` e entram no zip de
release.

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc; CSS puro; Handlebars

**Primary Dependencies**: Foundry VTT v13 (ActorSheetV2, DocumentSheetConfig, temas claro e escuro); Vitest, ESLint

**Storage**: nenhuma mudança de dados; a escolha de ficha usa o flag nativo `core.sheetClass` do ator e o padrão do mundo

**Testing**: Vitest (`design-tokens.test.mjs`: contraste, arquivos de estilo e fontes); roteiro manual em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: ficha abre e troca de aba como hoje; 130 KB de fontes, carregadas uma vez

**Constraints**:
- todo estilo sob `.dtd40k`;
- contraste AA para texto;
- funciona offline;
- nenhuma ação, campo ou regra muda;
- o NPC mantém o layout atual.

**Scale/Scope**:
- 6 arquivos de CSS novos e o atual convertido;
- 2 subclasses de ficha e 6 templates novos;
- 19 cartões de chat, 15 fichas restantes e diálogos em tokens;
- 8 fontes.

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | Nenhuma regra muda; as paradas exibidas vêm do mesmo cálculo da rolagem | ✅ |
| II. Nativo v13 | Seletor de ficha nativo, temas nativos, ActorSheetV2 com PARTS | ✅ |
| III. Pura e testada | Sem regra nova; o teste de tokens cobre contraste e arquivos | ✅ |
| IV. Automação pragmática | Mesmas ações; o Mestre escolhe o padrão do mundo | ✅ |
| V. Conteúdo como dados | Nada muda nos packs | ✅ |
| VI. Incremental | Camadas; NPC e outras fichas sem mudança de layout; a ficha atual vira base | ✅ |
| Restrições | ESM + JSDoc, CSS puro, i18n pt-BR/en, sem dependência de runtime | ✅ |

**Re-check pós-design**: todos se mantêm. Mudança visível: a ficha de personagem e o chat mudam de cara, e quem tinha
a ficha atual escolhida passa a abrir a Cogitador.

## Project Structure

```text
specs/021-design-system/ (plan, research, data-model, quickstart, contracts/, checklists/, tasks)
fonts/                                   # NOVO: 8 .woff2 + OFL-*.txt
styles/fonts.css                         # NOVO: @font-face
styles/tokens.css                        # NOVO: Vellum / Cogitator + aliases antigos
styles/components.css                    # NOVO: gemas (.dot), selos, títulos, painéis, tubos, placas, botões, campos
styles/dtd40k.css                        # convertido para tokens; regras de chat migradas
styles/chat.css                          # NOVO: 19 cartões pela raiz
styles/sheet-cogitator.css               # NOVO
styles/sheet-illuminated.css             # NOVO
system.json                              # lista de styles
module/apps/character-sheet.mjs          # base: contexto `rail`; layout por subclasse
module/apps/cogitator-sheet.mjs          # NOVO
module/apps/illuminated-sheet.mjs        # NOVO
dtd40k.mjs                               # registro das duas fichas; base fora do tipo character
templates/actor/cogitator/{rail,tabs,main}.hbs        # NOVO
templates/actor/illuminated/{header,tabs,main}.hbs    # NOVO
lang/en.json · lang/pt-BR.json
tests/unit/design-tokens.test.mjs        # NOVO
.github/workflows/release.yml            # inclui fonts
docs/design-system.md · README.md · docs/pendencias.md
```

## Complexity Tracking

| Escolha | Por quê | Alternativa rejeitada porque |
|---|---|---|
| Duas subclasses sobre a base (R3) | Seletor nativo; ações herdadas; NPC intacto | Um layout por configuração duplicaria o registro e não usaria o seletor que o usuário escolheu |
| Aliases dos nomes antigos (R2) | Evita reescrever cerca de 80 bordas e quebrar o CSS atual | Renomear tudo de uma vez tem risco alto e diff enorme |
