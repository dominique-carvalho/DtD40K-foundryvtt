# Contract — Interfaces expostas no Foundry

## Manifesto `system.json`

- `id: "dtd40k"`, `compatibility: { minimum: "13", verified: "13" }`.
- `documentTypes.Actor.character: { htmlFields: ["biography"] }`.
- `languages`: `en` (`lang/en.json`), `pt-BR` (`lang/pt-BR.json`).
- `initiative: "1d10 + @characteristics.dex.value + @characteristics.cmp.value"`.
- `primaryTokenAttribute: "hp"`, `secondaryTokenAttribute: "resolve"`, `grid: { distance: 1, units: "m" }`.
- `manifest`/`download` apontando para releases do GitHub (`dominique-carvalho/DtD40K-foundryvtt`).

## Ficha de personagem (layout híbrido A+C — FR-022 a FR-030)

| Parte (PART) | Conteúdo | Modo edição | Modo jogo |
|---|---|---|---|
| `header` (fixo/sticky) | nome, imagem, Level, Size, barras HP/Resolve, SD, MD, Resilience, Hero Points, Devotion, alternador de modo | tudo editável (exceto calculados) | HP/Resolve/Hero Points atuais editáveis |
| `characteristics` | grade 3×3: linhas Power/Finesse/Resistance × colunas Mental/Físico/Social (`CHARACTERISTIC_GRID`) | pontos clicáveis + especialidades editáveis | pontos só leitura; (US2) clique rola |
| `skills` | 3 colunas Mental/Físico/Social, marca de Avançada, característica padrão | pontos clicáveis + especialidades | busca + filtro "só treinadas"; (US2) parada XkY e clique rola |
| `footer` | Speed (m), iniciativa `1d10 + Dex + Cmp` | + ajustes do Mestre (bônus/override dos derivados) | só leitura |

- **Pontos**: 6 por item; o 6º destacado. `data-action="setDots"` com `data-path` e
  `data-value`; clicar no valor atual reduz 1.
- **Modo**: `data-action="toggleMode"`; preferência em
  `game.user.getFlag("dtd40k", "sheetModes")[actor.id]` (`"edit"` | `"play"`), padrão `"edit"` para
  proprietários; não proprietários sempre `"play"`.
- **Busca/filtro**: aplicados no cliente (ocultar linhas) sem re-renderizar.
- **Temas**: cores via variáveis do tema do Foundry v13 (claro e escuro); largura mínima 720 px.

## API pública do ator (uso em macros)

```js
// Abre o diálogo (ou rola direto com fastForward) e cria a mensagem no chat.
await actor.rollSkill("weaponry", { characteristic?: "str", fastForward?: false, tn?: 15 });
await actor.rollCharacteristic("wil", { fastForward?: false, tn?: 20 });
// Retorno: Promise<ChatMessage | null>  (null se o diálogo for cancelado ou a perícia bloqueada)
```

- Perícia avançada sem pontos: `ui.notifications.warn(game.i18n.localize("DTD.Roll.AdvancedUntrained"))`, retorna `null`.
- `fastForward`: verdadeiro quando o usuário segura Shift ao clicar (rolagem rápida, FR-019).

## Diálogo de rolagem (campos)

| Campo | Padrão |
|---|---|
| TN | 15 (vazio permitido) |
| Característica | padrão da perícia |
| Modificador de dados rolados / mantidos | 0 / 0 |
| Modificador fixo | 0 |
| Free raises | 0 |
| Stunt dice | 0 (0–3) |
| Especialidade se aplica | desmarcado (oculto se não houver especialidade) |
| Modo de rolagem | `core.rollMode` atual (`CONFIG.Dice.rollModes`: publicroll, gmroll, blindroll, selfroll) |

## Mensagem de chat

- `ChatMessage` com `rolls: [Roll]` (termo d10 com as faces planas, para Dice So Nice) e
  `content` renderizado de `templates/chat/roll-card.hbs`.
- `flags.dtd40k.test`: `TestResult` completo (ver [rules-api.md](rules-api.md)) + `{ label, actorUuid }`.
- O cartão exibe: nome do teste, parada final XkY (+flat), aviso de conversão, cada dado com
  cadeia de explosão, destaque dos mantidos, rerrolagens, total, TN e "Sucesso, N raises" /
  "Falha, N checks".

## Chaves i18n (prefixo `DTD.`)

`DTD.Characteristic.<key>`, `DTD.Skill.<key>`, `DTD.SkillGroup.<group>`, `DTD.Derived.<key>`,
`DTD.Roll.*` (Dialog, TN, Modifiers, FreeRaises, StuntDice, Specialty, Success, Failure,
Raises, Checks, Conversion, AdvancedUntrained, Untrained), `DTD.Sheet.*`.
