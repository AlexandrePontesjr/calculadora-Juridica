# Tasks - pacote local macOS e Linux

- [x] UXL-T001 Criar inicializadores POSIX para macOS e Linux.
  - Verificacao: `packaging/unix/Iniciar Calculadora Juridica.command` e `.sh` existem.
- [x] UXL-T002 Criar script de build Unix por plataforma.
  - Verificacao: `scripts/build_unix_release.sh` detecta `Darwin`/`Linux` e gera `.tar.gz`.
- [x] UXL-T003 Documentar uso pelo cliente em macOS e Linux.
  - Verificacao: `README-CLIENTE-MAC-LINUX.md` cobre abertura, permissao, backup, logs e porta local.
- [x] UXL-T004 Validar regressao automatica no ambiente atual.
  - Verificacao: testes Python passam; `bash -n` nao rodou neste Windows porque o Bash disponivel aponta para WSL sem `/bin/bash`.
