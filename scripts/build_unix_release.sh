#!/usr/bin/env sh
set -eu

PACKAGE_NAME=""
CLEAN_FRONTEND_INSTALL=0

while [ "$#" -gt 0 ]; do
    case "$1" in
        --package-name)
            if [ "$#" -lt 2 ]; then
                printf '%s\n' "Uso: $0 [--package-name NOME] [--clean-frontend-install]" >&2
                exit 2
            fi
            PACKAGE_NAME=$2
            shift 2
            ;;
        --clean-frontend-install)
            CLEAN_FRONTEND_INSTALL=1
            shift
            ;;
        *)
            printf '%s\n' "Opcao desconhecida: $1" >&2
            printf '%s\n' "Uso: $0 [--package-name NOME] [--clean-frontend-install]" >&2
            exit 2
            ;;
    esac
done

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
RELEASE_ROOT="$REPO_ROOT/release"
FRONTEND_DIR="$REPO_ROOT/frontend"
FRONTEND_DIST="$FRONTEND_DIR/dist"
PACKAGING_DIR="$REPO_ROOT/packaging/unix"

OS_NAME=$(uname -s)
case "$OS_NAME" in
    Darwin)
        PLATFORM_NAME="macos"
        ;;
    Linux)
        PLATFORM_NAME="linux"
        ;;
    *)
        printf '%s\n' "Sistema operacional nao suportado por este script: $OS_NAME" >&2
        exit 1
        ;;
esac

if [ -z "$PACKAGE_NAME" ]; then
    PACKAGE_NAME="calculadora-juridica-local-$PLATFORM_NAME"
fi

case "$PACKAGE_NAME" in
    *[!A-Za-z0-9._-]* | .* | *..*)
        printf '%s\n' "Nome de pacote invalido: $PACKAGE_NAME" >&2
        exit 2
        ;;
esac

if command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_CMD="python"
else
    printf '%s\n' "Python 3.14+ nao encontrado no PATH." >&2
    exit 1
fi

"$PYTHON_CMD" - <<'PY'
import sys

if sys.version_info < (3, 14):
    version = ".".join(map(str, sys.version_info[:3]))
    raise SystemExit(f"Python 3.14+ e necessario. Encontrado: {version}")
PY

PACKAGE_DIR="$RELEASE_ROOT/$PACKAGE_NAME"
ARCHIVE_PATH="$RELEASE_ROOT/$PACKAGE_NAME.tar.gz"

mkdir -p "$RELEASE_ROOT"
rm -rf "$PACKAGE_DIR"
rm -f "$ARCHIVE_PATH"

cd "$FRONTEND_DIR"
if [ "$CLEAN_FRONTEND_INSTALL" -eq 1 ]; then
    printf '%s\n' "Instalando dependencias do frontend com npm ci..."
    npm ci
else
    printf '%s\n' "Instalando/validando dependencias do frontend com npm install..."
    npm install
fi
printf '%s\n' "Gerando build do frontend..."
npm run build

printf '%s\n' "Montando pasta de entrega..."
mkdir -p "$PACKAGE_DIR/frontend" "$PACKAGE_DIR/data" "$PACKAGE_DIR/logs"
cp -R "$REPO_ROOT/src" "$PACKAGE_DIR/src"
cp -R "$FRONTEND_DIST" "$PACKAGE_DIR/frontend/dist"
cp "$REPO_ROOT/pyproject.toml" "$PACKAGE_DIR/"
cp "$REPO_ROOT/README.md" "$PACKAGE_DIR/"
cp "$REPO_ROOT/README-CLIENTE-MAC-LINUX.md" "$PACKAGE_DIR/README-CLIENTE.md"
cp "$PACKAGING_DIR/Iniciar Calculadora Juridica.command" "$PACKAGE_DIR/"
cp "$PACKAGING_DIR/Iniciar Calculadora Juridica.sh" "$PACKAGE_DIR/"
chmod +x "$PACKAGE_DIR/Iniciar Calculadora Juridica.command"
chmod +x "$PACKAGE_DIR/Iniciar Calculadora Juridica.sh"

printf '%s\n' "Criando ambiente Python local..."
"$PYTHON_CMD" -m venv "$PACKAGE_DIR/.venv"
PACKAGE_PYTHON="$PACKAGE_DIR/.venv/bin/python"
"$PACKAGE_PYTHON" -m pip install --upgrade pip
"$PACKAGE_PYTHON" -m pip install "$PACKAGE_DIR"

printf '%s\n' "Compactando pacote..."
cd "$RELEASE_ROOT"
tar -czf "$ARCHIVE_PATH" "$PACKAGE_NAME"

printf '%s\n' "Pacote gerado:"
printf '  Pasta: %s\n' "$PACKAGE_DIR"
printf '  Arquivo: %s\n' "$ARCHIVE_PATH"
