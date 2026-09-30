# Contract: integração Foundry (019)

## `module/documents/ammo-service.mjs` (novo)

- `checkAmmo(item, mode)` → `{ allowed, reason: ""|"empty"|"jammed" }` para o ataque; a recusa é do `rollAttack` (Mestre libera).
- `spendAmmo(item, mode, { rof })` → `{ spent, effectiveRof, left }` e grava `loaded`.
- `afterAttack(item, { jammed, overheats })` → grava travada / pente vazio.
- `spendLauncherAmmo(actor, ammoId)` → quantidade − 1 (apaga em 0).
- `reloadWeapon(actor, item)` → recusa sem reserva; ação do tipo do Reload; progresso; enche.
- `resetReloadProgress(actor, { except })` → zera o progresso das armas do personagem.
- `clearJam(item)` → destrava e esvazia.

## Extensões

- `attack-service.rollAttack`: antes do teste, `checkAmmo` (a menos que `preset.noAmmo`); depois, `spendAmmo`,
  `fullAutoHits` com o ROF efetivo, `afterAttack`, `spendLauncherAmmo`; cartão com os tiros restantes.
- `zone-service`: `startSuppression` gasta (`spendAmmo` auto) e guarda `zone.rof`; `resolveSuppression` usa `noAmmo` e o
  ROF da zona em `suppressionHits`.
- `turn-service.useAction`: `reload` → `reloadWeapon` (arma escolhida ou a primeira equipada com pente); `clearJam` →
  `clearJam` no sucesso; `takeAction` chama `resetReloadProgress` para ações que não são livres nem reações (exceto o Reload).
- Ficha: contadores `system.ammo.loaded`/`spare` editáveis na linha da arma; botão `reloadWeapon`.
