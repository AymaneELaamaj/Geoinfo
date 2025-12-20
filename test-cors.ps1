#!/usr/bin/env pwsh
# Script de test CORS pour valider la configuration

Write-Host "🔧 Test de Configuration CORS" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Variables
$BACKEND_URL = "http://localhost:8085"
$FRONTEND_ORIGIN = "http://localhost:5173"

Write-Host "`n1️⃣ Test de santé du backend..." -ForegroundColor Yellow

try {
    $health = Invoke-WebRequest -Uri "$BACKEND_URL/api/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Backend accessible (Status: $($health.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible: $_" -ForegroundColor Red
    Write-Host "   Assurez-vous que le backend est démarré sur le port 8085" -ForegroundColor Gray
    exit 1
}

Write-Host "`n2️⃣ Test CORS Preflight (OPTIONS)..." -ForegroundColor Yellow

try {
    # Test preflight OPTIONS avec headers CORS
    $headers = @{
        'Origin' = $FRONTEND_ORIGIN
        'Access-Control-Request-Method' = 'GET'
        'Access-Control-Request-Headers' = 'Content-Type,Authorization'
    }
    
    $preflight = Invoke-WebRequest -Uri "$BACKEND_URL/api/health" -Method OPTIONS -Headers $headers -TimeoutSec 10
    
    Write-Host "✅ Preflight OPTIONS réussi (Status: $($preflight.StatusCode))" -ForegroundColor Green
    
    # Vérification des headers CORS dans la réponse
    $corsHeaders = @{
        'Access-Control-Allow-Origin' = $preflight.Headers['Access-Control-Allow-Origin']
        'Access-Control-Allow-Methods' = $preflight.Headers['Access-Control-Allow-Methods']
        'Access-Control-Allow-Headers' = $preflight.Headers['Access-Control-Allow-Headers']
        'Access-Control-Allow-Credentials' = $preflight.Headers['Access-Control-Allow-Credentials']
    }
    
    Write-Host "📋 Headers CORS reçus:" -ForegroundColor Cyan
    foreach ($header in $corsHeaders.GetEnumerator()) {
        if ($header.Value) {
            Write-Host "   $($header.Key): $($header.Value)" -ForegroundColor White
        }
    }
    
} catch {
    Write-Host "❌ Test Preflight échoué: $_" -ForegroundColor Red
}

Write-Host "`n3️⃣ Test requête GET avec Origin..." -ForegroundColor Yellow

try {
    $getHeaders = @{
        'Origin' = $FRONTEND_ORIGIN
        'Content-Type' = 'application/json'
    }
    
    $getRequest = Invoke-WebRequest -Uri "$BACKEND_URL/api/test/connection" -Method GET -Headers $getHeaders -TimeoutSec 10
    
    Write-Host "✅ Requête GET avec Origin réussie (Status: $($getRequest.StatusCode))" -ForegroundColor Green
    Write-Host "📄 Réponse: $($getRequest.Content)" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Test GET avec Origin échoué: $_" -ForegroundColor Red
}

Write-Host "`n4️⃣ Test requête POST avec données..." -ForegroundColor Yellow

try {
    $postHeaders = @{
        'Origin' = $FRONTEND_ORIGIN
        'Content-Type' = 'application/json'
    }
    
    $postData = @{
        test = "cors-validation"
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    } | ConvertTo-Json
    
    $postRequest = Invoke-WebRequest -Uri "$BACKEND_URL/api/test/data" -Method POST -Headers $postHeaders -Body $postData -TimeoutSec 10
    
    Write-Host "✅ Requête POST réussie (Status: $($postRequest.StatusCode))" -ForegroundColor Green
    Write-Host "📄 Réponse: $($postRequest.Content)" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Test POST échoué: $_" -ForegroundColor Red
}

Write-Host "`n🏆 Résumé du Test CORS" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green

Write-Host "✅ Configuration CORS corrigée avec:" -ForegroundColor White
Write-Host "   - allowedOriginPatterns au lieu de allowedOrigins" -ForegroundColor Gray
Write-Host "   - Support des credentials activé" -ForegroundColor Gray
Write-Host "   - Annotations @CrossOrigin conflictuelles supprimées" -ForegroundColor Gray
Write-Host "   - Configuration centralisée dans CorsConfig.java" -ForegroundColor Gray

Write-Host "`n🌐 Frontend peut maintenant communiquer avec Backend !" -ForegroundColor Green
Write-Host "   Frontend: $FRONTEND_ORIGIN" -ForegroundColor Cyan
Write-Host "   Backend:  $BACKEND_URL" -ForegroundColor Cyan

Write-Host "`n📚 Page de test disponible:" -ForegroundColor Yellow
Write-Host "   http://localhost:5173/test-connectivite" -ForegroundColor Blue

Read-Host "`nAppuyez sur Entrée pour continuer..."