# Contract: `module/rules/builder.mjs` (puro)

| Função | Entrada | Saída | Casos |
|---|---|---|---|
| `BUILDER_STEPS` | — | lista ordenada dos 14 passos | ordem de FR-002 |
| `validateConcept` | `{ name }` | `{ ok, reasons[] }` | nome vazio → `nameRequired` |
| `validateRace` | `{ race, choice }` | idem | sem raça → `raceRequired`; raça com escolha pendente → `raceChoice` |
| `validateExaltation` | `{ exaltation, selection, race }` | idem | Paragon sem Statuesque → `exaltationChoice` |
| `validateRatings` | `{ kind, priorities, dots }` | idem + `{ spent, budget }` | Jane Física 6 / Mental 4 / Social 2 ok; 7 em Física → `budget`; 4 dots numa característica (valor 5) → `cap` |
| `validateSpecialties` | `{ finals, specialties }` | idem | especialidade em valor 3 → `specialtyLow`; duas no mesmo → `specialtyOne` |
| `availableClasses` | `{ classes, skills, feats }` | `{ uuid, allowed, reason }[]` | Monk permitido para Jane |
| `validateBackgrounds` | `{ backgrounds, wealth, artifacts }` | idem + `{ free, xp }` | 7 pontos → xp 0; 8º ponto → 50; acima de 3 → custa 100 a partir do 4º |
| `validateFeats` | `{ hindrances, assets, exaltedAsset, exaltation, race }` | idem + `{ xpGranted, xpSpent }` | 3 Hindrances → `hindranceLimit`; 2 Exalted Assets → `oneExaltedAsset` |
| `xpBalance` | `{ draft, costs }` | `{ starting, granted, spent, available }` | Jane: 600 + 200 − 200 (assets) − 550 (compras) = 50 |
| `validatePurchases` | `{ purchases, classData, values, available }` | idem | sem saldo → `notEnough`; fora da lista → `notOnList` |
| `equipmentSlots` | `{ picks, items }` | `{ slots, empty, reasons }` | item Rare na vaga Common → `wrongRarity`; artefato → `artifact`; vaga vazia → só `empty` |
| `previewCharacter` | `{ draft, race, exaltation }` | `{ characteristics, skills }` finais | Tiefling +1 escolhido entra; Statuesque entra |
| `buildPlan` | `{ draft }` | etapas em ordem (R1) | sem equipamento → etapa omitida |
