# Data Model — 006-classes-xp

## Item `class` — `ClassData`

| Campo | Tipo | Regra | Origem |
|---|---|---|---|
| `description` | HTML | resumo em inglês, redação própria | FR-001 |
| `source.book` / `source.page` | string / inteiro ≥ 1 | pp. 111–172 | constituição I |
| `level` | inteiro 1–5 | | FR-001 |
| `track` | string | nome da trilha ou "" (avulsa) | FR-001 |
| `prerequisites.skills` | lista de `{ keys: [chave de perícia] (≥ 1), value: 1–6 }` | `keys` > 1 = "A ou B" | FR-004 |
| `prerequisites.feats` | lista de strings | nomes do pack Feats | FR-004 |
| `prerequisites.schools` | lista de `{ name, value }` | só aviso | FR-004 |
| `prerequisites.text` | string | resto do texto (aviso) | FR-004 |
| `characteristics` | lista de chaves de característica | | FR-014 |
| `anyCharacteristic` | booleano | Peasant | FR-014 |
| `skills` | lista de chaves de perícia | | FR-014 |
| `feats` | lista de `{ name, subcategory, mandatory: bool, orGroup: string }` | subcategoria "" / "Any" = qualquer | FR-007 |
| `magicSchools`, `swordSchools`, `gunKata` | listas de strings | só dado | FR-001 |
| `completion.text` | HTML | bônus em redação própria | FR-010 |
| `completion.automation` | `CLASS_COMPLETION` = `none`, `hpMax`, `initiative`, `resolveMax`, `staticDefense`, `specialty`, `skillDot` | padrão `none` | FR-009 |
| `completion.value` | inteiro | +N do bônus numérico | FR-009 |
| `completion.skillGroup` | `any` \| `social` | para `specialty` | FR-009 |
| `completion.grants` | lista de concessões (005) | Druid, Techpriest | FR-009 |
| `completion.selection` | `{ skill, specialty }` | no personagem | FR-009 |
| `status` | `current` \| `completed` | no personagem; padrão `current` | FR-005, FR-008 |
| `startedAt` | inteiro | ordem de início | FR-007 |

## `CharacterData` (acréscimos)

| Campo | Tipo | Regra |
|---|---|---|
| `xp.starting` | inteiro ≥ 0, padrão 600 | editável pelo Mestre |
| `xp.log` | lista de `{ id, type: purchase\|award, kind: characteristic\|skill\|feat\|asset\|powerStat, key, label, from, to, cost, itemId, reason, user, date }` | FR-015 |
| `xp.totals` (**derivado**) | `{ total, spent, available, hindranceXp }` | FR-012 |
| `level` (**derivado quando há classes**) | maior Level de classe | FR-006 |
| `classState` (**derivado**) | `{ current: id\|null, freeStudy: bool, completed: [ids] }` | FR-007, FR-014 |

## Funções puras

- `module/rules/class.mjs`: `matchesListFeat(entry, feat)`, `classProgress`, `checkClassEntry`,
  `buildCompletionEffects`, `characterLevel(classes, stored)`.
- `module/rules/xp.mjs`: `advanceCost`, `canAdvance`, `xpTotals`, `undoPlan`.

## Ciclo de vida

```text
Compêndio classes (103, 19 pastas) ─ arrastar ─► startClass
   checkClassEntry: erro → aviso (GM confirma) · avisos (escolas/texto) → confirmar
   cria item class { status: current, startedAt }
feat criado (compra, drop, concessão) ─► DtdItem#_onCreate (autor) ─► syncClassCompletion
   classProgress(current).complete ─► status completed ─► escolha do bônus ─► efeitos + grantFeats
modo avanço ─► canAdvance ─► advanceCost × multiplier ─► saldo? ─► aplica + log
undo ─► undoPlan ─► restaura valor / apaga item ─► remove entrada do log
GM: conceder XP ─► log award · desfazer conclusão ─► status current, apaga efeitos, releaseGrants
```

## Fonte do compêndio — `src/packs/classes/`

Plano: 19 `folder-*.json` + 103 `class-<slug>.json` (`type: "class"`, `folder`, `system` completo com estado vazio:
`status: "current"`, `startedAt: 0`, `completion.selection` vazio).
