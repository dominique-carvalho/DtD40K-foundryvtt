# Contract: `module/rules/xp.mjs` (puro)

## `exaltedAssetPrice({ granted, available })`

→ `{ allowed: boolean, cost: number, reason: "" | "notEnough" }`

| Caso | Entrada | Saída |
|---|---|---|
| Compra normal | `granted: false, available: 600` | `{ allowed: true, cost: 100, reason: "" }` |
| Exatamente 100 | `granted: false, available: 100` | `{ allowed: true, cost: 100, reason: "" }` |
| Sem XP | `granted: false, available: 99` | `{ allowed: false, cost: 100, reason: "notEnough" }` |
| Perfection | `granted: true, available: 0` | `{ allowed: true, cost: 0, reason: "" }` |

## `undoPlan(entry, current)`

- `kind: "exaltedAsset"` → `{ restore: null, deleteItem: entry.itemId || null, refund: entry.cost }`.
