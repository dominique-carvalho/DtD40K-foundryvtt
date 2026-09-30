# Research: Controle de munição (019)

Inventário: `ch-ammo-inventory.json` no scratchpad da sessão (definições, 73 armas do pack de equipamento, gasto por
modo, recarga, 17 issues A1–A17).

## R1 — Estado na arma (A7, A8, A14, A15)

- **Decision**: `system.ammo = { loaded: null, spare: 2, progress: 0, jammed: false }`; `loaded: null` = pente cheio
  (armas existentes e dos packs); derivado `ammo.max = clip`, `ammo.current = min(loaded ?? clip, clip)`. Conta tiros
  quem tem `clip > 0`, não é corpo a corpo, não é arremessável e não tem `ammoGroup` (lançadores gastam o item). Armas de
  veículo e NPCs "Clip -" têm clip 0 e ficam de fora; NPCs com clip seguem as regras. Reserva por arma, editável.
- **Rationale**: decisões do usuário; o livro não precifica munição (pp. 317, 334).

## R2 — Gasto (A1, A11–A13)

- **Decision**: tiro simples 1; Full Auto Burst = ROF automático; com menos tiros, gasta os restantes e o ROF efetivo
  (`fullAutoHits`) é o número de tiros; Multiple Attacks: cada ataque gasta o seu (1 ou rajada); Twin-Linked não dobra;
  Suppressing Fire gasta ao iniciar a zona (confirmação, ou disparo do Overwatch em Suppressing Fire) e guarda o ROF
  efetivo na zona para a rajada, que não gasta de novo; Overwatch em Full Auto Burst gasta no disparo (é um ataque
  normal). Fan the Hammer limitado pelos tiros.
- **Rationale**: pp. 318, 426–430; decisões do usuário.

## R3 — Recusa (A1)

- **Decision**: sem tiros (ou travada), o ataque é recusado com aviso; o Mestre confirma e passa sem gastar.
- **Rationale**: decisão do usuário; constituição IV.

## R4 — Recarga (A2, A4–A6, A16)

- **Decision**: `parseReload("Half"|"Full"|"2Full"|"2 Full"|"Free"|"-"|"")` → `{ type: "free"|"half"|"full"|"none",
  actions: N }`. A ação Reload (da ficha, por arma; ou da aba Combate com a arma equipada) gasta ação livre, meia ou
  completa; para N Full, `progress + 1` e só enche em N. Encher: `loaded = clip` (sobra descartada), `spare − 1`,
  `progress = 0`; sem reserva: recusa. Qualquer ação que não seja livre nem reação zera o `progress` de todas as armas do
  personagem, exceto a arma do próprio Reload; fim do combate zera. Reduções por raça e recargas grátis por efeitos: nota.
- **Rationale**: pp. 318, 424, 429; decisões do usuário.

## R5 — Emperrar e Overheats (A3, A17)

- **Decision**: emperrar (já calculado em `rollAttack`) grava `jammed: true`; atacar travada é recusado; Clear Jam com
  sucesso → `jammed: false`, `loaded: 0`. Overheats que emperra → `loaded: 0` também (p. 320: precisa recarregar).
- **Rationale**: p. 435, p. 320; decisão do usuário.

## R6 — Lançadores (A10)

- **Decision**: depois do disparo, o item de munição escolhido (`ammoId`) perde 1 de quantidade; em 0, é apagado.
- **Rationale**: decisão do usuário.

## R7 — Interface

- **Decision**: na linha da arma (aba Equipamento): `tiros/pente` e `reserva` como campos numéricos, selo "Travada" e
  "Recarga 3/8"; botão Recarregar que chama a ação Reload com aquela arma. Cartão de ataque mostra os tiros restantes.
