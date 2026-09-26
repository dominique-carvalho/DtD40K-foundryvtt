# Quickstart — validação da feature 002-race-compendium

## Pré-requisitos

- Ambiente da 001 funcionando (Node.js 20+, Foundry **v13** 13.351, sistema linkado em
  `Data/systems/dtd40k` — ver `specs/001-system-foundation/quickstart.md`).
- Foundry **fechado** durante o build do compêndio (o LevelDB fica bloqueado com ele aberto).

## Testes automatizados

```bash
npm install
```

```bash
npm test
```

Esperado: todos os casos de [contracts/rules-api.md](contracts/rules-api.md) passam, incluindo
`packs.test.mjs` (16 raças batem com a Tabela de referência da spec — SC-001) e os testes da 001
sem regressão.

## Build do compêndio

```bash
npm run build:packs
```

Esperado: `packs/races/` gerado sem erros; abrir o Foundry depois.

## Roteiro manual (UI / integração)

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir um mundo DtD, aba Compêndios | "Races" com 16 entradas; sem erros no console (F12) | US1-1 |
| 1b | Abrir Dryad, Kenku, Kobold e Thri-Kreen; aplicar cada uma a um personagem e clicar no "i" | Dados iguais à Tabela de referência (7.7a pp. 37, 49, 51, 59); +1 na característica escolhida e nas 2 perícias; Size aplicado (Kobold Size 2 sobe a Static Defense); poder só como texto; descrição e ambientação completas | FR-006, SC-001 |
| 2 | Abrir Eldarin no compêndio | +1 Wisdom ou Intelligence; +1 Academic Lore e Arcana; Size 3; Warp Step com 1/2/3 usos; DtD 7.7a, página 39; somente leitura | US1-2, FR-004 |
| 3 | Abrir Human | "qualquer uma", "escolha 2", Size 4, Heroic Heritage | US1-3 |
| 4 | Ler as 16 descrições ao lado do PDF | Nenhuma frase igual ao livro; resumo em inglês | US1-4, SC-005 |
| 5 | Trocar o idioma para pt-BR e reabrir uma raça | Rótulos em português; descrições em inglês | US1-5, SC-006 |
| 6 | Personagem novo (Wis 2, Size 4): arrastar Eldarin, escolher Wisdom | Wisdom 3 (1 ponto destacado como racial), Academic Lore 1, Arcana 1, Size 3, SD recalculada na hora; "Race: Eldarin" no cabeçalho | US2-1, SC-002 |
| 7 | Arrastar Ork e cancelar a janela | Nada muda (continua Eldarin) | US2-2 |
| 8 | Arrastar Ork e escolher Strength | Eldarin e seus bônus somem; Str +1, Intimidation e Scrutiny +1; Size 5; só 1 raça na aba Traits | US2-3, FR-011 |
| 9 | Aplicar Human: Charisma + Pilot + Command; tentar Pilot duas vezes | Bônus aplicados; repetição impedida | US2-4 |
| 10 | Remover a raça na aba Traits | Bônus somem; Size volta a 4 (base) | US2-5, clarificação 1 |
| 11 | Aplicar Elf; "refazer escolha" trocando Wisdom por Dexterity | Wis volta ao base; Dex +1; nada duplicado | US2-6, FR-013 |
| 12 | Modo edição com Wis 2 + 1 racial (final 3): clicar no 4º ponto; depois clicar de novo no 4º | Final 4 (base 3), derivados atualizam; depois final 3 (base 2) | US2-7, FR-014 |
| 13 | Aplicar Aasimar a um personagem com Ballistics 0 | Ballistics 1, tratada como treinada | US2-8 |
| 14 | Personagem com Wis 6 + raça que dá Wis | Final 6, aviso de valor limitado | Edge, FR-015 |
| 15 | Human com Hero Points 2/2 | 3/3; remover a raça → 2/2 | US3-1 |
| 16 | Halfling Dex 3, Wis 4 | SD 24 | US3-2 |
| 17 | Squat Size 3, Level 1 | Resilience 4; com override 2 → 2 | US3-3, FR-019 |
| 18 | Eldarin nos Levels 1, 3, 5; gastar uso até 0; "Nova cena" | Máximo 1/2/3; não fica negativo; volta ao máximo | US3-4, US3-5 |
| 19 | Aasimar na aba Traits | Texto do poder (feats Jaded e Fearless), sem automação | US3-6 |
| 20 | Como Mestre, na aba Traços, desmarcar o modificador "Size" da raça; como jogador, ver a lista sem poder alterar | Size volta ao base enquanto desmarcado; o jogador vê as caixas desabilitadas | FR-010, FR-015a |
| 20b | Clicar no ícone "i" ao lado do nome da raça | Janela com descrição, altura, peso, idiomas, traços, nomes e página | FR-015a |
| 20c | Na raça do personagem (ou numa cópia no mundo), colar um texto em "Texto completo" e clicar no "i" | O texto aparece na janela, abaixo do resumo; no compêndio o campo continua vazio | FR-001 |
| 20d | Como Mestre, abrir uma raça do compêndio travado; destravar o compêndio (menu de contexto) e editar a descrição | Aviso de compêndio travado com o nome da opção; depois de destravar, editores de texto aparecem e a edição persiste | FR-004 |
| 21 | Como jogador observador, abrir a ficha e tentar arrastar | Nada muda; aba Traits só leitura | FR-013a |
| 22 | Arrastar raça para um ator de outro tipo (quando existir) ou forçar criação de 2ª raça por macro | Aviso; nada é duplicado | Edge, R6 |
| 23 | Trocar de aba e reabrir a ficha | Volta na última aba usada | FR-015a |
| 24 | Aplicar as 16 raças em sequência no mesmo personagem | Sempre exatamente 1 raça e só os efeitos dela | SC-003 |
| 25 | Temas claro e escuro | Aba Traits, janela de escolha e ficha da raça legíveis | 001 FR-030 |

## Registro de validação

| Data | Passos | Resultado | Observações |
|---|---|---|---|
| 2026-09-25 | 1–5 (US1) | ⚠️ Refazer | Validado no Foundry 13.351, mundo "teste dtd", mas com o pack **antigo** (12 raças da 1.6) — ver correção abaixo. Rótulos pt-BR/en ok. |
| 2026-09-25 | 6–14, 20–24 (US2) | ✅ Aprovado | Inclui os passos 20b (ícone "i"), 20c (Texto completo) e 20d (edição com o compêndio destravado), acrescentados durante a validação. |
| 2026-09-25 | 15–19 (US3) | ✅ Aprovado | Passo 18 feito com o Eldarin (único com usos por cena na 7.7a); Elf, Dark Eldarin e Dragonborn só com texto. |
| 2026-09-25 | 25 e roteiro completo | ⚠️ Parcial | Temas claro e escuro ok; dados da 7.7a pendentes (ver correção). |
| 2026-09-25 | **Correção** | ⚠️ | O pack compilado nunca foi atualizado depois do primeiro build (19:51): o Foundry ficou aberto o tempo todo e segurava o LOCK do pack, então todo `npm run build:packs` falhou. As linhas acima valem para a interface e a mecânica (aplicar, trocar, efeitos, abas, contador, permissões), **não** para os dados da 7.7a. Pendentes: passos 1, 1b, 2, 4 e o 24 com as 16 raças, com o pack recompilado com o Foundry fechado. O build agora verifica o bloqueio antes de mexer no pack e compila numa pasta temporária. |
| 2026-09-25 | 1, 1b, 2, 24 (dados da 7.7a) | ✅ Aprovado | Pack recompilado com o Foundry fechado; conferido antes da validação que o pack tem as 16 raças com fonte DtD 7.7a (pp. 31–61). Confirmado pelo usuário: compêndio, raças novas (Dryad, Kenku, Kobold, Thri-Kreen), Eldarin p. 39 e troca das 16 raças funcionais. |
| 2026-09-25 | 4 | ❌ → ✅ | Primeira passada: descrições apareciam parciais na ficha editável da raça (o editor encolhia até a altura mínima e escondia o resto numa rolagem interna). Corrigido no CSS (commit 9dd72c1); após recarregar, o usuário confirmou que as descrições aparecem inteiras. |
| 2026-09-25 | Integração com a 001 | ✅ Aprovado | Confirmado pelo usuário: paradas das rolagens já incluem o bônus racial e o stunt soma +XkX na janela de rolagem (7.7a p. 418). |

Ajustes feitos durante a validação (já incorporados à spec e às tarefas): lista de modificadores
raciais com toggle do Mestre e ícone "i" (T054–T055); campo "Texto completo" (T056); descrições
completas e edição pelo compêndio com `npm run extract:packs` (T057–T058); adoção da DtD 7.7a
(T059–T061). Fora do escopo desta validação: rolar Acrobatics sem pontos (depende das rolagens da
feature 001, US2).
