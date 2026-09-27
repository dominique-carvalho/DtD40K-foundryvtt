# Contract — Interfaces no Foundry (011)

## Pack `deities`

Item `deity`, 21 documentos em 3 pastas; OBSERVER para jogadores. Tabela "Degeneration" no pack `combat-tables`.

## `background-service` (`module/documents/background-service.mjs`)

| Função | Comportamento |
|---|---|
| `raiseBackground(actor, key, { id })` | +1 com `canRaise` e `backgroundCost` (confirmação, histórico `background`); `wealth` usa `system.wealth.value`; `id` para artefatos/backings |
| `addInstance(actor, key, name)` | novo artefato/backing com valor 1 (uma compra) |
| `setInheritancePicks(actor, picks)` | grava se `inheritanceFits` (override do Mestre) |
| `rollContacts(actor, characteristic)` | (Contacts + característica) k característica, cartão no chat |

## `alignment-service` (`module/documents/alignment-service.mjs`)

| Função | Comportamento |
|---|---|
| `setAlignment(actor, deity)` | drop: embute o deus; se já há um, pergunta e aplica `changeAlignment` |
| `rollAlignmentCheck(actor, { recover })` | diálogo (bônus, modo), 1d10 + bônus + `modifiers.alignmentCheck`; falha → Devotion −1, segundo teste, Degeneration; recover → +1 e cura |
| `applyDegeneration(actor, point)` | rola a tabela (repetidas de novo), registra e cria os efeitos |
| `cureDegeneration(actor, point)` | remove o registro e os efeitos |

## Extensões

- `xp-service`: `background` no desfazer; `canAdvance` de característica com `blocked`.
- `equipment-service.addEquipment`: vagas extras de Inheritance.
- Ficha: seção Backgrounds (aba Traits) com botões de compra no modo Evolução/criação, instâncias, Inheritance e
  Contacts; seção Alinhamento (aba Traits) com o deus, Devotion, Alignment Check, Recuperar, Degenerations por ponto,
  aviso de fora de jogo; drop de `deity`.
