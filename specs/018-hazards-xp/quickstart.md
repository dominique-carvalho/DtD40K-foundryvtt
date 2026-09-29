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
