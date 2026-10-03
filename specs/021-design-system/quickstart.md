# Quickstart — validação da feature 021-design-system

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-design`, com os packs compilados; recarregar.
- Mundo Mist of Imlarin com Aldred Kain e Milton; um NPC, um veículo, uma nave e itens dos compêndios.

```bash
npm test
```

## Roteiro manual (nos dois temas do Foundry)

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir Aldred Kain | Layout Cogitador: trilho lateral, leituras, teclas, módulos, tabela | US1-1 |
| 2 | Rolar até o fim da aba e trocar de aba | Trilho com HP, Resolve, Fatigue, Hero, condições e XP sempre visível | US1-2, FR-006 |
| 3 | Rolar uma característica e uma perícia (nome e botão) | Mesma parada e diálogo de hoje; cartão no design system | US1-3, US3-1 |
| 4 | Modo Edição: nome, nível, tamanho, dots, máximos; modo Evolução: comprar | Campos e botões funcionam | US1-4 |
| 5 | Personagem com 6, bônus de raça, perícia avançada sem treino | Gema tracejada dourada; aro claro; marca e sem parada | FR-007, edge |
| 6 | Trocar tema claro ↔ escuro | Vellum ↔ Cogitator sem recarregar | US1-5 |
| 7 | Menu de ficha → Iluminura | Arco, capitular, fitas, tríptico, índice; escolha salva no ator | US2-1 |
| 8 | Na Iluminura, usar todas as abas | Mesmas funções | US2-2, SC-001 |
| 9 | Configurar fichas: Iluminura como padrão do mundo | Personagens sem escolha abrem nela; voltar para Cogitador | US2-3 |
| 10 | Ataque com dano, defesa, perigo, zona, magia, cartão de veículo e de nave | Cartões no design system; botões funcionam | US3 |
| 11 | NPC, minion, veículo, nave, itens, diálogos de rolagem e de criação | Tokens e fontes, mesmo layout, nada some | US4 |
| 12 | Desconectar a internet e recarregar | Fontes e ornamentos iguais | SC-005 |

## Registro de validação — 2026-10-04

Foundry 13.351, mundo Mist of Imlarin, link apontando para o worktree da 021 (packs compilados no worktree). O tema
claro foi simulado trocando a classe do corpo da página (sem mudar a configuração do usuário).

| # | Resultado |
|---|---|
| 1 | Aldred Kain abriu na `CogitatorSheet`: trilho com retrato em octógono, identificação em fósforo, tubos de HP e Resolve, LEDs, recurso Motes, XP 300/600; leituras e teclas; módulos e tabela |
| 2 | Cada aba rola ao lado do trilho fixo; rodapé escondido fora do modo Edição |
| 3 | Botão de parada de Ballistics abriu o diálogo de rolagem (já no design system); dados fixados: cartão 6k3 com 10+6 explodido em lacre, total 31, "Success, 3 raises" |
| 4 | Edição: nome, tamanho, devoção, máximo de Hero Points, 37 dots editáveis, 36 campos de especialidade, ajustes do Mestre; nível travado (vem das classes). Dot de Athletics 0 → 2, devoção 6 → 7 e especialidade "Climbing" por Enter gravaram e foram desfeitos. Evolução: 36 botões (14 liberados); Academic Lore 2 → 3 por 50 XP, desfeito |
| 5 | Milton: 6º dot de Strength sólido; bônus de raça em str, command, intimidation; 2 perícias avançadas sem treino travadas |
| 6 | Tema claro: ficha em Vellum (pergaminho, gemas em lacre, latão); tema escuro: Cogitator |
| 7 | Escolha Iluminura gravada no ator → `IlluminatedSheet`: arco, capitular, linhagem com ✠, faixa de recursos, fitas, tríptico com medalhões, índice com pontilhado; claro e escuro |
| 8 | 2 fichas × 3 modos × 7 abas = 42 renderizações, nenhum erro no console |
| 9 | Registro: Cogitator padrão, Iluminura no menu. Padrão do mundo trocado para Iluminura → Milton (sem escolha) abriu nela; configuração devolvida ao original e, depois de recarregar, Cogitator de novo |
| 10 | Ataque desarmado (fastForward) e Roll Damage reais: cartão de ataque com o extra emendado e cartão de dano com Apply Damage em lacre. opposed, hazard, zone, pinning, ship-extra, damage-applied, social-attack e vehicle-card renderizados com dados de exemplo: todos no design system |
| 11 | NPC (Beast of Burden), minion (Space Pirate Crew), veículo (Helicopter), nave (Military Cruiser), arma (Pump Shotgun) e raça (Aasimar): tokens, fontes e componentes, layout de antes, nada sumiu |
| 12 | Fontes servidas por `/systems/dtd40k/fonts/`; nenhuma requisição externa; Cinzel, Crimson Pro e Share Tech Mono carregadas (Cinzel Decorative só carrega quando a capitular da Iluminura aparece) |

Correções feitas na validação:
- Rodapé vazio no modo Jogo da Cogitador: escondido fora da Edição.
- Nomes de perícia cortados com reticências: quebram linha; a abreviação da característica sai da tabela.
- Modo Evolução apertado: o botão de parada some e o de compra ocupa o lugar.
- Mistura de variantes no chat (o chat do Foundry é sempre claro): as diferenças entre as variantes passaram a ser
  tokens (`--dtd-title`, `--dtd-active`, `--dtd-switch-*`, `--dtd-readout`, `--dtd-die-kept`, `--dtd-odo-*`,
  `--dtd-zebra`, `--dtd-vignette`); só o `tokens.css` conhece os temas, com seletores de até três níveis (página,
  interface, chat), e o tema mais próximo vence.
- Título da janela invisível no tema claro: a barra de título tem cor própria.
- Título enorme no cartão "Damage Applied": os seletores do chat usam a lista explícita das raízes.

Observação: o Foundry carrega os estilos do sistema por `@import` numa camada `@layer system`.
