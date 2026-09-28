# Quickstart — validação da feature 013-vehicles

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-013`; mundo relançado após mudar o
  `system.json`. **Nenhum outro mundo em uso.**

```bash
npm test
```

```bash
npm run build:packs
```

Antes de registrar dados: `vehicle-components` com os componentes e armas em 8 pastas e `vehicles` com 16 atores.

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir Vehicle Components | Pastas e contagens da spec; Wheeled, Standard Frame, AC/2 | US1-1 |
| 2 | Abrir Vehicles | 16 veículos; Basic Ground Vehicle com os stats | US1-2 |
| 3 | Montar o carro (orçamento 50) | 50/50 VP, 8/8 slots | US2-1 |
| 4 | Componente a mais | Aviso de slots | US2-2 |
| 5 | Duas trações | Troca com meia ação; DR e perícia mudam | US2-3 |
| 6 | Veículo do livro fora do orçamento | Aviso; valores do livro | US2-4 |
| 7 | SD com Momentum 0 e 1 | −6; 2 | US3-1 |
| 8 | Move e fim de turno sem mover | Momentum 3 e alcance; depois 0 | US3-2 |
| 9 | Punch It Boost (Acc 2) | Momentum +3; ação completa | US3-3 |
| 10 | Skirmish com artilheiro | Parada do artilheiro sem feats; dano com +10 sem Força | US3-4 |
| 11 | Evasive Maneuvers | Metade do teste soma à SD | US3-5 |
| 12 | Ramming | 7k3+4 nos dois; Control Test ou Out of Control | US3-6 |
| 13 | Control Test falhado (10) | Turn Over | US3-7 |
| 14 | Quinto ferimento na cena | Crítico de veículo | US3-8 |
| 15 | 0 HP | Destruído | US3-9 |
| 16 | Jury Rig com 2 raises | +3 HP temporários, uma vez | US3-10 |
| 17 | Perseguição de 4 rodadas | Pernas, obstáculo +2 raises, perícia repetida −2 checks, vencedor | US4-1/2 |
| 18 | Punch It com stunt 2 e Barrel Roll | Reação extra | US4-3 |
| 19 | Reparo | 1 dia; 1k1 × 5 | US4-4 |
