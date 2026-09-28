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

## Registro de validação — 2026-09-28

Foundry 13.351, mundo Mist of Imlarin, link apontando para o worktree da 015 (packs compilados no worktree). O papel do
jogador foi simulado no cliente do Mestre (`game.user.isGM` falso) para os passos 9–10.

| # | Resultado |
|---|---|
| 1 | Botão "Build a weapon" no diretório de itens; montador com 2 famílias, 4 templates à distância, 8 tipos e 46 mods |
| 2 | Basic + Las + Extended Clip + Red-Dot Sight: 3k2 E, Pen 0, S/-, 40 m, pente 48, Full, Reliable, grupo Las, Basic/Ranged 2, Rare (+2) TN 20 |
| 3 | Com 2/2 mods, 44 mods desabilitados com o motivo ("Mod limit reached." ou "A mod doesn't fit this weapon type.") |
| 4 | Syrneth: limite 3 (2/3) e escolha do tipo de dano E/R; R aplicado na prévia (3k2 R) |
| 5 | Item "Test Lasgun" criado no mundo com o perfil da prévia, raridade Rare e a montagem em `system.custom` |
| 6 | Basic + Burst Fire + Red-Dot: tiro simples 5k3 com a nota "Red-Dot Sight +1k0"; rajada 6k4 sem o bônus nem a nota |
| 7 | Melta + Breacher: dano 3k2 em alcance normal, 4k2 com a nota "Breacher +1k0" a curta distância |
| 8 | Plasma + Unstable: d10 no cartão de dano; d10 = 10 dobrou 9 → 18 (total do Aplicar 18); d10 entre 2 e 7 manteve o dano |
| 9 | Jogador monta na aba Equipamento: arma pendente com selo "Awaiting approval", equipar e atacar recusados com aviso, sem botão de aquisição |
| 10 | Ficha: jogador só vê "Open in builder"; Mestre vê Aprovar (pronta / para fabricar). Para fabricar: Crafts antes dos materiais recusado; Wealth 0 recusado sem contar tentativa; falhas de Wealth repetíveis (TN sobe como na aquisição da 007); Crafts falho mantém "Being crafted"; sucesso deixa a arma pronta |
| 11 | Reabrir no montador, trocar Extended Clip por Precise: pente 24, nota do Precise, descrição com os nomes dos mods |

Correções feitas na validação: o tipo de dano escolhido num tipo com escolha não fica na montagem de um tipo fixo; a
descrição e a ficha mostram os nomes dos mods (não as chaves); Wealth 0 não conta tentativa de materiais; linha da
arma inacabada sem o botão de aquisição; botão da ficha renomeado para "Open in builder".
