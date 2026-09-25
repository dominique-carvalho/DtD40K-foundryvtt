# Contract — Módulos de regras puros (`module/rules/`)

Módulos ESM sem dependência de `foundry`, `game` ou `CONFIG` (constituição III). Todas as
funções são puras, exceto pelo gerador `rng` injetado. Cobertura obrigatória por Vitest.

## Tipos

```js
/** @typedef {{ rolled: number, kept: number, flat: number }} Pool */

/**
 * @typedef {object} NormalizedPool
 * @property {number} rolled        dados rolados finais (1–10)
 * @property {number} kept          dados mantidos finais (1–10, ≤ rolled)
 * @property {number} flat          bônus fixo total (inclui conversão acima de 10k10)
 * @property {{from: string, to: string, bonus: number} | null} conversion  ex. {from:"12k6", to:"10k7", bonus:0}
 */

/**
 * @typedef {object} DieResult
 * @property {number[]} chain       faces da cadeia, ex. [10, 10, 4]
 * @property {number} total         soma da cadeia (com regra de característica 0 aplicada)
 * @property {number[]} [rerolled]  faces descartadas pela rerrolagem de 1s
 * @property {boolean} kept
 */

/**
 * @typedef {object} TestResult
 * @property {NormalizedPool} pool
 * @property {DieResult[]} dice     ordenados como rolados
 * @property {number} keptSum       soma dos dados mantidos
 * @property {number} total         keptSum + pool.flat
 * @property {number|null} tn
 * @property {{success: boolean, raises: number, checks: number} | null} outcome
 * @property {{ zeroCharacteristic: boolean, specialty: boolean, untrained: boolean }} flags
 */
```

## `pool.mjs`

| Função | Contrato |
|---|---|
| `normalizePool({rolled, kept, flat})` → `NormalizedPool` | 1) rolled ≥ 1, kept ≥ 1, kept ≤ rolled; 2) excedente de rolados acima de 10: cada par → +1 kept (ímpar descartado); 3) após isso, excedentes acima de 10 (rolled ou kept) → +5 flat cada. Ex.: 12k6→10k7; 11k5→10k5; 15k10→10k10+25; 11k11→10k10+10; 2k3→2k2; 0k0→1k1 |
| `buildSkillPool({skill, characteristic, advanced})` → `{rolled, kept, untrained, zeroCharacteristic} \| {blocked: "advancedUntrained"}` | skill > 0: (skill+char)k char. skill = 0 e básica: (char−1)k(char−1), `untrained: true`. skill = 0 e avançada: bloqueado |
| `buildCharacteristicPool({characteristic})` → `{rolled, kept, zeroCharacteristic}` | char k char |

**Regra da característica 0** (FR-016, aplicada nas duas funções acima): se a característica
efetiva (após o −1 de "sem treino") for ≤ 0, ela conta como **1 dado rolado e 1 mantido** e
`zeroCharacteristic: true`. Ex.: perícia 2 + característica 0 → 3k1; teste de característica 0
→ 1k1; perícia básica sem treino com característica 1 → 1k1 (`untrained` e `zeroCharacteristic`).
| `applyModifiers(base, {rolled=0, kept=0, flat=0, freeRaises=0, stuntDice=0})` → `Pool` | rolled += rolled + stuntDice; kept += kept; flat += flat + 5·freeRaises. `stuntDice` limitado a 0–3 |

O sinal `zeroCharacteristic` retornado é repassado a `rollAndKeep` (ver `dice.mjs`).

## `dice.mjs`

`rollAndKeep(pool, { rng, explodeOn = 10, rerollOnes = false, zeroCharacteristic = false })` → `{ dice, keptSum, total }`

- `rng()` → número em [0, 1); face = `Math.floor(rng() * 10) + 1`.
- Para cada um dos `pool.rolled` dados: rola uma face; se `rerollOnes` e face = 1, guarda em
  `rerolled` e rola de novo uma única vez; enquanto a última face ≥ `explodeOn` e
  `!zeroCharacteristic`, rola outra e anexa à `chain`.
- `zeroCharacteristic`: toda face 10 vale 0 e não explode.
- Mantém os `pool.kept` maiores `total` (empate: ordem de rolagem); `keptSum` = soma;
  `total = keptSum + pool.flat`.

## `results.mjs`

`evaluateOutcome(total, tn)` → `null` se `tn` for nulo/vazio; senão
`{ success: total >= tn, raises: success ? ⌊(total−tn)/5⌋ : 0, checks: success ? 0 : ⌊(tn−total)/5⌋ }`.

## `derived.mjs`

`computeDerived({characteristics, size, level}, derivedMods)` → `{ staticDefense, hpMax, mentalDefense, resolveMax, speed, resilience }`
— fórmulas em [data-model.md](../data-model.md); `final = override ?? base + bonus`; resilience ≥ 1.

## `test.mjs` (orquestração pura)

`runTest({ base, modifiers, tn, specialty, zeroCharacteristic, untrained, rng })` → `TestResult`
— compõe `applyModifiers` → `normalizePool` → `rollAndKeep` → `evaluateOutcome`.

## Casos de teste obrigatórios (mínimo)

1. Exemplos de conversão do livro e casos-limite de `normalizePool` acima.
2. Explosão composta: rng gerando 10,10,4 num dado → total 24 conta como 1 dado mantido.
3. Característica 0: face 10 → 0, sem explosão.
4. Especialidade: face 1 rerrolada uma vez; nova face 10 explode normalmente.
5. `buildSkillPool` nos três ramos (treinada, básica sem treino, avançada sem treino) e a regra
   da característica 0 (perícia 2 + char 0 → 3k1; char 0 → 1k1; básica sem treino com char 1 → 1k1).
6. Raises/checks: 27 vs 15 → 2 raises; 9 vs 20 → 2 checks; 15 vs 15 → sucesso, 0 raises.
7. Derivados do exemplo Traya (data-model.md) e override/bonus.
