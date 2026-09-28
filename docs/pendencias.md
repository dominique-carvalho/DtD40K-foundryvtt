# Pendências — o que falta implementar (DtD 7.7a)

Levantamento de 2026-09-27, depois da feature 012 (PRs 1–12 na `main`); atualizado com as features 013 (Veículos), 014 (Naves) e 015 (Criação de armas). Cruza os capítulos da 7.7a com o que cada
feature entregou e com o que as specs deixaram fora de escopo ou como texto. Atualizar a cada feature.

## 1. Capítulos sem implementação

| Capítulo | Conteúdo |
|---|---|
| **XVIII Cenário** | Ambientação sem regra mecânica (no máximo um compêndio de consulta) |

## 2. Regras de jogo ainda não automatizadas

- **Pontos iniciais da criação**: características 6/4/2 (máx. 4) e perícias 8/6/4 (máx. 3) sem controle; só
  Backgrounds, itens iniciais e assets respeitam a criação.
- **Queda** (curta 1 ferimento, longa 1d10, fatal 1d5 + 1d5 Critical Damage), **sufocamento**, **marcha forçada**
  (Con por hora, fadiga).
- **Ações de combate só como texto**: Overwatch, Suppressing Fire (Pinning e zona de fogo), opções de Grapple a cada
  turno, Delay, Tactical Advance.
- **Recompensa de XP pela tabela de encontros** (50–250): o Mestre concede à mão.

## 3. Deixado como texto nas features feitas

| Feature | Texto de referência |
|---|---|
| 002 Raças | poderes raciais complexos |
| 004 Exaltações | poderes e Exalted Assets complexos; Embrace do Vampire |
| 005 Feats | feats de combate, magia, armadura, idiomas, Insanity; rolagens condicionais (Dark Cruelty, Light Step…) como modificador manual |
| 006 Classes | bônus de conclusão de ataque/dano, Focus Power, armadura condicional, Elemental Shot, Backing, nave |
| 007 Equipamento | armadura Good (+1 AP no primeiro ataque), munição especial como item, duração das drogas, efeitos não numéricos de material |
| 008 Combate | efeitos não numéricos das condições |
| 009 Magia | magias de efeito complexo (ilusões, invocações, teleporte), efeitos não simples de Phenomena/Perils, feats Spell Focus, Penetration, Might, Mastery, Parry |
| 010 Escolas marciais | vantagens complexas (teleporte, trilha de fogo, ataques extras), Wind Step e passivas condicionais, Death From Above depois de Dodge/Parry |
| 011 Alinhamento | Degenerations Ill-fortuned, Witch-mark, Ashen Taste, Blackouts; fora de escopo: feats Mark of X, Chosen, magias Atonement/Divine Power, troca de escola de Khorne |
| 012 NPCs | traits Phasing, Flyer, Quadruped, Crawler, Auto-Stabilized, Amphibious, Dark Sight, Resource Stat; feats de NPC; Special Attacks de NPC; ações de Minion Squad no turno; forma alternativa (Zoanoid) como nota |
| 014 Naves | efeitos da maioria dos consoles (Cloaking Device, Destiny Knot, Self Destruct, Grappler Arms, Freelance Market, Library Computer…), arco e alcance no mapa, recarga de torpedos em combate, encontros do Warp além da Crew perdida, efeitos de Chaplain, Chief Cook, Chief Medical Officer e Rogue Trader, Hail como combate social, serviços de porto sem contar tempo, hangar sem regra de capacidade |
| 015 Criação de armas | efeitos em texto (nota na arma e no cartão): Arm Mounted, Felling, Melee Attachment I/II, Precise, Preysense Sight, Quick Draw/Combat Sheath; a rolagem de Psychic Phenomena do Orgone Array é só lembrada; Throwing usa o arremesso da 007 com 10 m fixos |
| 013 Veículos | efeitos da maioria dos componentes (AI de bordo, COFFIN/SYNC, Berserker, ECM, Void Shield, Jump Jets, Afterburners por cena, Orgone Antennae, reatores), munições e modos de arma, terreno difícil e voo (queda e recuperação), Vault the Curb/Slip By/Pick Up, desvirar o veículo, compra de componentes com Wealth; Trick Shots com Mobile Trace System; pacotes de armas do Battlemecha |

## 4. Decisões em aberto (premissas das PRs)

- **Devotion por XP**: a 7.7a não dá custo; hoje só pelo teste de recuperar ou pelo Mestre.
- **Crew Quality** (naves): a 7.7a não tem a regra; a competência vem só dos oficiais e da Crew do casco (spec 014).
- Premissas marcadas como "decisões a revisar" nas PRs 9–12: custo de Background por ponto, d10 no Alignment Check,
  bônus dos minions aliados no total, alcance dos minions 10 × TR, Special Attacks na criação, entre outras.

## 5. Validação e manutenção

- **Sem teste com jogador comum** (o mundo de teste só tem o Gamemaster): pedidos ao Mestre por socket (dano em alvo
  alheio, efeitos de ataque especial) e as recusas que só valem para jogador.
- Worktrees antigos (003–012) abertos; o repositório principal parado na branch `002-race-compendium` (já mesclada).
