# DtD40K-foundryvtt

Sistema de jogo **não oficial** para [Foundry VTT](https://foundryvtt.com/) do RPG
*Dungeons the Dragoning* (LawfulNice), livro base 1.6 — um sistema **Roll & Keep** com d10.

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
  Resolve, Speed e Resilience.
- **Rolagem Roll & Keep**: 10 explode e soma no mesmo dado, conversão acima de 10 dados, perícia
  sem treino, característica 0, raises e checks, cartão no chat e suporte ao Dice So Nice.
- **Diálogo de rolagem**: TN, troca de característica, modificadores, free raises, stunt dice,
  especialidade (rerrola 1s) e modo de rolagem. **Shift + clique** rola direto.
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
| `module/data/`, `module/documents/` | Modelo de dados e documento `Actor` |
| `module/dice/` | Adaptador de rolagem (Roll do Foundry, chat, Dice So Nice) |
| `module/apps/` | Ficha (ApplicationV2) e diálogo de rolagem (DialogV2) |
| `templates/`, `styles/`, `lang/` | Handlebars, CSS e traduções |
| `specs/`, `docs/` | Especificações (Spec Kit) e análise das regras |

O desenvolvimento segue o fluxo [Spec Kit](https://github.com/github/spec-kit) e a constituição
em `.specify/memory/constitution.md`. A análise das regras do livro está em
[`docs/analise-dtd.md`](docs/analise-dtd.md).

## Licença

Sem licença definida por enquanto. *Dungeons the Dragoning* pertence a LawfulNice.
