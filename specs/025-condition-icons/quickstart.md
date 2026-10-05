# Quickstart — validação da feature 025-condition-icons

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-025`; `npm run build:icons` e
  `npm run build:packs`; **Foundry reiniciado por completo** e o mundo aberto.

```bash
npm test
```

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | HUD de um token: abrir a lista de condições | 30 selos redondos, todos distintos, anel na cor do grupo | US1-1/2/3 |
| 2 | Ligar Stunned, On Fire, Prone e Unconscious num token | Os 4 selos sobre o token, legíveis a 20 px; os mesmos na ficha | US1-1, SC-003 |
| 3 | Marcar o token como derrotado | Sobreposição com o selo de Dead | US1-4 |
| 4 | Degeneração (Alinhamento), técnica marcial com efeito, Barrel Roll | Efeitos com os selos próprios | US2-1 |
| 5 | Equipar Power Armor e ativar uma droga do compêndio | Efeitos com o ícone do item | US2-2 |
| 6 | Mundo com condição aplicada antes da 025 → Atualizar ícones | Contagem com "efeitos"; selo novo; imagem personalizada mantida | FR-006 |
| 7 | Tema claro e escuro | Selos legíveis nos dois | SC-003 |
| 8 | `build:icons` duas vezes; zip como o da release | Sem mudanças; zip ≤ 2,5 MB | SC-004 |
