# Data Model — 005-feats-assets-hindrances

Complementa as data-models de 001, 002 e 004. Chaves de característica e perícia de `module/config.mjs`.

## Item `feat` — `FeatData` (alterações)

| Campo | Tipo | Regra / validação | Origem |
|---|---|---|---|
| `category` | `FEAT_CATEGORIES` = `feat`, `racialFeat`, `asset`, `hindrance`, `exaltedAsset` | padrão `feat` para itens novos; `exaltedAsset` da 004 inalterado | FR-001, R1 |
| `group` | `ASSET_GROUPS` ou `""` | só `exaltedAsset` (inalterado) | 004 |
| `prerequisites.race` | string | `racialFeat`: raça exigida (nome do pack Races); `exaltedAsset` paragonRacial como na 004 | FR-002 |
| `prerequisites.exaltation`, `.deity` | string | inalterados (004) | 004 |
| `xpCost` | inteiro ≥ 0 | feat/racialFeat/asset/exaltedAsset 100; hindrance 0 | FR-002 |
| `xpGranted` | inteiro ≥ 0 | hindrance 100; demais 0 | FR-002 |
| `repeatable` | booleano | padrão `false` | FR-002, R2 |
| `featGroup.enabled` | booleano | feat de grupo | FR-002, FR-003 |
| `featGroup.options` | lista de strings | subcategorias do livro (pode ser vazia) | FR-002 |
| `requires` | lista de `{ type: "feat"\|"racePower", name }` | dependências (aviso) | FR-008, R3 |
| `automation` | `FEAT_AUTOMATION` = `ASSET_AUTOMATION` ∪ { soundConstitution, discipline, paranoia, farsighted, halflingAgility, noOneTougher, madeOfMettle, beneficialMutation, matron, sturdy, sand, nineLives, veteran, skillFocus, noisyCricket } | padrão `none` | FR-011, R4 |
| `grants` | lista de `{ name, subcategory, choose }` | concessões (R6) | FR-013 |
| `selection.subcategory` | string | obrigatória quando `featGroup.enabled` (no personagem) | FR-003 |
| `selection.characteristic`, `.characteristic2` | chave de característica ou `""` | Made of Mettle, Beneficial Mutation (≠), Veteran | FR-011 |
| `selection.skill` | chave de perícia ou `""` | Veteran, Skill Focus | FR-011 |
| `selection.specialty` | string | Skill Focus | FR-011 |

**Flags no item embutido**: `flags.dtd40k.grantedBy` — lista de ids de itens de origem no mesmo ator
(ou `"perfection"` da 004); `flags.dtd40k.purchased` — `true` quando também comprado.

## Item `race` — `RaceData` (acréscimo)

| Campo | Tipo | Regra |
|---|---|---|
| `grants` | lista de `{ name, subcategory, choose }` | Aasimar: Jaded, Fearless; Gnome: Weapon Proficiency × 7, Armor Proficiency × 5 |

## Item `exaltation` — `ExaltationData` (acréscimo)

| Campo | Tipo | Regra |
|---|---|---|
| `grants` | lista de `{ name, subcategory, choose, rank }` (`rank` 1–5) | concede quando `rank` ≤ Power Stat efetivo; Atlantean: Speak Language (Syrneth) rank 1; Promethean: Armor Proficiency × 5 rank 1 |

## Alterações em `CharacterData.modifiers`

| Campo | Tipo | Lido por |
|---|---|---|
| `resolveMax` | inteiro, 0 | `computeDerived` |
| `mentalDefense` | inteiro, 0 | `computeDerived` |
| `staticDefense` | inteiro, 0 | `computeDerived` |
| `staticDefenseCharacteristic` | `"dex"` \| `"con"`, padrão `"dex"` | `computeDerived` (ambas as fórmulas de SD) |
| `fatigueMax` | inteiro, 0 | `computeDerived` |
| `initiative` | inteiro, 0 | ficha e fórmula de iniciativa (`@modifiers.initiative`) |

Todos somados **antes** do bônus/override do Mestre (constituição IV); nunca são inputs da ficha.

## Regras de validação (puras, `module/rules/feat.mjs`)

- `fullName(feat)`: `name` + ` (subcategoria)` quando há subcategoria.
- `validateFeatSelection(feat, selection, { characteristics })`: grupo sem subcategoria → `noSubcategory`;
  característica fora das opções → `characteristic`; `characteristic2` igual à primeira → `characteristic2`;
  perícia desconhecida → `skill`; especialidade vazia no Skill Focus → `specialty`.
- `validateFeatAdd({ feat, selection, owned, race })` → `{ errors, warnings, notices }` (research R3).
- `lowestCharacteristics(characteristics)`: chaves empatadas na menor.

## Relações e ciclo de vida

```text
Compêndio feats (274, pastas)            raça / exaltação / feat com grants
   │ arrastar (dono)                         │ criado no ator
   ▼                                         ▼
addFeat ─ escolha (feat-choice) ─ cancelar ► nada    DtdItem#_onCreate (autor) ─► grantFeats(actor, origem)
   ├─ validateFeatAdd: erros → aviso (GM confirma)        ├─ resolve nomes no pack dtd40k.feats
   ├─ avisos → confirmar                                   ├─ choose → feat-choice
   ├─ já concedido? → marca purchased                      ├─ já existe? → só acrescenta a origem em grantedBy
   └─ cria item { name: fullName, selection, effects }     └─ cria item { grantedBy: [origem], effects }
removeFeat (dono; concedido só GM) ─► delete
DtdItem#_onDelete (autor) ─► releaseGrants(actor, id): tira id de grantedBy; apaga órfãos não comprados
```

Invariantes: nenhum `fullName` duplicado por categoria (exceto confirmação do Mestre); no máximo 2
hindrances (idem); todo item com `grantedBy` não vazio tem as origens presentes no ator.

## Fonte do compêndio — `src/packs/feats/`

Plano. Pastas `!folders!` (Feats, Racial Feats, 16 subpastas de raça com `folder` = Racial Feats, Assets,
Hindrances) e 274 JSON `type: "feat"` com `folder`, `system` completo e `selection` vazio.
