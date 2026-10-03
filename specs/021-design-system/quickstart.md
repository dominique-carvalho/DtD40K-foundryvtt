# Quickstart — validação da feature 021-design-system

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-design`, com os packs compilados; recarregar.
- Mundo Mist of Imlarin com Aldred Kain e Milton; um NPC, um veículo, uma nave e itens dos compêndios.

```bash
npm test
```

## Roteiro manual (nos dois temas do Foundry)

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir Aldred Kain | Layout Cogitador: trilho lateral, leituras, teclas, módulos, tabela | US1-1 |
| 2 | Rolar até o fim da aba e trocar de aba | Trilho com HP, Resolve, Fatigue, Hero, condições e XP sempre visível | US1-2, FR-006 |
| 3 | Rolar uma característica e uma perícia (nome e botão) | Mesma parada e diálogo de hoje; cartão no design system | US1-3, US3-1 |
| 4 | Modo Edição: nome, nível, tamanho, dots, máximos; modo Evolução: comprar | Campos e botões funcionam | US1-4 |
| 5 | Personagem com 6, bônus de raça, perícia avançada sem treino | Gema tracejada dourada; aro claro; marca e sem parada | FR-007, edge |
| 6 | Trocar tema claro ↔ escuro | Vellum ↔ Cogitator sem recarregar | US1-5 |
| 7 | Menu de ficha → Iluminura | Arco, capitular, fitas, tríptico, índice; escolha salva no ator | US2-1 |
| 8 | Na Iluminura, usar todas as abas | Mesmas funções | US2-2, SC-001 |
| 9 | Configurar fichas: Iluminura como padrão do mundo | Personagens sem escolha abrem nela; voltar para Cogitador | US2-3 |
| 10 | Ataque com dano, defesa, perigo, zona, magia, cartão de veículo e de nave | Cartões no design system; botões funcionam | US3 |
| 11 | NPC, minion, veículo, nave, itens, diálogos de rolagem e de criação | Tokens e fontes, mesmo layout, nada some | US4 |
| 12 | Desconectar a internet e recarregar | Fontes e ornamentos iguais | SC-005 |
