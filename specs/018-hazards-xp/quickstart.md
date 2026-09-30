# Quickstart — validação da feature 018-hazards-xp

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-018`, com os packs compilados; recarregar.
- Cena com tokens de personagens: um com armadura e Resilience 4, um com Catfall, um Vampire ou Promethean, um NPC com
  trait Undead, um com Sand.

```bash
npm test
```

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Ferramenta de perigos só aparece para o Mestre | Botões nos controles de token | FR-001 |
| 2 | Queda longa em dois tokens | Um cartão por token com 1d10; Aplicar tira exatamente o rolado (armadura e Resilience ignoradas) | US1-1 |
| 3 | Queda fatal | 1d5 HP e 1d5 de Critical Damage num local sorteado, com efeito crítico de Impacto | US1-2 |
| 4 | Queda intencional longa; Acrobatics com raises | Dano cai 1 + 1/raise | US1-3 |
| 5 | Queda fatal no personagem com Catfall | Vira longa; "cai de pé" | US1-4 |
| 6 | XP: Hard para três personagens com bônus 20 | 200 e 20 em linhas separadas no log de cada um | US2 |
| 7 | XP: Sessão | 500 | US2-2 |
| 8 | Sufocamento em esforço com Con 3 | Fôlego 6; falhas dão Fatigue; no 7º Unconscious; no 8º −1 HP | US3-1/2 |
| 9 | Imunes no diálogo | Vampire/Promethean/Undead/Rebreather marcados, sem teste | US3-3 |
| 10 | Marcha forçada 3 horas | TN 10, 15, 20; distância no cartão | US3-4 |
| 11 | Fatigue acima do máximo com Sand | Desmaio só acima de Con + 2; horas no aviso | FR-008 |

## Registro de validação — 2026-09-29

Foundry 13.351, mundo Mist of Imlarin, link apontando para o worktree da 018 (packs compilados no worktree). Cena de
teste com personagens Armored (Con 3, Flak: AP 5 no corpo, Resilience 4), Cat (Catfall), Sand (Con 3, Sand), Vampire,
Rebreather (Rebreather equipado) e um NPC Undead. Dados fixados quando o passo pedia um resultado; os diálogos de XP,
de perigos e o de sufocamento/marcha foram preenchidos na própria tela.

| # | Resultado |
|---|---|
| 1 | Ferramentas "Hazards" e "Award XP" nos controles de token do Mestre |
| 2 | Queda longa em Armored e Sand: cartões de 7 e 4 (1d10); Aplicar sem alvo marcado: Armored 8 → 1 HP e Sand 8 → 4, sem armadura (AP 5) nem Resilience (4) |
| 3 | Queda fatal em Sand (HP 4): 1 ferimento e +3 de Critical Damage com HP sobrando; crítico de Impacto no corpo, linha 3 (Fatigue e Stunned) |
| 4 | Queda longa intencional (8): Acrobatics 25 contra TN 15, 2 raises → 8 − 3 = 5 ferimentos no cartão, botão removido; com Acrobatics 0 o 10 conta como 0 (regra de perícia sem treino da 001) e a redução foi 0 |
| 5 | Cat com Catfall: queda fatal virou longa, "cai de pé", sem Critical extra; queda curta: sem ferimentos |
| 6 | XP Hard com bônus 20 "Plano engenhoso" para Armored, Cat e Sand: +200 e +20 em linhas separadas no log de cada um; Aldred Kain inalterado |
| 7 | XP Sessão: +500, sem linha de bônus |
| 8 | Sufocamento em esforço (Armored, Con 3): fôlego 6; seis falhas deram Fatigue (a 4ª desmaiou pela Fatigue, máximo 3); 7ª rodada "sem fôlego" (Unconscious); 8ª −1 HP; "Respirou" encerrou o cartão |
| 9 | Diálogo: Vampire, Rebreather e Undead marcados como "não respira"; Armored não; imunes sem teste no cartão |
| 10 | Marcha forçada de 3 horas (Rebreather Con 3, Cat Con 1): TN 10, 15, 20 (próximo 25); falhas deram Fatigue; Cat desmaiou pela Fatigue e aparece Unconscious no cartão; distância 12 km (Speed 2) |
| 11 | Sand (Con 3, máximo 5): Fatigue 5 sem desmaio; a 6ª desmaiou, voltou a 5, aviso de 7 horas |

Correções feitas na validação: o diálogo de XP lista todos os personagens (marcados os do combate atual, ou senão os
que têm jogador); o cartão de sufocamento e marcha mostra Unconscious quando a Fatigue derruba o personagem.
