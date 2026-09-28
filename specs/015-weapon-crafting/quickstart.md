# Quickstart — validação da feature 015-weapon-crafting

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-015`. A feature não muda o `system.json` nem
  os packs, então basta recarregar a página; se mudar, **reiniciar o Foundry por completo**.

```bash
npm test
```

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Mestre abre o montador pelo diretório de itens | Famílias, templates, tipos e mods | US1-1 |
| 2 | Basic + Las + Extended Clip + Red-Dot Sight | Prévia 3k2 E, 40 m, pente 48, Reliable; Rare (TN 20) | US1-1 |
| 3 | Mod incompatível e repetido | Desabilitados com o motivo | US1-2 |
| 4 | Syrneth | Limite de 3 mods; escolha do tipo de dano | US1-3/4 |
| 5 | Confirmar | Item de arma com grupo Las, Basic/Ranged 2, raridade Rare, notas | US1-5 |
| 6 | Tiro simples e rajada com Red-Dot | +1k0 só no simples; nota no cartão | US2-1 |
| 7 | Melta + Breacher a curta distância | +1k0 no dano | US2-2 |
| 8 | Arma Unstable | d10 e dano ajustado no cartão | US2-3 |
| 9 | Jogador monta na aba Equipamento | Arma pendente: não equipa nem ataca | US3-1 |
| 10 | Mestre aprova para fabricar; Materiais e Fabricar | Wealth e Crafts no TN; falha repetível; pronta ao fim | US3-2/3/4 |
| 11 | Reabrir no montador e trocar um mod | Perfil e raridade atualizados | FR-003 |
