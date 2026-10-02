# Contract: integração Foundry (020)

## `module/documents/xp-service.mjs`

- `priceExaltedAsset(actor, asset, { granted })` → `{ ok: boolean, cost: number }`
  - Perfection: `{ ok: true, cost: 0 }`, sem diálogo.
  - Sem XP: aviso `DTD.XP.Error.notEnough`; jogador → `{ ok: false }`; Mestre confirma a liberação → `{ ok: true, cost: 0 }`.
  - Com XP: confirmação `DTD.XP.BuyConfirm`; cancelada → `{ ok: false }`.
- `undoXp`: `exaltedAsset` entra na lista que não avisa "RefundOnly"; depois de apagar o item, `clampHeroPoints`.

## `module/documents/asset-service.mjs`

- `addExaltedAsset(actor, assetItem, { granted })`: depois das checagens (e da liberação do Mestre), `priceExaltedAsset`;
  se `ok`, cria o asset; se `cost > 0`, `recordEntry({ kind: "exaltedAsset", label, from: 0, to: 1, cost, itemId })`.
