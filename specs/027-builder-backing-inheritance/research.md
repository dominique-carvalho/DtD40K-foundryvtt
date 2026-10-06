# Research — 027 Backing e Inheritance no montador

## R1 — Backing no rascunho e na conta

- **Decisão**: `draft.backings: [{ name, value }]`, igual a `draft.artifacts`. `validateBackgrounds` recebe `backings` e
  soma os pontos de cada um na mesma ordem dos demais (cada Backing é um Background à parte, p. 280). Organização sem
  nome gera o aviso `unnamedBacking` (não bloqueia; não é criada na ficha).
- **Racional**: a ficha já guarda `system.backgrounds.backings` como instâncias e `creationDots` (011) conta Artifacts e
  Backings do mesmo jeito; repetir o molde dá o mesmo XP nos dois lados (SC-002).
- **Alternativas**: um único Backing (descartado pelo usuário); campo de organização só na ficha (o problema atual).

## R2 — Conclusão do Backing

- **Decisão**: no passo `backgrounds` do plano, depois dos Artifacts, cada Backing com nome chama
  `addInstance(actor, "backing", name)` e `raiseBackground(actor, "backing", { id })` até os pontos, como os Artifacts.
- **Racional**: os serviços registram cada compra no log de XP; o XP final é o da ficha.

## R3 — Contagem e aviso da Inheritance (regra pura)

- **Decisão**: nova `inheritanceItems({ level, items })` em `rules/builder.mjs`:
  - conta os itens por raridade (`picks`);
  - artefato (hearthstone, material, wonder) gera o motivo `artifact`;
  - `inheritanceFits(level, picks)` falso gera `inheritanceOver`;
  - devolve `used` e `max` em vagas de nota 1 (1 vaga = um Uncommon; `max = 2^(nota − 1)`), para a seção mostrar o uso.
  - `used` vem de uma função `inheritanceUsed(picks)` extraída de `inheritanceFits` (mesma conta; a 011 continua igual).
- **Racional**: SC-003 exige a mesma resposta da ficha; reaproveitar `inheritanceFits` garante isso.
- **Raridade**: a do item no compêndio. O compêndio vai de Ubiquitous a Mythic Rare; "qualquer item não artefato"
  (nota 5) não precisa de categoria própria, porque um Mythic Rare (8 vagas) cabe nas 16 da nota 5.

## R4 — Bloqueio do passo Equipamento

- **Decisão**: `#validate("equipment")` junta os motivos de `equipmentSlots` e de `inheritanceItems`; o Mestre libera o
  passo como já faz. Sem Inheritance e com itens herdados no rascunho (nota reduzida), o motivo é `inheritanceOver`.

## R5 — Conclusão da Inheritance

- **Decisão**: no passo `equipment` do plano:
  1. grava `system.backgrounds.inheritancePicks` com a contagem (atualização direta, porque o montador já validou e o
     Mestre pode ter liberado; `setInheritancePicks` recusaria o jogador nesse caso);
  2. adiciona os itens das vagas iniciais (como hoje);
  3. adiciona os itens herdados com `addEquipment(actor, doc, { starting: true })`: a ficha abre vagas extras pela
     contagem (`startingSlots`, 011). Se a vaga não existir (passo liberado acima da nota), adiciona com
     `{ starting: false }`, para o item não se perder.
- `buildPlan` inclui `equipment` quando há vagas iniciais **ou** itens herdados.

## R6 — Interface

- **Backgrounds**: seção "Backing" abaixo de Artifact, com o texto da 026, botão + e linhas nome/pontos/remover (mesmo
  HTML dos Artifacts; ações `addBacking`/`removeBacking`; campos `backings.<i>.name|value`).
- **Equipamento**: seção "Inheritance" abaixo das vagas, com o texto da 026 e a linha "Usado: X de Y". Com nota > 0,
  botão + adiciona uma linha com seletor (todos os itens não artefatos, agrupados por raridade em `<optgroup>`), a
  raridade e a linha de descrição (`itemNumbers` + efeito), e remover. Campo `inheritance.<i>` (re-renderiza, como as
  vagas).
