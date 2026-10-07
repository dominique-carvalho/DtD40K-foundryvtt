# Implementation Plan: Compêndio de cenário (cap. XVIII)

**Branch**: `028-setting-compendium` | **Date**: 2026-10-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/028-setting-compendium/spec.md`

## Summary

Um compêndio novo `setting`, do tipo **JournalEntry**, com 18 diários em 4 pastas:
- História do Wheel (1 diário, uma página por era);
- Cosmologia (1 diário: Astral Sea, portais, naves spelljammer, Warp, Umbra);
- Sigil (1 diário: visão geral, Lady of Pain, facções, locais);
- Esferas (15 diários, cada um com as páginas Physical Conditions, Inhabitants, Locations e Adventure Seeds).

Os textos são resumos curtos em inglês, com redação própria, escritos uma vez por um gerador no scratchpad e
versionados como JSON em `src/packs/setting/` (como os demais compêndios). Deuses, raças e exaltações citados viram
links `@UUID[...]` para os compêndios existentes. Os ganchos de aventura ficam num bloco secreto, que só o Mestre vê.

Não há código de jogo novo: o capítulo não tem regra. O código é o teste do compêndio e um ajuste no teste de ícones.

## Technical Context

**Language/Version**: JSON (fontes de compêndio); JavaScript ESM para o teste (Vitest)

**Primary Dependencies**: `@foundryvtt/foundryvtt-cli` (`npm run build:packs`, sem mudança); compêndios *Deities*,
*Races*, *Exaltations* como destino dos links

**Storage**: `src/packs/setting/*.json` (diários com páginas embutidas e pastas) → `packs/setting` (LevelDB, não versionado)

**Testing**: Vitest `tests/unit/setting.test.mjs` (estrutura, ganchos secretos, links válidos, tamanho dos blocos);
verificação de 6-gramas contra o texto do livro no scratchpad (o livro não fica no repositório); roteiro em
[quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: n/a (18 documentos de texto)

**Constraints**:
- redação própria: 0 trechos de 6 palavras em comum com as pp. 454–507;
- até 2 parágrafos por bloco;
- textos em inglês, como os demais compêndios;
- nomes próprios como no livro.

**Scale/Scope**: 18 diários, ~75 páginas (15 × 4 das esferas + ~15 de história, cosmologia e Sigil), 4 pastas.

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | Resumo das pp. 454–507, mesma estrutura do capítulo; nada inventado | ✅ |
| II. Nativo v13 | JournalEntry e páginas de texto nativas; links `@UUID`; blocos `secret` nativos | ✅ |
| III. Pura e testada | Sem regra nova; teste do compêndio (estrutura, links, segredos) | ✅ |
| IV. Automação pragmática | Capítulo só de consulta; nada automatizado | ✅ |
| V. Conteúdo como dados | Fonte JSON versionada em `src/packs`, compilada pelo build; redação própria verificada | ✅ |
| VI. Incremental | Compêndio isolado; integrações (Backing, Warp) ficam para depois | ✅ |
| Restrições | Pack declarado no `system.json`; i18n do rótulo do pack | ✅ |

**Re-check pós-design**: todos se mantêm.

## Project Structure

### Documentation (this feature)

```text
specs/028-setting-compendium/
├── plan.md, research.md, data-model.md, quickstart.md
├── contracts/setting-pack.md
├── checklists/requirements.md
└── tasks.md            # /speckit-tasks
```

### Source Code (repository root)

```text
src/packs/setting/                 # 4 pastas + 18 diários (JSON, páginas embutidas)
system.json                        # pack "setting" (JournalEntry, PLAYER: OBSERVER)
tests/unit/setting.test.mjs        # estrutura, segredos, links, tamanho
tests/unit/icons.test.mjs          # diários fora da checagem de imagem (não têm img)
README.md, docs/pendencias.md      # compêndio novo; cap. XVIII sai da lista
```

**Structure Decision**: só conteúdo e teste; nenhum módulo de jogo muda.

## Complexity Tracking

Nenhuma violação.
