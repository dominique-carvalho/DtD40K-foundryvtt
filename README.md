# DtD40K-foundryvtt

## Compêndios

A fonte dos compêndios fica em `src/packs/<nome>/*.json` (um arquivo por documento, versionado).
O Foundry lê a versão compilada em LevelDB em `packs/<nome>/`, que **não é versionada** e é
gerada com:

```bash
npm run build:packs
```

- **Feche o Foundry por completo** antes do build (sair do mundo não basta: o servidor pode continuar segurando o LOCK do pack). Se o pack estiver em uso, o build avisa e não altera nada.
- Depois do build, abra o Foundry e confira o compêndio (ex.: 16 raças).
- Nunca edite `packs/` à mão; altere os JSON em `src/packs/` e rode o build de novo.
- Para editar um compêndio pelo Foundry: clique com o botão direito no compêndio → "Alternar trava de edição", edite os itens, feche o Foundry e rode `npm run extract:packs` para gravar as mudanças de volta em `src/packs/` (depois revise o diff e faça o commit).
- Compêndios atuais: `races` (16 raças do cap. 4 da DtD 7.7a).
