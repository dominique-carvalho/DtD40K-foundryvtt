# Pendências — o que falta implementar (DtD 7.7a)

Levantamento de 2026-09-27, depois da feature 012 (PRs 1–12 na `main`); atualizado com as features 013 (Veículos), 014 (Naves), 015 (Criação de armas), 016 (Criação guiada), 017 (Ações de combate), 018 (Perigos e XP), 019 (Munição), 020 (Custo dos Exalted Assets), 021 (Design system), 022 (Traits de NPC), 023 (Montador de personagem), 024 (Ícones dos compêndios), 025 (Ícones das condições), 026 (Descrições no montador) e 027 (Backing e Inheritance no montador). Cruza os capítulos da 7.7a com o que cada
feature entregou e com o que as specs deixaram fora de escopo ou como texto. Atualizar a cada feature.

## 1. Capítulos sem implementação

| Capítulo | Conteúdo |
|---|---|
| **XVIII Cenário** | Ambientação sem regra mecânica (no máximo um compêndio de consulta) |

## 2. Regras de jogo ainda não automatizadas

Nenhuma regra mecânica pendente (o custo dos Exalted Assets entrou na 020). O que resta está nas seções 3 e 4.

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
| 012 NPCs | Mobbing e ataques de minions em equipe (teamed minions, Animal Companion); traits Unnatural Toughness e Daemonic já nos valores impressos |
| 022 Traits de NPC | penalidades de dado por terreno difícil (só o custo de movimento do Crawler); limite de deslocamento por ação no mapa (só exibido); queda de quem voa com a categoria escolhida pelo Mestre; dano na falha de uma ability só como texto; magias afetam incorpóreos (premissa); duração do Warform editável (NPC não tem Feral Heart); demais abilities do compêndio como texto (We'll Be Back, Possession como Dominate, Warp Step…) |
| 014 Naves | efeitos da maioria dos consoles (Cloaking Device, Destiny Knot, Self Destruct, Grappler Arms, Freelance Market, Library Computer…), arco e alcance no mapa, recarga de torpedos em combate, encontros do Warp além da Crew perdida, efeitos de Chaplain, Chief Cook, Chief Medical Officer e Rogue Trader, Hail como combate social, serviços de porto sem contar tempo, hangar sem regra de capacidade |
| 015 Criação de armas | efeitos em texto (nota na arma e no cartão): Arm Mounted, Felling, Melee Attachment I/II, Precise, Preysense Sight, Quick Draw/Combat Sheath; a rolagem de Psychic Phenomena do Orgone Array é só lembrada; Throwing usa o arremesso da 007 com 10 m fixos |
| 016 Criação guiada | idiomas só como lembrete (sem campo na ficha); escolhas do Atlantean e do Mark of Slaanesh contadas pela quantidade de perícias em 6 (quais perícias não são guardadas); especialidades só avisam |
| 017 Ações de combate | movimento obrigatório do Pinned (ficar/ir para a cobertura, afastar-se) como lembrete; cobertura sem direção (vale contra todos); gatilho do Overwatch em texto (o jogador aperta Disparar); Ready/Usar item do grapple em texto; Mobbing Up e Mark of Moradin como nota; trick shot Crisis Zone como estava |
| 018 Perigos e XP | categoria da queda escolhida pelo Mestre (sem distâncias no livro); Grav Bomb e Ejector Seat sem a queda; horas de desmaio por Fatigue só informadas; outras imunidades (feitiços, Blood Quickening, Stuff of Nightmares além do sufocamento) com o Mestre |
| 019 Munição | preço e compra de pentes (o livro não dá; reserva editada na ficha); recarga reduzida (Thri-Kreen Multi-Armed) e recargas grátis ou sem gasto (Reloading Kata, Mithril, Gun Blessing, Wraithbone, Jumping Dove) como nota; munição especial como item continua da 007 |
| 020 Custo dos Exalted Assets | personagens com assets anteriores à 020 não são cobrados (o Mestre ajusta o XP à mão); remover o asset pela ficha não devolve XP (só o desfazer do log) |
| 021 Design system | NPC, minion, esquadrão, veículo, nave, itens e diálogos só com tokens e componentes (layout de antes); mensagens simples de chat em `<p>` sem cartão; proposta C (Dossiê) não feita |
| 023 Montador de personagem | feats e assets com sub-categoria (Enemy, Peer…) pedem a escolha ao concluir; idiomas ficam para a ficha; quantidade de consumíveis 1 (o Mestre ajusta); itens do exemplo que não existem no compêndio (Biofoam) |
| 026 Descrições no montador | descrições dos compêndios só em inglês; raças e exaltações mostram só o primeiro parágrafo; equipamento sem linha nas opções do seletor (só no item escolhido) |
| 027 Backing e Inheritance no montador | missões e Backgrounds temporários do Backing com o Mestre; item herdado liberado acima da nota entra no inventário sem vaga inicial |
| 024–025 Ícones | sem arte ilustrada de retrato ou token; tokens já colocados nas cenas não são atualizados pelo menu; efeitos antigos de técnicas marciais e do Barrel Roll (duram até o próximo turno) não são reconhecidos pelo menu; divisão das condições por gravidade é premissa (spec 025) |
| 013 Veículos | efeitos da maioria dos componentes (AI de bordo, COFFIN/SYNC, Berserker, ECM, Void Shield, Jump Jets, Afterburners por cena, Orgone Antennae, reatores), munições e modos de arma, terreno difícil e voo (queda e recuperação), Vault the Curb/Slip By/Pick Up, desvirar o veículo, compra de componentes com Wealth; Trick Shots com Mobile Trace System; pacotes de armas do Battlemecha |

## 4. Decisões em aberto (premissas das PRs)

- **Devotion por XP**: a 7.7a não dá custo; hoje só pelo teste de recuperar ou pelo Mestre.
- **Crew Quality** (naves): a 7.7a não tem a regra; a competência vem só dos oficiais e da Crew do casco (spec 014).
- Premissas marcadas como "decisões a revisar" nas PRs 9–12: custo de Background por ponto, d10 no Alignment Check,
  bônus dos minions aliados no total, alcance dos minions 10 × TR, Special Attacks na criação, entre outras.

## 5. Validação e manutenção

- **Pouco teste com jogador comum**: o mundo de teste tem o usuário Player2 (jogador, sem permissão de criar atores),
  usado só na validação do montador (023). Os pedidos ao Mestre por socket (dano em alvo alheio, efeitos de ataque
  especial) e as recusas que só valem para jogador nas features 008–022 foram validados só como Mestre.
- Trocar o link `Data/systems/dtd40k` pede reiniciar o Foundry por completo: ele resolve o caminho do sistema ao
  iniciar o aplicativo (reabrir o mundo mantém os packs do caminho antigo).
- Worktrees das features 003–024 removidos em 2026-10-05 (todos mesclados); as specs da 003, que só existiam no
  worktree, foram trazidas para `specs/003-rules-7-7a-alignment`. Worktree da 026 removido em 2026-10-06.
- Os compêndios compilados (`packs/`) não vão para o git: um worktree novo precisa de `npm run build:packs` **antes** de
  receber o link, com o Foundry fechado; senão o Foundry cria bancos vazios no worktree.
- O Foundry reescreve o `system.json` do checkout ligado (formatação: `&amp;`, `flags`, `styles` como objetos); restaurar
  com `git checkout -- system.json` antes de commitar.
