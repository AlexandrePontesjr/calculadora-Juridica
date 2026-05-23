$ErrorActionPreference = "Stop"

$AppRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$Python = Join-Path $AppRoot ".venv\Scripts\python.exe"
$LogsDir = Join-Path $AppRoot "logs"
$StdoutLog = Join-Path $LogsDir "app-out.log"
$StderrLog = Join-Path $LogsDir "app-err.log"
$Url = "http://127.0.0.1:8000/"
$HealthUrl = "http://127.0.0.1:8000/api/health"

if (-not (Test-Path -LiteralPath $Python)) {
    Write-Host "Ambiente Python do pacote nao encontrado em: $Python" -ForegroundColor Red
    Write-Host "Gere o pacote novamente usando scripts/build_windows_release.ps1."
    Read-Host "Pressione ENTER para sair"
    exit 1
}

New-Item -ItemType Directory -Force -Path $LogsDir | Out-Null
$env:PYTHONPATH = Join-Path $AppRoot "src"
$env:CALCULADORA_FRONTEND_DIST = Join-Path $AppRoot "frontend\dist"

function Test-AppHealth {
    try {
        $response = Invoke-RestMethod -Uri $HealthUrl -TimeoutSec 2
        return $response.status -eq "ok"
    } catch {
        return $false
    }
}

if (Test-AppHealth) {
    Write-Host "A Calculadora Juridica ja esta rodando em $Url"
    Start-Process $Url
    Read-Host "Pressione ENTER para sair"
    exit 0
}

$Arguments = @(
    "-m",
    "uvicorn",
    "contracheque_extractor.local_app:app",
    "--host",
    "127.0.0.1",
    "--port",
    "8000"
)

$Process = Start-Process `
    -FilePath $Python `
    -ArgumentList $Arguments `
    -WorkingDirectory $AppRoot `
    -RedirectStandardOutput $StdoutLog `
    -RedirectStandardError $StderrLog `
    -PassThru `
    -WindowStyle Hidden

for ($attempt = 1; $attempt -le 30; $attempt++) {
    if ($Process.HasExited) {
        Write-Host "Nao foi possivel iniciar a Calculadora Juridica." -ForegroundColor Red
        Write-Host "Veja os logs em:"
        Write-Host "  $StdoutLog"
        Write-Host "  $StderrLog"
        Read-Host "Pressione ENTER para sair"
        exit 1
    }

    if (Test-AppHealth) {
        Start-Process $Url
        Write-Host "Calculadora Juridica aberta em $Url"
        Write-Host "Para encerrar, volte para esta janela e pressione ENTER."
        Read-Host
        Stop-Process -Id $Process.Id -Force
        exit 0
    }

    Start-Sleep -Seconds 1
}

Write-Host "O servidor demorou para responder em $HealthUrl." -ForegroundColor Yellow
Write-Host "Veja os logs em:"
Write-Host "  $StdoutLog"
Write-Host "  $StderrLog"
Read-Host "Pressione ENTER para encerrar o processo"
Stop-Process -Id $Process.Id -Force
exit 1
