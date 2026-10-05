# Data Model — 003-rules-7-7a-alignment

Alterações sobre o modelo da feature 001 (`specs/001-system-foundation/data-model.md`).

## Configuração pura (`module/config.mjs`)

| Item | Antes (001) | Depois (7.7a) | Fonte |
|---|---|---|---|
| `SKILLS.acrobatics.advanced` | `true` | `false` | p. 25 |
| `SKILLS.athletics.characteristic` | `"con"` | `"str"` | p. 25 |
| Perícias avançadas | 8 | 7: `academicLore`, `commonLore`, `forbiddenLore`, `medicae`, `pilot`, `politics`, `techUse` | p. 25 |
| `DERIVED_KEYS` | 6 chaves | + `fatigueMax` (7 chaves) | pp. 16–17 |
| `TN_LADDER` (novo) | — | lista ordenada de 10 degraus (abaixo) | p. 417 |

### `TN_LADDER`

| `tn` | `key` | Rótulo en | Rótulo pt-BR |
|---|---|---|---|
| 5 | `trivial` | Trivial | Trivial |
| 10 | `easy` | Easy | Fácil |
| 15 | `average` | Average | Mediano |
| 20 | `advanced` | Advanced | Avançado |
| 25 | `hard` | Hard | Difícil |
| 30 | `veryHard` | Very Hard | Muito difícil |
| 35 | `exceptional` | Exceptional | Excepcional |
| 40 | `heroic` | Heroic | Heroico |
| 45 | `neverDoneBefore` | Never Done Before | Nunca feito antes |
| 50 | `neverAgain` | Never to be Done Again | Nunca mais será feito |

Rótulos em `DTD.Roll.TNLadder.<key>`.

## Actor `character` — `actor.system`

| Campo | Tipo | Regras |
|---|---|---|
| `fatigue.value` (novo, persistido) | inteiro | ≥ 0, inicial 0; pode ficar acima do máximo |
| `fatigue.max` (novo, derivado) | inteiro | `derivedMods.fatigueMax.override ?? (con + bonus)`, mínimo 0; não persistido |
| `derivedMods.fatigueMax` (novo) | `{ bonus, override }` | mesmas regras dos demais derivados |

Atores existentes recebem `fatigue.value = 0` e `derivedMods.fatigueMax = { bonus: 0, override: null }`
pelos valores iniciais do schema ao carregar — sem migração.

## Modificadores de teste (`applyModifiers`)

| Campo | Antes | Depois |
|---|---|---|
| `stuntDice` (0–3, limitado) | `rolled += n` | `rolled += n` **e** `kept += n` |

Ordem inalterada: base → modificadores → `normalizePool` → rolagem.

**Exemplos de validação**: 5k3 + stunt 2 → 7k5; 9k8 + stunt 3 → 12k11 → 10k10 + 15.
