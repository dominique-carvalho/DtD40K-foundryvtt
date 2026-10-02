# Data Model — 020

Sem campo novo. A compra usa a linha do log da 006:

| Campo | Valor |
|---|---|
| `type` | `"purchase"` |
| `kind` | `"exaltedAsset"` (valor novo) |
| `label` | nome do asset |
| `from` / `to` | 0 / 1 |
| `cost` | 100 |
| `itemId` | id do asset criado |

Desfazer: apaga o item `itemId` se ainda existir, ajusta os Hero Points e devolve `cost` (a linha sai do log).
