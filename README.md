# DtD40K-foundryvtt

Sistema de jogo **não oficial** para [Foundry VTT](https://foundryvtt.com/) do RPG
*Dungeons the Dragoning* (LawfulNice), revisão **7.7a** — um sistema **Roll & Keep** com d10.

> Projeto de fã. As descrições exibidas são resumos com redação própria; nenhum texto integral
> do livro é reproduzido.

## Recursos (versão 0.1.0)

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
  exaltação, raça e o limite de um (exceto Paragon), com efeitos simples automatizados.
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
- Interface em **português (pt-BR)** e **inglês**.

## Requisitos

- Foundry VTT **v13** (testado no 13.351).

## Instalação

### Pelo manifesto

Em *Game Systems → Install System*, cole o endereço do manifesto:

```text
https://github.com/dominique-carvalho/DtD40K-foundryvtt/releases/latest/download/system.json
```

> Os pacotes de release ainda não foram publicados; por enquanto use a instalação local.

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
- Compêndios atuais: `races` (16 raças do cap. 4 da DtD 7.7a), `exaltations` e `exalted-assets` (cap. 5), `feats` (cap. 7), `classes` (103 classes do cap. 6) `equipment` (170 itens dos caps. XIII–XIV) `combat-tables` (22 tabelas do cap. XVII e as 2 do Warp) `spells` (126 magias do cap. VIII) `martial-schools` (15 escolas dos caps. IX–X) e `deities` (21 deuses do cap. XII); a tabela Degeneration fica em `combat-tables`.

## Licença

Sem licença definida por enquanto. *Dungeons the Dragoning* pertence a LawfulNice.
