# Data Model — 021

Sem mudança de dados do sistema.

| Item | Onde | Valor |
|---|---|---|
| Ficha escolhida por ator | flag nativo `core.sheetClass` | `dtd40k.CogitatorSheet` ou `dtd40k.IlluminatedSheet`; vazio = padrão do mundo |
| Padrão do mundo | configuração de fichas do Foundry | `dtd40k.CogitatorSheet` (registro com `makeDefault`) |
| Ficha antiga | `dtd40k.CharacterSheet` | deixa de ser registrada para `character`; quem a tinha escolhida abre no padrão |
| Modo e aba | flags do usuário `dtd40k.sheetModes` / `dtd40k.sheetTabs` | iguais aos de hoje, valem para os dois layouts |

## Contexto `rail` (novo, só de exibição)

| Campo | Origem |
|---|---|
| `conditions[]` `{ id, label, icon }` | condições ativas do ator (008) |
| `xp` `{ available, total }` | `system.xp.totals` (006) |
| `power` `{ name, value, pool: {value, max} } \| null` | exaltação (004) |
| `tabIcons` `{ tabId: "fa-…" }` | constante da ficha |
