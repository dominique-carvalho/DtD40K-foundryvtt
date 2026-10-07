# Contrato — compêndio `setting` (028)

## `system.json`

```json
{ "name": "setting", "label": "Setting", "path": "packs/setting", "type": "JournalEntry", "system": "dtd40k",
  "ownership": { "PLAYER": "OBSERVER", "ASSISTANT": "OWNER" } }
```

## Teste `tests/unit/setting.test.mjs`

- 4 pastas `JournalEntry` e 18 diários, cada um numa pasta existente.
- As 15 esferas: Abyssal, Acheronian, Arborean, Arcadian, Baatorian, Beastlands, Bytopian, Carcerian, Celestian,
  Commorraghan, Elysian, Gehennan, Grey Waste, Mechanian, Pandemonium; cada uma com as 4 páginas na ordem.
- Página Adventure Seeds: um aviso fora do segredo e todo o resto dentro de `<section class="secret">`; nenhuma outra
  página tem segredo.
- Todo `@UUID[Compendium.dtd40k.<pack>.Item.<id>]` aponta para um documento existente em `src/packs/<pack>`, e cada
  destino aparece no máximo uma vez por página.
- Cada página tem no máximo 2 `<p>` (fora o aviso dos ganchos e a lista de facções).
- `_key` de diários, páginas e pastas no formato do CLI; ids únicos.

## Teste de ícones

- Documentos `!journal!` saem da checagem de `img` e de categoria (não têm imagem).
