# Research: Criação guiada (016)

Inventário do capítulo: `ch-creation-inventory.json` no scratchpad da sessão (10 etapas, 15 verificações, 14 issues).

## R1 — Onde estão os pontos de criação

- **Decision**: pontos de criação de uma nota = valor guardado (`_source`) − base (1 característica, 0 perícia) − pontos
  comprados com XP (soma de `to − from` das entradas `purchase` do log com o mesmo `kind`/`key`).
- **Rationale**: os bônus de raça, exaltação e Assets já entram como Active Effects (não estão no `_source`, spec 002);
  o XP compra subindo o `_source` e registrando no log (spec 006); desfazer remove a entrada. Nada novo é guardado
  (decisão do usuário).
- **Alternatives**: campo de alocação separado (duplica o valor); ler o valor final (cobraria a raça).

## R2 — Orçamentos e limites

- **Decision**: características 1 de base, 6/4/2 entre Physical (Str/Dex/Con), Social (Cha/Fel/Cmp), Mental
  (Int/Wis/Wil), máximo 4 pelos pontos (p. 13); perícias 0 de base, 8/6/4 entre as categorias de `SKILLS[*].group`,
  máximo 3 (pp. 13–14). Os limites valem para os pontos de criação: `base + pontos de criação ≤ 4/3`; raça e XP podem
  passar (exemplo p. 18: Con 3 + 1 da raça; Brawl 3 → 4 por XP).
- **Rationale**: texto e exemplo concordam.

## R3 — Prioridades deduzidas (I03)

- **Decision**: ordenar os grupos pelo gasto (maior primeiro) e atribuir 6/4/2 (8/6/4) nessa ordem; cabe se cada gasto ≤
  orçamento atribuído. Empate: a ordenação estável (Physical, Social, Mental para características; Mental, Physical,
  Social para perícias) não muda o resultado, pois grupos empatados recebem orçamentos ordenados. Uma mudança é recusada
  quando, depois dela, os gastos não cabem. Sobra só aparece no checklist (decisão do usuário).
- **Rationale**: a ordem que maximiza o que cabe é a ordenada (troca de argumento); não precisa de escolha guardada.
- **Alternatives**: escolha explícita da ordem (campo novo, rejeitado).

## R4 — Máximo geral 5 (I04)

- **Decision**: `RATING_MAX = 5`; 6 só por exceção (R5). Vale na edição (limite da etapa já é menor), nas compras de XP
  (`xp-service.advance` compara o valor final com o máximo do personagem) e no corte do valor final
  (`#capRatings` usa o máximo do personagem para cada tipo). O schema continua aceitando 6.
- **Rationale**: p. 22; decisão do usuário. Para não mudar personagens em jogo, o corte do valor final usa o máximo do
  personagem só com a criação ativa (e nunca abaixo do valor guardado); com a criação encerrada, volta a 6 e o máximo
  vale só nas novas subidas (ajuste da validação).

## R5 — Exceções ao máximo

- **Decision**: tabela `RATING_EXCEPTIONS`, casada pelo nome do item (nomes dos packs):
  - Daemonhost (exaltação), poder de rank 2 (Power Stat ≥ 2): características até 6 (p. 76).
  - Paragon (exaltação), rank 2 (Swift as a Coursing River): características e perícias até 6 (p. 84).
  - Atlantean (exaltação), rank 1: até 3 perícias em 6 (p. 68).
  - Mark of Slaanesh (Exalted Asset): até 6 perícias em 6 (p. 213).
  As escolhas de "quais perícias" não são guardadas: o limite é pela contagem de perícias em 6 (subir a
  quarta perícia do Atlantean a 6 é recusado).
- **Rationale**: nenhuma exceção tem automação; os nomes são estáveis (packs.test confere). Com Power Stat 1 na criação,
  Daemonhost e Paragon só liberam depois.
- **Alternatives**: campo de seleção nas exaltações (fora do escopo).

## R6 — Especialidades (I05, I06)

- **Decision**: contar só as especialidades guardadas (`_source`; as de Skill Focus vêm por efeito e já estão pagas).
  Cota = 1 por nota com valor final ≥ 4 (características e perícias, p. 23) + extras em texto: Expanded Knowledge
  (+1 em cada perícia Mental exceto Perception, p. 185), Education (Int inicial especialidades de Lore, compartilhadas
  entre Academic/Common/Forbidden Lore, p. 206), Atlantean (3 Syrneth compartilhadas entre perícias, p. 68).
  Pendente: nota com ≥ 4 e nenhuma especialidade; excedente: especialidades além da cota da nota e dos grupos
  compartilhados. Só informa (checklist), não bloqueia.
- **Rationale**: a regra não tem cota de criação; o exemplo não mostra especialidades (omissão, premissa da spec).

## R7 — XP da criação

- **Decision**: reusa `xpTotals` (600 + prêmios + 100 por Hindrance); o painel mostra total, gasto e saldo e avisa
  prêmios durante a criação. Terceira Hindrance recusada (`HINDRANCE_LIMIT` já existe na config).
- **Rationale**: p. 16, p. 179; a 006 já conta o XP das Hindrances.

## R8 — Assets, Hindrances e classe (I09, I14)

- **Decision**: `feat-service.addFeat` recusa `category` asset/hindrance com a criação encerrada (o aviso
  `creationOnly` vira recusa com liberação do Mestre); `asset-service` recusa Exalted Assets fora da criação (Paragon
  isento, como hoje). `checkClassEntry` recebe `creation` e dá erro `creationLevel` para classe de nível > 1 na criação.
- **Rationale**: p. 16, p. 179, p. 106; decisões do usuário.

## R9 — Checklist e encerramento

- **Decision**: etapas — raça; exaltação (só se houver); classe (uma atual, nível 1); alinhamento (divindade e
  Devotion 6); características; perícias; Backgrounds (7 pontos usados, reusa `creationDots`); XP (sem prêmios; saldo
  é permitido); especialidades; itens iniciais (reusa a contagem da 007/011); idiomas (lembrete: idioma da raça + Trade
  + max(0, Int − 2)). Estados: `done`, `pending`, `warning`. Encerrar: Mestre; com pendências, DialogV2.confirm com a
  lista. O botão sai da aba Equipamento.
- **Rationale**: pp. 13–17; decisões do usuário.

## R10 — Exemplo como teste (I13)

- **Decision**: Traya (pp. 18–19): características base Str 4, Dex 2, Con 3, Cha 1, Fel 2, Cmp 2, Int 1, Wis 2, Wil 4
  (Con +1 raça); perícias Acrobatics 2, Athletics 2, Ballistics 1, Brawl 3 (+1 XP → 4), Arcana 1, Common Lore 1,
  Perception 1, Tech-Use 1, Animal Ken 2, Charm 1, Scrutiny 3; Intimidation e Weaponry +1 da raça; Backgrounds
  Contacts 3, Status 2, Backing 1, Wealth 1; XP 800, gasto 750.
- **Rationale**: a coluna física da ficha extraída está deslocada duas linhas; o deslocamento é confirmado pelos
  pré-requisitos citados no texto (Brawl 2, Acrobatics 1, Athletics 1) e pela compra de Brawl 3 → 4.

## Issues do inventário

| Issue | Tratamento |
|---|---|
| I01 Monk/Brother no exemplo | Sem efeito na regra; teste usa a classe de nível 1 |
| I02 feat racial comprado com XP | Já permitido (p. 179, 006) |
| I03 gastar tudo | R3: sobra avisa |
| I04 máximo 5 | R4 |
| I05/I06 especialidades | R6 |
| I07 texto de HP | Sem efeito (derivado já correto) |
| I08 Veteran/Paragon Statuesque | R1: são efeitos, não cobram pontos |
| I09 classe nível 2 | R8 |
| I10 XP no mesmo valor | R1 |
| I11 custos fixos | Mantidos |
| I12 idiomas | R9: lembrete |
| I13 exemplo desalinhado | R10 |
| I14 Assets/Hindrances | R8 |
