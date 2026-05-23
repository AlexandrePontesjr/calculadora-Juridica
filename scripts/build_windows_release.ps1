[CmdletBinding()]
param(
    [string]$PackageName = "calculadora-juridica-local",
    [switch]$CleanFrontendInstall
)

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$ReleaseRoot = Join-Path $RepoRoot "release"
$PackageDir = Join-Path $ReleaseRoot $PackageName
$ZipPath = Join-Path $ReleaseRoot "$PackageName.zip"
$FrontendDir = Join-Path $RepoRoot "frontend"
$FrontendDist = Join-Path $FrontendDir "dist"
$PackagingDir = Join-Path $RepoRoot "packaging\windows"

function Assert-ChildPath {
    param(
        [string]$Path,
        [string]$Parent
    )

    $resolvedParent = [System.IO.Path]::GetFullPath($Parent)
    $resolvedPath = [System.IO.Path]::GetFullPath($Path)
    if (-not $resolvedPath.StartsWith($resolvedParent, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Caminho fora da pasta de release: $resolvedPath"
    }
}

function Invoke-Checked {
    param(
        [string]$Description,
        [scriptblock]$Command
    )

    Write-Host $Description
    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "$Description falhou com codigo de saida $LASTEXITCODE."
    }
}

New-Item -ItemType Directory -Force -Path $ReleaseRoot | Out-Null
Assert-ChildPath -Path $PackageDir -Parent $ReleaseRoot
Assert-ChildPath -Path $ZipPath -Parent $ReleaseRoot

if (Test-Path -LiteralPath $PackageDir) {
    Remove-Item -LiteralPath $PackageDir -Recurse -Force
}

if (Test-Path -LiteralPath $ZipPath) {
    Remove-Item -LiteralPath $ZipPath -Force
}

Push-Location $FrontendDir
try {
    if ($CleanFrontendInstall) {
        Invoke-Checked "Instalando dependencias do frontend com npm ci..." { npm ci }
    } else {
        Invoke-Checked "Instalando/validando dependencias do frontend com npm install..." { npm install }
    }
    Invoke-Checked "Gerando build do frontend..." { npm run build }
} finally {
    Pop-Location
}

Write-Host "Montando pasta de entrega..."
New-Item -ItemType Directory -Force -Path $PackageDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $PackageDir "frontend") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $PackageDir "data") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $PackageDir "logs") | Out-Null

Copy-Item -LiteralPath (Join-Path $RepoRoot "src") -Destination (Join-Path $PackageDir "src") -Recurse
Copy-Item -LiteralPath $FrontendDist -Destination (Join-Path $PackageDir "frontend\dist") -Recurse
Copy-Item -LiteralPath (Join-Path $RepoRoot "pyproject.toml") -Destination $PackageDir
Copy-Item -LiteralPath (Join-Path $RepoRoot "README.md") -Destination $PackageDir
Copy-Item -LiteralPath (Join-Path $RepoRoot "README-CLIENTE.md") -Destination $PackageDir
Copy-Item -LiteralPath (Join-Path $PackagingDir "Iniciar Calculadora Juridica.bat") -Destination $PackageDir
Copy-Item -LiteralPath (Join-Path $PackagingDir "Iniciar Calculadora Juridica.ps1") -Destination $PackageDir

Write-Host "Criando ambiente Python local..."
Invoke-Checked "Criando .venv do pacote..." { python -m venv (Join-Path $PackageDir ".venv") }
$PackagePython = Join-Path $PackageDir ".venv\Scripts\python.exe"
Invoke-Checked "Atualizando pip do pacote..." { & $PackagePython -m pip install --upgrade pip }
Invoke-Checked "Instalando backend no pacote..." { & $PackagePython -m pip install $PackageDir }

Write-Host "Compactando pacote..."
Compress-Archive -Path (Join-Path $PackageDir "*") -DestinationPath $ZipPath

Write-Host "Pacote gerado:"
Write-Host "  Pasta: $PackageDir"
Write-Host "  Zip:   $ZipPath"
