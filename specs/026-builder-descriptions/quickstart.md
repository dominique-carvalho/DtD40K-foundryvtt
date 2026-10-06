# Quickstart — validação da feature 026-builder-descriptions

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-026`; **Foundry reiniciado por completo**.

```bash
npm test
```

## Roteiro manual (montando a Jane, p. 18)

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Raça: clicar em Tiefling | Painel: Dex ou Con, Intimidation e Weaponry, Size 5, Bloody Minded com o efeito, parágrafo | US2-1 |
| 2 | Exaltação: Werewolf | Painel: Feral Heart, Rage, Fast Healing, parágrafo | US2-2 |
| 3 | Classe | Cada classe com linha (papel e requisitos); Monk mostra o bloqueio e os requisitos | US2-3 |
| 4 | Backgrounds | 11 linhas descritivas (pt-BR e en) | US3-1 |
| 5 | Alinhamento: Malal | Painel com o resumo e o panteão | US2-4 |
| 6 | Assets e Hindrances | Enemy (+100 XP), Impulsive, Appearance (−100) com linha; feat racial com a raça exigida | US1-1/2 |
| 7 | Exalted Asset: Black Spiral Dancers | Painel com efeito e custo | US1-3 |
| 8 | XP: escolher feats no seletor | Descrição aparece antes de comprar; lista de compras com a linha | US1-4 |
| 9 | Equipamento: Autopistol, Flak, Stimm | Linha com dano/Pen/alcance, AP, adictividade/efeito | US3-2 |
| 10 | Trocar o idioma para pt-BR | Rótulos e backgrounds em português; descrições do compêndio em inglês | R4 |
