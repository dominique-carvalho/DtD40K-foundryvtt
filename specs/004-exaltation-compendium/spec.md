# Feature Specification: Compêndio de Exaltações (DtD 7.7a)

**Feature Branch**: `004-exaltation-compendium`

**Created**: 2026-09-25

**Status**: Draft

**Input**: User description: "Compêndio de Exaltações (DtD 7.7a, feature 004; referência: cap. 5 pp. 64–109 e Exalted Assets no cap. 7 pp. 211+). Tipo de Item 'exaltation' com os dados mecânicos: nome do Power Stat, nome do Resource Stat com fórmula do máximo e regra de recuperação, poderes estáticos (nome + resumo), tabela de 5 poderes liberados por ponto de Power Stat (conforme a ordem da 7.7a), descrição da Tell e ambientação resumida; ficha de item para ver/editar; compêndio 'Exaltations' com as 9 exaltações, fonte versionada em JSON, redação própria em inglês. Incluir também os Exalted Assets, vinculados à exaltação, em compêndio próprio; regra: só um Exalted Asset por personagem, exceto Paragon; assets só na criação de personagem. Aplicar no ator: arrastar a exaltação para a ficha define a exaltação (só uma por personagem), cria o Power Stat com 1 ponto (teto = Level), a reserva de recurso com máximo calculado pela fórmula e contador, e mostra na aba 'Traits' os poderes estáticos e os liberados até o Power Stat atual; limite de gasto por rodada = Power Stat; gastos genéricos listados como referência; indicador da Tell conforme pontos gastos na cena com botão de nova cena. Remover/trocar a exaltação remove tudo que ela concedeu. Poderes com efeito mecânico complexo ficam como texto. Seguir os padrões da feature 002-race-compendium."

**Referência de regras**: DtD **7.7a** — cap. 5 "Exaltations", pp. 64–100 (regras gerais p. 65:
Exalted Powers, Resource Points e The Tell; uma exaltação a cada quatro páginas, de Atlantean p. 67
a Wraith p. 99); cap. 7 "Exalted Assets", pp. 211–223 (regra de Exalted Assets p. 179) —
constituição v1.2.0.

**Depende de**: `001-system-foundation` (ator Personagem, características, perícias, derivados,
Level, Hero Points, Devotion) e `002-race-compendium` (aba "Traits", padrão de item embutido com
modificadores desativáveis, build/extract de packs).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar as exaltações do livro no compêndio (Priority: P1)

O Mestre ou um jogador abre o compêndio **Exaltations** do sistema e encontra as 9 exaltações do
livro. Ao abrir uma exaltação, vê uma ficha com: nome, imagem, resumo em inglês com redação
própria, os poderes estáticos, o nome do Power Stat, o nome do recurso com a fórmula do máximo e
a regra de recuperação, a tabela dos 5 poderes liberados por ponto de Power Stat, a descrição da
Tell e a ambientação resumida (origem, aparência, sociedade).

**Why this priority**: é a entrega central pedida (o compêndio) e já tem valor sozinha: é a
escolha mais importante da criação de personagem depois da raça, e hoje exige ler 36 páginas.

**Independent Test**: num mundo DtD, abrir o compêndio Exaltations, conferir que as 9 exaltações
estão lá e comparar Power Stat, recurso, fórmula e a ordem dos 5 poderes com a Tabela de
referência desta spec.

**Acceptance Scenarios**:

1. **Given** um mundo DtD recém-criado, **When** o usuário abre a aba de compêndios, **Then**
   existe o compêndio "Exaltations" com exatamente 9 entradas: Atlantean, Chosen, Daemonhost,
   Dragonblooded, Paragon, Promethean, Vampire, Werewolf e Wraith.
2. **Given** o compêndio aberto, **When** o usuário abre "Werewolf", **Then** a ficha mostra o
   Power Stat "Feral Heart", o recurso "Rage" com máximo "Composure + Willpower + Level", a
   recuperação "+Feral Heart no início de cada combate e ao nascer da lua", os poderes estáticos
   Shifting, Lycan Resilience, Spirit Sight e Silver Bane, e os poderes por ponto na ordem 1 Fast
   Healing, 2 Spirit Walk, 3 Quick Shift, 4 Stoking Fury, 5 Luna's Blessing.
3. **Given** qualquer exaltação, **When** a descrição é exibida, **Then** ela é um resumo em inglês
   com redação própria (sem trechos copiados do livro) e cita a página de origem.
4. **Given** o idioma do Foundry em pt-BR, **When** a ficha da exaltação é aberta, **Then**
   rótulos e títulos de seção aparecem em português (o conteúdo permanece em inglês).

---

### User Story 2 - Consultar os Exalted Assets no compêndio (Priority: P2)

O jogador, ao escolher a exaltação, abre o compêndio **Exalted Assets** e encontra os 75 assets
do livro organizados por exaltação e grupo (Atlantean Castes, Chosen Marks, Daemonhost Sins,
Dragonblooded Bloodlines, Paragon Assets, Paragon Racial Assets, Promethean Materials, Vampire
Clans, Werewolf Tribes, Wraith Hauntings). Cada asset mostra nome, exaltação exigida, grupo,
pré-requisitos (raça, para Paragon Racial; divindade, para Chosen Marks), custo em XP e resumo
mecânico.

**Why this priority**: completa a escolha de exaltação na criação do personagem; depende da
exaltação existir (P1) para fazer sentido, mas é consultável sozinho.

**Independent Test**: abrir o compêndio Exalted Assets, conferir a contagem por grupo (5/21/5/5/
4/15/5/5/5/5) e abrir "Mark of Khorne", "Blood of Io" e "Warboss" conferindo pré-requisitos e
resumo.

**Acceptance Scenarios**:

1. **Given** um mundo DtD, **When** o usuário abre o compêndio "Exalted Assets", **Then** existem
   75 entradas, agrupadas em pastas por exaltação.
2. **Given** o asset "Warboss", **When** aberto, **Then** mostra exaltação Paragon, grupo Paragon
   Racial Assets, raça exigida Ork, custo 100 XP e o resumo "+1 Size; no início de cada combate,
   recupera Fatigue igual ao Level".
3. **Given** o asset "Mark of Khorne", **When** aberto, **Then** mostra exaltação Chosen,
   divindade Khorne e o resumo do efeito, incluindo a restrição de nunca aprender magia.

---

### User Story 3 - Aplicar a exaltação ao personagem (Priority: P3)

Na criação do Herói, o jogador arrasta uma exaltação do compêndio para a ficha. O personagem
passa a ter essa exaltação: a aba "Traits" mostra a exaltação, o Power Stat com 1 ponto, a
reserva do recurso com o máximo calculado, os poderes estáticos e o poder do 1º ponto liberado.
Quando o jogador aumenta o Power Stat (até o Level), o máximo do recurso e os poderes liberados
acompanham. Trocar de exaltação substitui a anterior por completo.

**Why this priority**: tira do jogador o cálculo do máximo do recurso e o controle de quais
poderes estão liberados; depende do compêndio (P1).

**Independent Test**: criar a Traya (Tiefling Werewolf, Composure 2, Willpower 4, Level 1 —
exemplo do livro p. 18), arrastar Werewolf e conferir Feral Heart 1, Rage máximo 7, Fast Healing
liberado e Spirit Walk bloqueado; depois arrastar Vampire e conferir que só a exaltação Vampire
permanece, com Blood Potency 1 e Vitae máximo 5.

**Acceptance Scenarios**:

1. **Given** um personagem sem exaltação com Composure 2, Willpower 4 e Level 1, **When** o jogador
   arrasta Werewolf, **Then** a exaltação aparece no cabeçalho e na aba "Traits", Feral Heart = 1,
   Rage máximo = 7 e atual = 7, e o poder "Fast Healing" aparece liberado; "Spirit Walk" a "Luna's
   Blessing" aparecem bloqueados com o ponto necessário.
2. **Given** um Werewolf de Level 1 com Feral Heart 1, **When** o jogador tenta subir o Feral Heart
   para 2, **Then** o valor não passa de 1 (teto = Level); **When** o Level passa a 3 e o Feral
   Heart a 3, **Then** Rage máximo = 9 e os poderes 1 a 3 aparecem liberados.
3. **Given** um Atlantean com Charisma 3, Intelligence 4 e Gnosis 2, **When** a ficha é exibida,
   **Then** Motes máximo = 3 + 4 + 2×2 = 11.
4. **Given** um Chosen de Level 5 com Devotion 5, **When** o jogador tenta subir o Faith para 4,
   **Then** o valor não passa de 3 (teto = menor entre Level e metade da Devotion arredondada para
   cima) e Favor máximo = 5 + 3 = 8; **When** a Devotion cai para 3 com Faith 3, **Then** os poderes
   acima do teto (Faith 3) aparecem como indisponíveis até a Devotion voltar.
5. **Given** um personagem Werewolf, **When** o jogador arrasta Vampire, **Then** a exaltação
   Werewolf, seu Power Stat, reserva e modificadores são removidos, e o personagem fica com
   Vampire, Blood Potency 1 e Vitae máximo 5 — nunca com duas exaltações.
6. **Given** um personagem com exaltação, **When** o jogador remove a exaltação, **Then** tudo que
   ela concedeu deixa de valer e os Exalted Assets ligados a ela também são removidos (com
   confirmação).
7. **Given** um personagem Paragon Human, **When** a exaltação é aplicada, **Then** o jogador
   escolhe a característica do poder Statuesque entre as elegíveis da raça ainda não escolhidas
   (Human: qualquer uma diferente da escolhida na raça), Hero Points máximo sobe 2 (Destiny) e o
   asset racial de Paragon da raça (Human → Multiclass) é adicionado ao personagem (Perfection).
8. **Given** um personagem Dragonblooded, **When** a exaltação é aplicada, **Then** o jogador
   escolhe o elemento da Blood Quickening (Air, Earth, Fire, Water ou Wood); a característica do
   elemento recebe +1 como modificador da exaltação e o elemento escolhido aparece na aba
   "Traits" com seus efeitos.

---

### User Story 4 - Usar o recurso e a Tell em jogo (Priority: P4)

Durante a sessão, o jogador gasta pontos do recurso pela aba "Traits". Cada gasto reduz o recurso
atual, conta para o limite por rodada (igual ao Power Stat) e para a intensidade da Tell na cena.
A ficha mostra os gastos genéricos disponíveis e o nível atual da Tell; ações de recuperação e de
"nova cena" restauram os contadores.

**Why this priority**: dá utilidade de mesa à exaltação aplicada, mas os efeitos dos gastos são
aplicados pelo jogador/Mestre; o valor incremental é menor que o de aplicar a exaltação.

**Independent Test**: com um Werewolf de Feral Heart 2 e Rage 7/7, gastar 3 pontos na mesma
rodada e conferir Rage 4/7, aviso ao tentar o 3º gasto da rodada, Tell "impossível de não notar";
avançar a rodada, gastar mais 2 e conferir Tell "aura"; usar "nova cena" e conferir Tell zerada.

**Acceptance Scenarios**:

1. **Given** um Werewolf com Rage 7/7 e Feral Heart 2, **When** o jogador gasta 1 ponto, **Then**
   Rage passa a 6/7, gastos na rodada 1/2 e gastos na cena 1, com a Tell em "fraca (Perception +
   Wisdom TN 20 para notar)".
2. **Given** 2 gastos na rodada com Feral Heart 2, **When** o jogador tenta gastar mais 1, **Then**
   a ficha avisa que o limite por rodada foi atingido; o Mestre pode confirmar mesmo assim.
3. **Given** um combate em andamento, **When** a rodada avança, **Then** o contador de gastos na
   rodada volta a 0; fora de combate, há uma ação manual para zerá-lo.
4. **Given** gastos na cena 1, 2–3, 4–5 e 6+, **When** a Tell é exibida, **Then** aparece
   respectivamente como fraca, óbvia, aura e épica, com o texto da Tell daquela exaltação.
5. **Given** um recurso com 0 pontos, **When** o jogador tenta gastar, **Then** nada muda e a
   ficha avisa que não há pontos.
6. **Given** um Werewolf com Rage 3/9 e Feral Heart 3, **When** o jogador usa "início de combate",
   **Then** Rage passa a 6/9 (+Feral Heart, limitado ao máximo); **Given** um Chosen, **When** usa
   "ritual diário", **Then** Favor volta ao máximo.
7. **Given** um Atlantean com Motes 11/11, **When** gasta 2, **Then** Motes 9/11 e Paradox 2;
   **When** usa "Unravel" uma vez, **Then** Motes 10/11 e Paradox 1 (o mesmo vale para o Daemonhost
   com Essence e Resonance).
8. **Given** um Paragon com Excellence 1 (Be a Man liberado), **When** usa "nova cena", **Then** os
   Pressure Points voltam a 5 (5×Excellence), numa reserva separada que não conta para o limite
   por rodada nem para a Tell.

---

### User Story 5 - Adicionar Exalted Assets ao personagem (Priority: P5)

O jogador arrasta um Exalted Asset para a ficha. O sistema confere se o asset é da exaltação do
personagem (e da raça, para Paragon Racial) e se o personagem já tem outro Exalted Asset. O asset
aparece na aba "Traits", junto da exaltação. Assets com efeito numérico simples já valem
automaticamente.

**Why this priority**: completa a criação do personagem, mas depende da exaltação aplicada (P3)
e a maioria dos assets é narrativa ou depende de sistemas futuros.

**Independent Test**: num Dragonblooded de Level 2 com Aspect 1, arrastar Blood of Io e conferir
Breath máximo 4 + 1 = 5; tentar arrastar Double Dragon e conferir a recusa; num Paragon, arrastar
Extra Action e Action Hero e conferir que ambos entram.

**Acceptance Scenarios**:

1. **Given** um Dragonblooded de Level 2 e Aspect 1, **When** o jogador arrasta "Blood of Io",
   **Then** o asset aparece na aba "Traits" e Breath máximo passa de 4 para 5.
2. **Given** esse Dragonblooded com Blood of Io, **When** o jogador arrasta "Double Dragon",
   **Then** o sistema recusa com aviso de que só é permitido um Exalted Asset (exceto Paragon).
3. **Given** um Paragon, **When** o jogador arrasta "Extra Action" e "Action Hero", **Then** ambos
   entram, Action Points máximo sobe 2 e Hero Points máximo sobe 1.
4. **Given** um Werewolf, **When** o jogador arrasta "Mark of Khorne" (Chosen), **Then** o sistema
   recusa com aviso de exaltação incompatível.
5. **Given** um Paragon Elf, **When** o jogador arrasta "Warboss" (Ork), **Then** o sistema recusa
   com aviso de raça incompatível.
6. **Given** qualquer recusa desta história, **When** o usuário é o Mestre, **Then** ele pode
   confirmar a inclusão mesmo assim (constituição, IV).

---

### Edge Cases

- **Exaltação arrastada para um ator que não é Personagem**: a ação é recusada com aviso.
- **Personagem sem exaltação**: a aba "Traits" mostra um aviso para arrastar uma exaltação do
  compêndio; nenhum Power Stat ou recurso aparece.
- **Mesma exaltação arrastada de novo**: tratada como troca (substitui a atual, Power Stat volta a
  1); nada é duplicado. A ficha pede confirmação antes, pois o Power Stat comprado se perde.
- **Level reduzido abaixo do Power Stat**: o Power Stat efetivo fica limitado ao novo Level; os
  poderes acima aparecem indisponíveis; o valor comprado é preservado e volta a valer se o Level
  subir.
- **Máximo do recurso reduzido abaixo do atual** (ex.: Willpower caiu): o atual é limitado ao novo
  máximo.
- **Exaltação editada no compêndio após aplicada**: o personagem mantém a cópia que recebeu.
- **Exaltação criada pelo Mestre (fora do compêndio)**: funciona igual às do livro, desde que tenha
  os campos preenchidos; a fórmula do máximo escolhe entre as fórmulas suportadas (Tabela de
  referência) ou um valor fixo.
- **Paragon sem raça, ou raça sem asset de Paragon (Tiefling)**: Perfection não adiciona nada e a
  ficha informa o motivo; Statuesque sem raça pede qualquer característica.
- **Troca de raça de um Paragon**: o asset racial de Paragon da raça anterior é removido e o da
  nova raça é oferecido; a escolha do Statuesque é refeita se ficar inválida.
- **Asset de exaltação quando a exaltação é removida ou trocada**: os assets ligados a ela são
  removidos junto (com confirmação).
- **Promethean**: o gasto genérico "curar 1 HP" não aparece (Refitting); **Werewolf**: aparece
  com a nota de que vale também em combate (Lycan Resilience).
- **Vampire**: não há recuperação passiva de Vitae; a ficha oferece só ajuste manual e a nota
  "1 Vitae por dia para ficar ativo".
- **Wraith**: Plasm máximo = Synergy + Resolve máximo; perder a Resolve atual não reduz o máximo.
- **Usuário sem permissão de dono**: vê a exaltação, poderes e contadores só como leitura.

## Requirements *(mandatory)*

### Functional Requirements

**Exaltação (dados)**

- **FR-001**: O sistema MUST oferecer um tipo de item "Exaltação" com: nome, imagem, descrição
  resumida, texto completo opcional (sempre vazio no compêndio; preenchido pela mesa no próprio
  mundo), página de origem, nome do Power Stat, nome do recurso, fórmula do máximo do recurso,
  regra de recuperação (resumo), ações de recuperação disponíveis, nome do contador de "dívida"
  quando existir (Paradox, Resonance), poderes estáticos (nome, resumo, tipo de automação),
  tabela de 5 poderes por ponto de Power Stat (ponto, nome, resumo, tipo de automação),
  descrição da Tell (geral e por intensidade), exceções aos gastos genéricos e ambientação
  resumida (origem, aparência, sociedade, heróis de exemplo).
- **FR-002**: Todo personagem com exaltação MUST começar com 1 ponto no Power Stat; o Power Stat
  efetivo MUST ficar limitado ao Level (7.7a p. 65) e, para o Chosen, também a metade da Devotion
  arredondada para cima (Conviction, p. 71).
- **FR-003**: O máximo do recurso MUST ser calculado pela fórmula da exaltação (Tabela de
  referência) com os valores atuais do personagem, incluindo modificadores de raça e de assets.

**Exalted Asset (dados)**

- **FR-004**: O sistema MUST oferecer um tipo de item "Exalted Asset" com: nome, imagem, resumo,
  página, exaltação exigida, grupo (Caste, Mark, Sin, Bloodline, Paragon, Paragon Racial,
  Material, Clan, Tribe, Haunting), pré-requisito de raça (Paragon Racial), divindade (Chosen
  Marks), custo em XP (100) e tipo de automação.

**Fichas de item**

- **FR-005**: Exaltação e Exalted Asset MUST ter ficha própria para visualizar todos os campos e,
  para quem tem permissão, editá-los; nos compêndios bloqueados a ficha é somente leitura (com o
  mesmo aviso de compêndio bloqueado da feature 002).
- **FR-006**: Os rótulos das fichas MUST estar em pt-BR e inglês; o conteúdo do compêndio fica em
  inglês.

**Compêndios**

- **FR-007**: O sistema MUST distribuir o compêndio "Exaltations" com as 9 exaltações do cap. 5 da
  7.7a e o compêndio "Exalted Assets" com os 75 assets do cap. 7 (pp. 211–223), organizados em
  pastas por exaltação, conforme as Tabelas de referência.
- **FR-008**: As fontes dos compêndios MUST ser mantidas em arquivos de texto versionados e geradas
  para o formato do Foundry por ferramenta (constituição, V), reaproveitando o build e o extract
  de packs da feature 002.
- **FR-009**: Descrições MUST ser resumos com redação própria em inglês, com os dados mecânicos
  completos, sem nenhuma sequência de 6+ palavras igual ao livro (constituição, V).

**Aplicação no personagem**

- **FR-010**: Arrastar uma exaltação para a ficha de um Personagem MUST aplicá-la: Power Stat = 1,
  recurso atual = máximo, nome da exaltação na linha de identidade do cabeçalho (clicar abre a
  ficha) e exaltação, Power Stat, recurso e poderes na aba "Traits". Exaltações com escolha na
  aplicação (Paragon — Statuesque; Dragonblooded — Blood Quickening) MUST abrir a escolha antes;
  cancelar não altera nada.
- **FR-011**: O personagem MUST ter no máximo uma exaltação. Aplicar outra MUST remover a anterior,
  seus modificadores e seus Exalted Assets antes de aplicar a nova.
- **FR-012**: Remover a exaltação MUST remover todos os seus modificadores e Exalted Assets.
- **FR-013**: MUST ser possível refazer as escolhas da exaltação (Statuesque, Blood Quickening) sem
  removê-la.
- **FR-014**: O Power Stat MUST ser editável pelo dono do personagem na aba "Traits", de 1 até o
  teto do FR-002. Os poderes da tabela MUST aparecer como liberados (ponto ≤ Power Stat efetivo)
  ou bloqueados (com o ponto necessário).
- **FR-015**: Aplicar, trocar, remover e editar a exaltação MUST estar disponível a qualquer dono
  do personagem (jogador ou Mestre); os demais usuários só veem.

**Recurso, gastos e Tell**

- **FR-016**: A aba "Traits" MUST mostrar o recurso (atual / máximo) com ações para gastar 1 ponto,
  recuperar conforme as ações da exaltação (Tabela de referência: "recuperar tudo", "+N" ou
  "Unravel/Eruption") e ajustar manualmente o valor atual.
- **FR-017**: Cada gasto MUST contar nos "gastos na rodada" e nos "gastos na cena". Ao atingir o
  limite por rodada (= Power Stat efetivo, p. 65), novo gasto MUST pedir confirmação com aviso.
  O contador da rodada MUST zerar quando a rodada do combate avança e por ação manual.
- **FR-018**: A ficha MUST exibir o nível da Tell pelos gastos na cena — 0: nenhuma; 1: fraca
  (Perception + Wisdom TN 20 para notar); 2–3: óbvia; 4–5: aura; 6+: épica (p. 65) — com a
  descrição da Tell da exaltação, e uma ação "nova cena" que zera os gastos na cena.
- **FR-019**: A ficha MUST listar os gastos genéricos de 1 ponto como referência (curar 1 HP só
  fora de combate, +1k0 em teste de perícia, ganhar uma reação, sair de Stunned, sair de Dazed —
  p. 65), com as exceções da exaltação (Promethean sem cura; Werewolf cura também em combate).
  Os efeitos dos gastos não são aplicados automaticamente nesta feature.
- **FR-020**: Atlantean e Daemonhost MUST mostrar o contador de dívida (Paradox, Resonance) igual
  aos pontos gastos e ainda não recuperados; a ação "Unravel"/"Eruption" recupera 1 ponto e reduz a
  dívida em 1. Nenhuma rolagem é feita automaticamente.
- **FR-021**: Paragon com Excellence ≥ 1 MUST ter a reserva separada de Pressure Points (máximo
  5×Excellence), restaurada ao máximo em "nova cena", com ações de gastar N e de recuperar 5
  (Be a Man) ou Excellence (All the Force of a Great Typhoon, ponto 3); ela não conta para o
  limite por rodada nem para a Tell.

**Exalted Assets no personagem**

- **FR-022**: Arrastar um Exalted Asset para a ficha MUST validar: exaltação compatível; raça
  compatível (Paragon Racial); no máximo um Exalted Asset por personagem, exceto os grupos Paragon
  e Paragon Racial, que não contam no limite (p. 179). Falha MUST recusar com aviso; o Mestre pode
  confirmar a inclusão mesmo assim.
- **FR-023**: Como o sistema ainda não tem modo de criação de personagem nem compra de XP, a regra
  "assets só na criação" (exceto Paragon, Perfection) MUST aparecer como aviso informativo ao
  adicionar um asset, sem bloqueio.
- **FR-024**: Os Exalted Assets MUST aparecer na aba "Traits" junto da exaltação, com resumo e ação
  de remover.

**Automação (com o comportamento do livro como padrão)**

- **FR-025**: Automatizados nesta feature:
  - todos os máximos de recurso e tetos de Power Stat (FR-002, FR-003);
  - Paragon — Destiny: +2 no máximo de Hero Points; ao aplicar, o atual também sobe 2 (p. 83);
  - Paragon — Statuesque: +1 na característica escolhida (p. 83);
  - Paragon — Perfection: adiciona o Paragon Racial Asset da raça do personagem (p. 83);
  - Dragonblooded — Blood Quickening: +1 na característica do elemento; Earth também +2 HP
    máximo (p. 79);
  - assets: Action Hero (+1 Hero Point máximo), Extra Action (+2 Action Points máximo), Blood of Io
    (+Aspect no Breath máximo), Warboss (+1 Size), Longbeard (+1 Resilience), Sloth (+2 HP máximo),
    Elusive (Size não penaliza a Static Defense), Mark of Nurgle (+1 Resilience).
- **FR-026**: Os demais poderes e assets MUST aparecer como texto de referência na aba "Traits",
  sem automação nesta feature.
- **FR-027**: Cada modificador concedido por exaltação ou asset MUST poder ser desativado pelo
  Mestre individualmente (como os modificadores raciais), e todo derivado alterado continua
  sujeito ao bônus/override manual do Mestre (constituição, IV).
- **FR-028**: Todo texto de interface novo MUST existir em pt-BR e inglês.

### Tabela de referência — Exaltações (DtD 7.7a, cap. 5)

| Exaltação | Pág. | Power Stat | Recurso | Máximo | Recuperação (ações na ficha) | Dívida |
|---|---|---|---|---|---|---|
| Atlantean | 67 | Gnosis | Motes | Cha + Int + 2×Gnosis | só desfazendo Paradox: 1 h de meditação ou ação livre + Psychic Phenomena (Unravel) | Paradox |
| Chosen | 71 | Faith | Favor | Devotion + Faith | ritual diário restaura tudo (recuperar tudo) | — |
| Daemonhost | 75 | Arcanoi | Essence | Wil + Cha + 2×Arcanoi | só por Resonance Eruption (Wil vs TN 10 + 2×Resonance) ou mordida (Eruption) | Resonance |
| Dragonblooded | 79 | Aspect | Breath | 2×Level | 5 min de descanso restaura tudo (recuperar tudo) | — |
| Paragon | 83 | Excellence | Action Points | Level + Excellence | tudo no início da sessão; 1d10 após stunt de 2+ dados, 1×/cena (recuperar tudo, +N) | — |
| Promethean | 87 | Generation | Pyros | 3×Generation | +1 por hora (+1) | — |
| Vampire | 91 | Blood Potency | Vitae | 5×Blood Potency | só alimentando-se (ajuste manual) | — |
| Werewolf | 95 | Feral Heart | Rage | Cmp + Wil + Level | +Feral Heart no início do combate e ao nascer da lua (+Power Stat) | — |
| Wraith | 99 | Synergy | Plasm | Synergy + Resolve | +2/h na Umbra; −1/dia no mundo dos vivos (+2, −1) | — |

**Poderes estáticos e poderes por ponto (ordem 1→5 da 7.7a)**

| Exaltação | Poderes estáticos | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| Atlantean | Magical Aptitude, Prestidigitation, Past Lives, Paradox | Ancient Style | Empower Spell | Excellence | Maximize Spell | Quicken Spell |
| Chosen | Conviction, Redeemed, Divine Power, Leeway | Overbeing (Aura = 2×Faith) | Divine Protection | Prayer Strip | Trial of Faith | Demigod |
| Daemonhost | Demonic Tutor, Unholy Might, Rejected by Creation, Feeding | Daemonic (RD = Con + Arcanoi) | Unnatural Characteristics | Scorn Earth | Not Of This World | Black Miracle |
| Dragonblooded | Draconic Aura, Hot-Blooded, Claws, Blood Quickening | Dragon Mind | Dragon Wings | Dragon Heart | Dragon Skin | Maximum Dragoning |
| Paragon | Destiny, Statuesque, Flash, Perfection | Be a Man (Pressure 5×Excellence) | Swift as a Coursing River | All the Force of a Great Typhoon | Strength of a Raging Fire | Mysterious as the Dark Side of the Moon |
| Promethean | Living Construct, Refitting, Disquiet, Superlative Constitution | Integrated Armor (AP = Generation + 3) | Integrated Weapons | Transhuman Potential | Recharge | Warstrider |
| Vampire | Old Money, Undead Resilience, Sunlight Weakness, Blood Dependency | Auspex | Dread | Celerity | Potence (+3 Str) | Dominate |
| Werewolf | Shifting (Wolf form, Warform), Lycan Resilience, Spirit Sight, Silver Bane | Fast Healing | Spirit Walk | Quick Shift | Stoking Fury | Luna's Blessing |
| Wraith | Dematerialize, Second Death, Deathsight, Ghost Dice | Whispers | Poltergeist | Curse | Shroud (Armor = Resolve) | Ectoplasmic Form |

Blood Quickening (Dragonblooded, p. 79): Air +1 Int; Earth +1 Con e +2 HP; Fire +1 Cha; Water +1
Str; Wood +1 Wis (demais efeitos como texto).

Mudanças em relação à 1.6 (referência histórica): Werewolf passou Spirit Sight a poder estático e a
tabela a Fast Healing, Spirit Walk, Quick Shift, Stoking Fury, Luna's Blessing; Paragon Pressure
passou a 5×Excellence por cena; Chosen ponto 1 é Overbeing (Aura); Wraith e Dragonblooded vieram do
Book 2.

### Tabela de referência — Exalted Assets (DtD 7.7a, cap. 7, pp. 211–223; 100 XP cada)

| Grupo | Pág. | Qtd. | Assets |
|---|---|---|---|
| Atlantean Castes | 211 | 5 | Dawn, Zenith, Twilight, Night, Eclipse Caste |
| Chosen Marks | 212–214 | 21 | Mark of Acererak, Bahamut, Chaos, Corellon, Cuthbert, Khorne, Lolth, Luna, Malal, Moradin, Nurgle, Order, Pelor, the Council, the Omnissiah, the Raven, Tiamat, Slaanesh, Sigmar, Tzeentch, Vectron |
| Daemonhost Sins | 215 | 5 | Desire, Hunger, Pride, Rage, Sloth |
| Dragonblooded Bloodlines | 216 | 5 | Adamic Dragon, Blood of Bahamut, Blood of Io, Blood of Tiamat, Double Dragon |
| Paragon Assets | 217 | 4 | Action Hero, Extra Action, Stuntman, Martial Prodigy |
| Paragon Racial Assets | 218–219 | 15 | You Will Not Falter (Aasimar), Dark Mirth (Dark Eldarin), Inner Dragon (Dragonborn), Woodland Magic (Dryad), Controlled Warp (Eldarin), Elven Perfection (Elf), Tuning (Gnome), Elusive (Halfling), Multiclass (Human), Tengu Dive (Kenku), Blood is Power (Kobold), Warboss (Ork), Longbeard (Squat), For the Greater Good (Tau), ...and Dangerous (Thri-Kreen) |
| Promethean Materials | 220 | 5 | Orichalcum, Mithril, Darksteel, Wraithbone, Necrodermis |
| Vampire Clans | 221 | 5 | Brujah, Malkavian, Toreador, Tremere, Ventrue |
| Werewolf Tribes | 222 | 5 | Black Spiral Dancers, Get of Fenris, Iron Masters, Red Talons, Silent Striders |
| Wraith Hauntings | 223 | 5 | Children of Ash, Dust, Salt, Silence, Void |

Quando o resumo em tabela do livro diverge do texto completo (ex.: Inner Dragon 2k2 × 2k3 R), vale o
texto completo, como o próprio livro determina. Tiefling não tem Paragon Racial Asset.

### Key Entities *(include if feature involves data)*

- **Exaltação**: item de referência com Power Stat, recurso (fórmula, recuperação, dívida), poderes
  estáticos, tabela de 5 poderes, Tell e ambientação; existe no compêndio e como cópia embutida no
  personagem que a recebe.
- **Estado da exaltação no personagem**: Power Stat comprado, recurso atual, dívida (Paradox/
  Resonance), gastos na rodada e na cena, Pressure Points (Paragon) e as escolhas feitas
  (Statuesque, Blood Quickening); vive na cópia embutida.
- **Exalted Asset**: item com exaltação exigida, grupo, pré-requisitos e efeito; embutido no
  personagem, ligado à exaltação e removido junto com ela.
- **Modificador de exaltação**: cada efeito automatizado (característica, Hero Points, Size, HP,
  Resilience, máximo do recurso) vinculado à exaltação ou ao asset, desativável pelo Mestre.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das 9 exaltações têm Power Stat, recurso, fórmula do máximo e ordem dos 5
  poderes idênticos à Tabela de referência (conferência campo a campo).
- **SC-002**: 100% dos 75 Exalted Assets estão no compêndio, no grupo e com os pré-requisitos da
  Tabela de referência.
- **SC-003**: Um jogador aplica uma exaltação a um personagem novo em no máximo 3 interações
  (arrastar, escolher quando houver, confirmar) e em menos de 30 segundos.
- **SC-004**: Os exemplos numéricos das histórias (Traya Rage 7, Atlantean Motes 11, Chosen Faith
  limitado a 3 e Favor 8, Vampire Vitae 5, Blood of Io Breath 5, Paragon Hero Points +2/+1)
  produzem 100% dos valores esperados.
- **SC-005**: Em 100% das trocas de exaltação testadas (as 9, em sequência, no mesmo personagem) o
  personagem termina com exatamente uma exaltação, só os modificadores e assets dela.
- **SC-006**: 0 trechos de descrição copiados literalmente do livro (revisão das 84 entradas).
- **SC-007**: 0 textos de interface desta feature sem tradução ao alternar pt-BR ↔ inglês.

## Assumptions

- **Fora de escopo**: automação dos efeitos dos gastos genéricos (curar, +1k0, reação, condições);
  rolagens automáticas de Psychic Phenomena, Eruption, Alignment Check e Ghost Dice; formas do
  Werewolf (Wolf form, Warform) e Warstrider como modificadores; armaduras e armas integradas,
  Aura, redução de dano e Regeneration (dependem de combate/equipamento); magia, Sword Schools,
  feats e backgrounds concedidos por poderes (Magical Aptitude, Demonic Tutor, Old Money, Mark of
  Khorne etc. ficam como texto); Embrace do Vampire; modo de criação de personagem e compra de XP;
  tradução do conteúdo para pt-BR.
- "Paragon Assets" na exceção do limite de um Exalted Asset inclui os Paragon Racial Assets; um
  Paragon pode ter vários deles e mais nenhum asset de outro grupo (p. 179; ambíguo no livro).
- Paragon Racial Assets exigem a exaltação Paragon e a raça listada.
- A Marca do Chosen corresponde à divindade patrona; como o sistema ainda não tem divindades nem
  alinhamento, a divindade é só informativa e não é validada.
- O máximo de Essence do Daemonhost é a fórmula dada como valor inicial (o livro não diz
  "máximo", mas segue o padrão das demais).
- O Power Stat comprado acima do teto é preservado (o efetivo é que é limitado), para não perder
  compras quando Level ou Devotion caem temporariamente.
- A Tell e os contadores por cena são restaurados manualmente ("nova cena"); só o contador por
  rodada zera sozinho, ao avançar a rodada de um combate.
- As exaltações e os assets aplicados são cópias independentes das entradas do compêndio.
- Imagens usam ícones genéricos do Foundry; arte própria fica fora de escopo.
- Wraith e Dragonblooded vinham do Book 2, mas estão no cap. 5 da 7.7a; como fez com as raças, a
  constituição (princípio VI, que ainda cita "exaltações" como conteúdo da Fase 2) precisa de uma
  emenda PATCH para trazê-las à Fase 1.
