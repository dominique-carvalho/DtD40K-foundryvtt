# Quickstart — validação da feature 009-magic

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-009`; Foundry reiniciado após mudar o
  `system.json`. **Nenhum outro mundo em uso.**

```bash
npm test
```

```bash
npm run build:packs
```

Antes de registrar dados: `game.packs.get("dtd40k.spells").index.size === 126` e `combat-tables` com 24 tabelas.

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir o compêndio Spells | 126 magias, 9 pastas, 3/3/3/3/2 por escola | US1-1 |
| 2 | Abrir Magic Missile; tooltip de keyword | Dados da spec | US1-2/3 |
| 3 | Comprar Evocation 0 → 1 → 2 (Level 2, Apprentice) | 200, 100; 2 → 3 recusado | US2-1/2 |
| 4 | Escola fora da lista | Recusa; Mestre inclui | US2-3 |
| 5 | Aprender magias | Vaga 1/1; segunda recusada; nível acima recusado | US2-4/5 |
| 6 | Desfazer Evocation 2 | Valor e XP voltam; aviso de vaga | US2-6 |
| 7 | Magic Missile Unfettered / Fettered / Push 2 | 5k3 / 3k3 / 7k3 + Phenomena +20 | US3-1/2/4 |
| 8 | Unfettered com dado explodido mantido | Phenomena (+5 × nível sem Tested) | US3-3 |
| 9 | Phenomena 75+ | Perils rolados | US3-5 |
| 10 | Dano de magia | Cartão de dano com magia; Aplicar usa a Aura | US3-6 |
| 11 | Saving Throw | Botão Resistir do alvo | US3-7 |
| 12 | Agarrado + Somatic; Social em combate | Recusas | US3-8 |
| 13 | Em combate | Ação da magia gasta | US3-9 |
| 14 | Armoring Aura com 2 raises | Aura 3 no alvo | US3-10 |
| 15 | Sustentar Scry | Meia ação por turno; encerrar remove | US4-1/2 |
| 16 | Aprender e conjurar combo | 150 XP; TN maior + 5; sem Fettered; Phenomena +10 | US4-3/4 |
| 17 | Implement + Implement Focus | Reroll oferecido | US4-5 |
