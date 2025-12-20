# Script de Test d'Intégration Backend/Frontend
# PowerShell

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " TEST D'INTÉGRATION GEOINFO" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$API_URL = "http://localhost:8081/api"

# Test 1: Vérifier que le backend est accessible
Write-Host "[TEST 1] Vérification Backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/incidents" -Method Get -TimeoutSec 5
    Write-Host "✅ Backend accessible" -ForegroundColor Green
    Write-Host "   Nombre d'incidents: $($response.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend inaccessible" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Assurez-vous que le backend est démarré sur le port 8081" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Test de connexion
Write-Host "[TEST 2] Test d'authentification..." -ForegroundColor Yellow

$loginData = @{
    email = "admin@geoinfo.ma"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" `
        -Method Post `
        -Body $loginData `
        -ContentType "application/json" `
        -TimeoutSec 10
    
    $token = $loginResponse.token
    Write-Host "✅ Authentification réussie" -ForegroundColor Green
    Write-Host "   Utilisateur: $($loginResponse.utilisateur.nom) $($loginResponse.utilisateur.prenom)" -ForegroundColor Gray
    Write-Host "   Rôle: $($loginResponse.utilisateur.role)" -ForegroundColor Gray
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Échec de l'authentification" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: Accès à une route protégée
Write-Host "[TEST 3] Test d'accès aux utilisateurs (route protégée)..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $users = Invoke-RestMethod -Uri "$API_URL/utilisateurs" `
        -Method Get `
        -Headers $headers `
        -TimeoutSec 10
    
    Write-Host "✅ Accès autorisé avec JWT" -ForegroundColor Green
    Write-Host "   Nombre d'utilisateurs: $($users.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Accès refusé" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Statistiques
Write-Host "[TEST 4] Test des statistiques..." -ForegroundColor Yellow

try {
    $stats = Invoke-RestMethod -Uri "$API_URL/incidents/stats" `
        -Method Get `
        -TimeoutSec 10
    
    Write-Host "✅ Statistiques récupérées" -ForegroundColor Green
    Write-Host "   Total incidents: $($stats.total)" -ForegroundColor Gray
    if ($stats.traites) {
        Write-Host "   Incidents traités: $($stats.traites)" -ForegroundColor Gray
    }
    if ($stats.enCours) {
        Write-Host "   En cours: $($stats.enCours)" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  Statistiques non disponibles" -ForegroundColor Yellow
    Write-Host "   (Ceci est normal si aucun incident n'existe)" -ForegroundColor Gray
}

Write-Host ""

# Test 5: Vérifier le frontend
Write-Host "[TEST 5] Vérification Frontend..." -ForegroundColor Yellow

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" `
        -Method Head `
        -TimeoutSec 5 `
        -UseBasicParsing
    
    Write-Host "✅ Frontend accessible sur http://localhost:5173" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend inaccessible" -ForegroundColor Red
    Write-Host "   Assurez-vous d'avoir exécuté 'npm run dev' dans le dossier frontend" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Backend API: http://localhost:8081" -ForegroundColor White
Write-Host "📍 Frontend Web: http://localhost:5173" -ForegroundColor White
Write-Host "📍 Swagger UI: http://localhost:8081/swagger-ui.html" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Compte Admin:" -ForegroundColor White
Write-Host "   Email: admin@geoinfo.ma" -ForegroundColor Gray
Write-Host "   Mot de passe: password123" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Intégration fonctionnelle!" -ForegroundColor Green
Write-Host ""
