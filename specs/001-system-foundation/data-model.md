# Data Model — 001-system-foundation

Referências de regras: `docs/analise-dtd.md` §2–§3; spec FR-004 a FR-011.

## Actor `character` — `actor.system` (persistido)

| Campo | Tipo | Regras |
|---|---|---|
| `characteristics.<key>.value` | inteiro | 0–6, inicial 1 |
| `characteristics.<key>.specialties` | lista de texto | itens não vazios |
| `skills.<key>.value` | inteiro | 0–6, inicial 0 |
| `skills.<key>.specialties` | lista de texto | itens não vazios |
| `size` | inteiro | 1–10, inicial 4 |
| `level` | inteiro | 1–10, inicial 1 |
| `hp.value` | inteiro | ≥ 0 (Critical Damage é feature futura); inicial = `hp.max` na criação |
| `resolve.value` | inteiro | ≥ 0; inicial = `resolve.max` na criação |
| `fatigue.value` | inteiro | ≥ 0; inicial 0 (7.7a p. 17) |
| `heroPoints.value` / `heroPoints.max` | inteiro | ≥ 0; inicial 2 / 2 |
| `devotion.value` | inteiro | 0–10, inicial 6 |
| `derivedMods.<derivedKey>.bonus` | inteiro | inicial 0, pode ser negativo |
| `derivedMods.<derivedKey>.override` | inteiro ou nulo | nulo = sem override |
| `biography` | HTML | texto livre |

### Chaves de características (`CHARACTERISTICS` em `module/config.mjs`)

| Grupo | key | Nome |
|---|---|---|
| physical | `str` | Strength |
| physical | `dex` | Dexterity |
| physical | `con` | Constitution |
| social | `cha` | Charisma |
| social | `fel` | Fellowship |
| social | `cmp` | Composure |
| mental | `int` | Intelligence |
| mental | `wis` | Wisdom |
| mental | `wil` | Willpower |

### Grade clássica (`CHARACTERISTIC_GRID` em `module/config.mjs`)

Linhas × colunas da ficha oficial (FR-023):

| Linha | Mental | Físico | Social |
|---|---|---|---|
| `power` | `int` | `str` | `cha` |
| `finesse` | `wis` | `dex` | `fel` |
| `resistance` | `wil` | `con` | `cmp` |

### Preferência de interface (não faz parte do ator)

`game.user.flags.dtd40k.sheetModes = { [actorId]: "edit" | "play" }` — modo da ficha por usuário.

### Chaves de perícias (`SKILLS` em `module/config.mjs`)

`advanced: true` = Avançada (não rola sem pontos). Arcana = Básica (Clarifications da spec).

| Grupo | key | Característica padrão | Avançada |
|---|---|---|---|
| mental | `academicLore` | int | ✔ |
| mental | `arcana` | int | |
| mental | `commonLore` | int | ✔ |
| mental | `crafts` | wis | |
| mental | `forbiddenLore` | int | ✔ |
| mental | `medicae` | wis | ✔ |
| mental | `perception` | wis | |
| mental | `politics` | wis | ✔ |
| mental | `techUse` | int | ✔ |
| physical | `acrobatics` | dex | |
| physical | `athletics` | str | |
| physical | `ballistics` | dex¹ | |
| physical | `brawl` | dex¹ | |
| physical | `drive` | dex | |
| physical | `larceny` | dex | |
| physical | `pilot` | dex | ✔ |
| physical | `stealth` | dex | |
| physical | `weaponry` | dex¹ | |
| social | `animalKen` | cmp | |
| social | `charm` | fel | |
| social | `command` | cha | |
| social | `deceive` | cha | |
| social | `disguise` | fel | |
| social | `intimidation` | cha | |
| social | `performer` | fel | |
| social | `persuasion` | cha | |
| social | `scrutiny` | cmp | |

¹ "Special" no livro; padrão Dexterity (research R8).

## Derivados — `actor.system` (calculados em `prepareDerivedData`, não persistidos)

`derivedKey` ∈ `staticDefense`, `hpMax`, `mentalDefense`, `resolveMax`, `speed`, `resilience`, `fatigueMax`.

| Campo exposto | Fórmula base (`module/rules/derived.mjs`) |
|---|---|
| `derived.staticDefense` | 10 + 3·dex + 3·wis − 2·size |
| `hp.max` | 2·(con + wil) |
| `derived.mentalDefense` | 5 + 5·cmp |
| `resolve.max` | wil + cmp |
| `fatigue.max` | con (7.7a p. 17) |
| `derived.speed` | str + dex |
| `derived.resilience` | max(1, ⌈(size + level)/2⌉ + 1) |

Aplicação de modificadores: `final = override ?? (base + bonus)`; Resilience final nunca < 1.

**Exemplo de validação (Traya, DtD 7.7a pp. 17–18)**: str 4, dex 2, con 4, wil 4, wis 2, cmp 2, size 5,
level 1 → Static Defense 12, HP máx. 16, Mental Defense 15, Resolve 6, Speed 6, Resilience 4,
Fatigue máx. 4. (Str, Dex, Wis e Size estão no texto do exemplo; Con, Wil e Cmp saem de Fatigue 4,
HP 16 e Resolve 6.)

## Entidade transitória: Teste (não persistida no ator)

Resultado do motor, gravado em `ChatMessage.flags.dtd40k.test` — ver
[contracts/rules-api.md](contracts/rules-api.md) (`TestResult`).

## Transições de estado

- **Criação**: `hp.value ← hp.max`, `resolve.value ← resolve.max`.
- **Mudança de característica/Size/Level**: derivados recalculados; `hp.value`/`resolve.value`
  não são alterados automaticamente (dano/recuperação são features futuras).
- **Especialidade**: adicionar/remover item da lista; nenhuma regra automática de "4 pontos"
  (livro deixa ao julgamento do Mestre).
