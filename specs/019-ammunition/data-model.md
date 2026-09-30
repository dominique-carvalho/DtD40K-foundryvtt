# Data Model: Controle de munição (019)

## `weapon.system.ammo` (novo)

| Campo | Tipo | Inicial | Regra |
|---|---|---|---|
| `loaded` | inteiro ≥ 0, nulo | `null` | nulo = pente cheio |
| `spare` | inteiro ≥ 0 | 2 | pentes de reserva |
| `progress` | inteiro ≥ 0 | 0 | ações de recarga já feitas (N Full) |
| `jammed` | booleano | false | travada até o Clear Jam |

Derivados (não guardados): `ammo.max = clip`, `ammo.current = min(loaded ?? clip, clip)`, `ammo.tracked`,
`ammo.reload = parseReload(reload)`.

## Transições

- Ataque: `current − gasto` (mínimo 0); emperrar → `jammed`; Overheats emperrado → `loaded 0`.
- Reload: `progress + 1`; em `actions` → `loaded = clip`, `spare − 1`, `progress = 0`.
- Outra ação (não livre/reação): `progress = 0` nas outras armas do personagem.
- Clear Jam com sucesso: `jammed = false`, `loaded = 0`.
- Zona de Suppressing Fire: `flags.dtd40k.zone.rof` = ROF efetivo gasto ao iniciar.
