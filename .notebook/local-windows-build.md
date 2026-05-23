# Local Desktop Build

## Context

O projeto entrega backend FastAPI em `src/contracheque_extractor` e frontend React/Vite em `frontend/`. O frontend buildado chama endpoints relativos com prefixo `/api`.

## Flow

- `src/contracheque_extractor/local_app.py` cria o app local combinado.
- A API existente de `src/contracheque_extractor/api.py:create_app()` e montada sob `/api`.
- `frontend/dist` e servido pelo mesmo processo local; rotas desconhecidas retornam `index.html` para preservar hash routing.
- `scripts/build_windows_release.ps1` gera `release/calculadora-juridica-local` e `release/calculadora-juridica-local.zip`.
- `packaging/windows/Iniciar Calculadora Juridica.bat` chama o PowerShell launcher, sobe uvicorn, abre o navegador e registra logs em `logs/`.
- `scripts/build_unix_release.sh` deve ser executado no proprio macOS/Linux alvo e gera `release/calculadora-juridica-local-{macos|linux}.tar.gz`.
- `packaging/unix/Iniciar Calculadora Juridica.command` e `.sh` usam `.venv/bin/python`, sobem uvicorn, abrem o navegador com `open` ou `xdg-open` e registram logs em `logs/`.

## Gotchas

- No PowerShell classico, falhas de comandos nativos como `npm ci` nao interrompem automaticamente o script; o build usa `Invoke-Checked` para checar `$LASTEXITCODE`.
- `npm ci` pode falhar no Windows se binarios como `esbuild.exe` estiverem travados por outro processo ou antivirus. O script usa `npm install` por padrao e deixa `-CleanFrontendInstall` como opcao explicita.
- Para o banco SQLite ficar dentro do pacote em `data/contracheques.db`, o launcher define `PYTHONPATH` apontando para `src` copiado na pasta de release.
- Pacotes macOS e Linux nao devem ser gerados no Windows, porque wheels Python nativas precisam casar com o sistema operacional e arquitetura do cliente.
