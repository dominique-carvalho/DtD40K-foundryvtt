# Data Model — 007-equipment

## Constantes (`module/config.mjs`)

| Nome | Valor |
|---|---|
| `RARITIES` | `worthless 0 · ubiquitous 2 · veryCommon 5 · common 10 · uncommon 15 · rare 20 · veryRare 25 · mythicRare 30 · nearUnique 35 · fabulousMax 40 · irrationallyExpensive 45 · glittergold 50` (ordem = degraus), cada um com `tn`, `time` (chave i18n) e `label` |
| `CRAFTSMANSHIP` | `poor −5 · common 0 · good +5 · best +10` (TN de aquisição) |
| `WEAPON_TYPES` | `melee, thrown, pistol, basic, heavy` |
| `WEAPON_PROFICIENCIES` | `Basic, Melee 1, Melee 2, Melee 3, Ranged 1, Ranged 2, Throwing` (= opções do feat da 005) |
| `DAMAGE_TYPES` | `E, X, R, I` |
| `WEAPON_QUALITIES` | 36 chaves → `{ label, hasValue, automation }` (`automation`: `attack`, `damage`, `jam`, `skill`, `parry`, `text`) |
| `ARMOR_TYPES` | `light, medium, heavy, extreme, power` (= subcategorias de Armor Proficiency) |
| `ARMOR_PIECES` | `head, body, arms, legs` |
| `HIT_LOCATIONS` | d10: `1 leftLeg · 2 rightLeg · 3–6 body · 7 gizzards · 8 leftArm · 9 rightArm · 10 head` |
| `GEAR_CATEGORIES` | `gear, cybernetic, drug, material, wonder, hearthstone` |
| `MATERIALS` | `orichalcum, mithril, darksteel, wraithbone, necrodermis` → bônus por `melee`, `ranged`, `armor` (R11) |
| `ADDICTIVITY` | `none 0 · low 10 · moderate 15 · high 20 · extreme 25` |
| `ADDICTION_LEVELS` | `0 nenhum · 1 minor · 2 moderate · 3 major` |
| `STARTING_SLOTS` | `{ rare: 1, uncommon: 1, common: 2, veryCommon: 2 }` |
| `WEALTH_STRAIN` | `1–6: 0 · 7–9: 1 · 10: 3 · 11+: 5` |

## Campos comuns (`equipment-fields.mjs`)

| Campo | Tipo | Notas |
|---|---|---|
| `description` | HTML | redação própria |
| `source` | `{ book, page }` | |
| `rarity` | chave de `RARITIES` | raridade do item (traje, para armadura) |
| `quantity` | inteiro ≥ 0, padrão 1 | doses, granadas |
| `craftsmanship` | chave de `CRAFTSMANSHIP`, padrão `common` | no personagem |
| `equipped` | booleano | arma empunhada, armadura vestida, cibernético instalado, gear em uso |
| `material` | `""` ou chave de `MATERIALS` | arma, armadura, cibernético biônico |
| `startingSlot` | `""` ou chave de `STARTING_SLOTS` | item escolhido na criação |
| `names` | string[] | nomes alternativos (descrições) |

## `weapon`

| Campo | Tipo |
|---|---|
| `weaponType` | `WEAPON_TYPES` |
| `thrown` | booleano (arma Melee que também pode ser arremessada) |
| `group` | string (Ordinary, Las, …, Unarmed) |
| `proficiencies` | string[] ⊂ `WEAPON_PROFICIENCIES` |
| `damage` | `{ rolled, kept, type }` (`type` ∈ `DAMAGE_TYPES` ou vazio) |
| `pen` | inteiro ≥ 0 |
| `rof` | `{ single: bool, auto: int }` (0 = sem full auto) |
| `range` | `{ value: m, strMultiplier: int }` (granadas: S×3 → `strMultiplier 3`) |
| `clip`, `reload` | inteiro; string (`Half`, `Full`, `2Full`, `Free`) |
| `qualities` | `[{ key, value }]` |
| `ammoGroup` | string (launchers: dano da granada/míssil escolhida) |

## `armor`

| Campo | Tipo |
|---|---|
| `armorType` | `ARMOR_TYPES` |
| `ap` | inteiro |
| `maxDex` | inteiro ou nulo (sem limite) |
| `piece` | `""` (traje) ou `ARMOR_PIECES` |
| `suitOnly` | booleano (Power: peça avulsa não funciona) |
| `primitive` | booleano (rating de artefato um degrau abaixo) |

## `gear`

| Campo | Tipo |
|---|---|
| `category` | `GEAR_CATEGORIES` |
| `effectText` | string (efeito resumido) |
| `addictivity` | `ADDICTIVITY` (drogas) |
| `active` | booleano (droga em efeito) |
| `mechadendrite` | booleano |
| `location` | `""` ou localização (membro biônico: +2 AP ali) |
| `sockets` | inteiro (encaixes de hearthstone de uma Wonder: Amulet 1, Bracers 2, Dragon Tear Tiara 3; item com material tem 1) |
| `socketedIn` | id de item do mesmo ator (hearthstone) |
| `grants` | `grantField` da 005 (Gem of the Calm Heart) |

## Personagem (`character-data.mjs`)

| Campo | Tipo | Notas |
|---|---|---|
| `wealth` | `{ value 0–5, liquid ≥ 0, strain ≥ 0, attempts: [{ key, count }] }` | `key` = nome + qualidade + peça |
| `wealth.effective` | derivado | max(0, value − strain) |
| `creation` | `{ active: bool }` | padrão `true` em ator novo |
| `addictions` | `[{ name, level 0–3 }]` | |
| `modifiers.armor` | `{ apAll, gizzards }` | alvos de efeito (Hearthstone Bracers, Bionic Heart) |
| `modifiers.rolls` | `{ all: {rolled, kept}, noExplode: bool, skills: {<key>: {rolled, kept, freeRaises}} }` | alvos de efeito |
| `armor` | derivado | `{ locations, sdPenalty, maxDex, sources }` (R3) |

## Efeitos (Active Effects nos itens do compêndio)

- `transfer: true`, `flags.dtd40k.equipment = true`; suprimidos por `DtdActiveEffect#isSuppressed` (R2).
- Exemplos: Power Armor (`system.characteristics.str.value` ADD 1, `system.modifiers.resilience` ADD 1);
  Machinator Array (Str +1, Dex −1, Resilience +1); Slaught (Dex +1); Medkit
  (`system.modifiers.rolls.skills.medicae.freeRaises` ADD 1); Stone of Healing (Medicae rolled/kept ADD 1);
  Bionic Heart (`system.modifiers.armor.gizzards` ADD 2).

## Transições

- Item: não equipado ⇄ equipado (dono); droga: `active` falso → verdadeiro ao usar a dose, volta pelo botão.
- Hearthstone: solta ⇄ encaixada (`socketedIn`), um por hospedeiro.
- Wealth Strain: 0 → penalidade (aquisição) → 0 (Mestre encerra).
- Vício: nível sobe na falha do teste; Mestre edita.
- Criação: `creation.active` verdadeiro → falso (Mestre).
