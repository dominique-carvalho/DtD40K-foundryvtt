# Quickstart — validação da feature 011-backgrounds-alignment

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-011`; mundo relançado após mudar o
  `system.json`. **Nenhum outro mundo em uso.**

```bash
npm test
```

```bash
npm run build:packs
```

Antes de registrar dados: `game.packs.get("dtd40k.deities").index.size === 21` em 3 pastas e a tabela Degeneration no
`combat-tables` (16 resultados).

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir o compêndio Deities | 21 deuses, 3 pastas, 7 em cada | US1-1 |
| 2 | Abrir Slaanesh; tabela Degeneration | Dados da spec; 16 linhas | US1-2/3 |
| 3 | Criação: Contacts 3, Wealth 2, Fame 2 | 7/7, 0 XP | US2-1 |
| 4 | Mais um ponto (≤ 3) e Fame 4 | 50 e 100 XP no histórico | US2-2 |
| 5 | Fora da criação | Jogador recusado; Mestre edita | US2-3 |
| 6 | Artifacts somando 6 na criação | Recusa acima de 5 | US2-4 |
| 7 | Aquisição com Wealth 2 | Usa Wealth 2 | US2-5 |
| 8 | Inheritance 1 "2 Common" | +2 vagas Common nos itens iniciais | US2-6 |
| 9 | Rolar Contacts com Fellowship | (Contacts + Fel) k Fel | US2-7 |
| 10 | Desfazer compra de Background | Valor e XP voltam | US2-8 |
| 11 | Arrastar Sigmar | Alinhamento na ficha | US3-1 |
| 12 | Alignment Check 7 vs 6; 3 vs 8; +2 de bônus | Passa; Devotion 7; passa | US3-2/3/5 |
| 13 | Falha em 6 | Devotion 5, segundo teste, Degeneration | US3-4 |
| 14 | Recuperar Devotion | +1; cura a Degeneration do ponto | US3-6, US4-7 |
| 15 | Devotion 1 e falha | Fora de jogo | US3-7 |
| 16 | Trocar para Pelor; para Khorne; segunda troca | 4; 4 + Degeneration em 7; recusa | US3-8 |
| 17 | Degeneration Palsy | Dex −1, compra de Dex recusada | US4-1/2 |
| 18 | Palsy repetida; Horrific Nightmare; Blighted Mind; Skin Affliction | Nova rolagem; Night Terrors; derangement; −2k0 social | US4-3/4/5/6 |
