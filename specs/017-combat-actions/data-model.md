# Data Model: Ações de combate (017)

## Zona de tiro — `MeasuredTemplate.flags.dtd40k.zone`

| Campo | Tipo | Regra |
|---|---|---|
| `kind` | `"suppressing"` \| `"overwatch"` | |
| `actorUuid`, `tokenId`, `combatantId` | string | atirador |
| `weaponId` | string | arma com ROF automático |
| `attack` | `"suppressing"` \| `"burst"` | Overwatch: o que dispara |
| `trigger` | string | Overwatch: texto |
| `state` | `"placing"` \| `"active"` \| `"fired"` | placing até "Confirmar zona" |
| `pinned` | string[] | tokens que receberam Pinning na confirmação |
| `resolveOn` | `{ combatantId, round }` | Suppressing: rajada no início do próximo turno do atirador |

Template: `t: "cone"`, `angle: 45`, `distance`: alcance da arma (≤ 4×), `direction` para o primeiro alvo.
Removido depois da rajada, ao disparar/encerrar o Overwatch, ou no fim do combate.

## Grapple — efeitos de condição

- `grappling` (controlador) e `grappled` (alvo): `flags.dtd40k.grapple = { partner: <actorUuid>, controller: bool }`.
- Saem juntos (escape, incapacitado, fim do combate).

## Delay — `Combatant.flags.dtd40k.delay`

`{ round, turn }` gravado ao usar Delay; consumido por uma meia ação fora do turno; apagado no início do próximo turno.

## Cobertura — `Token.flags.dtd40k.cover` (existente, 008)

`{ ap: 4|8|12|16|32, locations: string[] }`, gravado ao ligar `inCover`, apagado ao desligar.

## Cartões

- **Pinning**: `flags.dtd40k.pinning = { actorUuid, tn, reason: "zone"|"escape", zoneId }`; botão rolar (dono ou Mestre).
- **Rajada**: `flags.dtd40k.suppression = { total, hits: [tokenUuid], … }`; por acertado Aplicar e Dodge.
- **Oposto**: `flags.dtd40k.opposed = { a: {uuid, total}, b: {uuid, total}, winner, raises, context }`.
- **Grapple**: ação de entrada no cartão de ataque (`flags.dtd40k.attack.grapple = true`).
