# Contract: `module/rules/ammo.mjs` (puro)

| Função | Entrada | Saída | Casos de teste |
|---|---|---|---|
| `tracksAmmo(weapon)` | perfil da arma | boolean | Autogun sim; espada, granada, lançador (`ammoGroup`), clip 0 não |
| `parseReload(text)` | Reload | `{ type, actions }` | "Half" half/1; "Full" full/1; "2Full" e "2 Full" full/2; "8Full" full/8; "Free" free/1; "-" e "" none/0 |
| `roundsFor({ mode, rof })` | modo, ROF automático | tiros pedidos | single 1; auto 10 |
| `spendRounds({ current, mode, rof })` | | `{ allowed, spent, left, effectiveRof }` | 30 single → 29; 19 auto ROF 10 → 9, ROF 10; 9 auto → 0, ROF 9; 0 → não permitido |
| `reloadStep({ progress, actions, spare })` | | `{ allowed, reason, progress, done }` | spare 0 → recusado `noSpare`; Full 1 ação → done; 2 Full: 0 → 1 não done, 1 → done |
