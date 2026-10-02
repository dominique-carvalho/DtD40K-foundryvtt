# Research — 020 Custo de XP dos Exalted Assets

## R1 — Preço

- **Decisão**: 100 XP fixos, de `XP_COSTS.asset` (o mesmo dos Assets comuns).
- **Por quê**: a tabela da p. 16 só tem "Buy an Asset 100"; o exemplo da p. 18 gasta 200 em Black Spiral Dancers (Exalted
  Asset) e Appearance (Asset).
- **Alternativa rejeitada**: `xpCost` do item — os packs não variam o preço e o usuário escolheu o fixo.

## R2 — O que fica grátis

- **Decisão**: só o asset concedido pela Perfection (`granted`, flag `grantedBy: "perfection"`).
- **Por quê**: a Perfection (p. 83) dá o Paragon Racial Asset como poder; as outras Paragon Assets são compradas, e a
  Perfection só libera a compra depois da criação.

## R3 — Recusas

- **Decisão**: as recusas de regra (exaltação, raça, limite, só na criação) continuam antes e, liberadas pelo Mestre,
  mantêm o preço (como `addFeat` + `priceFeat`); a falta de XP é recusada, e o Mestre pode liberar **sem custo** (como
  o `refuse` do xp-service).
- **Alternativa rejeitada**: mudar o `priceFeat` para todos os feats — fora do escopo pedido.

## R4 — Log e desfazer

- **Decisão**: linha com `kind: "exaltedAsset"` e o `itemId` do asset criado; `undoPlan` apaga o item e devolve o custo;
  o `undoXp` chama `clampHeroPoints` depois (Action Hero), como `removeExaltedAsset`.
- **Por quê**: um tipo próprio distingue a compra no log sem mudar o caminho dos feats; o desfazer reaproveita o da 006.
- A remoção pela ficha e a troca de exaltação não mexem no log (decisão do usuário): a linha desfeita depois só devolve.

## R5 — Personagens existentes

- **Decisão**: nada. Sem migração nem aviso.
