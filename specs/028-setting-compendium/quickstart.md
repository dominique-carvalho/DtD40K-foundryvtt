# Quickstart — validação da feature 028-setting-compendium

## Pré-requisitos

- `npm run build:packs` no worktree `DtD40K-foundryvtt-028` **com o Foundry fechado**; depois o link
  `Data/systems/dtd40k` apontando para o worktree e o Foundry aberto do zero.

```bash
npm test
```

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir o compêndio Setting como Mestre | 4 pastas (History, Cosmology, Sigil, Crystal Spheres), 18 diários | US1-1, US2-1 |
| 2 | Abrir "Baator" | 4 páginas com resumo curto; ganchos visíveis | US1-2 |
| 3 | Abrir "Sigil" | Visão geral, Lady of Pain, facções (filosofia e líder), locais | US2-2 |
| 4 | Abrir "History of the Wheel" | Eras na ordem do capítulo | US2-3 |
| 5 | Clicar num deus e numa raça citados | Abre a entrada do compêndio | US3-1 |
| 6 | Entrar como jogador (Player2) e abrir "Baator" | Lê condições, habitantes e locais; nos ganchos, só o aviso | US1-3 |
