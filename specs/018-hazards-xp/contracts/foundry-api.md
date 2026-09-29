# Contract: integração Foundry (018)

## `module/documents/hazard-service.mjs` (novo)

- `openHazardTool()` → diálogo (Mestre) com os tokens selecionados: perigo (queda, sufocamento, marcha), parâmetros
  (categoria e intencional; modo; debaixo d'água) e a lista com imunes detectados (checkbox).
- `applyFall(tokens, { category, intentional })` → um cartão de dano por token (`resolve.direct`, `extraCritical`,
  `tokenUuids`) com `flags.dtd40k.fall`; botão Acrobatics (dono) quando intencional e não fatal.
- `fallAcrobatics(message)` → rola Acrobatics TN 15 do dono; atualiza o total do cartão (uma vez).
- `startHazard(kind, tokens, { mode, immune })` → cartão de intervalo.
- `hazardStep(message)` → resolve um intervalo/hora (Mestre) e atualiza o cartão.
- `endHazard(message)` → encerra ("Respirou"/"Fim da marcha").
- `openXpDialog()` → diálogo de XP (Mestre); concede por `awardXp`.

## Extensões

- `condition-service.addFatigue`: `system.fatigue.max`; Promethean não recebe Fatigue.
- `damage-service`: nada (o `resolve` já passa para `resolveDamage`).
- `dtd40k.mjs`: ferramentas `dtdHazard` e `dtdXp` nos controles de token (Mestre); `CHAT_ACTIONS`
  `fallAcrobatics`, `hazardStep`, `hazardEnd`.
