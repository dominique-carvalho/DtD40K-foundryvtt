# Quickstart — validação da feature 008-combat

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-008`; Foundry reiniciado após mudar o
  `system.json`. **Nenhum outro mundo em uso.**

```bash
npm test
```

```bash
npm run build:packs
```

Antes de registrar dados: `game.packs.get("dtd40k.combat-tables").index.size === 22`.

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Aplicar dano 19 Pen 2 no corpo (AP 7, Res 4) | −3 HP, conta no chat | US1-1 |
| 2 | Dano ≤ AP efetivo | Sem efeito | US1-2 |
| 3 | Tearing 13 efetivo, Res 4 | −4 HP | US1-3 |
| 4 | HP 2 recebendo 5 | HP 0, crítico 3, efeito da linha 3 e condições | US1-4 |
| 5 | Crítico acumulado 5 | Dead | US1-5 |
| 6 | Dano de magia | Aura no lugar do AP | US1-6 |
| 7 | Cobertura AP 8 | Absorve, perde 1 | US1-7 |
| 8 | Desarmado tirando HP | +1 fadiga | US1-8 |
| 9 | Jogador aplica em alvo alheio | Vai para o Mestre | US1-9 |
| 10 | Desfazer | Valores voltam | FR-004 |
| 11 | Iniciativa Dex 3, Cmp 2; empate | 1d10 + 5; desempate | US2-1 |
| 12 | Duas meias iguais; completa + meia | Recusas | US2-2/3 |
| 13 | Segunda reação | Recusa | US2-4 |
| 14 | Dodge total 18 no cartão | SD +9; acerta ou não | US2-5 |
| 15 | Full Defense | +10 SD, 3 reações até o próximo turno | US2-6 |
| 16 | All Out Attack | Sem reações | US2-7 |
| 17 | Called Shot | −2k0, localização escolhida | US2-8 |
| 18 | Duas armas + Two Weapon Fighting | 2 ataques −1k0, 1 reação | US2-9 |
| 19 | Surpresa | Pula a rodada 1; vantagem | US2-10 |
| 20 | Alvo Prone | Vantagem corpo a corpo; +1 raise à distância | US2-11 |
| 21 | Dazed; fadiga 1 e 2 | −1k0; −1k0 | US3-1/2 |
| 22 | Fadiga acima da Con | Unconscious, fadiga = Con | US3-3 |
| 23 | Stunned no turno | Aviso; Hero Point remove | US3-4 |
| 24 | On Fire e Blood Loss no fim do turno | −1 HP +1 fadiga; 1d10 | US3-5/6 |
| 25 | Dead com Hero Point | Queimar evita | US3-7 |
| 26 | Descanso | Cura conforme o estado | US3-8 |
| 27 | Helpless atacado | Acerto automático, dano duas vezes | US3-9 |
| 28 | Ataque social | Gastar Resolve ou ceder | US4-1 |
| 29 | Quinto Resolve na cena | Jaded | US4-2 |
| 30 | Refute 16 | +8 Mental Defense | US4-3 |
| 31 | Fear 2 falhado, 2 checks | Shock 1d10 + 2 aplicado | US4-4 |
| 32 | Medo fora de combate | −1k1, +1d5 Insanity | US4-5 |
| 33 | Insanity 9 → 10; 19 → 20; 100 | Trauma Test TN 12; derangement; aviso | US4-6/7/8 |
