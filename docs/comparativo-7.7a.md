# Comparativo — DtD 7.7a × base anterior (1.6 + Book 2 v2.2)

> **Decisão (2026-09-25):** o projeto adota **Dungeons the Dragoning 7.7a** como fonte de regras
> (constituição v1.2.0, princípio I). Este documento lista o que muda em relação a
> [`analise-dtd.md`](analise-dtd.md), que foi escrita sobre a 1.6 + Book 2 v2.2.
>
> Fonte: `DtD7.7a - Ready to Print.pdf` (579 pp., LawfulNice, edição Loromite). Páginas citadas
> são **páginas do livro 7.7a** (PDF = livro + 1). Texto extraído via `pdftotext`; tabelas
> marcadas como "embaralhadas" devem ser conferidas no PDF antes de virar compêndio.

## 0. Visão geral

- A 7.7a **junta o livro base e o Book 2** num só volume e reequilibra opções fracas.
- O **núcleo não muda**: XkY, 10 explode (composto), conversão acima de 10 dados, raises/checks,
  característica 0, perícia básica sem treino (−1) e avançada bloqueada, especialidade rerrola 1s.
- Mudanças declaradas no prefácio (p. 4): compra de itens mais rápida; veículos mais simples;
  armadura como traje completo; custos de XP fixos; armas desarmadas substituem o soco 0k1.

## 1. Impacto na feature 001 (já na `main`)

| Item | 001 hoje | 7.7a | Página |
|---|---|---|---|
| Acrobatics | Avançada | **Básica** → 7 avançadas: Academic Lore, Common Lore, Forbidden Lore, Medicae, Pilot, Politics, Tech-Use | 25 |
| Athletics | característica padrão Con | **Str** | 25 |
| Stunt dice | +1 dado rolado cada (5k3 + 2 → 7k3) | **+1k1 cada** (5k3 + 2 → 7k5) | 418–419 |
| Tabela de TN | 8 degraus (5–40) | **10 degraus**: 5 Trivial, 10 Easy, 15 Average, 20 Advanced, 25 Hard, 30 Very Hard, 35 Exceptional, 40 Heroic, 45 Never Done Before, 50 Never to be Done Again | 417 |
| Fatigue máxima | não modelada | **= Con** | 16–17 |
| Teste oposto | não modelado | ambos falham → impasse ou ambos rerrolam; empate → maior característica | 417 |

**Sem mudança (confirmado):** 9 características e grupos; 27 perícias; Arcana básica; Static
Defense = 10 + 3·Dex + 3·Wis − 2·Size; **HP = 2·(Con + Wil)** (p. 17, exemplo p. 18, fichas pp. 20/577);
Mental Defense = 5 + 5·Cmp; Resolve = Wil + Cmp; Speed = Str + Dex; Resilience = ⌈(Size+Level)/2⌉ + 1;
iniciativa 1d10 + Dex + Cmp (social: 1d10 + Fel + Cmp); Hero Points 2; Devotion 6; conversão
acima de 10 dados com os mesmos exemplos; característica 0; free raise +5.

**Contradição nova do livro:** Medicae é Avançada no texto (p. 27) mas sem asterisco nas fichas
(pp. 19, 577). Recomendação: seguir o texto (Avançada).

## 2. Criação e XP (pp. 13–18, 515)

- Pontos iniciais **iguais**: características 6/4/2 (máx. 4), perícias 8/6/4 (máx. 3),
  backgrounds 7 (máx. 3), 600 XP, até 2 Hindrances (+100 XP cada).
- Saíram do cap. 2: point-buy alternativo e pacotes Earth/Air/Fire/Water/Void. Equipamento inicial:
  1 Rare, 1 Uncommon, 2 Common, 2 Very Common + roupas (p. 16).
- **Custos de XP agora fixos:**

| Compra | 1.6 | 7.7a |
|---|---|---|
| Característica | 100 × rank | **200** |
| Perícia nova | 100 | 100 |
| Melhorar perícia | 50 × rank | **50** |
| Nova escola (Magia, Espada **ou Gun Kata**) | 200 | 200 |
| Melhorar escola | 100 × rank | 100 × rank (teto = Level) |
| Power Stat | 200 × rank | **300** (teto = Level) |
| Feat | 100 | 100 |
| Asset | 100 (criação) | 100 (criação) |
| Background pontos 1–3 / 4–5 | 50 / 100 | 50 / **100** (só criação) |
| Devotion, Special Attack, Spell Combo | listados | **não constam das tabelas** — Special Attack: 50 XP por ponto de vantagem (cap. 9); Spell Combo: 50 XP por nível de cada magia (cap. 8); Devotion: **decisão pendente** |

## 3. Raças (pp. 30–62) — impacto na feature 002

Estrutura igual (+1 em uma de duas características, +1 em duas perícias, poder, Size). As 16 raças
estão num só capítulo. Características, perícias e Size **não mudaram**. Mudaram os poderes:

| Raça (p.) | Mudança |
|---|---|
| Dark Eldarin (33) | Warp Miasma **sem** limite 1/2/3 por cena |
| Dragonborn (35) | Sopro (perfil Flamer) **sem** limite 1/2/3 por cena |
| Dryad (37) | Pheromones: **+1 rank em Enchantment**, conjurável com Fellowship (era Charm Person) |
| Elf (41) | Elven Accuracy: **1× por rodada** (era 1/2/3 por cena) |
| Gnome (43) | Improvise: **todas** as proficiências de arma e armadura (era 1 + 1) |
| Kenku (49) | Wing-Aided Movement: **trait Flyer** na Speed normal + 2k0 Acrobatics; +1 idioma à escolha |
| Ork (53) | WAAAAAGH!: **HP temporário** = Level no início do combate (era cura) |
| Tau (57) | Fall Back: após esquivar de **qualquer** ataque (não só corpo a corpo) |

Sem mudança: Aasimar, Eldarin (única com 1/2/3 por cena), Halfling (Shifty), Human, Kobold,
Squat, Thri-Kreen, Tiefling. Novo vínculo: Paragon *Statuesque* usa a lista de opções de
característica da raça; *Perfection* concede um **Paragon Racial Asset** por raça.

## 4. Exaltações (pp. 64–100)

Estrutura igual: Power Stat 1–5 (teto = Level), Resource Stat, gastos genéricos (curar 1 HP fora de
combate, +1k0, reação, sair de Stunned/Dazed), limite por rodada = Power Stat, Tell por cena
(1 / 2–3 / 4–5 / 6+). Chosen ganha +1 Devotion ao subir Faith.

| Exaltação | Mudança |
|---|---|
| Atlantean, Chosen, Daemonhost, Dragonblooded, Promethean, Vampire, Wraith | sem mudança estrutural (detalhes: Vampire Dread = Fear ⌈BP/2⌉; mordidas 1k2 R; garras do Dragonblooded 2k3 R) |
| **Paragon** (83–84) | Recupera 1d10 AP 1×/cena após stunt ≥2 dados (antigo ponto 2); **1 Be a Man: Pressure = 5×Excellence** (era 3×), recupera 5 quando o oponente gasta; **2: perícias e características até 6**; 4: dados explodem em 9–10 em **todas** as rolagens |
| **Werewolf** (95–96) | Spirit Sight vira **poder estático**; 2 Spirit Walk (era 5); 4 **Stoking Fury** (substitui Sacred Hunt); 5 **Luna's Blessing** (nova) |

## 5. Classes, feats, assets, hindrances (pp. 104–223)

- Regras de nível **iguais** (uma classe por vez, conclusão pelos feats obrigatórios, Free Study,
  Level = maior classe). **Level agora limita Gun Kata** também. O livro tem um exemplo errado
  (p. 106); vale a regra "maior nível de classe".
- **18 trilhas**, mesmos nomes; **12 com características/escolas alteradas**:

| Trilha | Mudança |
|---|---|
| Assassin | Fel → **Str**; ganha Gun Kata Clay Pigeon, Silent Scope |
| Barbarian | Cha → **Wil** |
| Bard | White Raven → **Iron Heart** |
| Cleric | Cmp → **Int** |
| Druid | bônus + **Beastmaster** |
| Fighter | Int → **Dex**; + Diamond Mind, Stone Dragon |
| Guardsman | Str → **Cmp**; Iron Heart → Gun Kata Tin Star, Silent Scope, Point Blank |
| Heavy | + Sword Setting Sun, Gun Kata Point Blank |
| Magitek Gunman | Point Blank → **Clay Pigeon** |
| Operator | + Tin Star |
| Paladin | Wis → **Str**; Stone Dragon → **Desert Wind** |
| Thief | Int → **Str**; + Desert Wind |

- Classes sem pré-requisito (Initiate, Mercenary, Peasant, Ratcatcher, Scholar) e 8 classes de
  oficial de nave: iguais.
- **Feats:** 181 gerais + 49 raciais (mesmas quantidades). Asterisco de "repetível" sumiu: a
  repetição vem do texto (grupos, Elemental Shot, Wizard Tradition) ou de entradas duplicadas nas
  listas de classe.
- **Assets (22):** Tough as Nails = 1º crítico por *sessão* conta 1; Sturdy exige 2 hindrances sem XP.
- **Hindrances (22):** quase todas viraram narrativas (Geezer, Wimpy sem efeito numérico; Loco =
  começa com 20 de Insanidade; sem "200 XP para remover").
- **Exaltation Assets: 75** (eram 54): Chosen Marks 21; **15 Paragon Racial Assets** (novos,
  incluindo **Multiclass [Human]**: duas classes simultâneas e Free Study permanente).

## 6. Magia, Sword Schools, Gun Kata (pp. 224–279)

- **Focus Power = (Escola + Característica) k Característica** (teste de perícia normal).
- Fettered / Unfettered / Push e sancionado/não sancionado: iguais.
- **Psychic Phenomena:** gatilho = dado **explodido mantido** (resolvido). **"Level" nas magias =
  Level do personagem** (resolvido).
- **Aprender magias (novo, p. 228):** cada ponto na escola dá **1 magia escolhida** entre 3 por nível.
- **126 magias**, agora **14 por escola** (3 nos níveis 1–4, 2 no nível 5).
- Spell Combos: +5 por magia no teste de Phenomena; regras de componentes/duração explicitadas.
- Tabelas Phenomena (26) e Perils (18): mesmo tamanho.
- **Sword Schools e Gun Kata:** Style Points grátis = **Level**; restrições até **2× Level**; XP =
  50 × pontos de **vantagem** (restrições não descontam). Grupo de arma virou **restrição −1**.
  Desert Wind → ação **Multiple Attacks**; Stone Dragon → **Called Shot**. Gun Kata **sem** proibição
  de Blast/Flame (vantagens só no alvo mais próximo). Gunslinger Level definido; custo das escolas
  vale para Gun Kata.

## 7. Backgrounds, alinhamento, equipamento, artefatos (pp. 280–356)

- **Backgrounds:** mesmos 11.
- **Alinhamento:** Devotion 6; Alignment Check d10 + bônus ≥ Devotion; Degeneration com **16**
  entradas. Deuses: **3 mandamentos** + 5 palavras-chave (a Morality chart de 10 atos do Book 2
  saiu). **21 opções** (7 por panteão, incluindo "Undivided/Order/Unaligned", Tiamat, Omnissiah,
  Lolth). Ligação gravidade × Devotion **continua indefinida**.
- **Aquisição:** raridade em **12 degraus** (+ Irrationally Expensive 45, Glittergold 50); tabela de
  tamanho de mercado × tempo de busca; Wealth Strain **temporário**; **Liquid Wealth** (+1 por ponto
  após a rolagem); reabastecimento abstrato.
- **Armas:** 73; **36 qualidades** (24 da 1.6 + 8 do Book 2 + Arm Mounted, Homing, Orgone Array,
  Volatile); grupo **Unarmed** (Brawling substitui o soco 0k1); qualidade Best = Proven (2).
- **Armaduras:** **trajes completos** (10 itens: Mesh, Flak, Carapace, Storm Carapace, Light Power,
  Power, Leather, Chain, Banded, Plate); peça avulsa = 1 degrau de raridade a menos; **Max Dex limita
  esquiva e Speed, não a Static Defense**.
- **Cibernéticos (16) e drogas (16):** base + Book 2 fundidos, mesma mecânica.
- **Artefatos:** mesmos 5 materiais, 16 Wonders, 16 Hearthstones.
- **Criação de armas:** foi para o capítulo do Mestre (pp. 516–519); escala de preço **−3 a +8**.

## 8. Veículos e naves (pp. 358–415)

- **Veículos refeitos:** HP e Resilience vêm do **Frame** (Standard/Reinforced/Lightweight ×
  Normal/Good/Best); Size só dá slots; Man 0–10; SD = 10 − 2·Size + 2·Speed + 2·Man (sem os dois
  últimos com Momentum 0); trações com custo (nova **Battleship**); ações Move, Punch It, Skirmish,
  Barrage, Evasive, Ramming, Jury Rig; crítico a cada **5 ferimentos na cena**; **17 veículos prontos**.
- **Naves:** BP por Holdings 50/85/130/185/250; **cascos customizados**; **Crew Quality saiu** —
  dados mantidos = perícia do oficial da estação; SD = 10 + Man + Acc; armas renomeadas (Heavy
  Lance, Heavy Array, Lance, Array, Turret); **Fighter Bay** e caças; Warp com TN 25 e tabela de
  encontros perigosos; **6 naves de NPC** (mantêm 4 dados).

## 9. Jogo e combate (pp. 416–452)

- **Dodge/Parry:** reação que **soma metade do resultado à Static Defense** (pp. 424, 429). O resumo
  da p. 432 ainda fala em teste oposto — seguir o texto detalhado.
- **Crítico:** entrada = **total acumulado** de Critical Damage (1–5, 5 = morte).
- **Fight Defensively:** ação completa (−1k0, reação extra só para Dodge/Parry).
- Ganging up **+2k0 / +3k0**; terreno elevado = **combat advantage**; Full Defense **+2 reações**;
  Grapple só ação completa; Multiple Attacks custa uma reação por ataque extra; pesada sem apoio −3k1.
- **Queda:** curta 1 ferimento, longa 1d10, fatal 1d5 + 1d5 Critical Damage.
- **Desarmado:** Brawl; 0k1 + Str; perda de HP causa 1 Fatigue.
- Condições: **Dazed** substitui Dazzled; Blinded concede combat advantage.
- **Social:** dreno máximo **4 Resolve/cena**; disposição (Vengeful…Fanatical) vira **bônus na
  rolagem** (antes somava à Mental Defense); Refute soma metade à Mental Defense.
- **Medo:** novo **Fear 5 (TN 35)**; falha fora de combate −1k1 e +1d5 IP.
- **Insanidade:** **derangement a cada 20 IP**; resistência TN 15/20/25.
- Divergências tabela × texto (seguir o texto): Aim completo +2k1, Aid Another +1k1, Full Defense 2 reações.

## 10. Antagonistas e Mestre (pp. 508–544)

- XP de recompensa igual (500/sessão ou tabela de encontros 50–250).
- NPCs: mesmo formato, **47 fichas** (5 criaturas genéricas), **20 traits** (Amorphous perdeu o HP ×2).
  Valores impressos de SD/HP **não seguem as fórmulas** → guardar como impresso.
- **Minions:** Damage Rating **1–5**; Speed = Threat Rating; alcance 10 × TR; juntar a um herói dá
  maior TR **+1 por minion além do primeiro** (máx. = Fellowship).

## 11. Contradições da análise 1.6 (§21)

| # | Tema | Status na 7.7a |
|---|---|---|
| 1 | HP | ✅ 2·(Con + Wil) |
| 2 | Dodge/Parry | ✅ metade do resultado na Static Defense |
| 3 | Gatilho de Phenomena | ✅ dado explodido mantido |
| 4 | Entrada de crítico | ✅ total acumulado |
| 5 | "Level" em magias | ✅ Level do personagem |
| 6 | Alinhamento | ⚠️ 3 mandamentos; ligação com Devotion segue indefinida |
| 7 | Lista de classes | ✅ listas coerentes |
| 8 | Fight Defensively | ✅ ação completa |
| 9 | Magias sem TN | ❌ Disguise, Invisibility, Improved Invisibility, Energy Bits (TN 5), Geas (TN 20) |
| 10 | Gun Kata | ✅ custo de escola; Gunslinger Level definido |
| 11 | Veículos | ✅ crítico e custo de tração; ❌ tipos "Vhcl"/"Hybrid" indefinidos |
| 12 | Naves | ✅ SD = 10 + Man + Acc; Fighter Bay existe |
| 13 | Arcana | ✅ Básica (novo: Medicae texto × ficha) |

## 12. Próximos passos

1. **Feature de ajuste da 001 à 7.7a**: Acrobatics básica, Athletics = Str, stunt +XkX, tabela de
   TN com 10 degraus, (opcional) Fatigue máxima = Con.
2. **Feature 002 (raças)**: revisar os 8 poderes da seção 3 e as páginas de referência para a 7.7a.
3. Atualizar `docs/analise-dtd.md` gradualmente, seção a seção, ao especificar cada feature futura.
4. Decidir o custo de Devotion em XP (a 7.7a não informa).
