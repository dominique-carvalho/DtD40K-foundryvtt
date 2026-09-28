# Feature Specification: Criação de armas (DtD 7.7a)

**Feature Branch**: `015-weapon-crafting`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "Montador de armas do Story Master (pp. 516–519): template + tipo + até 2 mods (3 com tipo de mod extra), raridade pela soma dos custos e TN pela tabela de disponibilidade, gerando armas da 007. Mestre e jogadores usam (arma do jogador pendente até o Mestre aprovar). Fabricação em duas etapas (Wealth para materiais e Crafts, ambos no TN da raridade). Efeitos numéricos dos mods entram no perfil e os condicionais no ataque; efeitos especiais como nota."

**Referência de regras**: DtD **7.7a** — cap. XIV "The Story Master", "Weapon Creation", pp. 516–519 (templates e
tipos p. 516; mods pp. 517–518; preço, disponibilidade e fabricação p. 519). Constituição v1.2.1.

**Depende de**: 001 (rolagem), 007 (armas, qualidades, ataque e dano, raridade, teste de Wealth), 011 (Wealth como
Background).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Montar uma arma (Priority: P1)

O Mestre abre o **montador de armas** (no diretório de itens) e escolhe um **template** (Pistol, Basic, Cannon, Heavy
Rifle, Melee), um **tipo** (8 de longo alcance: Ordinary, Las, Plasma, Melta, Bolter, Syrneth, Exotic, Flamer; 10 de
corpo a corpo: Ordinary, Parrying, Cavalry, Flail, Fencing, Two Handed, Syrneth, Chain, Shield, Unarmed) e **até dois
mods** da tabela certa (22 de corpo a corpo, 46 de longo alcance; três quando o tipo dá um mod extra), só entre os
compatíveis com a letra do tipo e sem repetir. O montador mostra o perfil resultante (dano, tipo de dano, Pen, ROF,
alcance, pente, recarga, qualidades), a **raridade** (0 = Common, somando o custo dos mods e o modificador do tipo) com o
TN, as notas dos efeitos especiais e os avisos. Ao confirmar, cria a arma no mundo como item de arma da 007.

**Why this priority**: é o núcleo da feature; o resto usa a arma criada.

**Independent Test**: Basic + Las + Extended Clip + Red-Dot Sight: 3k2 E, Pen 0, S/-, 40 m, pente 48 (12 × 2 × 2),
Reliable, raridade +2 = Rare (TN 20), nota do Red-Dot; Pistol + Bolter + High Caliber + Magnum Rounds: 5k2 X
(2k2 + 1k0 + 1k0 + 1k0), Pen 2, raridade +2.

**Acceptance Scenarios**:

1. **Given** o montador aberto, **When** o Mestre escolhe template, tipo e mods, **Then** o perfil e a raridade se atualizam a cada escolha.
2. **Given** um mod incompatível com o tipo ou já escolhido, **When** a lista é mostrada, **Then** ele aparece desabilitado com o motivo.
3. **Given** um tipo com mod extra (Syrneth, Exotic), **When** escolhido, **Then** o limite passa a três mods.
4. **Given** um tipo com "escolha o dano", **When** escolhido, **Then** o montador pede o tipo de dano entre os permitidos; sem tipo impresso, fica o do template.
5. **Given** a arma confirmada, **When** criada, **Then** tem grupo e proficiências do grupo de mesmo nome da 007, raridade calculada, qualidades e notas, e pode ser editada na ficha de arma.

---

### User Story 2 - A arma em jogo (Priority: P2)

A arma criada funciona como qualquer arma da 007: o ataque e o dano usam o perfil; os efeitos **condicionais** entram
sozinhos: Breacher +1k0 de dano a curta distância ou menos; Red-Dot Sight +1k0 no acerto em tiro simples; Motion Predict
+1k0 no acerto em rajada; Unstable rola 1d10 no acerto (1 metade do dano, 10 dobra); Volatile explode em 9 e 10;
Nonlethal não explode; Orgone Array avisa psychic phenomena quando um dado de dano explode. Os demais (Quick Draw, Aim
como reação, sem penalidade de escuridão, Felling, Melee Attach) aparecem como notas na ficha e no cartão.

**Why this priority**: sem isso a arma é só texto; depende da US1.

**Independent Test**: com a arma de Red-Dot, um tiro simples rola +1k0 no ataque e uma rajada não; um Melta com Breacher
a curta distância rola +1k0 de dano; uma arma Unstable mostra o d10 e o dano ajustado no cartão.

**Acceptance Scenarios**:

1. **Given** uma arma com Red-Dot Sight, **When** o ataque é em tiro simples, **Then** +1k0 no acerto e a nota no cartão.
2. **Given** Breacher e alcance curto ou menor, **When** o dano é rolado, **Then** +1k0.
3. **Given** Unstable, **When** o ataque acerta e o dano é rolado, **Then** o cartão mostra o d10 e o dano metade/dobrado/normal.
4. **Given** uma arma com notas, **When** a ficha ou o cartão são abertos, **Then** as notas aparecem.

---

### User Story 3 - Jogadores e fabricação (Priority: P3)

O jogador abre o montador pela aba Equipamento da própria ficha; a arma nasce **pendente** (não equipa nem ataca) até o
Mestre aprovar (botão na ficha da arma; o Mestre pode ajustar antes). Para uma arma **fabricada**, o jogador faz duas
etapas no TN da raridade: **materiais** pelo teste de Wealth da 007 (com as regras de aquisição) e **fabricação** por
Crafts; a arma fica pronta quando as duas passam; a falha registra a tentativa e pode ser repetida.

**Why this priority**: completa o fluxo do livro; depende da US1.

**Independent Test**: jogador monta uma arma Rare (TN 20): pendente; o Mestre aprova; o jogador rola Wealth (sucesso) e
Crafts 3 (falha e depois sucesso); a arma fica pronta e pode ser equipada.

**Acceptance Scenarios**:

1. **Given** uma arma montada pelo jogador, **When** criada, **Then** fica pendente, com aviso na ficha, até o Mestre aprovar.
2. **Given** uma arma aprovada para fabricação, **When** o teste de materiais passa, **Then** a etapa fica registrada e libera o teste de Crafts.
3. **Given** os dois testes com sucesso, **When** o segundo termina, **Then** a arma fica pronta e equipável.
4. **Given** uma falha, **When** acontece, **Then** o cartão mostra e a etapa pode ser tentada de novo.

---

### Edge Cases

- **Raridade abaixo de −3 ou acima de +8**: presa aos extremos da tabela (Worthless, Glittergold).
- **Dois mods de ROF** (Burst Fire, Machine Gun, Rock and Roll): vale o último, com aviso.
- **Bullet Hose** sem rajada no template: +2 sobre 0 (rajada 2) com Inaccurate.
- **Bônus iguais** (Extra Damage I/II, High Caliber + Magnum Rounds, Blast de dois mods): somam; Blast fica no maior.
- **Recarga "Full"/"2 Full" em dobro ou metade**: Full ↔ 2 Full; Half ↔ Full; valores fora disso ficam como texto.
- **Mod que troca o tipo de dano** (Incendiary corpo a corpo → E): vence o tipo.
- **Throwing** (corpo a corpo): arma arremessável com alcance 10 m.
- **Quick Draw, Melee Attach (Spear/Chainsword), Felling**: notas; Melee Attach cita o perfil do Spear/Chainsword do compêndio.
- **Custos diferentes do mesmo mod nas duas tabelas** (Toxic, Tearing, Incendiary, Volatile): cada tabela usa o seu.
- **Usuário sem permissão**: vê a arma só como leitura; jogador não aprova a própria arma.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Dados das 5 templates, 18 tipos (com letra, mudanças de perfil, raridade e mod extra), 68 mods (custo, compatibilidade, efeito numérico, qualidades, condição e nota) e da tabela de disponibilidade (12 linhas).
- **FR-002**: Montador com escolha de template, tipo, tipo de dano (quando o tipo pede), até 2 mods (3 com mod extra), só compatíveis e sem repetir; perfil, raridade, TN, notas e avisos ao vivo.
- **FR-003**: A arma criada é um item de arma da 007 com grupo/proficiência do grupo de mesmo nome, raridade calculada, qualidades, notas e o registro da montagem (template, tipo, mods) para reabrir no montador.
- **FR-004**: Mods numéricos alteram o perfil (dano, Pen, ROF, alcance, pente, recarga, tipo de dano, qualidades, explosão); conflitos de ROF: o último vence, com aviso; bônus iguais somam.
- **FR-005**: O ataque e o dano da 007 aplicam os condicionais (Breacher, Red-Dot Sight, Motion Predict, Unstable, Nonlethal, Orgone Array) e mostram as notas.
- **FR-006**: O Mestre abre o montador no diretório de itens (arma de mundo); o jogador na aba Equipamento (arma na ficha, pendente até aprovação do Mestre).
- **FR-007**: Fabricação em duas etapas no TN da raridade: materiais pelo teste de Wealth da 007 e Crafts; estado da fabricação na arma; falha registrada e repetível.
- **FR-008**: Textos de interface en e pt-BR; notas e resumos em redação própria (6-gramas = 0).

### Tabela de referência

| Item | Valores |
|---|---|
| Templates | Pistol 2k2 I Pen 0 S/- 30 m pente 6 Full · Basic 3k2 I 0 S/- 40 m 12 Full · Cannon (Heavy) 3k3 I 4 S/- 60 m 4 2 Full · Heavy Rifle (Heavy) 2k2 I 2 S/- 60 m 40 Full · Melee 1k2 I 0 |
| Tipos à distância | O Ordinary (−1 raridade) · L Las (E, Reliable, pente ×2) · P Plasma (E, +2 Pen, recarga ×2) · M Melta (E, alcance ½, +4 Pen) · B Bolter (X, +1k0, +2 Pen) · S Syrneth (E ou R, +1 mod) · E Exotic (escolha, +1 mod) · F Flamer (E) |
| Tipos corpo a corpo | O Ordinary (R ou I, −1) · P Parrying (R ou I) · C Cavalry (R, +1k0) · F Flail (Flexible, +1) · N Fencing (R, Balanced) · T Two Handed (Two Hands, +1k1) · S Syrneth (escolha, +3 Pen, +1 mod) · A Chain (R, Tearing) · H Shield (I, Defensive) · U Unarmed (R ou I, Brawling, +0k1) |
| Mods | 22 corpo a corpo, 46 à distância (custos −1 a +2) |
| Disponibilidade | −3 Worthless 0 · −2 Ubiquitous 2 · −1 Very Common 5 · 0 Common 10 · +1 Uncommon 15 · +2 Rare 20 · +3 Very Rare 25 · +4 Mythic Rare 30 · +5 Near Unique 35 · +6 Fabulous Max 40 · +7 Irrationally Expensive 45 · +8 Glittergold 50 |

### Key Entities

- **Montagem**: template, tipo, tipo de dano escolhido, mods; gera o perfil e a raridade.
- **Arma customizada**: item de arma da 007 com a montagem, as notas, o estado (pendente, aprovada, em fabricação, pronta).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das templates, tipos, mods e linhas de disponibilidade do livro estão nos dados, com os números do livro.
- **SC-002**: Montar uma arma com dois mods leva menos de 1 minuto e o perfil confere com a conta à mão nos casos de teste.
- **SC-003**: Os efeitos condicionais aparecem no ataque sem conta à mão em 100% dos casos de teste.
- **SC-004**: Nenhum resumo ou nota repete 6 palavras seguidas do livro.

## Assumptions

- **Proficiência**: a do grupo de mesmo nome das armas da 007 (Las, Plasma, Chain…); o template decide Basic, Pistol,
  Heavy ou Melee (decisão do usuário).
- **Dano sem tipo impresso**: o do template (I); "escolha" entre os tipos listados; mod que troca o dano vence
  (decisão do usuário).
- **ROF**: o último mod vence, com aviso; bônus iguais somam (decisão do usuário).
- **Condicionais automáticos no ataque** (decisão do usuário); Felling e Melee Attach como nota.
- A raridade soma os custos dos mods **e** o modificador do tipo (Ordinary −1, Flail +1); o total fica entre −3 e +8.
- A fabricação usa o teste de aquisição da 007 com o TN da raridade final para os materiais, e Crafts
  (com a característica padrão da perícia, Wisdom) no mesmo TN; sem limite de tentativas.
- A aprovação do Mestre é uma marca na arma; o Mestre pode editar o perfil antes (sanity check do livro).
