# DtD40K-foundryvtt

Sistema de jogo **não oficial** para [Foundry VTT](https://foundryvtt.com/) do RPG
*Dungeons the Dragoning* (LawfulNice), revisão **7.7a** — um sistema **Roll & Keep** com d10.

> Projeto de fã. As descrições exibidas são resumos com redação própria; nenhum texto integral
> do livro é reproduzido.

## Recursos (versão 0.1.0)

- **Ficha de personagem** no layout clássico da ficha oficial, com dois modos:
  - **Edição** — características na grade 3×3 (Power / Finesse / Resistance × Mental / Físico /
    Social) e 27 perícias em 3 colunas, com pontos clicáveis, especialidades e ajustes do Mestre
    (bônus e substituição dos valores derivados).
  - **Jogo** — cabeçalho fixo com HP, Resolve, defesas e Hero Points; perícias com busca e filtro
    "só treinadas"; clique para rolar, com a parada (ex.: `6k3`) ao lado de cada item.
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
- Compêndios atuais: `races` (16 raças do cap. 4 da DtD 7.7a).

## Licença

Sem licença definida por enquanto. *Dungeons the Dragoning* pertence a LawfulNice.
