#!/usr/bin/env sh
set -u

APP_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PYTHON="$APP_ROOT/.venv/bin/python"
LOGS_DIR="$APP_ROOT/logs"
STDOUT_LOG="$LOGS_DIR/app-out.log"
STDERR_LOG="$LOGS_DIR/app-err.log"
URL="http://127.0.0.1:8000/"
HEALTH_URL="http://127.0.0.1:8000/api/health"
APP_PID=""

if [ ! -x "$PYTHON" ]; then
    printf '%s\n' "Ambiente Python do pacote nao encontrado em: $PYTHON"
    printf '%s\n' "Gere o pacote novamente usando scripts/build_unix_release.sh no macOS ou Linux alvo."
    printf '%s' "Pressione ENTER para sair"
    read _unused
    exit 1
fi

mkdir -p "$LOGS_DIR"
export PYTHONPATH="$APP_ROOT/src"
export CALCULADORA_FRONTEND_DIST="$APP_ROOT/frontend/dist"

test_app_health() {
    "$PYTHON" - "$HEALTH_URL" >/dev/null 2>&1 <<'PY'
import json
import sys
import urllib.request

try:
    with urllib.request.urlopen(sys.argv[1], timeout=2) as response:
        payload = json.loads(response.read().decode("utf-8"))
except Exception:
    raise SystemExit(1)

raise SystemExit(0 if payload.get("status") == "ok" else 1)
PY
}

open_browser() {
    if command -v open >/dev/null 2>&1; then
        open "$URL" >/dev/null 2>&1 &
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$URL" >/dev/null 2>&1 &
    else
        printf '%s\n' "Abra manualmente: $URL"
    fi
}

stop_app() {
    if [ -n "$APP_PID" ] && kill -0 "$APP_PID" >/dev/null 2>&1; then
        kill "$APP_PID" >/dev/null 2>&1 || true
        wait "$APP_PID" >/dev/null 2>&1 || true
    fi
}

trap stop_app INT TERM EXIT

if test_app_health; then
    printf '%s\n' "A Calculadora Juridica ja esta rodando em $URL"
    open_browser
    printf '%s' "Pressione ENTER para sair"
    read _unused
    exit 0
fi

"$PYTHON" -m uvicorn contracheque_extractor.local_app:app \
    --host 127.0.0.1 \
    --port 8000 \
    >"$STDOUT_LOG" \
    2>"$STDERR_LOG" &
APP_PID=$!

attempt=1
while [ "$attempt" -le 30 ]; do
    if ! kill -0 "$APP_PID" >/dev/null 2>&1; then
        printf '%s\n' "Nao foi possivel iniciar a Calculadora Juridica."
        printf '%s\n' "Veja os logs em:"
        printf '  %s\n' "$STDOUT_LOG"
        printf '  %s\n' "$STDERR_LOG"
        printf '%s' "Pressione ENTER para sair"
        read _unused
        exit 1
    fi

    if test_app_health; then
        open_browser
        printf '%s\n' "Calculadora Juridica aberta em $URL"
        printf '%s' "Para encerrar, volte para esta janela e pressione ENTER."
        read _unused
        exit 0
    fi

    attempt=$((attempt + 1))
    sleep 1
done

printf '%s\n' "O servidor demorou para responder em $HEALTH_URL."
printf '%s\n' "Veja os logs em:"
printf '  %s\n' "$STDOUT_LOG"
printf '  %s\n' "$STDERR_LOG"
printf '%s' "Pressione ENTER para encerrar o processo"
read _unused
exit 1
