# Contract: integração Foundry (017)

## `module/documents/zone-service.mjs` (novo)

- `placeZone(actor, weaponId, kind, { attack, trigger })` → cria o template cone e posta o cartão da zona com
  "Confirmar zona" (Suppressing Fire) ou "Disparar" (Overwatch).
- `confirmZone(message)` → tokens no cone; Suppressing Fire: cartões de Pinning, `state: "active"`, `resolveOn`.
- `tokensInZone(template)` → tokens cujo centro está no cone.
- `resolveSuppression(zone)` (chamado no `startOfTurn` do atirador) → rolagem do Full Auto Burst, `suppressionHits`,
  cartão com Aplicar/Dodge por acertado; apaga o template.
- `fireOverwatch(message)` → dispara o ataque escolhido e encerra; `endOverwatch(actor)` → apaga a zona.
- `rollPinning(message)` → teste de Willpower do dono do alvo; falha aplica `pinned`.
- `activeZoneAt(token)` → se o token está numa zona ativa (TN da saída do Pinned).
- `clearZones(combat)` → no fim do combate.

## `module/documents/maneuver-service.mjs` (novo)

- `opposedTest(a, b, { kindA, keyA, kindB, keyB, bonusA, bonusB, label })` → rola os dois, posta o cartão oposto e
  devolve `{ winner, raises }`.
- `useManeuver(actor, key)` → Bull Rush, Knock Down, Disarm, Feint contra o alvo marcado.
- `startGrapple(message)` → do cartão de ataque (acerto): aplica Grappling/Grappled.
- `controlGrapple(actor)` → diálogo de opções, Strength oposta, efeito.
- `escapeGrapple(actor, mode)` → Break Free, Slip Free, Take Control.
- `endGrapple(actor)` → tira as duas condições.

## `turn-service` (extensões)

- `useAction`: recusas por `restriction` (Mestre libera); Grapple ataca com Brawl desarmado; Suppressing Fire e Overwatch
  chamam `placeZone`; ações opostas chamam `useManeuver`; ações do grapple chamam o maneuver-service; Delay grava o flag.
- `takeAction`: consome o Delay fora do turno; qualquer ação ou reação encerra o Overwatch do personagem.
- `startOfTurn`: resolve as zonas de Suppressing Fire do combatente; apaga o Delay; encerra o Overwatch expirado.
- `endOfTurn`: Pinned → cartão de saída com `pinningTn`.

## Condições

`grappling` (novo), `inCover` (novo, diálogo de AP e locais, `Token.flags.dtd40k.cover`).

## Chat

`CHAT_ACTIONS`: `confirmZone`, `fireOverwatch`, `rollPinning`, `suppressionDodge`, `startGrapple`, `grappleDamage`.
