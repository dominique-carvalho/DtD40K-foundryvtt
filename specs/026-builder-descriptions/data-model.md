# Data model — 026 Descrições no montador de personagem

Nada é gravado: as descrições são derivadas dos documentos dos compêndios na montagem do contexto.

## Linha de opção (contexto das listas)

| Campo | Origem |
|---|---|
| `desc` | `shortLine(system.description)` (divindade: `summary`; equipamento: `effectText` ou descrição) |
| `facts` | `featFacts` / `classFacts` / `itemNumbers`, já traduzidos: `"+100 XP · Requires: Tiefling"` |

## Painel de resumo (contexto dos cartões)

| Campo | Origem |
|---|---|
| `title` | nome da opção selecionada |
| `facts` | `[{ label, value }]` de `raceFacts` / `exaltationFacts` / `featFacts` / panteão |
| `text` | `firstParagraph(system.description)` (divindade: `summary`) |

## i18n novo

- `DTD.Background.<allies|artifact|backing|contacts|fame|followers|holdings|inheritance|mentor|status|wealth>.hint`
- `DTD.Builder.Fact.{Characteristic,Skills,ChooseSkills,Size,Power,PowerStat,Resource,Powers,Xp,Requires,Pantheon,Level,AnyCharacteristic}`
