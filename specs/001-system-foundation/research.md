# Research — 001-system-foundation

Data: 2026-09-24. Fontes: documentação oficial do Foundry (foundryvtt.com/api, /releases,
/article/system-development), código do dnd5e 6.0.5 (v14) e do sistema l5r4 (Roll & Keep, v13).

## R1. Versão-alvo do Foundry

- **Decision (revisada em 2026-09-25)**: `compatibility.minimum = "13"`, `verified = "13"`.
  A mesa usa o Foundry **13.351** e não pretende atualizar para o v14 por enquanto.
- **Verificação**: as APIs usadas foram conferidas no código-fonte do 13.351 instalado
  (`client/`): `foundry.applications.apps.DocumentSheetConfig`,
  `foundry.applications.handlebars.loadTemplates`, `foundry.applications.sheets.ActorSheetV2`,
  ação `editImage` do `DocumentSheetV2`, `foundry.applications.api.DialogV2` (`wait`/`input`/
  `prompt`), `CONFIG.Dice.randomUniform`, `foundry.dice.terms.Die`,
  `ChatMessage.applyRollMode(chatData, rollMode)` e setting `core.rollMode`.
- **Diferença para o v14 a respeitar**: no v13 o modo de visibilidade é **`rollMode`**
  (`CONFIG.Dice.rollModes`: publicroll, gmroll, blindroll, selfroll); o v14 o renomeia para
  `messageMode`. O código usa só `rollMode`; a migração para v14 será uma feature própria.
- **Decisão anterior (descartada)**: mínimo/verificado 14 (estável atual 14.368) — trocada
  pela restrição da mesa.

## R2. Explosão de dados (Roll & Keep) — decisão central

- **Fato verificado**: o modificador `x` do Foundry **adiciona resultados separados** ao pool em
  vez de somar no mesmo dado; não existe modificador de explosão "composta" (lista de
  modificadores de `Die` no v14: cf, cs, d, dh, dl, df, even, odd, k, kh, kl, max, min, ms, r,
  rr, sf, x, xo).
- **Consequência**: a fórmula `Xd10x10kY` citada na constituição (princípio II) **não é
  correta** em geral — com `x10kY` cada explosão compete como dado próprio. O truque do l5r4
  (`XdkYx10`, manter antes de explodir) só funciona enquanto a explosão é exclusivamente no 10
  e depende de comportamento interno não verificado; quebra com "explodir em 9" (Paragon,
  Silver Bullet, Volatile — fases futuras).
- **Decision**: motor Roll & Keep **puro** (`module/rules/dice.mjs`) com gerador de números
  injetável. Ele monta cadeias de explosão por dado, soma a cadeia, aplica rerrolagem de 1s,
  regra da característica 0, mantém os Y maiores e totaliza. No Foundry, o gerador injetado é
  `CONFIG.Dice.randomUniform` (mesma fonte aleatória do core) e o resultado é convertido num
  objeto `Roll` já avaliado (termo `Die` d10 com os resultados planos) apenas para exibição,
  mensagem de chat e Dice So Nice.
- **Rationale**: controle total das regras (explosão composta, 9+ no futuro, char 0,
  especialidade, conversão >10), 100% testável com Vitest e gerador determinístico
  (constituição III), sem depender de ordem interna de modificadores do Foundry.
- **Alternatives considered**:
  1. `XdkYx10` estilo l5r4 — rejeitado (frágil, não cobre regras futuras).
  2. Subclasse de `DiceTerm` com denominação própria — adiada; útil só se quisermos notação
     `7k3` em macros/fórmulas. Pode envolver o motor puro depois.
  3. Rolar `Nd10x10` e pós-processar reconstruindo cadeias — rejeitado: a reconstrução depende
     da ordem de anexação dos resultados e complica rerrolagem de 1s.
- **Impacto na constituição**: resolvido — princípio II emendado na v1.0.1 (rolagens produzem
  objetos `Roll` do Foundry para chat e Dice So Nice; a semântica Roll & Keep vive no motor puro).
- **Risco não verificado**: montar um `Roll` já avaliado a partir de faces prontas no v14.
  A T030 começa verificando isso; **fallback**: em vez de gerar faces pelo `rng`, rolar pelo
  Foundry `new Roll("Nd10").evaluate()` em lotes (1 lote inicial + 1 lote por rodada de
  explosões/rerrolagens) e alimentar o motor puro com essas faces via um `rng` baseado em fila;
  os `Roll` avaliados vão para `ChatMessage.rolls`.

## R3. Manifesto (`system.json`)

- **Decision**: id `dtd40k`; campos: id, title, description, version, compatibility,
  authors, esmodules `["dtd40k.mjs"]`, styles, languages (en, pt-BR), `documentTypes.Actor.character`
  com `htmlFields: ["biography"]`, `grid {distance: 1, units: "m"}`,
  `primaryTokenAttribute: "hp"`, `secondaryTokenAttribute: "resolve"`, `initiative`, url,
  manifest, download.
- **Rationale**: só id/title/description/version são obrigatórios; demais seguem o padrão do
  dnd5e v14. `grid` em metros (o livro usa metros para Speed).
- **Alternatives considered**: id `dtd` — rejeitado por risco de colisão no registro de pacotes.

## R4. Modelo de dados

- **Decision**: `TypeDataModel` registrado em `CONFIG.Actor.dataModels.character`; derivados em
  `prepareDerivedData()` (não persistidos). Valor atual de HP/Resolve inicializado com o máximo
  em `Actor#_preCreate`.
- **Rationale**: padrão oficial (constituição II); derivados nunca salvos.

## R5. Ficha e diálogo

- **Decision**: `HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2)` com
  `form.submitOnChange: true`, `actions` (`rollSkill`, `rollCharacteristic`, `addSpecialty`,
  `removeSpecialty`) e `PARTS`; registro via
  `foundry.applications.apps.DocumentSheetConfig.registerSheet(Actor, "dtd40k", CharacterSheet, {types: ["character"], makeDefault: true})`.
  Diálogo de rolagem com `foundry.applications.api.DialogV2` (`input`/`wait`) e template
  Handlebars próprio.
- **Rationale**: ApplicationV2 é o caminho suportado; AppV1 está depreciado.
- **Nota**: defaults exatos de `DEFAULT_OPTIONS` no v14 não verificados — validar no quickstart.

## R6. Mensagem de chat e modo de visibilidade

- **Decision (v13)**: montar `chatData = { rolls: [roll], content, speaker, flags: { dtd40k: { test } } }`,
  aplicar `ChatMessage.applyRollMode(chatData, rollMode)` e chamar `ChatMessage.create(chatData, { rollMode })`,
  com `rollMode = game.settings.get("core", "rollMode")` (sobrescrito pelo seletor do diálogo).
  O conteúdo é renderizado de `templates/chat/roll-card.hbs` a partir do resultado estruturado.
- **Rationale**: API do v13 (verificada no 13.351). Mensagens com `rolls` são animadas pelo
  Dice So Nice automaticamente.

## R7. Iniciativa

- **Decision**: `system.json` → `"initiative": "1d10 + @characteristics.dex.value + @characteristics.cmp.value"`,
  reforçado em `CONFIG.Combat.initiative.formula` no `init`. Sem explosão (spec, Assumptions).
- **Nota**: formato de `CONFIG.Combat.initiative` no v14 não re-verificado; o campo do manifesto
  é documentado oficialmente e basta.

## R8. Característica padrão das perícias "Special"

- **Decision**: Ballistics, Brawl e Weaponry usam Dexterity como característica padrão para
  testes genéricos; o jogador pode trocar no diálogo.
- **Rationale**: o livro lista "Special" porque ataques usam perícia k perícia (feature de
  combate futura). Dexterity é o uso mais comum fora de ataques (sacar, manusear armas).

## R9. Testes

- **Decision**: Vitest (ambiente `node`) só para `module/rules/**` e `module/config.mjs`, que
  não tocam `foundry`/`game`/`CONFIG`. Aleatoriedade via gerador injetado (sequências fixas).
  UI/integração: roteiro manual em `quickstart.md`.
- **Alternatives considered**: happy-dom + stubs globais do Foundry (padrão l5r4) — desnecessário
  enquanto a lógica testada for pura.

## R10. Ferramentas

- **Decision**: `package.json` só com devDependencies: `vitest`, `eslint` (+ `@eslint/js`,
  `globals`). Sem bundler. Foundry CLI (`@foundryvtt/foundryvtt-cli`, comando `fvtt`) fica para
  a primeira feature com compêndios.

## R11. Diagnóstico — derivados não atualizavam na ficha (T019, 2026-09-25)

- **Verificado no código-fonte do 13.351** (`client/applications/api/document-sheet.mjs`):
  `_prepareSubmitData` chama `document.validate({changes: submitData, clean: true, fallback: false})`
  sobre o **formulário inteiro**; se qualquer campo for inválido, nada é salvo e o usuário vê só
  uma notificação de erro. `FormDataExtended` converte campo numérico vazio em `null`
  (`form-data-extended.mjs`, linha ~204). Na ficha antiga, apagar um campo `bonus` (não
  anulável) invalidava toda a submissão → nenhuma característica era gravada/atualizada.
- **Dados do mundo `teste-dtd`**: o ator foi criado e uma edição de Strength foi gravada, então
  a submissão funcionou ao menos uma vez; a causa exata da sessão do usuário não pôde ser
  reproduzida porque o Foundry estava com outro mundo ativo (Traveller). Não foi trocado.
- **Correções defensivas aplicadas**: (1) `sanitizeDerivedMods` na submissão (bônus vazio → 0,
  override vazio → `null`); (2) `computeDerived` tolera bônus nulo e override `""`; (3) pontos
  clicáveis atualizam via `actor.update` direto (sem depender do formulário); (4) re-render
  explícito da ficha após `updateActor` do próprio ator.
- **Pendente**: confirmar em T029 no Foundry, com o mundo `teste-dtd` ativo e o console aberto.
