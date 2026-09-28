# Quickstart — validação da feature 016-guided-creation

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-016`, com os packs compilados
  (`npm run build:packs`, com o Foundry fechado se os packs já estiverem abertos). A feature não muda o `system.json`;
  basta recarregar a página.

```bash
npm test
```

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Novo personagem; abrir a ficha | Painel de criação: características 0/6, 0/4, 0/2; perícias 0/8, 0/6, 0/4; XP 600 | US1 |
| 2 | Montar Traya (pp. 18–19): Tiefling (+1 Con), notas base | Características Physical 6/6, Mental 4/4, Social 2/2; perícias Physical 8/8, Social 6/6, Mental 4/4; Intimidation/Weaponry da raça fora da conta | US1, SC-001 |
| 3 | Com os grupos cheios, subir mais uma característica e uma perícia (jogador simulado) | Recusadas com aviso; como Mestre, confirmação e passa | US1-2 |
| 4 | Str 4 → 5 e perícia 3 → 4 no modo de edição | Recusadas (`stepMax`); Brawl 3 → 4 por XP no modo de avanço passa e não entra na conta | US1-3/4 |
| 5 | Duas Hindrances; tentar a terceira | XP 800; terceira recusada | US2-1/2 |
| 6 | Gastar 750 de XP como no exemplo | XP 800 / 750 / 50 | SC-001 |
| 7 | Adicionar classe de nível 2 na criação | Recusada (`creationLevel`); Brother (nível 1) entra | US2-4 |
| 8 | Nota em 5 → 6 sem exceção; com Atlantean, quarta perícia a 6 | `atMax`; `sixLimit` | US2-5 |
| 9 | Brawl em 4 sem especialidade; especialidade numa nota 3 | Pendente e excedente no painel | US2-6 |
| 10 | Checklist do Traya completo | Todas as etapas feitas; idiomas como lembrete (2) | US3-1 |
| 11 | Encerrar com pontos sobrando; depois encerrar completo | Confirmação com a lista; sem confirmação quando completo; painel some | US3-2/3 |
| 12 | Criação encerrada: comprar um Asset e tomar Hindrance | Recusados (Mestre libera) | US2-3 |
| 13 | Personagem já em jogo (Aldred Kain) | Nenhuma nota alterada; sem painel | SC-004 |
