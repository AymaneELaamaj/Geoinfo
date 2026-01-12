# Script de démarrage pour développement
Write-Host "🚀 Démarrage GeoInfo Backend - Mode Développement" -ForegroundColor Green

# Vérifier Java
Write-Host "`n📋 Vérification de Java..." -ForegroundColor Cyan
java -version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Java 17+ requis !" -ForegroundColor Red
    exit 1
}

# Vérifier PostgreSQL
Write-Host "`n📋 Vérification de PostgreSQL..." -ForegroundColor Cyan
$pgRunning = Get-Process postgres -ErrorAction SilentlyContinue
if (-not $pgRunning) {
    Write-Host "⚠️  PostgreSQL ne semble pas démarré" -ForegroundColor Yellow
    Write-Host "Voulez-vous continuer quand même ? (O/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "O" -and $response -ne "o") {
        exit 1
    }
}

# Créer le répertoire uploads
Write-Host "`n📁 Création du répertoire uploads..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "./uploads" | Out-Null

# Démarrer l'application
Write-Host "`n🏃 Démarrage de l'application..." -ForegroundColor Cyan
Write-Host "Backend sera disponible sur: http://localhost:8085" -ForegroundColor Green
Write-Host "Swagger UI: http://localhost:8085/swagger-ui.html" -ForegroundColor Green
Write-Host "`nAppuyez sur Ctrl+C pour arrêter`n" -ForegroundColor Yellow

mvn spring-boot:run
