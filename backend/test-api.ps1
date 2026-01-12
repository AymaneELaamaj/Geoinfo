# Script de test de l'API GeoInfo
$BASE_URL = "http://localhost:8085/api"

Write-Host "🧪 Tests API GeoInfo" -ForegroundColor Green
Write-Host "==================`n" -ForegroundColor Green

# Test 1: Backend opérationnel
Write-Host "Test 1: Backend opérationnel..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/test" -Method Get
    Write-Host "✅ Backend OK: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible" -ForegroundColor Red
    exit 1
}

# Test 2: Connexion Admin
Write-Host "`nTest 2: Connexion Admin..." -ForegroundColor Cyan
try {
    $loginData = @{
        email = "admin@geoinfo.ma"
        motDePasse = "password123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginData

    $TOKEN = $response.token
    Write-Host "✅ Connexion réussie: $($response.utilisateur.nom) $($response.utilisateur.prenom)" -ForegroundColor Green
    Write-Host "   Rôle: $($response.utilisateur.role)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Échec connexion: $_" -ForegroundColor Red
    exit 1
}

# Test 3: Récupérer secteurs
Write-Host "`nTest 3: Récupération secteurs..." -ForegroundColor Cyan
try {
    $secteurs = Invoke-RestMethod -Uri "$BASE_URL/secteurs" -Method Get
    Write-Host "✅ $($secteurs.Count) secteurs trouvés" -ForegroundColor Green
    foreach ($secteur in $secteurs) {
        Write-Host "   - $($secteur.nom)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Échec récupération secteurs" -ForegroundColor Red
}

# Test 4: Statistiques
Write-Host "`nTest 4: Statistiques..." -ForegroundColor Cyan
try {
    $stats = Invoke-RestMethod -Uri "$BASE_URL/incidents/stats" -Method Get
    Write-Host "✅ Statistiques récupérées:" -ForegroundColor Green
    Write-Host "   Total incidents: $($stats.total)" -ForegroundColor Gray
    Write-Host "   Traités: $($stats.traite)" -ForegroundColor Gray
    Write-Host "   En cours: $($stats.enCours)" -ForegroundColor Gray
    Write-Host "   Taux résolution: $($stats.tauxResolution)%" -ForegroundColor Gray
} catch {
    Write-Host "❌ Échec récupération stats" -ForegroundColor Red
}

# Test 5: Incidents en attente (Admin)
Write-Host "`nTest 5: Incidents en attente (Admin)..." -ForegroundColor Cyan
try {
    $headers = @{
        Authorization = "Bearer $TOKEN"
    }
    $incidents = Invoke-RestMethod -Uri "$BASE_URL/admin/incidents/en-attente" `
        -Method Get `
        -Headers $headers
    Write-Host "✅ $($incidents.Count) incidents en attente de validation" -ForegroundColor Green
} catch {
    Write-Host "❌ Échec récupération incidents: $_" -ForegroundColor Red
}

Write-Host "`n✅ Tous les tests terminés !" -ForegroundColor Green
Write-Host "`nToken Admin (pour tests manuels):" -ForegroundColor Yellow
Write-Host $TOKEN -ForegroundColor Gray
