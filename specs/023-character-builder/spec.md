# Feature Specification: Montador de personagem para jogadores (DtD 7.7a)

**Feature Branch**: `023-character-builder`

**Created**: 2026-10-04

**Status**: Draft

**Input**: User description: "Montador de ficha para jogadores: um assistente em janela própria, passo a passo na ordem
do livro, iniciado por um botão na aba de atores, cobrindo núcleo (conceito, raça, exaltação, características,
perícias, especialidades, classe), traços (backgrounds, alinhamento e divindade, Assets, Hindrances, Exalted Asset), XP
inicial e equipamento inicial; escolhas fora da regra bloqueiam o passo e o Mestre pode liberar."

**Referência de regras**: DtD 7.7a — Cap. II, criação de personagem pp. 12–19 (passos 1–9, tabela de XP p. 16,
equipamento inicial p. 16, exemplo p. 18); especialidades p. 23; idiomas p. 24; teto de valores p. 22; Assets e
Hindrances p. 179; Backgrounds pp. 280–283. Constituição v1.2.1. Inventário: [inventory.json](inventory.json) (N1–N12).

**Depende de**: 002 (raças), 004 (exaltações), 005 (feats, Assets, Hindrances), 006 (classes e XP), 007 (equipamento e
aquisição inicial), 009/010 (escolas), 011 (backgrounds e alinhamento), 016 (criação guiada), 020 (custo do Exalted
Asset), 021 (design system).

## Decisões do usuário (2026-10-04)

- Assistente em janela própria, na ordem do livro, com Voltar/Avançar, resumo lateral e só as opções válidas.
- Começa por um botão "Novo personagem" na aba de atores; sem permissão de criar atores, o Mestre cria pelo jogador.
- Passos: núcleo, traços, XP inicial e equipamento inicial.
- Escolhas fora da regra bloqueiam o passo com o motivo; o Mestre pode liberar.
- O ator só é criado e preenchido ao Concluir; o rascunho fica salvo e pode ser retomado.
- Equipamento: cada vaga aceita a raridade exata, sem artefatos (hearthstones, materiais, wonders); consumíveis em 1 unidade.
- Especialidades: uma por característica ou perícia com valor 4 ou mais.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar um personagem do zero: núcleo (Priority: P1)

O jogador clica em **Novo personagem** na aba de atores. O assistente abre e guia, um passo por vez:
1. **Conceito**: nome, conceito e retrato.
2. **Raça**: lista das raças do compêndio com o resumo; as escolhas da raça (característica do bônus, perícias do
   Human) são feitas no próprio passo.
3. **Exaltação**: lista das exaltações; as escolhas de Paragon e Dragonblooded no passo.
4. **Características**: ordem de prioridade dos grupos (6/4/2) e os dots, com teto 4 e o que falta gastar.
5. **Perícias**: prioridade própria (8/6/4) e dots, teto 3.
6. **Especialidades**: uma para cada característica ou perícia com valor final 4 ou mais.
7. **Classe**: só as classes que o personagem pode começar (nível 1, pré-requisitos atendidos).

Um resumo lateral mostra o personagem até ali (valores finais com raça e exaltação). Ao **Concluir**, o ator é criado
com o jogador como dono e tudo é aplicado pelos mesmos caminhos da ficha (efeitos da raça, Power Stat, Hero Points),
sem perguntar de novo; a ficha abre em seguida, ainda em criação (016).

**Why this priority**: é o caminho mínimo para um jogador montar um personagem válido sem conhecer a ficha.

**Independent Test**: montar Jane (p. 18): Tiefling, Werewolf, prioridades Física/Mental/Social nas características e
Física/Social/Mental nas perícias, Monk; concluir e conferir na ficha valores, raça, exaltação e classe.

**Acceptance Scenarios**:

1. **Given** a aba de atores, **When** o jogador clica em Novo personagem, **Then** o assistente abre no passo Conceito.
2. **Given** um passo com escolha inválida (dots demais, valor acima do teto, raça sem escolha), **When** o jogador clica em Avançar, **Then** o passo não avança e mostra o motivo; o Mestre pode liberar.
3. **Given** uma raça ou exaltação com escolhas, **When** escolhida, **Then** as escolhas aparecem no próprio passo e entram no resumo.
4. **Given** o passo Classe, **When** listado, **Then** só aparecem classes que podem ser começadas no nível 1 pelo personagem montado.
5. **Given** todos os passos válidos, **When** o jogador conclui, **Then** o ator é criado com dono, raça, exaltação, valores, especialidades e classe, e a ficha abre em criação.

---

### User Story 2 - Traços (Priority: P2)

Passos de **Backgrounds** (7 pontos gratuitos, nenhum acima de 3 sem XP; Artifacts até 5 dots), **Alinhamento e
divindade** (os três panteões; Devotion inicial 6), **Assets e Hindrances** (Assets 100 XP cada; até 2 Hindrances,
+100 XP cada) e **Exalted Asset** (os da exaltação escolhida; 100 XP; o da Perfection é grátis).

**Why this priority**: completa o personagem segundo o livro; depende do núcleo.

**Independent Test**: Jane escolhe Enemy e Impulsive (800 XP), Black Spiral Dancers e Appearance (−200), Malal; o
resumo mostra 600 XP restantes.

**Acceptance Scenarios**:

1. **Given** os Backgrounds, **When** o jogador passa de 7 pontos ou de 3 num background, **Then** o excedente custa XP (50/100) do mesmo saldo do passo XP.
2. **Given** Hindrances, **When** o jogador tenta a terceira, **Then** é recusada.
3. **Given** Exalted Assets, **When** listados, **Then** só os da exaltação (e raça) do personagem aparecem; mais de um (fora Paragon) é recusado.
4. **Given** uma divindade escolhida, **When** o jogador conclui, **Then** ela entra na ficha com Devotion 6.

---

### User Story 3 - XP inicial (Priority: P2)

O passo **XP** mostra o saldo (600 + Hindrances − traços) e deixa gastar em características (200), perícias (100 nova,
50 melhorar), feats da classe (100), escolas (200 / 100 × posto) e Power Stat (300), com o custo ao lado e só o que a
classe permite (feats raciais e Assets fora da lista, como na ficha). Sobras ficam guardadas.

**Why this priority**: é o passo em que o jogador mais erra a conta; depende da classe.

**Independent Test**: Jane gasta 400 em quatro feats, 50 em Brawl 3 → 4 e 100 em Outsider; restam 50.

**Acceptance Scenarios**:

1. **Given** o saldo, **When** o jogador compra algo, **Then** o custo sai do saldo e aparece no resumo; sem saldo, recusa.
2. **Given** um item fora da lista da classe, **When** o jogador tenta comprar, **Then** é recusado (o Mestre libera).
3. **Given** a conclusão, **When** aplicada, **Then** cada compra entra no log de XP da ficha como se feita nela.

---

### User Story 4 - Equipamento inicial (Priority: P3)

O passo **Equipamento** mostra as vagas: 1 Rare, 1 Uncommon, 2 Common, 2 Very Common. Cada vaga lista os itens do
compêndio daquela raridade, sem artefatos; consumíveis entram em 1 unidade. Wealth, Inheritance e Artifact seguem os
backgrounds escolhidos.

**Why this priority**: fecha a criação; os personagens também podem receber equipamento depois pelo Mestre.

**Independent Test**: Jane escolhe Injector rig (Uncommon), Autopistol e Micro-Bead (Common), Knife e Leather (Very
Common) e um item Rare; concluir e ver os seis itens na ficha.

**Acceptance Scenarios**:

1. **Given** uma vaga, **When** listada, **Then** só aparecem itens da raridade dela, sem artefatos.
2. **Given** vagas vazias, **When** o jogador conclui, **Then** o assistente avisa (não bloqueia) que há vagas sem item.
3. **Given** a conclusão, **When** aplicada, **Then** os itens entram na ficha marcados como equipamento inicial (007).

---

### User Story 5 - Permissão e rascunho (Priority: P2)

Se o jogador não puder criar atores no mundo, ao Concluir o pedido vai ao Mestre ativo, que cria o ator com o jogador
como dono; o assistente então aplica o resto. Sem Mestre conectado, o assistente avisa e mantém o rascunho. Fechar o
assistente salva o **rascunho**; ao reabrir, o jogador escolhe continuar ou começar do zero.

**Why this priority**: sem isso, jogadores comuns não conseguem usar o montador na maioria dos mundos.

**Independent Test**: com um jogador sem permissão de criar atores, montar e concluir com o Mestre conectado; fechar no
meio e reabrir para continuar.

**Acceptance Scenarios**:

1. **Given** um jogador sem permissão e um Mestre conectado, **When** conclui, **Then** o ator é criado pelo Mestre com o jogador como dono e preenchido.
2. **Given** nenhum Mestre conectado, **When** o jogador sem permissão conclui, **Then** recebe um aviso e o rascunho fica salvo.
3. **Given** o assistente fechado no meio, **When** reaberto, **Then** oferece continuar do passo em que parou ou recomeçar.

---

### Edge Cases

- Voltar a um passo anterior e mudar a raça ou a exaltação: os passos seguintes que dependem dela (bônus, Exalted
  Asset, classes) são revalidados e o que ficou inválido é marcado.
- Compêndios sem um item referenciado: o passo avisa e segue.
- Falha no meio da conclusão: o ator fica em criação (016) para o Mestre ou o jogador terminar na ficha; o rascunho não é apagado.
- Mestre usando o montador: cria o ator para si ou escolhe o jogador dono.
- Nome vazio: Concluir recusado.
- Personagem sem classe possível (pré-requisitos): o passo mostra por quê.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A aba de atores MUST ter um botão "Novo personagem" que abre o assistente.
- **FR-002**: O assistente MUST seguir a ordem: Conceito, Raça, Exaltação, Características, Perícias, Especialidades, Classe, Backgrounds, Alinhamento, Assets e Hindrances, Exalted Asset, XP, Equipamento, Revisão.
- **FR-003**: Cada passo MUST mostrar só opções válidas e MUST bloquear o avanço com escolhas fora da regra, mostrando o motivo; o Mestre MUST poder liberar.
- **FR-004**: Raça e exaltação MUST ter suas escolhas feitas dentro do passo.
- **FR-005**: Características MUST usar prioridades 6/4/2 com base 1 e teto 4; perícias 8/6/4 com base 0 e teto 3.
- **FR-006**: Especialidades MUST ser permitidas uma por característica ou perícia com valor final 4 ou mais.
- **FR-007**: Classes MUST ser filtradas por início no nível 1 e pré-requisitos.
- **FR-008**: Backgrounds MUST ter 7 pontos gratuitos (nenhum acima de 3 sem XP; Artifacts até 5) e o excedente MUST custar XP do saldo comum.
- **FR-009**: Hindrances MUST ser no máximo 2 (+100 XP cada); Assets e Exalted Asset MUST custar 100 XP (Perfection grátis; um Exalted Asset fora Paragon).
- **FR-010**: O passo XP MUST seguir a tabela da p. 16 e as listas da classe, mostrando custo e saldo.
- **FR-011**: O equipamento MUST ter as vagas 1 Rare, 1 Uncommon, 2 Common e 2 Very Common, cada uma com a raridade exata, sem artefatos.
- **FR-012**: Um resumo lateral MUST mostrar o personagem montado até o passo atual, com valores finais.
- **FR-013**: Ao Concluir, o ator MUST ser criado com o jogador como dono e preenchido pelos mesmos caminhos da ficha, sem novas perguntas; compras MUST entrar no log de XP.
- **FR-014**: Sem permissão de criar atores, o ator MUST ser criado pelo Mestre ativo a pedido do jogador.
- **FR-015**: O rascunho MUST ser salvo ao fechar e oferecido ao reabrir; Concluir com sucesso MUST apagá-lo.
- **FR-016**: Uma falha na conclusão MUST deixar o ator em criação e o rascunho intacto.
- **FR-017**: O assistente MUST usar o design system (021) e ter textos em inglês e pt-BR.

### Key Entities

- **Rascunho**: as escolhas de cada passo e o passo atual, por usuário.
- **Plano de construção**: a sequência de aplicações derivada do rascunho ao Concluir.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O exemplo da p. 18 (Jane) é montado do começo ao fim no assistente e a ficha resultante bate com o livro (valores, traços, 50 XP restantes, salvo os feats fora da lista do Monk, que pedem liberação do Mestre).
- **SC-002**: Um jogador sem permissão de criar atores conclui um personagem com o Mestre conectado.
- **SC-003**: Nenhuma escolha inválida passa sem bloqueio ou liberação explícita do Mestre.
- **SC-004**: Fechar e reabrir o assistente retoma do mesmo passo com as mesmas escolhas.

## Assumptions

- A classe no nível 1 não concede nada além do que a ficha já faz (o capítulo não define).
- O teto de perícias 3 vale para os dots de criação; bônus de raça entram por cima, como na 016.
- Idiomas continuam só como lembrete (sem campo na ficha), no passo Revisão.
- Biofoam e outros itens do exemplo que não existem no compêndio ficam fora.
- O montador cria personagens (tipo `character`); NPCs ficam fora.
