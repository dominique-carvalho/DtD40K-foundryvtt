# Quickstart — validação da feature 027-builder-backing-inheritance

## Pré-requisitos

- `npm run build:packs` no worktree `DtD40K-foundryvtt-027` **com o Foundry fechado**; depois o link
  `Data/systems/dtd40k` apontando para o worktree e o Foundry aberto do zero.

```bash
npm test
```

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Backgrounds: ver a seção Backing | Texto explicativo e botão + | US1-1 |
| 2 | Adicionar "Harmonium" 2 e "Doomguard" 1, Wealth 3, Allies 1 | 7 pontos gratuitos usados, 0 XP | US1-2 |
| 3 | Subir Harmonium para 4 | XP de Backgrounds sobe conforme a regra | US1-2 |
| 4 | Remover Doomguard; adicionar um Backing sem nome | Harmonium continua; aviso de nome | US1-3 |
| 5 | Inheritance 0, passo Equipamento | Seção Inheritance só com o texto | US2-1 |
| 6 | Inheritance 2: um Rare; trocar por dois Uncommon | Linha de cada item; "Usado: 2 de 2" | US2-2/3 |
| 7 | Adicionar um terceiro Uncommon | Aviso de Inheritance; passo bloqueado; Mestre libera | US2-4 |
| 8 | Concluir com um rascunho de teste | Backings na ficha com os pontos; XP igual ao do montador; itens herdados no inventário; contagem da Inheritance na ficha | US1-4, US2-5 |
| 9 | Abrir um rascunho salvo antes da 027 | Abre sem erro, listas vazias | FR-008 |
