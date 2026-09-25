# Análise — Dungeons the Dragoning (DtD) para sistema Foundry VTT

> Fontes analisadas:
> - **Livro base 1.6z** — `Dungeons the Dragoning 1.6 - Bookmarked Final.pdf` (394 pp.)
> - **Book 2 v2.2 "For a Few Subtitles More"** — `Dungeons_the_Dragoning_Book_2.2_-_Bookmarked.pdf` (178 pp., suplemento, beta incompleto)
>
> Outros arquivos na pasta de origem: `Dungeons_the_Dragoning.pdf` (**1.6z+T**, 408 pp., revisão ligeiramente mais nova do básico — conferir se resolve contradições abaixo), `Dungeons_the_Dragoning_-_For_a_Few_Subtitles_More.pdf` (versão anterior do Book 2), ficha oficial.
>
> Números de página = **páginas do livro** (PDF 1.6 = livro + 1; PDF Book 2 = livro + 3). Texto extraído via `pdftotext`; várias tabelas saíram embaralhadas e **devem ser transcritas manualmente** do PDF antes de virar compêndio.

---

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Mecânica central (Roll & Keep)](#2-mecânica-central-roll--keep)
3. [Personagem: características, perícias, derivados](#3-personagem)
4. [Criação e XP](#4-criação-e-xp)
5. [Raças](#5-raças)
6. [Exaltações](#6-exaltações)
7. [Classes](#7-classes)
8. [Feats, Assets, Hindrances](#8-feats-assets-hindrances)
9. [Magia](#9-magia)
10. [Sword Schools e Gun Kata](#10-sword-schools-e-gun-kata)
11. [Backgrounds, Alinhamento, Devotion](#11-backgrounds-alinhamento-devotion)
12. [Equipamento, Artefatos, Drogas, Biônicos](#12-equipamento)
13. [Combate](#13-combate)
14. [Ferimentos e condições](#14-ferimentos-e-condições)
15. [Movimento, social, medo e insanidade](#15-movimento-social-medo-e-insanidade)
16. [Antagonistas, NPCs e Minions](#16-antagonistas-npcs-e-minions)
17. [Veículos (Book 2)](#17-veículos-book-2)
18. [Naves e viagem no Warp (Book 2)](#18-naves-e-viagem-no-warp-book-2)
19. [Cenário e glossário](#19-cenário-e-glossário)
20. [Modelo de dados proposto (Foundry)](#20-modelo-de-dados-proposto-foundry)
21. [Contradições e decisões pendentes](#21-contradições-e-decisões-pendentes)
22. [Riscos de automação](#22-riscos-de-automação)
23. [Escopo sugerido por fases](#23-escopo-sugerido-por-fases)

---

## 1. Visão geral

RPG paródia (autor: LawfulNice) que mistura Warhammer 40K (Dark Heresy/Rogue Trader) com D&D Planescape/Spelljammer. Sistema **Roll & Keep** com d10 (estilo L5R/7th Sea). Personagens são "Heróis": Raça + Exaltação (opcional) + Classe + Alinhamento.

---

## 2. Mecânica central (Roll & Keep)

Fonte: 1.6 pp. 8, 19–21, 235–239.

- **XkY**: rola X d10, soma os Y maiores. Foundry: `Xd10x10kY`.
- **10 explode** sem limite; o dado continua contando como 1 dado mantido.
- **Teste de perícia**: (Perícia + Característica) k Característica. TN padrão 15.
- **Teste de característica**: rola Característica e soma (XkX).
- **Perícia Básica sem treino**: característica −1. **Avançada**: não pode sem ao menos 1 ponto.
- **Característica 0**: rola 1 dado; 10 conta 0 e não explode.
- **Regra dos 10 dados** (aplicar após modificadores): cada 2 dados rolados acima de 10 → +1 mantido; acima de 10k10, cada dado extra → +5. Ex.: 12k6→10k7; 15k10→10k10+25; 11k11→10k10+10.
- **Raise** = ⌊(total − TN)/5⌋; **Check** = ⌊(TN − total)/5⌋. "Free raise" = +5 no resultado. "Requer N raises adicionais" ≈ +5N no TN.
- **Especialidade** (ganha no 4º ponto de perícia/característica): rerrola 1s quando aplicável.
- **Teste oposto**: ambos rolam; só um passa → vence; ambos passam → maior total; empate → maior característica.

**Tabela de TN** (p. 236): 5 Mundano · 10 Fácil · 15 Médio · 20 Difícil · 25 Muito Difícil · 30 Heroico · 35 Nunca Feito · 40 Nunca Será Feito de Novo.

**Stunts** (pp. 237–238): SM concede 0–3 dados rolados extras (+Xk0) por descrição/uso do ambiente/ato épico. NPCs sem importância não recebem.

**Hero Points** (p. 239): 2 iniciais (Humano +1, Paragon +2), renovam por sessão. Gasto (ação livre): rerrolar teste falho · −5 no TN (antes de rolar) · +1 raise em sucesso · dado de iniciativa conta 10 · sair de Stunned. **Queimar** (perde permanentemente) = sobrevive a algo que o mataria.

---

## 3. Personagem

### Características (9)
| Físico | Social | Mental |
|---|---|---|
| Strength (Str) | Charisma (Cha) | Intelligence (Int) |
| Dexterity (Dex) | Fellowship (Fel) | Wisdom (Wis) |
| Constitution (Con) | Composure (Cmp) | Willpower (Wil) |

A ficha também agrupa em linhas **Power** (Int/Str/Cha), **Finesse** (Wis/Dex/Fel), **Resistance** (Wil/Con/Cmp). Range 1–5 (6 em casos especiais). Int ≥ 3 dá 1 idioma extra por ponto acima de 2.

### Perícias (27) — `*` = Avançada
| Mental | Físico | Social |
|---|---|---|
| Academic Lore* (Int) | Acrobatics* (Dex) | Animal Ken (Cmp) |
| Arcana (Int)¹ | Athletics (Con) | Charm (Fel) |
| Common Lore* (Int) | Ballistics (especial) | Command (Cha) |
| Crafts (Wis) | Brawl (especial) | Deceive (Cha) |
| Forbidden Lore* (Int) | Drive (Dex) | Disguise (Fel) |
| Medicae* (Wis) | Larceny (Dex) | Intimidation (Cha/qualquer) |
| Perception (Wis) | Pilot* (Dex) | Performer (Fel) |
| Politics* (Wis) | Stealth (Dex) | Persuasion (Cha) |
| Tech-Use* (Int) | Weaponry (especial) | Scrutiny (Cmp) |

¹ Arcana é "Basic" no texto do cap. 3 mas marcada como avançada na ficha — conferir.

### Derivados (1.6 p. 14, ficha p. 17/392)
| Valor | Fórmula |
|---|---|
| Static Defense | 10 + 3·Dex + 3·Wis − 2·Size |
| Hit Points | **2·(Con + Wil)** (ficha/cap. 2) — ⚠ cap. 14 diz Con + Wil |
| Mental Defense | 5 + 5·Cmp (+ modificador de disposição) |
| Resolve | Wil + Cmp |
| Speed | Str + Dex (m por meia ação; Run = 6×) |
| Resilience | ⌈(Size + Level)/2⌉ + 1 |
| Iniciativa | 1d10 + Dex + Cmp |
| Iniciativa social | 1d10 + Fel + Cmp |
| Size | Humano 4 (raça define 2–5) |

Outros campos: Hero Points, Devotion (inicia 6), Power Stat, Resource Stat, Level, XP (Banked e Total), Armor por localização, Aura, Fatigue, Insanity Points, Critical Damage, Derangements, Idiomas, Backgrounds, Class List.

**Regras gerais do glossário** (p. 384): arredonda para baixo; derivados recalculam quando característica muda (queda de HP máx. mantém dano sofrido); bônus de fontes diferentes acumulam, da mesma fonte não.

---

## 4. Criação e XP

Fonte: 1.6 pp. 10–15, 333–334.

**Passos**: 0 Conceito · 1 Pontos iniciais · 2 Raça · 3 Exaltação · 4 Classe inicial · 5 Backgrounds · 6 Alinhamento · 7 XP · 8 Equipamento · 9 Toques finais.

- Características começam em 1; distribuição **6/4/2** (primário/secundário/terciário por grupo); máximo 4 nesta etapa.
- Perícias começam em 0; **8/6/4**; máximo 3 nesta etapa.
- Backgrounds: **7 pontos**, máx. 3 sem XP; só compráveis com XP na criação (acima de 3 custa dobro).
- **600 XP** iniciais. Até 2 Hindrances (+100 XP cada).
- Alternativa point-buy: 4800 / 5200 / 5600 XP (baixo/médio/alto), até 10% reservado para feats/assets/backgrounds.
- Pacotes de equipamento: Earth, Air, Fire, Water, Void (p. 13).

**Custos de XP** ("rank atual" = antes de subir):
| Compra | Custo |
|---|---|
| Característica | 100 × rank |
| Devotion | 50 × rank |
| Perícia nova | 100 |
| Melhorar perícia | 50 × rank |
| Nova Sword School ou Magic School | 200 |
| Melhorar Sword/Magic School | 100 × rank (teto = Level) |
| Power Stat | 200 × rank (teto = Level) |
| Feat | 100 |
| Asset | 100 (só na criação) |
| Background | 50/ponto (só na criação) |
| Special Attack / Trick Shot | 50 por Style Point (mín. 50) |
| Spell Combo | 50 por nível de cada magia |

Só pode gastar XP no que está nas listas da **classe atual**.

**Recompensa de XP** (p. 333–334): abstrato 500 XP/sessão/jogador; ou por encontro: Easy 50 · Routine 70 · Ordinary 100 · Average 130 · Challenging 170 · Hard 200 · Very Hard 250.

---

## 5. Raças

Estrutura: +1 em uma de duas características · +1 em duas perícias · 1 Poder · Size. Vários poderes usam **usos por cena 1/2/3 nos níveis 1/3/5**.

### Livro base (pp. 27–51)
| Raça | Característica | Perícias +1 | Poder | Size |
|---|---|---|---|---|
| Aasimar | Wis/Con | Command, Ballistics | Feats Jaded e Fearless grátis | 5 |
| Dark Eldarin | Cha/Dex | Deceive, Forbidden Lore | Warp Miasma: esfera de escuridão 4 m (1/2/3 por cena) | 3 |
| Dragonborn | Str/Cha | Command, Intimidation | Dragon Breath: ataque perfil Flamer (1/2/3) | 5 |
| Eldarin | Wis/Int | Academic Lore, Arcana | Warp Step: teleporte até 2×Speed (1/2/3) | 3 |
| Elf | Wis/Dex | Perception, Charm | Elven Accuracy: rerrola Weaponry/Ballistics falho (1/2/3) | 3 |
| Gnome | Int/Fel | Crafts, Academic Lore | Improvise: 1 proficiência de arma + 1 de armadura | 3 |
| Halfling | Int/Fel | Larceny, Deceive | Shifty: SD = 10 + 6·Dex − 2·Size | 2 |
| Human | Qualquer | Quaisquer 2 | Heroic Heritage: +1 Hero Point | 4 |
| Ork | Str/Wil | Intimidation, Scrutiny | WAAAAAGH!: cura HP = Level no início do combate | 5 |
| Squat | Con/Wil | Crafts, Common Lore | Resilience +1 para cálculo de dano | 3 |
| Tau | Int/Cmp | Common Lore, Persuasion | Fall Back: após esquiva bem-sucedida, recuo livre | 4 |
| Tiefling | Dex/Con | Intimidation, Weaponry | Bloody Minded: rerrola 1s de dano | 5 |

### Book 2 (pp. 6–13)
| Raça | Característica | Perícias +1 | Poder | Size |
|---|---|---|---|---|
| Thri-Kreen | Dex/Wis | Acrobatics, Perception | Multi-Armed: 1 Ready livre/rodada; recarga na metade do tempo | 4 |
| Kenku | Int/Wis | Performer, Pilot | Asas: sem dano de queda, planar, +2k0 Acrobatics | 3 |
| Kobold | Cha/Dex | Arcana, Stealth | Power in the Blood: 2 HP → 1 ponto de recurso (1/rodada) | 2 |
| Dryad | Fel/Wil | Animal Ken, Scrutiny | Pheromones: Charm Person com Level + Fel | 4 |

---

## 6. Exaltações

Fonte: 1.6 pp. 53–81; Book 2 pp. 16–19.

**Estrutura**: poderes estáticos + **Power Stat** (1–5, teto = Level, cada ponto libera um poder fixo) + **Resource Stat** (reserva com máximo por fórmula). Mortal Hero = sem exaltação (só Hero Points).

**Gastos genéricos de recurso** (1 ponto cada): curar 1 HP (fora de combate) · +1k0 em perícia · ganhar reação · sair de Stunned · sair de Dazed. **Limite por rodada = Power Stat.**

**The Tell** (pontos gastos na cena): 0 nada · 1 fraco (Perception+Wis TN 20) · 2–3 óbvio · 4–5 aura · 6+ épico.

| Exaltação | Power Stat | Recurso | Máximo | Recuperação / mecânica-chave |
|---|---|---|---|---|
| Atlantean | Gnosis | Motes | Cha + Int + 2·Gnosis | Cada Mote gasto vira Paradox; recupera "desfazendo" Paradox (1h/ponto ou Psychic Phenomena). 9 mantido em teste mágico força desfazer |
| Chosen | Faith | Favor | Devotion + Faith | Ritual diário; Faith ≤ ⌈Devotion/2⌉; Divine Power troca 1 dado por Devotion |
| Daemonhost | Arcanoi | Essence | Wil + Cha + 2·Arcanoi | Essence gasto vira Resonance; Eruptions (Wil vs 10 + 2·Resonance); 9 em magia força Eruption; mordida converte |
| Paragon | Excellence | Action Points | Level + Excellence | Renova por sessão; 2ª reserva **Pressure** = 3·Excellence por cena (+1 no total por ponto) |
| Promethean | Generation | Pyros | 3·Generation | +1/hora; não cura naturalmente (reparo Craft+Int); críticos por localização |
| Vampire | Blood Potency | Vitae | 5·BP | Sunlight; 1 Vitae/dia; Undead; Embrace |
| Werewolf | Feral Heart | Rage | Cmp + Wil + Level | +FH no início do combate e ao nascer da lua; formas Wolf/Warform |
| Wraith *(B2)* | Synergy | Plasm | Synergy + Resolve | −1/dia no mundo dos vivos; +2/h na Umbra; **Ghost Dice** (1 = ruim, 10 = bom) |
| Dragon Blooded *(B2)* | Aspect | Breath | 2·Level | Recupera tudo após 5 min; aura de dano ligada à Tell; 5 elementos (Air/Earth/Fire/Water/Wood) |

**Poderes por ponto (resumo)**
- **Atlantean**: 1 Ancient Style (3 perícias até 6) · 2 Empower Spell · 3 Excellence (2 Motes = Hero Point p/ rerrolar) · 4 Maximize Spell (dado conta 10) · 5 Quicken Spell.
- **Chosen**: 1 Aura = 2·Faith · 2 Divine Protection · 3 Prayer Strip · 4 Trial of Faith · 5 Demigod (+10 em vez de +1k0).
- **Daemonhost**: 1 RD = Con + Arcanoi · 2 características até 6 · 3 Hover · 4 ignora críticos não fatais · 5 Black Miracle.
- **Paragon**: 1 Pressure Points · 2 stunt ≥2 dados recupera AP · 3 regenera Pressure por turno · 4 dados explodem em 9–10 em stunts · 5 aliados ganham bônus.
- **Promethean**: 1 Armadura integrada = Gen + 3 · 2 armas integradas · 3 Pyros → +1 característica · 4 dano E recupera Pyros · 5 Warstrider.
- **Vampire**: 1 Auspex · 2 Dread (Fear 1) · 3 Celerity · 4 Potence (+3 Str) · 5 Dominate.
- **Werewolf**: 1 Fast Healing · 2 Spirit Sight · 3 Quick Shift · 4 Sacred Hunt · 5 Spirit Walk.
- **Wraith**: 1 Whispers · 2 Poltergeist · 3 Curse · 4 Shroud (Armor = Resolve) · 5 Ectoplasmic Form.
- **Dragon Blooded**: 1 Dragon Mind · 2 Dragon Wings · 3 Dragon Heart (sopro Flamer) · 4 Dragon Skin (Armor/Aura = Aspect) · 5 Maximum Dragoning.

**Formas alternativas** (Active Effects): Wolf, Warform, Warstrider, Potence, Wild Shape.

---

## 7. Classes

Fonte: 1.6 pp. 85–115; Book 2 pp. 21–53.

**Regras**:
- Classe define listas de características, perícias, feats (obrigatórios, opcionais `*`, grupos "A OU B"), Sword/Magic Schools (e Gun Kata no B2).
- Uma classe por vez; conclui ao comprar todos os feats obrigatórios; só então pode trocar. Nível da nova classe ≤ Level atual + 1.
- **Level do personagem** = nível da classe mais alta.
- **Free Study** (p. 87): após concluir, pode comprar opcionais pulados e itens de listas de classes concluídas; fora disso custa o dobro.
- **Bônus de conclusão** por classe (igual dentro da trilha).
- Trilhas de 5 níveis; pode trocar de trilha.

**Estrutura**: `name, level (1–5), track, prerequisites (perícias/feats/escolas, com OU), characteristics[], skills[], feats[] {mandatory|optional|orGroup}, swordSchools[], magicSchools[], gunKata[], completionBonus`.

### Trilhas do livro base
| Trilha (L1→L5) | Características | Escolas | Bônus |
|---|---|---|---|
| Assassin: Sell-Steel, Nighthawk, Assassin, Freeblade, Nihilator | Dex, Int, Fel | Sword: Shadow Hand, Setting Sun | +1 iniciativa |
| Barbarian: Feral, Savage, Rager, Barbarian, Berserker | Str, Cha, Con | Sword: Stone Dragon, Tiger Claw, Desert Wind | +1 dano corpo a corpo |
| Bard: Minstrel, Bard, Skald, Swashbuckler, Master Bard | Cha, Fel, Dex | Sword: White Raven, Diamond Mind; Magic: Enchantment, Illusion | +1 ponto em perícia < Level |
| Cleric: Priest, Preacher, Cleric, Zealot, Bishop | Wil, Wis, Cmp | Magic: Abjuration, Divination, Healing, Necromancy, Transmutation | +1 HP máx. |
| Fighter: Swordsman, Myrmidon, Fight Guy, Fighter, Master Fight Guy | Str, Con, Int | Sword: Iron Heart, White Raven | +1 ataque corpo a corpo |
| Guardsman: Conscript, Guardsman, Sergeant, Grenadier, Stormtrooper | Str, Dex, Wil | Sword: Iron Heart | +1 ataque à distância |
| Magic User: Apprentice, Aspirant, Magic User, Sorcerer, Master Sorcerer | Int, Cha, Wil | Magic: Abjuration, Evocation, Illusion, Conjuration, Divination, Necromancy | +1 Focus Power |
| Paladin: Gallant, Protector, Defender, Paladin, Chevalier | Wil, Wis, Con | Sword: White Raven, Devoted Spirit, Stone Dragon | +1 AP com armadura |
| Thief: Outcast, Outlaw, Renegade, Rogue, Stubjack | Dex, Int, Fel | Sword: Shadow Hand, Diamond Mind | +1 Static Defense |

**Avulsas L1**: Ratcatcher (+2 HP), Scholar (especialidade), Initiate (especialidade), Mercenary (+2 HP), Peasant (qualquer característica, sem pré-requisitos, sem bônus).

### Trilhas do Book 2
| Trilha (L1→L5) | Escolas / Gun Kata | Bônus |
|---|---|---|
| Courtier: Negotiator, Courtier, Diplomat, Legate, Emissary | — | +1 Resolve |
| Techpriest: Mech-Wright, Enginseer, Tech-Priest, Technomancer, Magos | — | Feat Upgraded (raridade sobe por nível) |
| Arcane Knight: Spellsword, Swordmage, Runeblade, Arcane Knight, Sorcerer-Swordsman | — | −1 TN Focus Power com Implement |
| Monk: Brother, Disciple, Monk, Immaculate Master, Grand Master of Flowers | Sword: Setting Sun, Shadow Hand, Diamond Mind | +1 Armor (Wholeness of Body) |
| Druid: Ovate, Oak-Knower, Druid, Archdruid, Patriarch | Magic: Healing, Transmutation, Divination | Improved Animal Companion |
| Magitek Gunman: Spellshooter, Riflemancer, Gunmage, Bulletwizard, Witch-Sniper | Magic: Evocation, Conjuration; Gun Kata: Elemental Gearbolt, Point Blank | +1 uso/sessão de Elemental Shot |
| Sheriff: Deputy, Sheriff, Constable, Marshal, Judge | Gun Kata: Clay Pigeon, Tin Star, Point Blank | +1 Backing (Law Enforcement) |
| Operator: Hunter, Marksman, Sniper, Quickscope, Targetmaster | Gun Kata: Clay Pigeon, Silent Scope | +2 Stealth parado |
| Heavy: Big Shot, Krazy Ivan, Heavy Weapons Guy, Walking Gunshow, Living Fortress | Gun Kata: Crisis Zone | +1 HP |

**Classes de Oficial** (B2 pp. 24–28), bônus aplicados à **nave**: Operations Officer (L2) → Chief of Engineering (L3, +1 Shield Regen); Science Officer (L2) → Chief Arcana Officer (L3, +1 Sensors); Tactical Officer (L2) → Chief of Security (L3, +1 Crew Quality vs abordagem); Captain (L3) → Commodore (L4, especialidade social).

---

## 8. Feats, Assets, Hindrances

Fonte: 1.6 pp. 117–145; Book 2 pp. 55–71.

**Contagem**: 1.6 ≈ 96 feats gerais + 24 raciais; B2 85 gerais + 25 raciais + 10 assets de exaltação. 1.6: 22 assets gerais + assets de exaltação (5 Atlantean, 15 Chosen Marks, 5 Daemonhost, 4 Paragon, 5 Promethean, 5 Vampire, 5 Werewolf; limite 1 por personagem, exceto Paragon); 22 Hindrances.

**Estrutura de feat**: `name, summary, description, repeatable (*), group (escolhido na compra), tags`. Feats **não têm pré-requisitos formais** (o controle é pela lista da classe), mas várias dependem de outras. Feats raciais: compráveis a qualquer momento como se estivessem na lista da classe.

**Grupos**: Armor Proficiency (Light/Medium/Heavy/Extreme/Power); Weapon Proficiency (Basic, Melee 1–3, Ranged 1–2, Thrown); Peer/Good Reputation (organização); Hatred (grupo); Heightened Senses (sentido); Speak Language; Weapon Focus/Specialization (arma específica); Spell Focus/Book/Specialization (escola); Spell Mastery (magia ≤ 3); Wizard/Archmage Tradition.

**Tipos de efeito → implementação**
| Tipo | Exemplos | Implementação |
|---|---|---|
| Bônus fixo em derivado | Sound Constitution +1 HP; Crushing Blow +2 dano; Armor Specialization +2 AP | Active Effect |
| Dados XkY condicionais | Weapon Focus +2k0 ataque; Improved +0k1; Specialization +2k0 dano; Peer +2k0 social com grupo | `rollBonus {rolled, kept, flat, selector, condition}` |
| Escala com Level | **Weapon Proficiency: +Level k0 no ataque**; Power Attack −Xk0/+Xk0 | Fórmula com `@level` |
| Rerrolagens | Luck, Blademaster, Fast Reflexes, Mark of Corellon (1s) | Contadores por rodada/cena/dia/sessão |
| Free raises | Spell Focus, Spell Penetration | +5 no resultado / +5 no TN do alvo |
| Substituição de característica | Combat Insight (Int no lugar de Dex); Zen Shooting (Perception no lugar de Ballistics) | Override de fórmula |
| Novas ações/reações | Swift Attack, Lightning Attack, Double Tap, Step Aside, Wall of Steel | Itens de ação |
| Modos | Frenzy (+1 Str/Con, −2 Int/Wis, sem aparar) | Active Effect com toggle |
| Gasto de Hero Point | Absolution, Divine Ministration, Iron Curtain | Botão de uso |
| Concessões | Minor Magic, Skill Focus, Spell Book, Animal Companion | Criação de itens/links |
| Narrativos | Common Sense, Eidetic Memory, Jaded | Só texto |

**Assets exemplos**: Appearance (+2k0 social), Magic Resistance (+5 TN contra você), Sturdy (+1 Resilience), Tough as Nails (máx. 1 crítico por golpe com HP cheio), Nine Lives.

**Hindrances**: +100 XP cada, máx. 2, só na criação. Ex.: Ailin', All Thumbs, Bad Luck (sem rerrolar com Hero Point), Geezer (−2 HP), Wimpy (−1 Resilience), Slowpoke, Night Terrors, Loco, Illiterate/Kid (200 XP para remover).

**Penalidade de armadura** (1.6 p. 120): sem proficiência, AP vira penalidade na SD. Light/Medium removem; Heavy/Extreme/Power reduzem à metade.

---

## 9. Magia

Fonte: 1.6 pp. 147–173; Book 2 pp. 73–82.

- **9 escolas**, característica fixa: Abjuration (Wil), Conjuration (Wil), Divination (Wis), Enchantment (Cha), Evocation (Cha), Healing (Wis), Illusion (Int), Necromancy (Int), Transmutation (Wis).
- Cada ponto na escola ensina 1 magia daquele nível (permanente). Escola 1–5, magia nível 1–5. **Sem slots/mana.**
- **Focus Power Test**: Escola k Característica vs TN da magia. Raises escalam efeitos.
- **Teste de resistência padrão**: Arcana + Wil, TN = resultado do Focus Power.
- Modificadores de magias não acumulam (só o maior). Detectar magia: Arcana + Wis TN 20.

**Modos de conjuração** (p. 150)
| Modo | Dados | Sancionado | Não sancionado |
|---|---|---|---|
| Fettered | Rolados à metade | Sem fenômeno | Sem fenômeno |
| Unfettered | Normal | Fenômeno se **dado explodido for mantido** | Idem, +5 por nível da magia |
| Push | Escola efetiva +N | Até +3; sempre fenômeno +5/push | Até +4; sempre fenômeno +10/push |

- **Psychic Phenomena** (p. 152): d100, 26 entradas; ≥ 75 → **Perils of the Warp** (p. 153): d100, 18 entradas, 00 = destruição.
- **Spell Combos** (pp. 154–155): 50 XP × nível de cada magia; usa menor característica e menor escola; TN = maior TN + 5 por magia adicional; não pode ser Fettered.

**Estrutura de magia**: `name, school, level, test, tn, action (Free/Half/Full/Reaction), keywords[], duration {type, concentration, expendable}, components, description` (alcance fica no texto).

**Keywords**: Attack, Combo-OK, Focus, Language Dependent, Material, Mind-Affecting, Ranged Touch, Saving Throw, Social, Somatic, Subtle, Touch, Verbal.

**Contagem**: 1.6 = **81** (por escola: 2 por nível de 1–4, 1 de nível 5); B2 = **45** (1 por nível por escola). **Total 126.** TN típico = 10 + 5·nível.

---

## 10. Sword Schools e Gun Kata

### Sword Schools (1.6 pp. 175–186)
- **Martial Adept Level** = maior rank em qualquer escola.
- **Ranks**: 1 Apprentice (grupo de arma + ação base) · 2 Initiate (restrição −2 + vantagem) · 3 Journeyman (restrição de perícia −1: teste vs SD do alvo, senão falha + vantagem) · 4 Master (Mastery passiva + vantagem) · 5 Grandmaster (vantagem suprema).
- **Special Attack**: ação base + grupo de arma + Vantagens (custam Style Points). Style Points grátis = Adept Level; Restrições dão pontos até Adept Level. **50 XP por Style Point.**

**Universais**: Vantagens +1k0 dano (1*), +0k1 dano (3*), +1k0 ataque (1*), +0k1 ataque (2*), +2 Pen (1*). Restrições: Difficult Strike (−1), Last Resort (−2), Restrained Force (−1*), Unbroken Skin (−2*), Inaccurate (−1*), Overextended (−2*), Non-Penetrating (−1).

| Escola | Grupo de arma | Ação | Perícia | Mastery (L4) |
|---|---|---|---|---|
| Desert Wind | Syrneth | Called Shot | Athletics | Zephyr Dance |
| Devoted Spirit | Flails | Aid Another | Medicae | Ox Body (+4 HP) |
| Diamond Mind | Fencing | Feint | Scrutiny | Open Form Motion |
| Iron Heart | Ordinary | Aim | Perception | Mithril Blade |
| Setting Sun | Brawl/Unarmed | Fight Defensively | Deceive | Wind Step |
| Shadow Hand | Parrying | Ready | Stealth | Sheathed Blade |
| Stone Dragon | Two Handed | Bull Rush | Intimidate | Strength of Granite |
| Tiger Claw | Chain | All Out Attack | Acrobatics | Brutal Reserve |
| White Raven | Cavalry | Charge | Command | Marked Target |

### Gun Kata (Book 2 pp. 83–90)
Análogo à distância das Sword Schools. **Gunslinger Level** = maior rank em Gun Kata. **Trick Shots** = Special Attacks (mesmas vantagens/restrições universais, 50 XP/Style Point). Não pode usar armas com Blast ou Flame. ⚠ Custo de compra dos ranks não é informado.

| Estilo | Arma | Ação | Perícia | L5 |
|---|---|---|---|---|
| Clay Pigeon | Pistolas | Called Shot | Performer | Manhattan Transfer (ignora cobertura) |
| Crisis Zone | Pesadas | Suppressing Fire | Tech-Use | Razing Storm (Storm) |
| Elemental Gearbolt | Primitivas (arcos) | Multiple Attacks | Arcana | Curse of Red Rain (Blood Loss) |
| Point Blank | Armas de fogo em corpo a corpo | Full Auto Burst | Athletics | Pistol Whip Strike |
| Silent Scope | Precisão | Aim | Perception | One Bullet (+1k0 dano por ação estudando, até +3k0) |
| Tin Star | Qualquer arma de fogo | Ready | Scrutiny | Dead Man's Hand |

**Recomendação**: um único tipo de item `martialSchool` com campo `mode: melee|ranged`, e `specialAttack` compartilhado.

---

## 11. Backgrounds, Alinhamento, Devotion

### Backgrounds (1.6 pp. 187–190)
11, valores 0–5: Allies, Artifact (múltiplo, 1 por item, máx. 5 pontos na criação), Backing (múltiplo, por organização), Contacts, Fame, Followers, Holdings, Inheritance (itens iniciais por raridade), Mentor, Status, Wealth (reserva de dados para Wealth Tests). Majoritariamente narrativos.

### Alinhamento (1.6 pp. 191–197)
- 3 panteões: **Ruinous Powers** (Khorne, Slaanesh, Tzeentch, Nurgle, Malal), **Blessed Pantheon** (Sigmar, Bahamut, Pelor, Moradin, Cuthbert), **Gray Council** (Acererak, Raven Queen, Luna, Corellon, Vectron).
- **Devotion** inicia em 6. **Alignment Check**: 1d10 + bônus vs Devotion; falha → −1 Devotion permanente.
- **Degeneration** (p. 192–193): se a Devotion cair para ≤ 6, novo teste; falha → rola na tabela d100 (17 entradas: Palsy −1 Dex, Wasted Frame −1 Str, Blighted Mind etc.). Registrado **por nível de Devotion**; redução de característica trava compra por XP. Recuperar Devotion limpa a degeneração do nível abaixo. Devotion 0 = sai de jogo.
- Troca de alinhamento: 1 vez. Mesmo panteão −2 Devotion; outro panteão Devotion = 4 + degeneração.

### Book 2 (pp. 139–160)
- 20 opções: **Chaos Undivided**, Khorne, Nurgle, Slaanesh, Tzeentch, Malal, **Tiamat**; **Blessed Order**, Cuthbert, Sigmar, Bahamut, Moradin, Pelor, **Omnissiah**; **Unaligned**, Raven Queen, Vectron, Corellon, Luna, Acerath, **Lolth**. As opções "Undivided/Order/Unaligned" são cultos ao panteão inteiro.
- Cada deus tem **Morality chart de 10 atos proibidos (10 → 1)** + 2 cultos (flavor). ⚠ O livro não explica como a escala se liga à Devotion (provável: 10 = ofensa mais leve, 1 = mais grave, limiar vs Devotion).
- Única regra: Khorne's Champions (troca rank de magia concedido por rank de Sword School).

---

## 12. Equipamento

### Aquisição (1.6 pp. 199–201)
- **Sem moeda**. Wealth Test: Wealth dados vs TN por raridade: Ubiquitous 2 · Very Common 5 · Common 10 · Uncommon 15 · Rare 20 · Very Rare 25 · Mythic Rare 30 (B2 adiciona Worthless 0 · Near Unique 35 · Fabulous Max 40). Retry +5 TN.
- Qualidade: Poor −5 · Common 0 · Good +5 · Best +10 no TN.
- **Wealth Strain**: TN > Wealth×5 → 1d10 (+1 por 5 acima) → penalidades temporárias/permanentes.
- Munição abstrata.

### Armas (1.6 pp. 202–214)
**Bloco**: nome · tipo (Melee/Thrown/Pistol/Basic/Heavy) · dano XkY + tipo (**E** Energy, **X** Explosive, **R** Rending, **I** Impact) · Pen · RoF (S/N) · alcance (curto ½, longo ×2, máx. ×4) · clip · reload · disponibilidade · qualidades · grupo de proficiência.
- Melee/Thrown: +Str k0 no dano. Basic com uma mão −2k0. Heavy sem apoio −3k1 e sem full auto.
- **Qualidade**: Poor/Good/Best com efeitos diferentes para distância e corpo a corpo.
- **25 qualidades**: Accurate, Armoured, Balanced, Blast (X), Brawling, Defensive, Flame, Flexible, Inaccurate, Overheats, Power Field, Reach, Recharge, Reliable, Scatter, Shocking, Smoke, Snare, Tearing, Toxic, Two Hands, Unbalanced, Unreliable, Unwieldy. B2 adiciona: Beam, Combiweapon, Compact, Incendiary, Proven X, Razor Sharp, Storm, Twin Linked.
- **Contagem**: 28 armas de fogo + 17 outras à distância/granadas + 28 corpo a corpo = **73**.

### Armaduras (1.6 pp. 215–217)
Colunas: nome, AP, Max Dex, disponibilidade, localizações (Head/Arms/Body/Legs/All; Body cobre Gizzards). **23 peças** em Light/Medium/Heavy/Extreme/Power (AP 2–12). Não acumulam; maior AP por localização. Power Armor: +1 Str, +1 Resilience.

### Gear e cibernéticos
18 itens de gear (Medkit = free raise Medicae; Combi-Tool; Auspex…). 6 cibernéticos no 1.6 (Bionic Arm, Heart, Locomotion, Respiratory, Senses, MIU) com efeito por qualidade; +2 AP na localização.

### Artefatos (1.6 pp. 223–233)
- Rating 1–5 pela raridade base. Item base + **material**: Orichalcum, Mithril, Darksteel, Wraithbone, Necrodermis (efeitos por tipo de item: melee, ranged, munição, armadura, 3 biônicos). Conta como Best, dano mágico, **1 slot de hearthstone**.
- 16 Wonders; 16 Hearthstones (só funcionam encaixados).

### Criação de armas (Book 2 pp. 162–165)
1. **Modelo**: Pistol (2k2 I, 30 m, clip 6), Basic (3k2 I, 40 m, 12), Cannon (3k3 I Pen 4, 60 m, 4), Heavy Rifle (2k2 I Pen 2, 60 m, 40), Melee (1k2 I).
2. **Tipo**: distância O/L/P/M/B/S/E/F (Ordinary, Las, Plasma, Melta, Bolter, Syrneth, Exotic, Flamer); corpo a corpo O/P/C/F/N/T/S/A/H/U.
3. **Mods**: até 2 (3 com tipo extra-mod), sem repetir; 22 corpo a corpo, 46 distância; cada um com custo, compatibilidade e efeito.
4. **Preço**: soma → tabela de raridade (−3 a +6).

### Drogas (Book 2 pp. 166–170)
16 drogas (Comfort, Stimm, Detox, Hither, Alpha, Bio-Foam, Drive, Frenzon, Obscura, Tranq, Flight, Slaught, Truth, Spook, Null, Polymorphine). Campos: raridade, efeito, duração (no texto), **Addictivity** (None/Low 10/Moderate 15/High 20/Extreme 25).
**Vício**: teste de Wil por uso; falha sobe a gravidade: Minor (−1k0) → Moderate (dados não explodem) → Major (−2k2 total). Recuperação: 1 semana sem usar + teste de Wil.

### Biônicos (Book 2 pp. 171–172)
Cortex Implants, Implanted Equipment, Injector Rig, Machinator Array, Voidskin, 5 Mechadendrites (Ballistic, Manipulator, Medicae, Optical, Utility; máx. = Con; só tech-priests).

---

## 13. Combate

Fonte: 1.6 pp. 240–254.

- **Iniciativa**: 1d10 + Dex + Cmp, rolada uma vez por combate. Desempate: maior dado → maior Dex → rerrolar.
- **Surpresa**: perde o turno da rodada 1 e concede combat advantage.
- **Turno**: 1 ação completa **ou** 2 meias ações diferentes + ações livres + **1 reação por rodada** (fora do próprio turno).
- **Subtipos de ação**: Attack, Melee, Ranged, Movement, Concentration, Miscellaneous, Defense, **Provokes** (gera ataque de oportunidade).

### Ações (~30)
Aid Another (H, +1k0) · Aim (H +1k0 / F +2k0) · All-Out Attack (F, +2k0, sem reações) · Brace (H) · Bull Rush (H) · Called Shot (F, −2k0) · Charge (F, +1k0) · Delay (H) · Disarm (H) · **Dodge (R)** · Feint (H) · Fight Defensively (H/F) · Focus Power (V) · Full Auto Burst (F, +2k1; cada raise = acerto extra) · Full Defense (F, +10 SD) · Grapple (H/F) · Healing Surge (H) · Knock Down (H) · Move (H/F) · Multiple Attacks (F) · Opportunity Attack (livre) · Overwatch (F) · **Parry (R)** · Ready (H) · Reload (V) · Run (F, 6×Speed) · Shift (H, Dex metros sem provocar) · Stand (H) · Standard Attack (H) · Suppressing Fire (F) · Tactical Advance (F) · Use a Skill (V) · Withdraw (F).

### Procedimento de ataque
1. Somar modificadores XkY.
2. **Rolagem**: Perícia k Perícia (**sem característica**; Weaponry/Ballistics/Brawl) **+Level k0 se proficiente**, vs **Static Defense**.
3. **Localização** (d10): 1 Perna E · 2 Perna D · 3–6 Corpo · 7 Gizzards · 8 Braço E · 9 Braço D · 10 Cabeça (Called Shot escolhe).
4. **Dano**: XkY da arma (+Str k0 corpo a corpo; desarmado 0k1 + Str k0). Raises **não** aumentam dano (exceto full auto).
5. **Aplicar**: dano − AP da localização (magia: − Aura) → **HP perdido = ⌊resto / Resilience⌋**; excesso após HP 0 vira Critical Damage.

### Modificadores
| Situação | Modificador |
|---|---|
| Combat advantage | +1 free raise |
| Concealment | SD +5 |
| Terreno difícil / árduo | corpo a corpo e esquiva −1k0 / −2k0 |
| Atirar em corpo a corpo | +2 raises exigidos |
| Ganging up 2:1 / 3:1 | +1k0 / +2k0 corpo a corpo |
| Terreno elevado | +1k0 corpo a corpo |
| Point blank (≤ 2 m) | +2k1 |
| Curto alcance | +1k0 |
| Longo / extremo | +1 / +3 raises exigidos |
| Alvo correndo | distância −2k0, corpo a corpo +2k0 |
| Duas armas | −3k0 cada (Ambidextrous −1k0, Two-Weapon Fighting −2k0) |
| Heavy sem apoio | −3k0 |

**Cobertura** (p. 252): AP da cobertura aplica antes (4/8/12/16/32); cada golpe que excede reduz 1.
**Emperramento** (p. 254): nº de 1s no ataque > Level → arma emperra.

---

## 14. Ferimentos e condições

Fonte: 1.6 pp. 255–263.

- **Estados**: Lightly Wounded (HP perdido ≤ Wil; 1 HP/dia) · Heavily Wounded (> Wil; 1 HP/semana) · Critically Wounded (tem Critical Damage; cuidado médico, 1/semana).
- **Críticos**: tabela por **tipo de dano (E/X/I/R) × localização (Arm/Body/Gizzards/Head/Leg)**, entradas 1–5 (4–5 geralmente morte). ⚠ Seleção da entrada não é explícita; leitura mais provável = total acumulado de Critical Damage. → RollTables.
- **Morte**: crítico, Blood Loss (1 no d10), sufocamento. Queimar Hero Point evita.

**Condições** (status effects): Blinded (−2k1 Weaponry, falha Ballistics) · Blood Loss (d10/rodada, 1 = morte; Medicae TN 20) · Dazzled (−1k0) · Deafened · Diseased (não recupera HP) · On Fire (−1 HP e +1 Fatigue/rodada) · **Fatigue** (−1k0; > Con = inconsciente) · Helpless (acerto automático, dano rolado 2×) · Immobilized · Pinned (Wil TN 20; só meias ações) · Prone (−1k0 corpo a corpo, −2k0 esquiva) · Restrained (−1k0 ataque, concede advantage) · Stunned (sem ações) · Surprised · Suffocation · Unconscious · Amputações (mão, braço, olho, pé, perna).

---

## 15. Movimento, social, medo e insanidade

### Movimento (p. 264)
Meia ação = Speed; completa = 2×; Run = 6×; Shift = Dex m. Viagem: 20×Speed/min, Speed km/h. Escalar (Athletics TN 15), saltar (Acrobatics + Str), nadar (Athletics + Str TN 10). Queda: 1 ferimento por 2 m (ignora Resilience).

### Combate social (pp. 265–268)
- **Resolve** = "HP social"; recupera no amanhecer (Cmp TN 10).
- **Mental Defense** = 5 + 5·Cmp + disposição (Kismesissitude +10, Hostile +5, Unfriendly/Indifferent/Friendly 0, Helpful +5, Fanatical +10).
- **Ataque social**: Cha (honesto) ou Fel (manipulação) + Charm/Command/Deceive/Intimidation/Performer/Persuasion vs Mental Defense; acerto → alvo gasta 1 Resolve ou cede. Máx. 2 Resolve perdidos por cena.
- Ações: Monologue/Study, Poker Face, Refute (R), Social Attack, Speak Carefully, Support, Wordplay.

### Medo (pp. 269–270)
Fear 1–4 → Wil vs TN 15/20/25/30. Falha em combate: d10 + Checks na **Shock Table** (1–13+). Fora de combate: −1k0.

### Insanidade (pp. 270–271)
Insanity Points 0–100. A cada 10: Trauma test (Wil vs 10 + ⌊IP/5⌋). Distúrbios automáticos: Minor 40, Severe 60, Acute 80. 100 = sai de jogo.

---

## 16. Antagonistas, NPCs e Minions

Fonte: 1.6 pp. 335–359.

**Bloco de NPC**: nome/descrição · 9 características (podem ser "−" ou `3[6]` para forma alternativa) · perícias · Speed · Size/Resilience · Static Defense · HP · feats · armadura (nome, AP, localizações) · ataques (melee: `Nome (XkY Tipo; Pen N; qualidades)`; ranged: `Nome (alcance; RoF; XkY; Pen; Clip; Reload; qualidades)`) · habilidades · traits · equipamento · Level.

**Traits (20)**: Amphibious, Amorphous (HP ×2, tudo no corpo), Armor Plating (X), Aura (X), Auto-Stabilized, Caster (escolas), Crawler, Daemonic (HP e armadura extra = Con), Dark Sight, Fear (X), Flyer (X), Machine (X), Mindless, Phasing, Quadruped, Regeneration (X), Resource Stat, Stuff of Nightmares, Undead, Unnatural Toughness (HP ×2).

**47 fichas prontas**: General Noncombatant, Green/Regular/Elite Troops, Mortal Hero, Sabbat Thug/Prince, Zoanoid Thug/Heavy, Monodrone/Duodrone Modron, Cultist, Arch-Heretic, Heretek, Dark Mechanius, Lesser/Greater Daemon, 4 criaturas genéricas, Combat/Industrial Servitor, Dragon, Lich, Mind Flayer, Aboleth, Elemental, Walkin' Dead, Ghost, Fire Warrior, Ratling, Slayer, Living Ancestor, Talon of Tiamat, Dragonfire Adept, Tinkerer, Ork Freeboota/Nob, Aspect Warrior, Eldarin Farseer, Space Marine, Grey Knight, Chaos Marine, Obliterator, Dark Eldarin Raider.

### Minions (pp. 358–359) — ator separado
- **Minion Squad** até 6. **Threat Rating** (1–5): rola nº de minions agindo, mantém TR. SD = 5·TR. Alcance = 10·TR.
- **Sem HP**: cada acerto derruba 1, +1 por raise; Blast derruba Blast minions.
- **Damage Rating** (1–4 + tipo): dano = 5 × (DR + raises), sem rolagem.
- **Acompanhando um PC**: soma o maior TR aos testes do PC; máx. minions = Fel do PC.
- Exemplos: Kobold Stabbers (TR 1, 1R), Ninja Slayers (4, 2R), Fluffy Bunnies (1, 5R), Space Pirate Crew (3, 3R/3I).

---

## 17. Veículos (Book 2)

Fonte: B2 pp. 91–113.

**Bloco**: Acc (0–5) · **Momentum** (0–10, estado) · Size (HP, Resilience e slots = Size) · Man (−10 a +10, reduzido pelo Momentum) · Speed (1–15) · Static Defense = 10 + Man − 2·Size + bônus de Speed por Momentum · Drive Rating · perícia de controle (Drive/Pilot/alternativas) · Armor única · Aura (wards) · Void Shield.
**Movimento/rodada** = Speed × Drive Rating × Momentum.

**Construção**: orçamento em VP (50 Uncommon → 200 Mythic Rare; 250–450 via Holdings). Custos de Acc, Size, Speed, Man por tabela. Obrigatórios: sistema de controle (Cockpit 4 slots) + tração (Naval, Tracked, Walker, Wheeled, Hover, VTOL, Aerospace, Scramjet). Categorias de componentes: Armor, Accommodations, Accessories, Control (inclui AI), Reactor, Modifications (inclui Flawed −10 VP), Weapons.

**Ações**: Maintain Control (H; muda Momentum até Acc ou vira 90°; senão tabela Out of Control d10) · Punch It (H) · Fire Mounted Weapon (H) · Evasive Maneuvers (R) · Ramming (livre; dano ½Size k ⌈Mom/3⌉) · Chase Tricks.
**Dano**: dano > Size perde HP; 2+ HP = golpe penetrante → crítico d10. HP 0 = destruído. Reparo: Size horas por HP.
**Tripulação**: piloto, copiloto (meia ação/turno), AI de bordo, operador remoto, passageiros (só atacam se Open Topped).

---

## 18. Naves e viagem no Warp (Book 2)

Fonte: B2 pp. 115–137.

**Bloco**: Hull Class (Escort/Destroyer/Cruiser/Battleship) · BP · Crew (reserva de dados) · Hull Strength (HP) · Maneuverability · Acceleration · Speed (VU) · Sensors · slots de console (Arcana/Command/Engineering/Tactical/Universal) · slots de arma (proa/popa) · Crew Quality (1–5) · Shields (capacidade/regeneração). TN para acertar = 3·CQ + Maneuverability.

**Construção**: BP por Holdings (0/50/80/120/170/230). **14 cascos**; Crew Quality custa −5/0/10/20/30 BP; **5 tipos de escudo** × Mk I–IV; **armas** (Heavy Cannon, Heavy Beam, Cannon, Beam Array, Turret; Lance vs Array) × 7 tecnologias; **7 torpedos**; **34 consoles** (7 Arcana, 6 Command, 7 Engineering, 7 Tactical, 7 Universal).

**Combate** (rodada ≈ 10 min): iniciativa = Sensors + Acceleration + 1d10. Por turno: 1 ação de Manobra obrigatória + até 1 de cada estação (Tactical, Engineering, Command, Arcana). **Testes = X k Y** (X = tripulação alocada da reserva da rodada; Y = CQ ou perícia do oficial).
- Helm (Pilot): Move, Adjust Speed/Heading, Evasive.
- Tactical (Ballistics): Shoot Guns, Boarding Party, Target Subsystem, Ram.
- Engineering (Tech-Use): Divert Power, Emergency Repair.
- Command (Cha + Command): Brace, Hail, Picard Speech, Micromanage.
- Arcana: Active Augury, Jam Comms, Triage.
- Caças como minions.

**Dano**: escudos primeiro (regeneram menos Disruption; colapsados não regeneram no combate) → Hull direto → crítico d10 + Crit da arma. Hull 0 = explode.

**Viagem no Warp** (pp. 136–137): 1 abrir portal (automático com Portal Relay; senão Arcana TN 15–25+) → 2 traçar rota (Arcana + Wis + Sensors TN 20) → 3 pilotar vs TN da viagem (10 = 1 dia … 25 = anos) → 4 sair (TN 20). Tabela de encontros d10 (All's Well → Geller Field Failure).

---

## 19. Cenário e glossário

**Great Wheel**: galáxia de **Crystal Spheres** no **Astral Sea**, com **Sigil** (Cidade das Portas, governada pela Lady of Pain) no centro. **Warp** = fonte de magia; **Umbra** = camada rasa. Viagem por **Spelljammers** e **Portal Relays** dos antigos Syrne. Ameaças: Orks, piratas Eldarin, Modrons, Blood War, Great Devourer.
**Facções de Sigil**: Godsmen, Bleak Cabal, Doomguard, Dustmen, Fated, Guvners, Harmonium, Mercykillers, Sign of One, Sensates, Ciphers, Verdant Guild. Ranks: Namer, Factotum, Factor, Factol.
**Esferas notáveis**: Abyss, Arborea, Arcadia, Acheron, Baator, Beastlands, Bytopia, Carceri, Commorragh, Elysium, Gehenna, Grey Waste, Mechanus, Celestia, Pandemonium.

**Vocabulário para chaves i18n**: Test, Skill Test, Characteristic Test, Rolled/Kept Dice, Raise, Check, Target Number, Exploding Dice, Hit Points, Critical Damage, Static Defense, Mental Defense, Resolve, Resilience, Size, Speed, Armor Points, Aura, Hero Points, Devotion, Power Stat, Resource Stat, Level, Tell, Combat Advantage, Engaged, Provokes, Full/Half/Reaction/Free Action. Gíria de Sigil (~50 termos: Berk, Cutter, Basher, Chant, Clueless…) só como flavor.

---

## 20. Modelo de dados proposto (Foundry)

### Actors
| Tipo | Notas |
|---|---|
| `character` | 9 características, 27 perícias (+ especialidades), derivados, Hero Points, Devotion + slots de degeneração por nível, Power/Resource Stat, contador de Tell por cena, Fatigue, Insanity, Critical Damage, XP banked/total, log de compras por classe |
| `npc` | Bloco de antagonista; traits; stat set alternativo (formas) |
| `minionSquad` | Threat Rating, Damage Rating (+ranged), tamanho do esquadrão, SD derivada |
| `vehicle` *(fase 3)* | Ver §17 |
| `ship` *(fase 3)* | Ver §18; oficiais de ponte como links para atores |

### Items
`race`, `exaltation` (+ tabela de 5 poderes), `class`, `feat` (subtipos: feat, racialFeat, asset, exaltAsset, hindrance), `spell`, `martialSchool` (melee/ranged), `specialAttack`, `weapon`, `armor`, `gear`, `cybernetic`, `drug`, `artifact`, `hearthstone`, `background`, `deity`, `condition/derangement`; fase 3: `vehicleComponent`, `vehicleWeapon`, `shipWeapon`, `shield`, `console`, `torpedo`.

### Rolagem
- Roller próprio: `(pool)d10x10k(keep)` → conversão acima de 10 → total → raises/checks → mensagem de chat.
- Diálogo: TN, stunt 0–3, modificadores XkY/flat, free raises, Hero Point.
- Hooks para: explodir em 9, substituição de dado (Devotion, conta como 10 sem explodir), rerrolar 1s, gatilhos de 9 mantido (Paradox/Resonance), contagem de 1s (emperramento), fenômenos psíquicos.
- `rollBonus {rolled, kept, flat, selector, condition}` filtrável por perícia/arma/alvo.
- RollTables: Psychic Phenomena, Perils of the Warp, críticos (4 tipos × 5 localizações), Shock, Trauma, Degeneration, Out of Control, críticos de veículo/nave, encontros no Warp.

---

## 21. Contradições e decisões pendentes

| # | Tema | Conflito | Fonte |
|---|---|---|---|
| 1 | **HP máximo** | 2·(Con+Wil) (cap. 2, ficha, glossário) vs Con+Wil (cap. 14); exemplo diz 6 no texto e 12 na ficha | 1.6 pp. 14, 17, 255 |
| 2 | **Dodge/Parry** | Teste oposto que anula acerto vs somar metade do resultado à SD | 1.6 pp. 245, 248, 250 |
| 3 | **Gatilho de Psychic Phenomena** | Dado explodido mantido vs "dobras" (resto do Dark Heresy) | 1.6 pp. 150–151 |
| 4 | **Entrada de crítico** | Não explícito; provável = total acumulado, 5 = morte | 1.6 pp. 257–260 |
| 5 | **"Level" em magias** | Nível do personagem ou rank da escola? | 1.6 cap. 8 |
| 6 | **Alinhamento** | 1.6: mandamentos simples; B2: Morality chart de 10 níveis sem regra ligando à Devotion | 1.6 p. 194; B2 p. 140 |
| 7 | Classes 1.6 | Lista cita Armsman/Veteran sem ficha; omite Grenadier/Stormtrooper | 1.6 p. 86 |
| 8 | Fight Defensively | Meia ação vs ação completa | 1.6 p. 243 |
| 9 | Magias | ~5 sem TN ou TN suspeito (Energy Bits TN 5, Geas TN 20, Disguise/Invisibility) | 1.6 cap. 8 |
| 10 | Gun Kata | Custo de ranks não informado; texto cita "Martial Adept level" | B2 p. 83 |
| 11 | Veículos | Crítico com 1 HP perdido; custo de tração não informado (deduzido 0); tipos "Vhcl"/"Hybrid" indefinidos | B2 pp. 96, 99, 109 |
| 12 | Naves | Maneuverability contada 2× no TN; "Fighter Bay" citado sem console | B2 pp. 128–131 |
| 13 | Arcana | Básica (texto) vs avançada (ficha) | 1.6 pp. 22, 391 |

➡ Verificar #1–#6 na revisão **1.6z+T** antes de fechar a spec.

---

## 22. Riscos de automação

- **Transcrição manual obrigatória** de tabelas embaralhadas: armas/armaduras/granadas (1.6), Degeneration, Gun Kata, mods de criação de armas, armas de veículo, torpedos.
- **Pipeline de rolagem customizado** (não basta a fórmula nativa) por causa de explosão em 9, substituição de dados, gatilhos em 9 mantido, conversão acima de 10.
- **Validador de compra de XP** baseado em classe atual/concluídas + exceções (Free Study, Able Learner, Gifted etc.) e tetos por Level.
- **Estado temporal**: efeitos "até a próxima ação" (Aim, Feint), contadores por rodada/cena/dia/sessão, Tell por cena, vício e abstinência (tempo do mundo), Pressure do Paragon reagindo a gastos de oponentes.
- **Dano tipado** (E/X/I/R + silver/magic) necessário para imunidades de Vampire/Werewolf/Stuff of Nightmares.
- **Muito conteúdo narrativo** (backgrounds, stunts, efeitos de Phenomena/Perils, social) → melhor como toggles/botões manuais que Active Effects fixos.
- **Naves/veículos** exigem grid com facing/arcos, divisão da reserva de tripulação, múltiplos atores por veículo.

---

## 23. Escopo sugerido por fases

1. **Fase 1 — Núcleo 1.6**: actor `character`/`npc`/`minionSquad`; roller R&K; perícias/características/derivados; raças, exaltações, classes, feats; combate (iniciativa, ataque, dano, localização, críticos, condições); magia + Phenomena/Perils; Sword Schools/Special Attacks; equipamento base.
2. **Fase 2 — Book 2 nos moldes existentes**: 4 raças, 2 exaltações, 9 trilhas + oficiais, feats, 45 magias, Gun Kata, drogas/vício, biônicos, criação de armas, novos alinhamentos.
3. **Fase 3 — Veículos e naves**: actors `vehicle` e `ship`, construção por pontos, combate de veículos/perseguição, combate por estações, viagem no Warp.
