# Permissoes e Acesso - calculadora-Juridica

Gerado pelo Reversa Detective em 2026-05-14T22:28:00Z.

## Resultado da Analise

🟢 CONFIRMADO: Nao ha autenticacao, autorizacao, RBAC, ACL, login, usuario, papel administrativo ou middleware de seguranca de acesso no codigo da aplicacao.

🟢 CONFIRMADO: Todas as rotas FastAPI declaradas ficam publicas para qualquer cliente que consiga chamar o backend.

🟢 CONFIRMADO: O CORS permite origens locais:

- `http://127.0.0.1:5173`
- `http://localhost:5173`

## Matriz de Permissoes Efetiva

| Funcionalidade | Papel efetivo | Permissao | Evidencia | Confiança |
|---|---|---|---|---|
| `GET /health` | Cliente anonimo | Permitido | `api.py` | 🟢 |
| `POST /extract` | Cliente anonimo | Permitido | `api.py` | 🟢 |
| `GET /servers` | Cliente anonimo | Permitido | `api.py` | 🟢 |
| `GET /servers/{server_id}` | Cliente anonimo | Permitido | `api.py` | 🟢 |
| `DELETE /servers/{server_id}` | Cliente anonimo | Permitido | `api.py` | 🟢 |
| `GET /integrations/servers/{server_id}` | Cliente anonimo | Permitido | `api.py` | 🟢 |
| UI de upload | Usuario local do navegador | Permitido | `App.tsx` | 🟢 |
| UI de exclusao | Usuario local do navegador | Permitido apos `window.confirm` | `App.tsx` | 🟢 |
| CLI | Usuario com acesso ao shell | Permitido | `cli.py` | 🟢 |

## Riscos e Lacunas

- 🔴 Dados pessoais e financeiros de servidores podem ser consultados sem autenticacao se o backend estiver exposto em rede.
- 🔴 A exclusao de servidor nao exige permissao nem registra quem executou a operacao.
- 🔴 Nao ha segregacao entre perfil de consulta, analista juridico, administrador ou integracao externa.
- 🔴 O endpoint de integracao tem o mesmo controle de acesso inexistente dos endpoints da UI.
- 🟡 O CORS local sugere uso em desenvolvimento/local, mas CORS nao substitui autenticacao.

## Recomendacao para Sistema Alvo

🟡 INFERIDO: Se este sistema for evoluido para uso multiusuario, a matriz minima deveria separar:

- Operador de extracao: pode enviar PDFs e ver auditoria.
- Analista juridico: pode consultar servidor e emitir calculos.
- Administrador: pode excluir snapshots e gerenciar fontes legais.
- Integracao: pode consultar endpoint dedicado com credencial tecnica.
