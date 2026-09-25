# Feature Specification: Compêndio de Raças (livro base 1.6)

**Feature Branch**: `002-race-compendium`

**Created**: 2026-09-25

**Status**: Draft

**Input**: User description: "Compêndio de Raças do livro base DtD 1.6 (Fase 1, feature 002): tipo de Item 'race' com os dados mecânicos da raça — bônus de característica (+1 em uma de duas características; Human: qualquer uma), bônus de perícia (+1 em duas perícias; Human: quaisquer duas), Poder racial (nome + descrição resumida, com usos por cena 1/2/3 nos níveis 1/3/5 quando aplicável), Size, altura/peso médios, idiomas, traços comuns e nomes de exemplo; ficha de item para ver/editar a raça; compêndio 'Races' com as 12 raças do livro base (pp. 27–51), fonte versionada em JSON; descrições resumidas com redação própria em inglês. Aplicar no ator: arrastar a raça para a ficha define o Size, pede a escolha da característica bonificada (e, para Human, das perícias) e aplica os bônus via Active Effects; o personagem só pode ter uma raça. Poderes com efeito mecânico simples e determinístico (Human, Halfling, Squat) devem ser automatizados; os demais ficam como texto/contador manual. Observação: Halfling e Gnome listam o mesmo bônus (Int/Fel) — tratar como está no livro."

**Referência de regras**: `docs/analise-dtd.md` §5 (tabela do livro base); livro 1.6 pp. 27–51
(Racial Traits p. 27; uma raça a cada duas páginas, de Aasimar p. 28 a Tiefling p. 50).

**Depende de**: `001-system-foundation` (ator Personagem, características, perícias, derivados,
Size, Level e Hero Points).

## Clarifications

### Session 2026-09-25

- Q: Ao remover a raça, o que acontece com o Size? → A: o Size da raça é um modificador racial
  que substitui o Size base do personagem; removida a raça, volta o Size base (4 por padrão, ou o
  valor definido pelo Mestre).
- Q: Quem pode aplicar, trocar, remover ou refazer a escolha da raça? → A: qualquer dono do
  personagem (jogador ou Mestre), a qualquer momento; observadores só veem.
- Q: Com bônus racial, o que o clique no ponto N faz? (achado U1 do `/speckit-analyze`) → A:
  torna N o valor final; grava o valor distribuído (base) = N − bônus racial, mínimo 0; o final
  nunca fica abaixo do bônus racial.
- Q: Onde o poder racial e o contador de usos aparecem na ficha do personagem? → A: o nome da
  raça fica na linha de identidade do cabeçalho; poder e contador ficam numa nova aba "Traits"
  (que depois recebe feats e poderes de exaltação).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar as raças do livro no compêndio (Priority: P1)

O Mestre ou um jogador abre o compêndio **Races** do sistema e encontra as 12 raças do livro base.
Ao abrir uma raça, vê uma ficha com: nome, imagem, resumo em inglês com redação própria, as
opções de bônus de característica, as perícias bonificadas, o Size, o poder racial (nome,
resumo e, quando houver, usos por cena por nível) e as informações de ambientação (altura e peso
médios, idiomas, traços de personalidade e físicos comuns, nomes de exemplo).

**Why this priority**: é a entrega central pedida (o compêndio) e já tem valor sozinha: serve de
referência rápida durante a criação de personagem, sem abrir o PDF.

**Independent Test**: num mundo DtD, abrir o compêndio Races, conferir que as 12 raças estão lá e
comparar os dados mecânicos de cada uma com a tabela de referência desta spec.

**Acceptance Scenarios**:

1. **Given** um mundo DtD recém-criado, **When** o usuário abre a aba de compêndios, **Then** existe
   o compêndio "Races" com exatamente 12 entradas: Aasimar, Dark Eldarin, Dragonborn, Eldarin,
   Elf, Gnome, Halfling, Human, Ork, Squat, Tau e Tiefling.
2. **Given** o compêndio aberto, **When** o usuário abre "Eldarin", **Then** a ficha mostra
   bônus "+1 Wisdom ou Intelligence", perícias "+1 Academic Lore e Arcana", Size 3 e o poder
   "Warp Step" com usos por cena 1/2/3 nos níveis 1/3/5.
3. **Given** a ficha de "Human", **When** exibida, **Then** o bônus de característica aparece como
   "qualquer uma", o de perícia como "quaisquer duas", Size 4 e o poder "Heroic Heritage".
4. **Given** qualquer raça, **When** a descrição é exibida, **Then** ela é um resumo em inglês com
   redação própria (sem trechos copiados do livro) e cita a página de origem.
5. **Given** o idioma do Foundry em pt-BR, **When** a ficha da raça é aberta, **Then** rótulos e
   títulos de seção aparecem em português (o conteúdo das descrições permanece em inglês).

---

### User Story 2 - Aplicar a raça ao personagem (Priority: P2)

Na criação do Herói, o jogador arrasta uma raça do compêndio para a ficha do personagem. O
sistema pergunta qual característica recebe o +1 (entre as duas opções da raça; qualquer uma para
Human) e, para Human, quais duas perícias recebem +1. Em seguida o personagem passa a ter essa
raça: o Size assume o valor da raça, os bônus aparecem somados nas características e perícias,
e a raça fica visível no cabeçalho da ficha. Trocar de raça substitui a anterior por completo.

**Why this priority**: tira do jogador o trabalho manual e o risco de erro de aplicar os bônus,
mas depende do compêndio (P1) existir.

**Independent Test**: criar um personagem com Wisdom 2 e Academic Lore 0, arrastar Eldarin,
escolher Wisdom, e conferir Wisdom 3, Academic Lore 1, Arcana +1, Size 3 e os derivados
recalculados; depois arrastar Ork e conferir que só os bônus do Ork permanecem.

**Acceptance Scenarios**:

1. **Given** um personagem sem raça com Wisdom 2 e Size 4, **When** o jogador arrasta Eldarin e
   escolhe Wisdom, **Then** Wisdom passa a valer 3, Academic Lore e Arcana ganham +1, Size passa a
   3 e Static Defense é recalculada na mesma hora.
2. **Given** a janela de escolha aberta, **When** o jogador cancela, **Then** nada é alterado no
   personagem.
3. **Given** um personagem Eldarin, **When** o jogador arrasta Ork e escolhe Strength, **Then** a
   raça Eldarin e todos os seus bônus são removidos, os bônus do Ork são aplicados e o Size passa
   a 5 — o personagem nunca fica com duas raças.
4. **Given** um personagem Human, **When** o jogador escolhe Charisma e as perícias Pilot e
   Command, **Then** Charisma, Pilot e Command ganham +1, e o jogador não consegue escolher a
   mesma perícia duas vezes.
5. **Given** um personagem com raça, **When** o jogador remove a raça da ficha, **Then** todos os
   bônus e efeitos daquela raça deixam de valer, os valores voltam aos que o jogador distribuiu e
   o Size volta ao Size base (4, se o Mestre não o alterou).
6. **Given** um personagem com raça, **When** o jogador ou o Mestre pede para refazer a escolha,
   **Then** pode trocar a característica (e, para Human, as perícias) bonificada sem remover e
   arrastar a raça de novo.
7. **Given** a ficha em modo edição com Wisdom 2 + 1 racial (final 3, com 1 ponto indicado como
   racial), **When** o jogador clica no 4º ponto de Wisdom, **Then** o valor final passa a 4
   (valor distribuído 3 + 1 racial); **When** clica de novo no ponto do valor final atual,
   **Then** o final volta a 3. O valor final nunca fica abaixo do bônus racial.
8. **Given** uma perícia Avançada com 0 pontos que recebe +1 racial, **When** a ficha é exibida,
   **Then** a perícia conta como treinada (valor 1).

---

### User Story 3 - Poderes raciais na ficha (Priority: P3)

O personagem com raça vê o poder racial na aba "Traits" da ficha. Poderes com efeito mecânico simples já valem
automaticamente (Human, Halfling, Squat); poderes de uso limitado por cena mostram um contador
de usos com o máximo calculado pelo Level; os demais aparecem como texto de referência.

**Why this priority**: completa a raça na mesa de jogo, mas a maior parte dos poderes é narrativa
ou depende de sistemas futuros (feats, combate); o valor incremental é menor.

**Independent Test**: criar três personagens (Human, Halfling, Squat) e um Elf; conferir Hero
Points, Static Defense, Resilience e o contador de usos do Elf nos Levels 1, 3 e 5.

**Acceptance Scenarios**:

1. **Given** um personagem Human com Hero Points 2/2, **When** a raça é aplicada, **Then** Hero
   Points passa a 3/3.
2. **Given** um Halfling com Dexterity 3, Wisdom 4 e Size 2, **When** a ficha é exibida, **Then**
   Static Defense = 10 + 6×3 − 2×2 = 24 (Wisdom não entra).
3. **Given** um Squat com Size 3 e Level 1, **When** a ficha é exibida, **Then** Resilience = 4
   (3 da fórmula + 1 do poder Squat Toughness).
4. **Given** um Elf, **When** o Level é 1, 3 e 5, **Then** o contador de Elven Accuracy mostra
   máximo 1, 2 e 3 usos por cena, respectivamente (Level 2 → 1; Level 4 → 2; Level 6+ → 3).
5. **Given** um contador de usos com 1 uso restante, **When** o jogador marca um uso, **Then** o
   contador mostra 0 e não desce abaixo de 0; **When** o jogador usa "nova cena", **Then** os usos
   voltam ao máximo.
6. **Given** um Aasimar, **When** a ficha é exibida, **Then** o poder "And They Shall Know No
   Fear" aparece com o texto dizendo que o personagem começa com os feats Jaded e Fearless, sem
   automação (feats ainda não existem no sistema).
7. **Given** um derivado com override do Mestre, **When** um poder racial automatizado o afetaria,
   **Then** o override continua prevalecendo.

---

### Edge Cases

- **Bônus que ultrapassaria 6**: característica ou perícia com valor distribuído 6 + 1 racial
  permanece 6 (limite máximo do sistema) e a ficha indica que o bônus foi limitado.
- **Raça arrastada para um ator que não é Personagem**: a ação é recusada com aviso.
- **Personagem sem raça**: a aba "Traits" mostra um aviso para arrastar uma raça do compêndio
  e a linha de identidade do cabeçalho fica sem raça.
- **Usuário sem permissão de dono** arrasta uma raça para o personagem: nada é alterado (o
  Foundry já não aceita o drop).
- **Mesma raça arrastada de novo**: tratada como troca (substitui a atual), abrindo a escolha de
  novo; nada é duplicado.
- **Raça editada no compêndio após aplicada**: o personagem mantém a cópia que recebeu; mudanças no
  compêndio não afetam personagens existentes.
- **Raça criada pelo Mestre (fora do compêndio)**: funciona igual às do livro, desde que tenha os
  campos preenchidos; bônus de característica com uma única opção dispensa a escolha.
- **Halfling com override de Static Defense**: o override do Mestre vence a fórmula Shifty.
- **Remoção da raça**: o Size volta ao Size base do personagem (4 por padrão, ou o valor que o
  Mestre definiu); Hero Points máximo volta ao valor sem o bônus Human e o atual é limitado ao
  novo máximo.
- **Level abaixo de 1 ou acima de 5** para usos por cena: Level 1–2 → 1 uso; 3–4 → 2; 5+ → 3.
- **Gnome e Halfling com o mesmo bônus (Intelligence ou Fellowship)**: implementado exatamente
  como no livro (p. 38 e p. 40); registrado como observação, não como erro a corrigir.

## Requirements *(mandatory)*

### Functional Requirements

**Raça (dados)**

- **FR-001**: O sistema MUST oferecer um tipo de item "Raça" com: nome, imagem, descrição
  resumida, página de origem, opções de bônus de característica (lista de características
  elegíveis, ou "qualquer uma"), perícias bonificadas (lista fixa, ou "quaisquer N"), Size,
  poder racial (nome, descrição resumida, tipo de automação e, quando aplicável, usos por cena
  por faixa de Level), altura média, peso médio, idiomas, traços de personalidade comuns, traços
  físicos comuns e nomes de exemplo.
- **FR-002**: Todo bônus racial de característica e de perícia MUST valer +1 (livro p. 27); o
  personagem recebe o bônus em apenas uma das características listadas, salvo indicação da raça.
- **FR-003**: Usos por cena, quando existirem, MUST seguir a progressão 1/2/3 nos Levels 1/3/5
  (Dark Eldarin, Dragonborn, Eldarin, Elf — pp. 30, 32, 34, 36).

**Ficha da raça**

- **FR-004**: A raça MUST ter uma ficha própria para visualizar todos os campos do FR-001 e, para
  quem tem permissão de edição, editá-los; nas raças do compêndio bloqueado a ficha é somente
  leitura.
- **FR-005**: Os rótulos da ficha da raça MUST estar em pt-BR e inglês; os textos de conteúdo das
  raças do compêndio ficam em inglês.

**Compêndio**

- **FR-006**: O sistema MUST distribuir o compêndio "Races" com as 12 raças do livro base e os
  dados da Tabela de referência abaixo.
- **FR-007**: A fonte do compêndio MUST ser mantida em arquivos de texto versionados e gerada
  para o formato do Foundry por ferramenta, nunca editada à mão no formato binário
  (constituição, V).
- **FR-008**: As descrições da raça e do poder MUST ser resumos com redação própria em inglês,
  com os dados mecânicos completos; é proibido copiar o texto do livro (constituição, V).

**Aplicação no personagem**

- **FR-009**: Arrastar uma raça para a ficha de um Personagem MUST abrir uma escolha da
  característica bonificada (entre as elegíveis) e, quando a raça pede perícias à escolha, das
  N perícias distintas; confirmar aplica a raça, cancelar não altera nada.
- **FR-010**: Ao aplicar a raça, o sistema MUST: fazer o Size da raça substituir o Size base do
  personagem, como modificador racial (o Size base continua guardado e volta a valer quando a
  raça é removida ou o modificador é desativado); somar +1 na característica escolhida e em cada perícia bonificada, como modificadores
  que o Mestre pode desativar individualmente; e exibir o nome da raça na linha de identidade do
  cabeçalho da ficha (clicar abre a ficha da raça).
- **FR-011**: O personagem MUST ter no máximo uma raça. Aplicar outra raça MUST remover a
  anterior e todos os seus modificadores antes de aplicar a nova.
- **FR-012**: Remover a raça MUST remover todos os seus modificadores.
- **FR-013**: MUST ser possível refazer a escolha de característica/perícias da raça já aplicada
  sem removê-la.
- **FR-013a**: Aplicar, trocar, remover e refazer a escolha da raça MUST estar disponível a
  qualquer usuário com permissão de dono do personagem (jogador ou Mestre), a qualquer momento;
  usuários sem essa permissão veem a raça e o poder apenas como leitura.
- **FR-014**: A ficha do personagem MUST exibir o valor final (distribuído + racial) de
  características e perícias e indicar visualmente quando há bônus racial. Clicar no ponto N
  MUST tornar N o valor final, gravando só o valor distribuído (base) = N − bônus racial,
  mínimo 0; clicar no ponto do valor final atual reduz o final em 1. Os derivados MUST usar o
  valor final.
- **FR-015**: O valor final de característica e perícia MUST ficar limitado a 6.

**Poderes raciais**

- **FR-015a**: A ficha do personagem MUST ganhar navegação por abas: a aba principal com o
  conteúdo atual (características, perícias, derivados) e uma nova aba "Traits", que mostra a
  raça (nome, imagem, bônus escolhidos, ações de refazer escolha/remover) e o poder racial com
  seu contador. O cabeçalho fixo continua visível em todas as abas, e a aba ativa é lembrada
  como o modo da ficha (por usuário e por personagem).

- **FR-016**: Poderes automatizados (com o comportamento do livro como padrão):
  - Human — Heroic Heritage: +1 no máximo de Hero Points; ao aplicar a raça, o atual também
    sobe 1 (p. 42).
  - Halfling — Shifty: Static Defense = 10 + 6×Dexterity − 2×Size, substituindo a fórmula
    padrão (p. 40).
  - Squat — Squat Toughness: Resilience +1 (a Resilience só é usada para calcular HP perdido
    por dano, então equivale ao texto do livro, p. 46).
- **FR-017**: Poderes com usos por cena MUST exibir um contador (usos restantes / máximo pelo
  Level), com ações para gastar um uso e para restaurar todos ("nova cena"); o contador não
  rola nada nem aplica efeitos.
- **FR-018**: Os demais poderes (Aasimar, Gnome, Ork, Tau, Tiefling) MUST aparecer como texto de
  referência na aba "Traits", sem automação nesta feature.
- **FR-019**: Todo valor alterado por poder racial MUST continuar sujeito ao bônus/override
  manual do Mestre já existente nos derivados (constituição, IV).
- **FR-020**: Todo texto de interface novo MUST existir em pt-BR e inglês.

### Tabela de referência (livro 1.6, pp. 28–51)

| Raça | Pág. | Característica +1 (uma) | Perícias +1 | Poder | Automação | Size |
|---|---|---|---|---|---|---|
| Aasimar | 28 | Wisdom ou Constitution | Command, Ballistics | And They Shall Know No Fear: começa com os feats Jaded e Fearless | texto | 5 |
| Dark Eldarin | 30 | Charisma ou Dexterity | Deceive, Forbidden Lore | Warp Miasma: meia ação, esfera de escuridão de 4 m de raio que bloqueia linha de efeito e cega quem está dentro; dura 1 rodada por Level | usos 1/2/3 | 3 |
| Dragonborn | 32 | Strength ou Charisma | Command, Intimidation | Dragon Breath: ataque de sopro com o perfil de um Flamer | usos 1/2/3 | 5 |
| Eldarin | 34 | Wisdom ou Intelligence | Academic Lore, Arcana | Warp Step: meia ação, teleporte até 2×Speed para local visível | usos 1/2/3 | 3 |
| Elf | 36 | Wisdom ou Dexterity | Perception, Charm | Elven Accuracy: rerrola um teste falho de Weaponry ou Ballistics | usos 1/2/3 | 3 |
| Gnome | 38 | Intelligence ou Fellowship | Crafts, Academic Lore | Improvise: uma proficiência de arma e uma de armadura grátis, de qualquer tipo | texto | 3 |
| Halfling | 40 | Intelligence ou Fellowship | Larceny, Deceive | Shifty: Static Defense = 10 + 6×Dex − 2×Size | automático | 2 |
| Human | 42 | qualquer uma | quaisquer duas | Heroic Heritage: +1 Hero Point | automático | 4 |
| Ork | 44 | Strength ou Willpower | Intimidation, Scrutiny | WAAAAAGH!: no início de cada combate, cura HP igual ao Level | texto | 5 |
| Squat | 46 | Constitution ou Willpower | Crafts, Common Lore | Squat Toughness: Resilience +1 para dano | automático | 3 |
| Tau | 48 | Intelligence ou Composure | Common Lore, Persuasion | Fall Back: após esquivar com sucesso de ataque corpo a corpo, recuo (Withdraw) livre com metade do deslocamento | texto | 4 |
| Tiefling | 50 | Dexterity ou Constitution | Intimidation, Weaponry | Bloody Minded: rerrola dados de dano que caírem em 1 | texto | 5 |

Idiomas (todas falam Trade + idioma próprio): Aasimar Celestial; Dark Eldarin Dark Eldarin;
Dragonborn Draconic; Eldarin Eldarin; Elf Elven; Gnome Gnomish; Halfling Halfling; Human Human;
Ork Orkish; Squat Squat; Tau Tau; Tiefling Abyssal.

Normalização de nomes do livro: "Ballistic" (Elf) = Ballistics; "Intimidate" (Tiefling) =
Intimidation; "Common lore" (Squat) = Common Lore.

### Key Entities *(include if feature involves data)*

- **Raça**: item de referência com dados mecânicos (bônus, Size, poder) e de ambientação; existe
  no compêndio e como cópia embutida no personagem que a recebe.
- **Escolha racial**: a característica (e, para Human, as perícias) que o jogador escolheu ao
  aplicar a raça; fica guardada na cópia da raça no personagem.
- **Modificador racial**: cada +1 aplicado a característica/perícia ou efeito de poder
  automatizado; vinculado à raça, desativável pelo Mestre e removido junto com ela.
- **Poder racial**: nome, resumo, tipo de automação (texto, usos por cena ou automático) e, para
  usos por cena, o contador de usos restantes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das 12 raças do compêndio têm bônus de característica, perícias, Size e poder
  idênticos à Tabela de referência (conferência campo a campo).
- **SC-002**: Um jogador aplica uma raça a um personagem novo em no máximo 3 interações
  (arrastar, escolher, confirmar) e em menos de 30 segundos.
- **SC-003**: Em 100% das trocas de raça testadas (todas as 12 raças, em sequência, no mesmo
  personagem) o personagem termina com exatamente uma raça e só os modificadores dela.
- **SC-004**: Os exemplos numéricos das histórias (Eldarin, Halfling SD 24, Squat Resilience 4,
  Human Hero Points 3/3, usos 1/2/3 por Level) produzem 100% dos valores esperados.
- **SC-005**: 0 trechos de descrição copiados literalmente do livro (revisão manual das 12
  entradas: nenhuma frase igual ao texto original).
- **SC-006**: 0 textos de interface desta feature sem tradução ao alternar pt-BR ↔ inglês.

## Assumptions

- **Fora de escopo**: raças do Book 2 (Thri-Kreen, Kenku, Kobold, Dryad — Fase 2); feats e
  proficiências (os poderes de Aasimar e Gnome ficam como texto até essas features existirem);
  automação de combate (Ork WAAAAAGH!, Tau Fall Back, Tiefling Bloody Minded, Dragon Breath);
  validação das regras de criação de personagem (distribuição de pontos, compra de XP);
  tradução do conteúdo das raças para pt-BR.
- A escolha de característica/perícias é feita pelo jogador no momento da aplicação; o sistema
  não sugere a "melhor" opção.
- A raça aplicada é uma cópia independente da entrada do compêndio (padrão do Foundry para itens
  arrastados).
- O contador de usos por cena é restaurado manualmente ("nova cena"); a detecção automática de
  início/fim de cena fica fora de escopo.
- Imagens das raças usam ícones genéricos do Foundry; arte própria fica fora de escopo.
- As páginas citadas seguem a paginação impressa do livro 1.6 (bookmarked final).
- O texto de ambientação (altura, peso, traços e nomes de exemplo) são dados factuais curtos e
  entram como listas, não como prosa copiada.
