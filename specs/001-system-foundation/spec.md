# Feature Specification: Fundação do Sistema DtD (personagem + Roll & Keep)

**Feature Branch**: `001-system-foundation`

**Created**: 2026-09-24

**Status**: Draft

**Input**: User description: "Fundação do sistema DtD para Foundry VTT (Fase 1, primeira feature): manifesto instalável no Foundry v13+; ator 'character' com as 9 características, as 27 perícias (básicas/avançadas, com especialidades) e os valores derivados (Static Defense, Hit Points, Mental Defense, Resolve, Speed, Resilience, Size, Level, Hero Points, Devotion); ficha de personagem básica editável; e a rolagem Roll & Keep (XkY com 10 explodindo, conversão acima de 10 dados, TN, raises/checks, diálogo com TN/modificadores/stunt dice, mensagem no chat) para testes de perícia e de característica. Base de regras: docs/analise-dtd.md seções 2, 3 e 4. Contradições a resolver: fórmula de HP e se Arcana é básica ou avançada."

**Referência de regras**: `docs/analise-dtd.md` §2 (Roll & Keep), §3 (personagem), §4 (criação); livro 1.6 pp. 8, 14, 19–25, 235–236.

## Clarifications

### Session 2026-09-24

- Q: Fórmula de Hit Points máximos (livro se contradiz, revisão 1.6z+T mantém)? → A: 2×(Con + Wil).
- Q: Arcana é perícia Básica ou Avançada? → A: Básica.
- Q: Qual versão do Foundry é o alvo? → A: v13 (a mesa usa 13.351 e não pretende atualizar
  para o v14 por enquanto); substitui a escolha anterior de v14.

### Session 2026-09-25 (validação manual da US1)

- Problemas encontrados no passo 3 do quickstart: (a) derivados não atualizavam na ficha aberta;
  (b) ficha visualmente inutilizável no v13. → Correção de (a) exigida por FR-010/US1-6; (b)
  resolvido pelo novo layout (FR-022 a FR-030, US1-9).
- Q: Qual layout de ficha? → A: híbrido das propostas A (clássica, fiel ao PDF) e C (mesa de
  combate), com modos edição e jogo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar e manter a ficha de um Herói (Priority: P1)

O Mestre instala o sistema, cria um mundo DtD e um jogador cria seu Herói. A ficha segue o
**layout híbrido aprovado** (clássico do PDF oficial + painel de mesa), com dois modos:

- **Modo edição**: características em grade clássica 3×3 (linhas Power/Finesse/Resistance ×
  colunas Mental/Físico/Social) e perícias em 3 colunas, ambas com pontos clicáveis;
  especialidades e ajustes do Mestre (bônus/override dos derivados) visíveis.
- **Modo jogo**: o mesmo desenho, sem edição de pontos; perícias com busca e filtro "só
  treinadas". (Na US2 cada item vira botão de rolagem com a parada XkY exibida.)

Nos dois modos, um **cabeçalho fixo** mostra HP e Resolve em barras (valor atual editável),
Static Defense, Mental Defense, Resilience, Hero Points e Devotion. Os valores derivados aparecem
calculados automaticamente e se atualizam **imediatamente** sempre que uma característica, o Size
ou o Level mudam.

**Why this priority**: sem sistema instalável e sem ficha não existe nada para rolar; é a base de
todas as features seguintes.

**Independent Test**: instalar o sistema num Foundry limpo, criar um mundo, criar um personagem,
preencher os valores do exemplo do livro (Traya, p. 15) e conferir os derivados.

**Acceptance Scenarios**:

1. **Given** um Foundry v13+ sem o sistema, **When** o Mestre instala pelo endereço do manifesto,
   **Then** o sistema aparece na lista e permite criar um mundo DtD sem erros.
2. **Given** um personagem novo, **When** é criado, **Then** todas as características começam em 1,
   todas as perícias em 0, Size 4, Level 1, Hero Points 2 e Devotion 6.
3. **Given** Dex 3, Wis 2 e Size 5, **When** a ficha é exibida, **Then** Static Defense = 15.
4. **Given** um personagem com Cmp 2 e Wil 2, **When** Cmp sobe para 3, **Then** Mental Defense
   passa de 15 para 20 e Resolve de 4 para 5 imediatamente.
5. **Given** uma perícia com 4 pontos, **When** o jogador adiciona a especialidade "Rifles",
   **Then** ela fica salva e visível junto da perícia.
6. **Given** o modo edição e Dexterity 3, **When** o jogador clica no 4º ponto de Dexterity,
   **Then** Dexterity vira 4 e Static Defense e Speed mudam na mesma hora, sem reabrir a ficha;
   **When** clica de novo no 4º ponto (o valor atual), **Then** Dexterity volta para 3.
7. **Given** a ficha aberta, **When** o jogador alterna para o modo jogo, **Then** os pontos deixam
   de ser editáveis, o cabeçalho continua visível e a escolha de modo é lembrada na próxima vez
   que esse usuário abrir a ficha.
8. **Given** o modo jogo, **When** o jogador digita "lore" na busca ou marca "só treinadas",
   **Then** apenas as perícias correspondentes permanecem visíveis, sem recarregar a ficha.
9. **Given** o tema escuro ou claro do Foundry v13, **When** a ficha é aberta, **Then** todo texto,
   ponto e campo é legível e a ficha rola verticalmente sem cortar conteúdo.
10. **Given** o campo de bônus de um derivado apagado, **When** a ficha salva, **Then** o bônus é
    tratado como 0 e as demais alterações continuam sendo gravadas.

---

### User Story 2 - Rolar testes de perícia e característica (Priority: P2)

Durante a sessão, o jogador clica numa perícia ou característica da ficha e o sistema faz a rolagem
Roll & Keep correta, mostrando no chat os dados rolados, os mantidos, as explosões, o total e — se
houver TN — sucesso/falha com o número de raises ou checks.

**Why this priority**: é a mecânica central do jogo; com a ficha (P1) já entrega uma mesa jogável
para testes fora de combate.

**Independent Test**: com um personagem pronto, rolar testes de perícia treinada, perícia básica
sem treino, perícia avançada sem treino e característica, e conferir a mensagem no chat.

**Acceptance Scenarios**:

1. **Given** Weaponry 3 e Dex 3, **When** o jogador rola Weaponry + Dex, **Then** o sistema rola
   6 dados, mantém os 3 maiores, e cada 10 explode (rola de novo e soma no mesmo dado).
2. **Given** uma perícia básica com 0 pontos e característica 3, **When** o jogador rola,
   **Then** o teste vira teste de característica com valor 2 (2k2).
3. **Given** uma perícia avançada com 0 pontos, **When** o jogador tenta rolar, **Then** o sistema
   impede a rolagem e informa que a perícia exige treino.
4. **Given** TN 15 e total 27, **When** o resultado é exibido, **Then** aparece "Sucesso, 2 raises".
5. **Given** TN 20 e total 9, **When** o resultado é exibido, **Then** aparece "Falha, 2 checks".
6. **Given** uma parada de 12k6 após modificadores, **When** a rolagem é feita, **Then** o sistema
   rola 10k7 e a mensagem indica a conversão.

---

### User Story 3 - Ajustar a rolagem antes de lançar (Priority: P3)

Antes de rolar, o jogador vê uma janela onde pode definir o TN (ou deixá-lo em branco), trocar a
característica usada, somar modificadores de dados (+XkY) ou fixos (+Z), aplicar free raises,
adicionar stunt dice (0–3) concedidos pelo Mestre e marcar que a especialidade se aplica.

**Why this priority**: o Mestre frequentemente pede combinações diferentes de perícia +
característica e concede stunts; sem isso a rolagem do P2 cobre só o caso padrão.

**Independent Test**: abrir a janela de rolagem, aplicar cada opção isoladamente e verificar o
efeito na parada e no resultado.

**Acceptance Scenarios**:

1. **Given** Persuasion 2 + Cha 3, **When** o jogador troca para Fellowship 4, **Then** a parada
   passa a 6k4.
2. **Given** uma parada 5k3, **When** o jogador aplica 2 stunt dice, **Then** a parada vira 7k3.
3. **Given** 1 free raise, **When** a rolagem totaliza 14 contra TN 15, **Then** o total final é 19
   e o resultado é sucesso.
4. **Given** a especialidade marcada, **When** saem dados com resultado 1, **Then** esses dados são
   rerrolados uma vez e a mensagem mostra a rerrolagem.
5. **Given** um atalho de teclado/modificador configurado para "rolagem rápida", **When** o jogador
   usa o atalho, **Then** a rolagem é feita com os valores padrão sem abrir a janela.

---

### Edge Cases

- **Característica 0** (inclusive a efetiva 0 de perícia básica sem treino com característica 1):
  a característica conta como 1 dado rolado e 1 mantido (perícia 2 + característica 0 → 3k1);
  qualquer 10 conta como 0 e não explode.
- **Mantidos maiores que rolados** (ex.: 2k3 após modificadores): mantidos são limitados aos
  rolados.
- **Modificadores negativos** que zerariam a parada: mínimo de 1 dado rolado e 1 mantido.
- **Acima de 10 dados com sobra ímpar** (ex.: 11k5): o dado que não forma par é descartado (11k5 → 10k5).
- **Acima de 10k10** (ex.: 15k10 → 10k10+25; 11k11 → 10k10+10): o excedente vira bônus fixo de +5
  por dado.
- **TN em branco**: a mensagem mostra só o total, sem sucesso/falha nem raises.
- **Resilience** nunca menor que 1.
- **Valores derivados sobrescritos** pelo Mestre continuam sobrescritos mesmo quando as
  características mudam, até o override ser removido.
- **Característica ou perícia fora do intervalo** (menor que 0 ou maior que 6): a ficha não aceita
  o valor.

## Requirements *(mandatory)*

### Functional Requirements

**Instalação e configuração**

- **FR-001**: O sistema MUST ser instalável no Foundry VTT v13 (versão usada pela mesa; testado
  no 13.351 — ver research.md R1) a partir de um manifesto público e permitir criar mundos DtD.
- **FR-002**: Toda a interface MUST estar disponível em português (pt-BR) e inglês.
- **FR-003**: O sistema MUST configurar a iniciativa como 1d10 + Dexterity + Composure para o
  rastreador de combate.

**Personagem**

- **FR-004**: O sistema MUST oferecer um tipo de ator "Personagem" com: nome, imagem, 9
  características (Strength, Dexterity, Constitution, Charisma, Fellowship, Composure,
  Intelligence, Wisdom, Willpower) agrupadas em Físico/Social/Mental.
- **FR-005**: O personagem MUST ter as 27 perícias do livro agrupadas em Mental/Físico/Social, cada
  uma com: pontos (0–6), característica padrão, tipo (Básica/Avançada) e lista de especialidades.
- **FR-006**: As perícias Avançadas MUST ser: Academic Lore, Acrobatics, Common Lore, Forbidden
  Lore, Medicae, Pilot, Politics, Tech-Use. Arcana MUST ser Básica (decisão: segue o texto da
  perícia, p. 22, em vez do asterisco da ficha, p. 391).
- **FR-007**: Características MUST aceitar valores de 0 a 6, e cada característica MUST aceitar
  especialidades, como as perícias.
- **FR-008**: O personagem MUST ter Size (padrão 4), Level (padrão 1), Hero Points atuais/máximo
  (padrão 2/2), Devotion (padrão 6), Hit Points atuais e Resolve atual.
- **FR-009**: O sistema MUST calcular automaticamente:
  - Static Defense = 10 + 3×Dexterity + 3×Wisdom − 2×Size
  - Hit Points máximos = 2×(Constitution + Willpower) (decisão: segue cap. 2, ficha e resumo da
    ficha, pp. 14/17, em vez do cap. 14, p. 255)
  - Mental Defense = 5 + 5×Composure
  - Resolve máximo = Willpower + Composure
  - Speed = Strength + Dexterity
  - Resilience = arredondar para cima((Size + Level) / 2) + 1, mínimo 1
- **FR-010**: Os derivados MUST ser recalculados e **exibidos na ficha aberta** imediatamente
  quando qualquer valor de origem muda, sem reabrir a ficha; cada derivado MUST aceitar um bônus
  e um valor de substituição (override) definidos manualmente. Bônus vazio MUST valer 0 e nunca
  impedir o salvamento dos demais campos.
- **FR-011**: A ficha MUST permitir editar todos os campos acima (no modo edição) e exibir os
  derivados sem permitir edição direta do valor calculado (apenas via bônus/override).

**Layout da ficha (híbrido A+C aprovado em 2026-09-25)**

- **FR-022**: A ficha MUST ter dois modos alternáveis por um controle no cabeçalho: **edição** e
  **jogo**. A escolha MUST ser lembrada por usuário e por personagem. Usuários sem permissão de
  proprietário MUST ver sempre o modo jogo, somente leitura.
- **FR-023**: Características MUST ser exibidas na grade clássica 3×3 do PDF oficial: linhas
  Power (Intelligence, Strength, Charisma), Finesse (Wisdom, Dexterity, Fellowship) e Resistance
  (Willpower, Constitution, Composure); colunas Mental, Físico e Social.
- **FR-024**: Perícias MUST ser exibidas em 3 colunas (Mental, Físico, Social) com a marca de
  Avançada e a característica padrão.
- **FR-025**: Valores de características e perícias MUST ser exibidos como pontos (6 pontos, o 6º
  destacado como sobre-humano). No modo edição, clicar no ponto N define o valor N; clicar no
  ponto igual ao valor atual o reduz em 1 (permitindo chegar a 0).
- **FR-026**: Um cabeçalho fixo, visível nos dois modos e ao rolar a ficha, MUST mostrar: nome e
  imagem, Level e Size, barras de HP e Resolve (valor atual editável, máximo calculado), Static
  Defense, Mental Defense, Resilience, Hero Points (atual/máximo) e Devotion.
- **FR-027**: No modo jogo, a coluna de perícias MUST oferecer busca por nome (sem diferenciar
  maiúsculas e acentos, no idioma ativo) e filtro "só treinadas" (valor ≥ 1), aplicados sem
  recarregar a ficha.
- **FR-028**: No modo edição, as especialidades e os ajustes do Mestre (bônus/override dos
  derivados) MUST estar visíveis; no modo jogo, as especialidades aparecem só como leitura.
- **FR-029**: Um rodapé MUST mostrar Speed (em metros) e a fórmula de iniciativa do personagem
  (1d10 + Dex + Cmp).
- **FR-030**: A ficha MUST ser legível nos temas claro e escuro do Foundry v13 e rolar
  verticalmente sem cortar conteúdo, com largura mínima de 720 px.

**Rolagem Roll & Keep**

- **FR-012**: Toda rolagem MUST seguir XkY: rolar X d10, somar os Y maiores; cada 10 explode
  (rola de novo e soma ao mesmo dado, sem limite), e o dado explodido conta como um único dado.
- **FR-013**: Antes de rolar, o sistema MUST aplicar a conversão acima de 10 dados: cada 2 dados
  rolados acima de 10 viram +1 mantido (sobra ímpar descartada); acima de 10k10, cada dado rolado
  ou mantido excedente vira +5 no total.
- **FR-014**: Teste de perícia MUST rolar (perícia + característica) e manter a característica;
  perícia Básica sem pontos MUST virar teste de característica com −1; perícia Avançada sem pontos
  MUST ser bloqueada com aviso.
- **FR-015**: Teste de característica MUST rolar e manter o valor da característica (XkX).
- **FR-016**: Com característica 0, o sistema MUST rolar e manter 1 dado para ela e tratar todo 10 como 0,
  sem explodir.
- **FR-017**: Com TN informado, o sistema MUST indicar sucesso quando o total atingir ou superar o
  TN, e calcular raises = ⌊(total − TN)/5⌋ no sucesso e checks = ⌊(TN − total)/5⌋ na falha.
- **FR-018**: A janela de rolagem MUST permitir: TN (padrão 15, podendo ficar em branco), escolha
  da característica, modificador de dados (±X rolados, ±Y mantidos), modificador fixo (±Z), free
  raises (+5 cada), stunt dice 0–3 (+1 rolado cada) e marcação de especialidade (rerrola os 1s uma
  vez).
- **FR-019**: MUST existir uma forma de rolagem rápida que pula a janela e usa os valores padrão.
- **FR-020**: Cada rolagem MUST gerar uma mensagem no chat com: personagem, teste realizado,
  parada final (XkY e conversões aplicadas), cada dado rolado com mantidos e explosões destacados,
  rerrolagens, total, TN e resultado (sucesso/falha, raises/checks) quando houver TN.
- **FR-021**: A rolagem MUST respeitar o modo de visibilidade escolhido no chat (público, privado
  do Mestre, cego, pessoal) e ser compatível com rolagem de dados 3D padrão do Foundry.

### Key Entities *(include if feature involves data)*

- **Personagem (Herói)**: ator controlado por um jogador; possui características, perícias,
  derivados, recursos (Hit Points, Resolve, Hero Points, Devotion), Size e Level.
- **Característica**: um dos 9 atributos inatos (0–6), pertence a um grupo (Físico/Social/Mental)
  e pode ter especialidades.
- **Perícia**: uma das 27 capacidades treinadas (0–6), com característica padrão, tipo
  Básica/Avançada, grupo e especialidades.
- **Valor derivado**: número calculado a partir de características/Size/Level, com bônus e
  override manuais opcionais.
- **Teste (rolagem)**: parada XkY + modificadores + TN opcional, produzindo dados, total e
  resultado; registrado como mensagem no chat.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um Mestre instala o sistema, cria um mundo e um personagem funcional em menos de
  5 minutos, sem mensagens de erro.
- **SC-002**: 100% dos valores derivados do personagem de exemplo do livro (Traya, p. 15)
  batem com o cálculo esperado pela regra adotada.
- **SC-003**: 100% dos exemplos de conversão do livro (12k6→10k7, 15k10→10k10+25, 11k11→10k10+10)
  e dos casos-limite listados produzem a parada correta.
- **SC-004**: Um jogador faz um teste de perícia a partir da ficha em no máximo 2 cliques
  (1 clique na rolagem rápida).
- **SC-005**: Em uma sessão de teste com 3 jogadores, todos conseguem ler na mensagem do chat,
  sem ajuda, se o teste passou e quantos raises obtiveram.
- **SC-006**: Toda a interface desta feature aparece traduzida ao trocar o idioma entre pt-BR e
  inglês (0 textos sem tradução).
- **SC-007**: Ao mudar uma característica na ficha aberta, 100% dos derivados afetados exibem o
  novo valor em menos de 1 segundo, sem reabrir a ficha.
- **SC-008**: A pessoa que mantém o projeto consegue completar os passos 1–6 do quickstart nos
  temas claro e escuro do v13 sem nenhum bloqueio visual.

## Assumptions

- **Fora de escopo** (features futuras): raças, exaltações, classes, feats, compra de XP e
  assistente de criação de personagem; combate (ataque, dano, localização, armadura); gasto de
  Hero Points na rolagem; NPCs e minions; itens e equipamento. A ficha reserva espaço (linha de
  identidade no cabeçalho e área para abas futuras: Talentos, Magia, Itens, Bio), mas não os
  implementa.
- O modo da ficha é preferência de interface: fica em flag do usuário, não nos dados do ator.
- A distribuição 6/4/2 e 8/6/4 da criação não é validada nesta feature; valores são livres dentro
  de 0–6.
- A especialidade é marcada manualmente pelo jogador/Mestre na janela de rolagem (o livro deixa a
  aplicabilidade ao julgamento do Mestre).
- O Mestre pode rolar pelas fichas dos jogadores; permissões seguem o padrão do Foundry
  (proprietário edita, observador vê).
- Iniciativa usa 1d10 sem explosão (o livro escreve "1d10" sem mencionar explosão).
- A ficha exibe apenas os nomes das perícias e características; descrições/tooltips de regras
  ficam fora de escopo desta feature (quando vierem, serão resumos com redação própria —
  constituição, V).
