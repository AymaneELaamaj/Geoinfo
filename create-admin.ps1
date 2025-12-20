# Script PowerShell pour créer le compte administrateur
# Exécutez ce script après que le backend soit démarré

Write-Host "=== Création du compte administrateur ===" -ForegroundColor Cyan
Write-Host ""

$url = "http://localhost:8085/api/init/admin"
$body = @{
    email = "admin@geo.ma"
    password = "Admin123!"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
    Write-Host "✓ Succès!" -ForegroundColor Green
    Write-Host $response
    Write-Host ""
    Write-Host "=== Informations de connexion ===" -ForegroundColor Yellow
    Write-Host "Email    : admin@geo.ma"
    Write-Host "Password : Admin123!"
    Write-Host ""
} catch {
    Write-Host "✗ Erreur:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "Assurez-vous que le backend est démarré sur http://localhost:8085"
}

Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
