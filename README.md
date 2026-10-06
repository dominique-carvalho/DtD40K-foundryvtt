# DtD40K-foundryvtt

Sistema de jogo **não oficial** para [Foundry VTT](https://foundryvtt.com/) do RPG
*Dungeons the Dragoning* (LawfulNice), revisão **7.7a** — um sistema **Roll & Keep** com d10.

> Projeto de fã. As descrições exibidas são resumos com redação própria; nenhum texto integral
> do livro é reproduzido.

## Recursos (versão 0.5.0)

- **Ficha de personagem** no layout clássico da ficha oficial, com três modos:
  - **Edição** — características na grade 3×3 (Power / Finesse / Resistance × Mental / Físico /
    Social) e 27 perícias em 3 colunas, com pontos clicáveis, especialidades e ajustes do Mestre
    (bônus e substituição dos valores derivados).
  - **Jogo** — cabeçalho fixo com HP, Resolve, defesas e Hero Points; perícias com busca e filtro
    "só treinadas"; clique para rolar, com a parada (ex.: `6k3`) ao lado de cada item.
  - **Evolução** — como o modo Jogo, com um botão `+custo` em cada característica, perícia e no Power
    Stat para comprar com XP (sem cobrança no modo Edição).
- **Valores derivados** calculados automaticamente: Static Defense, Hit Points, Mental Defense,
  Resolve, Speed, Resilience e Fatigue máxima; iniciativas de combate e social no rodapé.
- **Rolagem Roll & Keep**: 10 explode e soma no mesmo dado, conversão acima de 10 dados, perícia
  sem treino, característica 0, raises e checks, cartão no chat e suporte ao Dice So Nice.
- **Diálogo de rolagem**: TN, troca de característica, modificadores, free raises, stunt (+1k1/+2k2/+3k3),
  especialidade (rerrola 1s) e modo de rolagem. **Shift + clique** rola direto.
- **Raças**: compêndio *Races* com as 16 raças da 7.7a. Arrastar uma raça para a ficha aplica
  Size e bônus como Active Effects (com escolha da característica), poderes simples automatizados
  e contador de usos por cena; aba *Traços* com o poder, os modificadores (o Mestre liga/desliga)
  e um ícone "i" com descrição e ambientação.
- **Exaltações**: compêndio *Exaltations* com as 9 exaltações da 7.7a e *Exalted Assets* com os
  75 assets (em pastas por grupo). Arrastar uma exaltação para a ficha cria o Power Stat (teto =
  Level), a reserva do recurso com o máximo calculado, os poderes liberados por ponto, o limite de
  gasto por rodada, a Tell da cena e as escolhas do Paragon e do Dragonblooded; assets validam
  exaltação, raça e o limite de um (exceto Paragon), com efeitos simples automatizados, e custam 100 XP
  (o da Perfection é grátis), com desfazer pelo histórico de XP.
- **Feats, Assets e Hindrances**: compêndio *Feats* com as 274 entradas do cap. 7 da 7.7a (181 feats, 49
  feats raciais por raça, 22 assets e 22 hindrances). Arrastar para a ficha pede a subcategoria dos feats de
  grupo, confere repetição, raça, dependências e o limite de 2 hindrances (o Mestre pode incluir mesmo
  assim), aplica 15 efeitos simples como modificadores desligáveis e concede automaticamente os feats que
  raças, exaltações e assets dão — removidos junto com a origem.
- **Classes e XP**: compêndio *Classes* com as 103 classes do cap. 6 da 7.7a (18 trilhas e 13 avulsas).
  Arrastar uma classe para a ficha confere Level e pré-requisitos (o Mestre pode iniciar mesmo assim); a aba
  *Classe e XP* mostra o progresso nos feats obrigatórios, conclui a classe com o bônus (os simples como
  modificadores desligáveis, feats concedidos) e deriva o Level da classe mais alta. O modo **Evolução**
  compra características, perícias, feats e Power Stat com os custos da 7.7a, restritos às listas da classe
  (Free Study em dobro), com histórico de XP, prêmios do Mestre e desfazer.
- **Equipamento**: compêndio *Equipment* com os 170 itens dos caps. XIII e XIV da 7.7a (armas, armaduras, gear,
  cibernéticos, drogas, materiais mágicos, Wonders e Hearthstones). Aba *Equipamento* com inventário e itens
  equipados: armadura dá AP por localização e aplica a penalidade de proficiência e o Max Dex; armas rolam ataque
  (perícia + Level se proficiente) e dano com diálogo de alcance, mira e modo de tiro, qualidades, emperramento e
  localização; efeitos de itens só valem equipados (desligáveis pelo Mestre). Aquisição pelo teste de Wealth com
  qualidade, tentativas, Liquid Wealth e Wealth Strain; vagas do equipamento inicial; drogas com doses e vício;
  materiais mágicos e encaixe de hearthstones.
- **Combate**: aba *Combate* com as 38 ações do cap. XVII (turno controlado: ação completa ou duas meias diferentes,
  livres e 1 reação por rodada), condições da 7.7a como status effects com efeitos numéricos, Critical Damage,
  ferimentos, fadiga, descanso e Hero Point contra a morte. O cartão de dano ganha **Aplicar** (cobertura, AP − Pen,
  Resilience, HP e críticos das 20 tabelas do compêndio *Combat Tables*, com Desfazer); o cartão de ataque ganha
  Dodge e Parry; iniciativa com o desempate do livro; combate social (Resolve, Jaded, Refute), testes de medo com a
  Shock Table e insanidade com Trauma Test e derangements.
- **Magia**: compêndio *Spells* com as 126 magias do cap. VIII em 9 escolas; escolas compradas com XP no modo Evolução
  (lista da classe, teto no Level) e cada ponto libera uma magia; aba *Magia* com Focus Power (Fettered, Unfettered,
  Push), keywords, dano de magia contra Aura, resistência do alvo, efeitos simples, Psychic Phenomena e Perils of the
  Warp rolados e aplicados, magias sustentadas cobradas no turno, Spell Combos e Implement Focus.
- **Sword Schools e Gun Kata**: compêndio *Martial Schools* com as 9 Sword Schools e os 6 Gun Kata dos caps. IX–X;
  escolas compradas com XP (lista da classe, teto no Level), Martial Adept e Gunslinger Level, passivas numéricas como
  efeitos; aba *Marcial* com o montador de Special Attacks e Trick Shots (orçamento de Style Points, 50 XP por ponto)
  e o uso em combate: restrições de uso, teste de perícia, bônus de ataque/dano/Pen, qualidades e efeitos no alvo.
- **Backgrounds e Alinhamento**: os 11 Backgrounds na aba *Traços* com 7 pontos de criação e XP 50/100 (só na
  criação), Artifact e Backing nomeados, Wealth da aquisição, Inheritance somando itens iniciais e rolagem de Contacts;
  compêndio *Deities* (21 deuses em 3 panteões) arrastado para a ficha; Alignment Check, recuperar Devotion, troca de
  alinhamento e Degeneration rolada, registrada por ponto de Devotion e com efeitos aplicados.
- **NPCs e Minions**: atores NPC com o bloco do livro (valores como impressos), armas embutidas no ataque/dano/Aplicar,
  condições, turno e magia; traits automatizados (armadura, Aura, Regeneration, Fear, Amorphous, Mindless, Undead,
  Caster); compêndio *Antagonists* com as 47 fichas e 4 Minion Squads; squads com ataque (minions)k(TR), dano
  5 × (DR + raises), baixas no Aplicar e bônus de minions aliados a um herói.
- **Veículos**: compêndio *Vehicle Components* (componentes e 27 armas de veículo do cap. XV em 8 pastas) e *Vehicles*
  (16 veículos de exemplo); ator de veículo montado por arraste com orçamento em VP, slots e avisos, tração ativa e
  tripulação ligada a personagens e NPCs; ações de veículo pelo turno de quem age (Move, Punch It com stunts, Skirmish
  e Barrage com a perícia do atirador, Evasive Maneuvers, Ramming, Jury Rig), Control Test e Out of Control, dano pelo
  Aplicar com críticos de veículo e explosão, perseguições por cartão de chat e ciclo de reparo.
- **Naves**: compêndio *Ship Components* (cascos, bases customizáveis, oficiais, consoles, escudos, armas e torpedos do
  cap. XVI) e *Ships* (6 naves de NPC); montador com BP por Holdings, customização, slots e avisos, oficiais ligados a
  personagens e NPCs; combate de naves no tracker (uma manobra e uma ação por departamento, Crew comprometida por
  rodada, dados mantidos pelo oficial), ataques e Aplicar de nave (escudo, Disruption, Hull e Crit Chart), Evasive,
  ramming e abordagem; caças, bombardeio, viagem pelo Warp com encontros, hangar de veículos e reparos.
- **Criação de armas**: montador (templates, tipos e mods do Story Master) com prévia do perfil, raridade e TN; armas
  de jogador aguardam a aprovação do Mestre e podem ser fabricadas (materiais por Wealth, depois Crafts); Red-Dot Sight,
  Motion Predictor, Breacher, Nonlethal, Unstable e Orgone Array entram no ataque.
- **Criação guiada**: painel na ficha durante a criação com os pontos 6/4/2 e 8/6/4 (máx. 4 e 3), XP inicial,
  especialidades e checklist das etapas; máximo 5 nas notas (6 pelas exceções do livro); classe de nível 1, Assets e
  Hindrances só na criação; encerrar pede confirmação quando falta algo.
- **Ações de combate**: Suppressing Fire e Overwatch com a zona de 45° como template no mapa, testes de Pinning pelo
  cartão e a rajada no início do turno do atirador; testes opostos (Bull Rush, Knock Down, Disarm, Feint); Grapple
  completo com as opções de cada lado; Delay fora do turno; condição Em cobertura com o AP da cobertura.
- **Perigos e XP**: ferramentas do Mestre para queda (dano direto, Critical Damage da queda fatal, Catfall e
  Acrobatics), sufocamento e marcha forçada por intervalo com imunes detectados, e XP para o grupo pela tabela de
  Encounter Difficulty ou por sessão.
- **Munição**: tiros no pente e pentes de reserva por arma, gasto por tiro, rajada (ROF efetivo com o que restar) e
  Suppressing Fire, lançadores gastando a granada ou o míssil, recarga pelo tempo da arma com progresso, emperrar
  travando a arma até o Clear Jam.
- **Traits de NPC no mapa e no turno**: Flyer voa por padrão e cai se ficar Stunned, Unconscious ou Prone; Phasing
  incorpóreo atravessa paredes e só sofre dano de magia ou Power Field; Dark Sight dá visão no escuro e ignora a
  escuridão (+5 SD); Crawler ignora terreno difícil; Auto-Stabilized faz Full Auto Burst como meia ação; aviso de
  alcance com elevação. Habilidades de ataque rolam pela ficha (Mind Blast em cone, Frightful Presence, calor do
  Elemental, Gauss Weapon, Possession); Minion Squads agem no turno; formas alternativas (Warform, composição do
  Elemental), Resource Stat e editores na aba Antagonista.
- **Montador de personagem**: botão "Novo personagem" na aba de atores abre um assistente na ordem do livro
  (conceito, raça, exaltação, características e perícias por prioridade, especialidades, classe, backgrounds,
  divindade, Assets e Hindrances, Exalted Asset, XP inicial, equipamento por raridade), com resumo lateral, bloqueio
  das escolhas fora da regra (o Mestre libera) e rascunho salvo. Cada escolha traz uma descrição curta: linha com XP e
  requisitos nas listas (Assets, Hindrances, classes, feats, backgrounds, equipamento) e painel com os fatos principais
  da raça, exaltação, divindade e Exalted Asset selecionados, para não precisar consultar o livro. Jogadores sem permissão de criar atores têm o
  personagem criado pelo Mestre conectado.
- **Visual Scriptorium Machina**: ficha de personagem em dois layouts, Cogitador (padrão: trilho lateral com os
  recursos sempre à vista) e Iluminura (página de códice), escolhidos no menu de ficha; cartões de chat com dados em
  facetas de d10; variantes clara (pergaminho) e escura (cogitador) que seguem o tema do Foundry; fontes livres
  empacotadas. Detalhes em `docs/design-system.md`.
- **Ícones próprios**: todos os itens, atores e tabelas dos compêndios têm ícone na placa Cogitador (octógono de ferro,
  aro de latão e glifo na cor da categoria); itens e atores criados no mundo nascem com o ícone do tipo, e o Mestre
  atualiza os documentos antigos do mundo em Configurações → Ícones dos compêndios. As 30 condições e os efeitos do
  sistema usam um selo redondo (disco de ferro, anel na cor da gravidade: dano, incapacidade, restrição, postura
  favorável); os efeitos dos itens usam o ícone do item.
- Interface em **português (pt-BR)** e **inglês**.

## Requisitos

- Foundry VTT **v13** (testado no 13.351).

## Instalação

### Pelo manifesto

Em *Game Systems → Install System*, cole o endereço do manifesto:

```text
https://github.com/dominique-carvalho/DtD40K-foundryvtt/releases/latest/download/system.json
```

O manifesto aponta sempre para a release mais recente; o Foundry avisa quando há atualização.

### Local (desenvolvimento)

Crie um *junction* da pasta do repositório para `Data/systems/dtd40k` (não exige administrador):

```powershell
New-Item -ItemType Junction -Path "$env:LOCALAPPDATA\FoundryVTT\Data\systems\dtd40k" -Target "C:\caminho\para\DtD40K-foundryvtt"
```

Reinicie o Foundry: **Dungeons the Dragoning** aparece em *Game Systems*.

## Desenvolvimento

Requer Node.js 20+.

```bash
npm install
```

```bash
npm test
```

```bash
npm run lint
```

```bash
npm run test:coverage
```

Estrutura principal:

| Caminho | Conteúdo |
|---|---|
| `module/config.mjs`, `module/rules/` | Regras puras (sem Foundry), cobertas por testes Vitest |
| `module/data/`, `module/documents/` | Modelos de dados (personagem, raça), documentos `Actor`/`Item` e serviço de raça |
| `module/dice/` | Adaptador de rolagem (Roll do Foundry, chat, Dice So Nice) |
| `module/apps/` | Fichas de personagem e de raça (ApplicationV2) e diálogo de rolagem (DialogV2) |
| `templates/`, `styles/`, `lang/` | Handlebars, CSS e traduções |
| `src/packs/`, `scripts/` | Fonte JSON dos compêndios e scripts de build/extract |
| `specs/`, `docs/` | Especificações (Spec Kit) e análise das regras |

O desenvolvimento segue o fluxo [Spec Kit](https://github.com/github/spec-kit) e a constituição
em `.specify/memory/constitution.md`. A referência de regras é a **DtD 7.7a**; a análise está em
[`docs/analise-dtd.md`](docs/analise-dtd.md).

## Compêndios

A fonte dos compêndios fica em `src/packs/<nome>/*.json` (um arquivo por documento, versionado).
O Foundry lê a versão compilada em LevelDB em `packs/<nome>/`, que **não é versionada** e é
gerada com:

```bash
npm run build:packs
```

- **Feche o Foundry por completo** antes do build (sair do mundo não basta: o servidor pode continuar segurando o LOCK do pack). Se o pack estiver em uso, o build avisa e não altera nada.
- Depois do build, abra o Foundry e confira o compêndio (ex.: 16 raças).
- Nunca edite `packs/` à mão; altere os JSON em `src/packs/` e rode o build de novo.
- Para editar um compêndio pelo Foundry: clique com o botão direito no compêndio → "Alternar trava de edição", edite os itens, feche o Foundry e rode `npm run extract:packs` para gravar as mudanças de volta em `src/packs/` (depois revise o diff e faça o commit).
- Compêndios atuais: `races` (16 raças do cap. 4 da DtD 7.7a), `exaltations` e `exalted-assets` (cap. 5), `feats` (cap. 7), `classes` (103 classes do cap. 6) `equipment` (170 itens dos caps. XIII–XIV) `combat-tables` (22 tabelas do cap. XVII e as 2 do Warp) `spells` (126 magias do cap. VIII) `martial-schools` (15 escolas dos caps. IX–X) `deities` (21 deuses do cap. XII; a tabela Degeneration fica em `combat-tables`) `antagonists` (47 NPCs e 4 Minion Squads do cap. XX, só para o Mestre), `vehicle-components` (131 componentes, armas e munições do cap. XV), `vehicles` (16 veículos de exemplo), `ship-components` (104 peças do cap. XVI) e `ships` (6 naves de NPC).

## Ícones

Os ícones são gerados a partir de `src/icons/` (`categories.json`: cor e glifo padrão de cada categoria;
`curation.json`: o glifo de cada documento; `conditions.json`: grupo e glifo dos selos das condições e dos efeitos;
`glyphs/`: os glifos do game-icons.net usados) em `assets/icons/`:

```bash
npm run build:icons
```

- Rode antes de `npm run build:packs`: ele também grava o caminho dos ícones nos JSON de `src/packs`. Sem mudança, não altera nada.
- Documento novo sem glifo próprio usa o padrão da categoria e entra em `src/icons/uncurated.json`; para escolher, rode `npm run icons:suggest` (candidatos em `src/icons/suggestions.json`), anote em `curation.json` e baixe o glifo com `npm run icons:fetch` (único passo com rede).
- O teste `tests/unit/icons.test.mjs` falha se algum documento de compêndio ficar com imagem do Foundry ou sem arquivo.

## Publicar uma versão

O workflow [`.github/workflows/release.yml`](.github/workflows/release.yml) roda quando uma release
é publicada no GitHub. Ele roda lint e testes, compila os compêndios, grava a versão e o link de
download no `system.json` e anexa `system.json` + `dtd40k.zip` à release.

1. Atualize `version` em `system.json` e `package.json` e faça o commit na `main`.
2. Publique a release com a tag `vX.Y.Z` (a mesma versão):

```bash
gh release create v0.1.0 --title "v0.1.0" --generate-notes
```

3. Acompanhe o workflow em *Actions*; ao terminar, o manifesto `releases/latest/download/system.json` já aponta para a nova versão.

## Licença

Sem licença definida por enquanto. *Dungeons the Dragoning* pertence a LawfulNice. Os glifos dos ícones são do
[game-icons.net](https://game-icons.net) (CC BY 3.0); autores em [`CREDITS.md`](CREDITS.md).
