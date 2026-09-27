# Contract — regras puras (011)

Sem globais do Foundry. Testes em `tests/unit/backgrounds.test.mjs`, `alignment.test.mjs`, `xp.test.mjs`,
`acquisition.test.mjs`.

| Função | Entrada → saída | Casos de teste |
|---|---|---|
| `creationDots({ backgrounds, wealth })` | → pontos usados (Σ min(valor, 3)) | Contacts 3 + Wealth 2 + Fame 2 = 7; Fame 4 conta 3; artefatos somam |
| `backgroundCost({ to, dotsUsed })` | → XP | to 2, usados 5 → 0; to 2, usados 7 → 50; to 4 → 100 |
| `canRaise({ creation, isGM, to, artifactTotal })` | → `{ allowed, reason }` | fora da criação → `notCreation` (Mestre ok); artefatos 6 na criação → `artifactCap`; to 6 → `atMax` |
| `inheritanceFits(level, picks)` | → bool | 1: {uncommon 1} ok, {common 2} ok, {common 1, veryCommon 1} não; 2: {rare 1} ok, {common 2, veryCommon 4} ok, {rare 1, common 1} não; 3: {veryRare 1}, {rare 1, uncommon 1, common 2} ok |
| `alignmentCheck({ d10, bonus, devotion })` | → `{ total, pass }` | 7 vs 6 passa; 4 + 2 vs 6 passa; 3 vs 8 falha |
| `afterFailure(devotion)` | → `{ devotion, second, outOfPlay }` | 8 → 7 sem segundo; 6 → 5 com segundo; 1 → 0 fora de jogo |
| `recover({ pass, devotion })` | → `{ devotion, cures }` | passa em 5 → 6, cura 5; falha → 5, nada; 10 → 10 |
| `changeAlignment({ fromPantheon, toPantheon, devotion, changes })` | → `{ devotion, degenerationAt, refused }` | mesmo panteão 6 → 4; 2 → 1 (mín. 1); outro → 4 e 7; segunda troca → recusa |
| `degenerationRow(results, roll, owned)` | → linha ou `null` (repetida) | 5 → Palsy; 62 → Malign Sight; 100 → Blighted Mind; Palsy já tida → null |
| `canAdvance({ kind: "characteristic", blocked })` | → `degenerated` | Dex bloqueada recusa; Str ok |
| `startingSlots(items, extra)` | → vagas | extra `{ common: 2 }` → Common 4 |
