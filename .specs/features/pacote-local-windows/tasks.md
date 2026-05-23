# Tasks - pacote local Windows

- [x] PKG-T001 Criar app FastAPI local combinado, montando a API existente sob `/api` e servindo `frontend/dist`.
  - Verificacao: teste automatizado cobre `/api/health`, `/` e fallback SPA.
- [x] PKG-T002 Criar inicializador Windows para subir o servidor local, abrir navegador e gravar logs.
  - Verificacao: arquivos `packaging/windows/Iniciar Calculadora Juridica.*` existem.
- [x] PKG-T003 Criar script de build da pasta redistribuivel.
  - Verificacao: `scripts/build_windows_release.ps1` gera `release/calculadora-juridica-local` e `.zip`.
- [x] PKG-T004 Documentar uso pelo cliente.
  - Verificacao: `README-CLIENTE.md` descreve abertura, backup, logs e porta local.
- [x] PKG-T005 Executar validacao local completa.
  - Verificacao: `pytest`, `npm run build` e import do app local passam.
