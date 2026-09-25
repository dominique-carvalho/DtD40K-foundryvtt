# Quickstart — validação da feature 001-system-foundation

## Pré-requisitos

- Node.js 20+ e npm.
- Foundry VTT **v13** (testado no 13.351) instalado localmente, com acesso à pasta `Data/systems/`.

## Testes automatizados (regras puras)

```bash
npm install
```

```bash
npm test
```

Esperado: todos os casos de [contracts/rules-api.md](contracts/rules-api.md) passam
(conversão >10, explosão composta, característica 0, especialidade, raises/checks, derivados Traya).

## Instalação local no Foundry (desenvolvimento)

Criar um link da pasta do repositório para `Data/systems/dtd40k` (PowerShell como administrador):

```powershell
New-Item -ItemType SymbolicLink -Path "$env:LOCALAPPDATA\FoundryVTT\Data\systems\dtd40k" -Target "C:\Users\Dominique\Documents\Personal Projects\DtD40K-foundryvtt"
```

Reiniciar o Foundry → o sistema "Dungeons the Dragoning" aparece em *Game Systems*.

## Roteiro manual (UI / integração)

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Criar mundo com o sistema e abrir | Sem erros no console (F12) | FR-001, SC-001 |
| 2 | Criar ator "Personagem" | Características 1, perícias 0, Size 4, Level 1, HP 4/4, Resolve 2/2, Hero Points 2/2, Devotion 6 | US1-2 |
| 3 | No modo edição, preencher Traya clicando nos pontos (str 4, dex 3, con 4, wil 2, wis 2, cmp 2) e Size 5 | SD 15, HP máx. 12, MD 15, Resolve 4, Speed 7, Resilience 4 — cada valor muda **na hora**, sem reabrir a ficha | SC-002, SC-007, US1-6 |
| 4 | Subir Cmp para 3 | MD 20, Resolve máx. 5 imediatamente | US1-4 |
| 5 | Override de SD = 20; mudar Dex | SD continua 20 até remover o override | Edge |
| 6 | Adicionar especialidade "Rifles" em Ballistics | Aparece e persiste após reabrir a ficha | US1-5 |
| 7 | Clicar em Weaponry (3) + Dex (3), TN 15 | Diálogo abre; mensagem mostra 6k3, mantidos destacados, explosões em cadeia, resultado | US2-1, SC-004 |
| 8 | Shift+clique numa perícia | Rola sem abrir o diálogo | FR-019 |
| 9 | Rolar perícia básica com 0 pontos (Cha 3) | Parada 2k2, marcada "sem treino" | US2-2 |
| 10 | Rolar perícia avançada com 0 pontos | Aviso, nenhuma mensagem | US2-3 |
| 11 | Diálogo: +2 stunt dice, 1 free raise, especialidade | Parada e total refletem cada opção; 1s rerrolados aparecem | US3 |
| 12 | Modificadores que levem a 12k6 | Mensagem indica conversão 10k7 | US2-6 |
| 13 | Modo "privado do Mestre" | Jogador sem permissão não vê o resultado | FR-021 |
| 14 | Com Dice So Nice ativo | Dados 3D animam antes da mensagem | FR-021 |
| 15 | Trocar idioma pt-BR ↔ en | Nenhum texto sem tradução | SC-006 |
| 16 | Adicionar ao Combat Tracker e rolar iniciativa | 1d10 + Dex + Cmp | FR-003 |
| 17 | Clicar no ponto igual ao valor atual de uma característica | Valor reduz 1; derivados atualizam na hora | FR-025, US1-6 |
| 18 | Alternar para o modo jogo; fechar e reabrir a ficha | Pontos não editáveis; cabeçalho fixo visível; reabre no modo jogo | FR-022, US1-7 |
| 19 | No modo jogo, buscar "lore" e depois marcar "só treinadas" | Só perícias correspondentes ficam visíveis, sem recarregar | FR-027, US1-8 |
| 20 | Repetir passos 2–6 nos temas claro e escuro do v13 (Configurações → tema) | Tudo legível; ficha rola sem cortar conteúdo | FR-030, SC-008, US1-9 |
| 21 | Apagar o campo Bônus de um derivado e alterar Dex | Bônus vira 0; Dex é salvo e derivados atualizam | FR-010, US1-10 |
| 22 | Abrir a ficha como jogador observador (sem ser proprietário) | Sempre modo jogo, somente leitura | FR-022 |

## Registro de validação

| Data | Passos | Resultado | Observações |
|---|---|---|---|
| 2026-09-25 | 1–2 | ✅ | Personagem criado com valores iniciais corretos (verificado no banco do mundo `teste-dtd`) |
| 2026-09-25 | 3 | ❌ | Derivados não atualizavam na ficha aberta; layout inutilizável no v13 → reformulação da US1 (layout híbrido A+C) |
| 2026-09-25 | 3, 6, 17 (ficha híbrida) | ✅ parcial | Pontos clicáveis alteram características e perícias; especialidades são adicionadas. Rolagens (passos 7–16) ainda não existem: pertencem à US2/US3 (Fase 4 e 5). Pendentes de confirmação na US1: derivados atualizando na hora, passos 18–22 |
| 2026-09-25 | 7, 9, 10, 12, 16 (US2) | ✅ | Rolagens de perícias e características funcionando no Foundry 13.351 (confirmado pelo usuário) |
| 2026-09-25 | 8, 11, 13, 14 (US3) | ✅ | Diálogo de rolagem funcionando no Foundry 13.351 (confirmado pelo usuário) |
| 2026-09-25 | 1–22 (roteiro completo) | ✅ | Validação completa confirmada pelo usuário no Foundry 13.351, incluindo passos 3, 15 e 18–22 |
