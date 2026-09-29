# Contract: `module/rules/maneuvers.mjs` (puro)

| Função | Entrada | Saída | Casos de teste |
|---|---|---|---|
| `opposedResult(a, b)` | totais do atacante e do defensor | `{ winner: "a"\|"b", raises }` | 22 × 13 → a, 1; 13 × 13 → b, 0; 10 × 31 → b, 4 |
| `inCone({ origin, direction, angle, distance, point })` | px, graus | boolean | ponto a 45° fora; a 20° e dentro da distância dentro; além da distância fora |
| `suppressionHits({ total, targets, rof, rng })` | `targets: [{ id, sd, covered }]` | ids acertados | SD 20 e 22 com total 25 acertam, coberto não, SD 25 não (estrito); 5 elegíveis com ROF 3 → 3 sorteados |
| `pinningTn({ escape, underFire })` | | 20 ou 10 | teste inicial 20; saída sob fogo 20; saída fora 10 |
| `pinningImmune(featNames)` | | boolean | Fearless, Headstrong |
| `pushDistance({ raises, speed })` | | metros | 1 raise → 4; 5 raises com Speed 6 → 6 |
| `slipFreeTn({ bearHug })` | | 20 ou 25 | |
| `restriction({ statuses, role, action })` | condições, papel no grapple, ação | `{ allowed, reason }` | Pinned + ação completa: `pinnedFull`; Grappled + Charge: `grappled`; Grappled + Break Free ok; livre ok; Grappling + Standard Attack: `grappling` |

`rules/turn.mjs`: `useDelay(state)` / regras do Delay (consome o delay, não o estado do turno).
