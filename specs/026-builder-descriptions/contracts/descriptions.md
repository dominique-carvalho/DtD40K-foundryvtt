# Contrato — `module/rules/descriptions.mjs` (puro)

```js
plainText(html) → string
shortLine(html, max = 180) → string            // até o fim da 1ª frase (inclui a 2ª se a 1ª < 30), "…" se cortar
firstParagraph(html, max = 420) → string        // 1º <p> com texto, cortado como shortLine
raceFacts(system) → { key, value }[]            // characteristic, skills, chooseSkills, size, power
exaltationFacts(system) → { key, value }[]      // powerStat, resource, powers
featFacts(feat) → { xp: number|null, requires: string[] }   // xp: −100 Asset/feat, +N Hindrance
classFacts(system) → { level, skills: { keys, value }[], feats: string[] }  // o app formata "Brawl 3"
itemNumbers(item) → string                      // arma, armadura, droga, demais
```

Casos de teste (`tests/unit/descriptions.test.mjs`):
- `shortLine`: frase curta, frase longa cortada na palavra, 1ª frase curta junta a 2ª, HTML com entidades.
- `firstParagraph`: pula `<h3>`, pega o 1º `<p>`.
- `raceFacts`: Tiefling (Dex ou Con, Intimidation e Weaponry, Size 5, Bloody Minded); Human (qualquer, escolhe 2).
- `exaltationFacts`: Werewolf (Feral Heart, Rage, Fast Healing).
- `featFacts`: Enemy (+100), Appearance (−100), Outsider (Tiefling).
- `classFacts`: Mercenary (nível 1, sem requisitos); Monk (nível 3, Brawl/Acrobatics/Athletics 3, Ki Strike).
- `itemNumbers`: Autopistol, Flak, Stimm.

# Contrato — UI do assistente

- `templates/apps/builder/step.hbs`:
  - linhas `builder-desc`/`builder-facts` nas listas;
  - `.builder-detail` nos passos de cartões;
  - `data-desc` nas `<option>` de compra de feat e de equipamento, com a linha do selecionado.
- `module/apps/character-builder.mjs`: `#stepView` monta `desc`, `facts` e `detail`; `_onRender` atualiza a linha dos
  seletores sem re-renderizar.
