# Contract: `module/rules/creation.mjs` (puro)

| Função | Entrada | Saída | Casos de teste |
|---|---|---|---|
| `xpDots(log, kind, key)` | log da 006 | pontos comprados (soma `to − from` das compras) | Brawl 3 → 4 dá 1; prêmio não conta |
| `creationSpend(kind, source, log)` | `kind` characteristic/skill; valores `_source` | `{ byGroup: { g: spent }, byKey: { k: pts } }` | Traya: características Physical 6, Mental 4, Social 2; perícias Physical 8, Social 6, Mental 4 |
| `assignPriorities(kind, byGroup)` | gastos | `{ groups: [{ key, spent, budget }], fits, unspent }` | Traya fecha com `unspent` 0; 7/0/0 não cabe; 4/4/0 cabe (6, 4) com sobra 4 |
| `checkDots({ kind, key, to, source, log })` | mudança pedida | `{ allowed, reason: ""|"stepMax"|"budget" }` | Str 4 → 5 pela criação: `stepMax`; perícia 3 → 4: `stepMax`; 7º ponto Physical com os demais grupos cheios: `budget` |
| `ratingCaps({ exaltation, powerStat, feats })` | nome da exaltação, Power Stat, nomes de feats | `{ characteristic: { max, limit }, skill: { max, limit } }` | sem exceção 5/5; Atlantean skill 6 limit 3; Atlantean + Mark of Slaanesh limit 9; Daemonhost com Power Stat 1: 5, com 2: 6; Paragon 2: ambos 6 |
| `canReach({ to, cap, atSix })` | valor final pretendido; máximo do tipo; outras notas já em 6 | `{ allowed, reason: ""|"atMax"|"sixLimit" }` | 5 → 6 sem exceção `atMax`; quarta perícia a 6 do Atlantean `sixLimit` |
| `specialtyCheck({ ratings, specialties, extras })` | valores finais, listas guardadas, `{ expandedKnowledge, education, atlantean }` | `{ missing, excess }` | Brawl 4 sem especialidade: missing; especialidade em nota 3: excess; Education 2 cobre 2 Lores |
| `creationXp(totals, log)` | `xp.totals` | `{ total, spent, available, awards }` | Traya 800 / 750 / 50 |
| `languagesHint(int)` | Int final | quantidade (raça + Trade + max(0, Int − 2)) | Int 1 → 2; Int 4 → 4 |
| `creationChecklist(state)` | resumo + itens | `[{ key, status, detail }]` | Traya completo: todos `done` (idiomas `done` como lembrete); só raça: raça `done`, demais `pending` |

`rules/class.mjs`: `checkClassEntry({ ..., creation })` — erro `creationLevel` para `cls.system.level > 1` com
`creation` verdadeiro.

`rules/race.mjs`: `capValue(value, max)` — o chamador passa o máximo do personagem.
