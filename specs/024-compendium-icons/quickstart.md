# Quickstart — validação da feature 024-compendium-icons

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-024`; `npm run build:icons` e
  `npm run build:packs`; mundo reaberto pela tela de setup (o manifesto muda).

```bash
npm test
```

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir os 15 compêndios | Nenhuma entrada com ícone do Foundry; placa Cogitador em todas | US1-1, SC-001 |
| 2 | Comparar Autopistol × Lasgun, Power Sword × Chainaxe, duas drogas, duas magias | Glifos diferentes | US1-2, SC-003 |
| 3 | Conferir as cores: arma, droga, cibernético, magia, armadura, raça | Cor da categoria (research R3) | US1-3 |
| 4 | Ver itens na ficha Cogitador e na Iluminura, no diretório e num cartão de chat, temas claro e escuro | Legíveis a 24 px e a 64 px | US1-4, SC-004 |
| 5 | Importar Dragon, um veículo e uma nave; colocar os tokens | Retrato e token próprios; armas e componentes com ícones | US2 |
| 6 | Arma de NPC com o mesmo nome de uma do equipamento | Mesmo ícone | US2-2 |
| 7 | Criar uma arma, um feat, uma droga e um NPC em branco | Ícones padrão do tipo | US3-1 |
| 8 | Configurações → Atualizar ícones no Mist of Imlarin, com um item de imagem personalizada | Contagens; confirmar troca os ícones antigos; o personalizado fica | US3-2/3 |
| 9 | Rodar `npm run build:icons` de novo | Nenhuma mudança no `git status` | SC-005 |
| 10 | Zip como o da release | Inclui `assets` e `CREDITS.md`; tamanho ≤ 2,4 MB | FR-012, SC-006 |
