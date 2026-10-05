# Research — 024 Ícones próprios dos compêndios

## R1 — Fonte e versionamento dos glifos

- **Decisão**: glifos do repositório `game-icons/icons` no GitHub (4.239 SVG, uma pasta por autor; licença CC BY 3.0,
  alguns autores CC0, ver `license.txt` do repositório). `scripts/fetch-glyphs.mjs` (ferramenta de desenvolvimento, com
  rede) baixa **só os glifos citados na curadoria** de `raw.githubusercontent.com/game-icons/icons/master/<autor>/<nome>.svg`
  para `src/icons/glyphs/<autor>/<nome>.svg`, que ficam versionados. A geração dos ícones não usa rede.
- **Racional**: reprodutível offline (FR-007), diff legível, só o necessário no repositório.
- **Alternativas**: baixar o zip completo (≈4 MB de glifos sem uso no repositório); usar o site game-icons.net (exige
  escolher cor de fundo e baixa o quadrado preto, que teríamos de remover).

## R2 — Formato e composição do ícone

- **Decisão**: SVG autocontido, `viewBox="0 0 100 100"`, `width`/`height` 512 (o Foundry rasteriza o SVG do token no
  tamanho intrínseco; sem tamanho, o token fica borrado). Camadas: octógono de ferro `#1c2124`; aro de latão `#c09a48`
  (2,5); filete interno na cor da categoria (1, opacidade 0,55); quatro rebites de latão; glifo do game-icons (só os
  `path` de preenchimento branco, sem o quadrado de fundo) em `translate(23 23) scale(.105)` na cor da categoria.
- **Racional**: é a placa da prévia aprovada (opção A); o fundo embutido garante leitura nos dois temas e fora das fichas.
- **Alternativas**: WebP/PNG rasterizado (mais pesado e borrado em telas densas); SVG com `currentColor` mudando por
  tema (não funciona em `<img>` nem no token).

## R3 — Paleta por categoria

Só cores de `styles/tokens.css` (tema escuro, onde a placa vive):

| Cor | Token | Categorias |
|---|---|---|
| `#c8372f` | `--dtd-seal` | armas (corpo a corpo, fogo, de veículo e de nave), Hindrances, NPCs e Minion Squads |
| `#e0963a` | `--dtd-warning` | drogas, tabelas de rolagem |
| `#62f08f` | `--dtd-phosphor` | cibernéticos, componentes de veículo e de nave, veículos, naves |
| `#e2bd66` | `--dtd-brass-bright` | magias, divindades, exaltações, Exalted Assets, artefatos (hearthstones, wonders, materiais) |
| `#c09a48` | `--dtd-brass` | equipamento geral, classes, escolas marciais |
| `#e8dfca` | `--dtd-ink` | raças, feats, Assets, feats raciais |
| `#b3a88f` | `--dtd-ink-muted` | armaduras e escudos |

- **Racional**: sete cores bastam para separar os grandes grupos; tudo fica na identidade da 021.
- **Alternativa**: uma cor por compêndio (15 cores, várias fora da paleta).

## R4 — Curadoria de um glifo por item

- **Decisão**: `src/icons/curation.json` mapeia `<pack>/<tipo>/<nome>` → `<autor>/<glifo>`; `src/icons/categories.json`
  define cada categoria (cor, glifo padrão, pasta) e as regras que levam um documento a ela (pack, tipo, `system.category`,
  `weaponType`…). A curadoria é montada em duas etapas:
  1. `scripts/suggest-glyphs.mjs` (desenvolvimento) propõe candidatos por palavras do nome contra os nomes dos glifos
     (com sinônimos por categoria: pistol → revolver/pistol-gun, lasgun → laser-blast…), gravando a sugestão;
  2. revisão categoria por categoria (nome → glifo), registrando em `curation.json` só as escolhas finais. Itens sem
     glifo próprio ficam com o padrão da categoria e entram em `specs/024-compendium-icons/pendencias-curadoria.md`.
- **Racional**: 1.249 + 328 documentos tornam a escolha à mão sem apoio lenta e inconsistente; a sugestão acelera e a
  revisão mantém a qualidade (SC-002, SC-003).
- **Alternativas**: só por subcategoria (rejeitado pelo usuário); IA gerando glifos (estilo e licença incertos).

## R5 — Caminhos e nomes dos arquivos

- **Decisão**: `assets/icons/<categoria>/<slug>.svg`, slug do nome em kebab-case ASCII; se dois documentos da mesma
  categoria tiverem o mesmo slug e glifos diferentes, o segundo recebe `-<pack>`. Documentos que resolvem para o mesmo
  glifo e categoria compartilham o arquivo. `img` nos packs: `systems/dtd40k/assets/icons/<categoria>/<slug>.svg`.
  Padrões por tipo em `assets/icons/defaults/<tipo>.svg`.
- **Racional**: caminhos estáveis (SC-005) e legíveis; compartilhar reduz o pacote (SC-006).

## R6 — Aplicação nos packs

- **Decisão**: `scripts/build-icons.mjs` lê `src/packs`, resolve categoria e glifo de cada documento e dos itens
  embutidos nos atores (mesmo nome e tipo de um item de compêndio → mesmo ícone, FR-005), escreve os SVGs e atualiza
  `img` (e `prototypeToken.texture.src` dos atores) nos JSON. Idempotente: só reescreve o que muda. `npm run build:icons`
  antes de `npm run build:packs`. As funções puras ficam em `scripts/lib/icons.mjs` (testadas).
- **Racional**: os JSON de `src/packs` são a fonte (constituição V); os SVGs gerados são versionados porque o sistema
  roda sem etapa de build (restrições técnicas).

## R7 — Ícones padrão no mundo

- **Decisão**: `DtdItem.getDefaultArtwork(itemData)` e `DtdActor.getDefaultArtwork(actorData)` devolvem o padrão do
  tipo (e da categoria, para `gear`, `feat`, `vehicleComponent`, `shipComponent`) a partir de um mapa em `module/config.mjs`
  (`DTD.ICONS`); para atores também a textura do token. Os serviços que criam itens com `icons/svg/*` (degeneração,
  ataques e técnicas das escolas marciais, esquadrão, arma criada, manobra de veículo, retrato do montador) passam a
  usar o mapa.
- **Racional**: API nativa do Foundry 13 (`static getDefaultArtwork`, constituição II); um só mapa.

## R8 — Atualizar documentos já no mundo

- **Decisão**: menu do Mestre em Configurações do sistema ("Atualizar ícones") que monta um plano e pede confirmação
  com as contagens. Entram itens e atores do mundo, e itens embutidos em atores, cuja origem
  (`_stats.compendiumSource`) é um compêndio `dtd40k.*` e cuja imagem ainda é do Foundry (`icons/`); a imagem nova vem do
  índice do compêndio de origem. Para atores, também o token do protótipo quando ele ainda usa imagem do Foundry; tokens já
  colocados em cenas não mudam. A montagem do plano é pura (`module/rules/icons.mjs`).
- **Racional**: o Mestre decide (constituição IV); só toca no que é claramente o ícone antigo, preservando imagens
  personalizadas (FR-010).
- **Alternativa**: migração automática ao abrir o mundo (mexe em dados sem o Mestre pedir).

## R9 — Créditos e release

- **Decisão**: `CREDITS.md` gerado pelo `build-icons` com a lista de autores dos glifos usados e a licença; seção curta
  no README apontando para ele. O workflow de release passa a incluir `assets` e `CREDITS.md` no zip.
- **Estimativa de tamanho**: ~1.000 SVG distintos × ~2,5 KB ≈ 2,5 MB descomprimidos; SVG comprime ~3–4× no zip,
  ≈ 0,7 MB a mais (SC-006: até ≈2,4 MB no total).
