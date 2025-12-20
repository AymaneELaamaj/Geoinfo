#!/usr/bin/env pwsh
# Script de démarrage automatique des services Frontend et Backend

Write-Host "🚀 Démarrage des services GeoInfo..." -ForegroundColor Green

# Variables
$ROOT_DIR = Get-Location
$BACKEND_DIR = "$ROOT_DIR\backend"
$FRONTEND_DIR = "$ROOT_DIR\frontend"

# Fonction pour vérifier si un port est occupé
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Fonction pour attendre qu'un service soit prêt
function Wait-ForService {
    param([string]$ServiceName, [string]$Url, [int]$MaxAttempts = 30)
    
    Write-Host "⏳ Attente de $ServiceName..." -ForegroundColor Yellow
    
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ $ServiceName est prêt !" -ForegroundColor Green
                return $true
            }
        } catch {
            Write-Host "   Tentative $i/$MaxAttempts..." -ForegroundColor Gray
            Start-Sleep -Seconds 2
        }
    }
    
    Write-Host "❌ $ServiceName n'a pas démarré dans les temps." -ForegroundColor Red
    return $false
}

# Vérifier si les services sont déjà en cours d'exécution
if (Test-Port 8085) {
    Write-Host "⚠️  Backend déjà en cours d'exécution sur le port 8085" -ForegroundColor Yellow
} else {
    Write-Host "🔧 Démarrage du Backend Spring Boot..." -ForegroundColor Cyan
    
    # Démarrer le backend en arrière-plan
    Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd '$BACKEND_DIR'; mvn clean spring-boot:run" -WindowStyle Minimized
}

if (Test-Port 5173) {
    Write-Host "⚠️  Frontend déjà en cours d'exécution sur le port 5173" -ForegroundColor Yellow
} else {
    Write-Host "🔧 Démarrage du Frontend React..." -ForegroundColor Cyan
    
    # Démarrer le frontend en arrière-plan
    Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd '$FRONTEND_DIR'; npm run dev" -WindowStyle Minimized
}

# Attendre que les services soient prêts
Write-Host "`n🔍 Vérification des services..." -ForegroundColor Magenta

$backendReady = Wait-ForService "Backend" "http://localhost:8085/api/health"
$frontendReady = Wait-ForService "Frontend" "http://localhost:5173"

Write-Host "`n📋 État des services:" -ForegroundColor White
Write-Host "   Backend (Spring Boot) : http://localhost:8085 - $(if($backendReady){'✅ PRÊT'}else{'❌ ERREUR'})" -ForegroundColor $(if($backendReady){'Green'}else{'Red'})
Write-Host "   Frontend (React)      : http://localhost:5173 - $(if($frontendReady){'✅ PRÊT'}else{'❌ ERREUR'})" -ForegroundColor $(if($frontendReady){'Green'}else{'Red'})

if ($backendReady -and $frontendReady) {
    Write-Host "`n🎉 Tous les services sont opérationnels !" -ForegroundColor Green
    Write-Host "`n🧪 Tests de connectivité disponibles sur:" -ForegroundColor Cyan
    Write-Host "   http://localhost:5173/test-connectivite" -ForegroundColor Blue
    
    # Test rapide de l'API
    Write-Host "`n🔬 Test rapide de l'API..." -ForegroundColor Magenta
    try {
        $apiTest = Invoke-WebRequest -Uri "http://localhost:8085/api/health" -Method GET
        $healthData = $apiTest.Content | ConvertFrom-Json
        Write-Host "✅ API Health Check: $($healthData.status)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur lors du test API: $_" -ForegroundColor Red
    }
    
} else {
    Write-Host "`n⚠️  Certains services ont échoué au démarrage." -ForegroundColor Yellow
    Write-Host "Vérifiez les logs dans les fenêtres de terminal ouvertes." -ForegroundColor Gray
}

Write-Host "`n📚 Documentation complète disponible dans:" -ForegroundColor Cyan
Write-Host "   - INTEGRATION_GUIDE.md" -ForegroundColor Blue
Write-Host "   - API_DOCUMENTATION.md" -ForegroundColor Blue
Write-Host "   - QUICKSTART.md" -ForegroundColor Blue

Read-Host "`nAppuyez sur Entrée pour continuer..."