# Quickstart — validação da feature 003-rules-7-7a-alignment

## Pré-requisitos

- Node.js 20+; Foundry VTT **v13** (13.351).
- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-003` durante a validação
  (depois do merge, voltar para a pasta principal).

## Testes automatizados

```bash
npm test
```

Esperado: todos os casos de [contracts/changes.md](contracts/changes.md) e os 77 testes da 001
(ajustados onde a regra mudou) passam.

## Roteiro manual

| # | Passo | Esperado | Spec |
|---|---|---|---|
| 1 | Ficha em modo edição, perícias físicas | Acrobatics sem `*`; Pilot com `*`; Athletics mostra Str | US1-2, US1-3 |
| 2 | Modo jogo: Acrobatics com 0 pontos e Dex 3 | Parada 2k2 e ícone de rolar (não bloqueada); cartão "sem treino" | US1-1 |
| 3 | Athletics 2 pontos, Str 4, Con 2 | Parada 6k4 | US1-3 |
| 4 | Medicae com 0 pontos | Cadeado, aviso ao tentar rolar | US1-4 |
| 5 | Diálogo: parada 5k3 + stunt 2 | Cartão mostra 7k5 | US2-1 |
| 6 | Diálogo: perícia 3 + característica 6 (9k6), modificador +2 mantidos e stunt 3 | Cartão mostra 10k10+15 e aviso de conversão 12k11 → 10k10 | US2-2 |
| 7 | Campo TN: abrir sugestões e escolher "Hard (25)" | TN = 25 em até 2 cliques | US2-3, SC-003 |
| 8 | Campo TN: digitar 18; depois deixar vazio | Aceita 18; vazio mostra só o total | US2-4 |
| 9 | Con 3 → Fatigue "0 / 3"; mudar Con para 4 | Máximo vira 4 na hora | US3-1, US3-2 |
| 10 | Modo jogo: alterar Fatigue atual para 2 | Valor salvo; negativo não aceito | US3-4 |
| 11 | Fel 3, Cmp 2 | Rodapé: iniciativa social 1d10 + 5 | US3-3 |
| 12 | Trocar idioma pt-BR ↔ en | Degraus de TN, stunt, Fatigue e iniciativa social traduzidos | SC-004 |
| 13 | Repetir o roteiro da 001 (rolagens, diálogo, modos, temas) | Sem regressões | SC-005 |

## Registro de validação

| Data | Passos | Resultado | Observações |
|---|---|---|---|
