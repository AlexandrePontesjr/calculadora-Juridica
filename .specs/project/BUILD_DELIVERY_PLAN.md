# Plano de build e entrega v1.0

## Objetivo

Entregar a Calculadora Jurídica em um formato que o cliente consiga usar com baixo atrito, preservando o backend FastAPI, o frontend React/Vite e o banco SQLite local.

## Build base

Antes de qualquer modalidade de entrega:

1. Validar backend:
   - `pip install -e .[dev]`
   - `pytest`
2. Validar frontend:
   - `cd frontend`
   - `npm ci`
   - `npm run build`
3. Gerar pacote de frontend:
   - artefato: `frontend/dist/`
4. Definir dados locais:
   - banco padrão: `data/contracheques.db`
   - decidir se o pacote será entregue com banco vazio ou com base demonstrativa.

## Opção A - Entrega local assistida

**Formato:** pasta compactada com código, dependências instaláveis e instruções de execução.

**Como o cliente usa:** executa dois comandos, um para API e outro para frontend em preview ou dev server.

**Vantagens:**
- menor esforço para fechar a v1.0;
- mantém o fluxo atual quase sem alteração;
- bom para validação presencial, homologação e uso inicial por equipe técnica.

**Limitações:**
- exige Node.js e Python instalados na máquina do cliente;
- dois processos precisam ficar abertos;
- mais sujeito a erro operacional.

**Quando escolher:** primeira entrega controlada, cliente com suporte técnico disponível.

## Opção B - Pacote local com inicializador

**Formato:** pasta compactada com scripts `start-backend` e `start-frontend`, usando `frontend/dist/` e ambiente Python preparado.

**Como o cliente usa:** executa um atalho ou script único que sobe a API e abre o navegador.

**Vantagens:**
- experiência mais simples para usuário não técnico;
- mantém dados no computador do cliente;
- não exige publicar dados sensíveis na internet.

**Limitações:**
- ainda depende de runtime Python instalado, salvo se for empacotado com ferramenta adicional;
- precisa tratar porta ocupada, logs e encerramento dos processos;
- requer um pequeno ciclo de hardening dos scripts.

**Quando escolher:** entrega v1.0 recomendada se o cliente vai operar em Windows local.

## Opção C - Executável desktop

**Formato:** instalador ou executável que embute backend, frontend e inicialização local.

**Como o cliente usa:** instala e abre como aplicativo.

**Vantagens:**
- melhor experiência final para cliente não técnico;
- reduz dependência de terminal;
- facilita suporte por versão.

**Limitações:**
- maior trabalho de empacotamento;
- precisa decidir tecnologia de wrapper, por exemplo Tauri, Electron ou empacotamento Python;
- atualizações e assinatura do executável entram no escopo.

**Quando escolher:** após homologação da v1.0, quando houver demanda por distribuição recorrente.

## Opção D - Servidor privado

**Formato:** deploy em VPS, intranet ou servidor do cliente, com frontend estático e API FastAPI.

**Como o cliente usa:** acessa uma URL interna ou privada.

**Vantagens:**
- operação centralizada;
- dispensa instalação em cada máquina;
- facilita backup, logs e atualizações.

**Limitações:**
- exige política clara para PDFs e dados pessoais;
- precisa configurar autenticação, HTTPS, backup e acesso restrito;
- SQLite pode deixar de ser suficiente se houver múltiplos usuários simultâneos.

**Quando escolher:** cliente com equipe interna, necessidade de acesso por múltiplos usuários ou uso contínuo.

## Recomendação para v1.0

Entregar primeiro a **Opção B - Pacote local com inicializador**.

Critérios para fechar essa opção:

1. `npm run build` do frontend passa sem erro.
2. `pytest` do backend passa sem erro.
3. Script único inicia API e frontend.
4. Navegador abre na tela inicial da calculadora.
5. Banco SQLite fica em diretório previsível e documentado.
6. Logs ficam acessíveis para suporte.
7. Pacote final inclui um `README-CLIENTE.md` com instalação, execução, backup e solução de problemas comuns.

## Sequência sugerida

1. Fechar correções textuais e build atual.
2. Criar scripts de inicialização para Windows.
3. Ajustar backend para servir `frontend/dist/` ou definir preview estável via Vite.
4. Testar pacote em uma máquina limpa.
5. Gerar `README-CLIENTE.md`.
6. Congelar tag `v1.0.0`.
7. Separar backlog pós-v1.0: executável desktop, autenticação, servidor privado e migração de SQLite caso haja uso multiusuário.
 
## Extensao macOS e Linux

O codigo do app local combinado e portavel, mas o pacote final nao deve ser reaproveitado entre sistemas operacionais.

- Windows: gerar com `scripts/build_windows_release.ps1`, entregando `.zip`.
- macOS: gerar no macOS com `scripts/build_unix_release.sh`, entregando `.tar.gz`.
- Linux: gerar no Linux com `scripts/build_unix_release.sh`, entregando `.tar.gz`.

Motivo: o pacote inclui `.venv/` com dependencias Python nativas, e essas wheels precisam ser compativeis com o sistema operacional e arquitetura da maquina do cliente.
