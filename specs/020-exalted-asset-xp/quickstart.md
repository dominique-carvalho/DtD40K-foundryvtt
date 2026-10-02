# Quickstart — validação da feature 020-exalted-asset-xp

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-020`, com os packs compilados; recarregar.
- Personagem de teste em criação com 600 XP e exaltação Werewolf; outro, Elf, para o Paragon.

```bash
npm test
```

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Arrastar um asset de Werewolf (Black Spiral Dancers) e confirmar | 600 → 500; linha "Black Spiral Dancers · 100" no log | US1-1, FR-003 |
| 2 | Arrastar e cancelar a confirmação | Asset não entra; XP igual | US1-2 |
| 3 | Com 50 XP, arrastar como jogador | Recusado (XP insuficiente) | US1-3 |
| 4 | Com 50 XP, como Mestre, liberar | Asset entra; XP igual; sem linha | US1-4 |
| 5 | Segundo Exalted Asset liberado pelo Mestre | Cobra 100 | US1-5 |
| 6 | Elf escolhe Paragon | Elven Perfection entra sem cobrança | US2-1, FR-005 |
| 7 | Paragon fora da criação compra Action Hero | −100 XP; +1 Hero Point | US2-2 |
| 8 | Desfazer a linha do Action Hero | Asset some; XP volta; Hero Points ajustados | US3-1 |
| 9 | Remover um asset pela ficha; desfazer a linha | A remoção não devolve; o desfazer só devolve | US3-2, FR-008 |
| 10 | Exemplo da p. 18 | 50 XP restantes | SC-001 |
