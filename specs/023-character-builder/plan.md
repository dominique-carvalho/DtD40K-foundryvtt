# Implementation Plan: Montador de personagem para jogadores

**Branch**: `023-character-builder` | **Date**: 2026-10-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/023-character-builder/spec.md`

## Summary

Uma janela de assistente edita um rascunho (salvo no usuário) passo a passo:
- Passos: conceito, raça, exaltação, características, perícias, especialidades, classe, backgrounds, alinhamento,
  Assets e Hindrances, Exalted Asset, XP, equipamento e revisão.
- Validação de cada passo por um módulo puro novo, que reaproveita as regras da 016 e das features 002–011.
- Ao Concluir, o ator é criado (pelo jogador ou pelo Mestre via `query`) e preenchido por um plano em ordem. O plano usa
  os serviços existentes, que ganham opções para receber escolhas prontas sem abrir diálogos.
- Um botão na aba de atores abre o assistente.

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc; Handlebars; CSS (tokens da 021)

**Primary Dependencies**: Foundry VTT v13 (ApplicationV2 + HandlebarsApplicationMixin, `renderActorDirectory`,
`CONFIG.queries`/`User#query`, compêndios); Vitest, ESLint

**Storage**: flag do usuário `dtd40k.builderDraft`; o ator só é criado ao Concluir; nada muda no modelo do personagem

**Testing**: Vitest (`rules/builder.mjs`); roteiro manual em [quickstart.md](quickstart.md) (Jane, p. 18)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: índices dos compêndios carregados uma vez por abertura; troca de passo sem atraso perceptível

**Constraints**:
- regras puras sem Foundry;
- serviços mantêm o comportamento da ficha sem as opções novas;
- nada é gravado antes de Concluir.

**Scale/Scope**:
- 1 módulo puro;
- 1 app com cerca de 14 templates de passo;
- 1 serviço de construção;
- opções novas em cerca de 8 serviços;
- botão, query e i18n.

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | Cap. II pp. 12–19, p. 23, p. 179, pp. 280–283; ambiguidades registradas nas premissas | ✅ |
| II. Nativo v13 | ApplicationV2, `renderActorDirectory`, `CONFIG.queries`, flags de usuário | ✅ |
| III. Pura e testada | `builder.mjs` com os casos do contrato (Jane) | ✅ |
| IV. Automação pragmática | Bloqueio por passo com liberação do Mestre; equipamento vazio só avisa | ✅ |
| V. Conteúdo como dados | Opções vêm dos compêndios | ✅ |
| VI. Incremental | Serviços com opções opcionais; painel 016 e ficha intactos | ✅ |
| Restrições | ESM + JSDoc, i18n pt-BR/en, design system 021 | ✅ |

**Re-check pós-design**: todos se mantêm.

## Project Structure

```text
specs/023-character-builder/ (plan, research, data-model, quickstart, contracts/, checklists/, inventory.json, tasks)
module/rules/builder.mjs                 # NOVO, PURO: passos, validação, saldo de XP, prévia, plano
module/apps/character-builder.mjs        # NOVO: janela do assistente (PARTS steps/step/summary/footer)
module/documents/builder-service.mjs     # NOVO: rascunho (flag), criação do ator (direta ou query), aplicação do plano
module/documents/race-service.mjs · exaltation-service.mjs · class-service.mjs · feat-service.mjs ·
  asset-service.mjs · background-service.mjs · xp-service.mjs   # opções { choice/selection/silent }
dtd40k.mjs                               # botão na aba de atores; CONFIG.queries["dtd40k.createCharacter"]
templates/apps/builder/{steps,summary,footer}.hbs + step-*.hbs (14)
styles/builder.css · system.json · lang/*.json
tests/unit/builder.test.mjs (NOVO)
```

## Complexity Tracking

| Escolha | Por quê | Alternativa rejeitada porque |
|---|---|---|
| Opções "silent/preset" nos serviços (R2) | Reaproveita validações e efeitos colaterais | Uma construção paralela duplicaria regras e esqueceria efeitos (Perfection, grants) |
| `User#query` para o Mestre (R5) | Devolve o UUID criado para o jogador continuar | `requestGm` não tem resposta |
