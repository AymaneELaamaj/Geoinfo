# 🎯 Tests de Connectivité - Backend/Frontend

## 🚀 URL de Test Principal
**Page de diagnostic:** http://localhost:5173/test-connectivite

---

## 🧪 Tests Manuels Backend

### 1. Test de Santé (Health Check)
```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:8085/api/health" -Method GET

# Réponse attendue
{
  "status": "OK",
  "timestamp": "2025-12-18T22:15:00Z",
  "service": "CityAlert Backend",
  "version": "1.0.0"
}
```

### 2. Test de Connectivité
```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:8085/api/test/connection" -Method GET

# Réponse attendue
{
  "message": "Connection test successful",
  "timestamp": "2025-12-18T22:15:00Z",
  "cors": "enabled"
}
```

### 3. Test POST avec Données
```bash
# PowerShell
$body = @{
    test = "frontend-data"
    timestamp = "2025-12-18T22:15:00Z"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8085/api/test/data" -Method POST -Body $body -ContentType "application/json"

# Réponse attendue
{
  "received": {
    "test": "frontend-data",
    "timestamp": "2025-12-18T22:15:00Z"
  },
  "processed": "2025-12-18T22:15:00Z"
}
```

### 4. Test d'Authentification
```bash
# PowerShell
$authBody = @{
    email = "test@test.com"
    password = "test123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8085/api/test/auth" -Method POST -Body $authBody -ContentType "application/json"

# Réponse attendue
{
  "authenticated": true,
  "user": {
    "email": "test@test.com",
    "role": "TEST_USER"
  },
  "token": "mock-jwt-token-for-testing"
}
```

---

## 🎨 Tests Frontend

### 1. Page de Test Interactive
- **URL:** http://localhost:5173/test-connectivite
- **Fonctionnalités:**
  - ✅ Test de santé du backend
  - ✅ Test de connectivité CORS
  - ✅ Test d'envoi de données POST
  - ✅ Test d'authentification
  - 📊 Affichage des réponses JSON en temps réel
  - 🎯 Indicateurs visuels de succès/échec

### 2. Tests d'Intégration Automatiques
```javascript
// Dans la console du navigateur (F12)
// Test de l'API centralisée
import { healthAPI } from './services/api.js';

// Test 1: Health Check
const health = await healthAPI.getHealth();
console.log('Health:', health);

// Test 2: Connection
const connection = await healthAPI.testConnection();
console.log('Connection:', connection);

// Test 3: Data POST
const dataTest = await healthAPI.testData({
  test: 'frontend-data',
  timestamp: new Date().toISOString()
});
console.log('Data test:', dataTest);

// Test 4: Auth
const authTest = await healthAPI.testAuth({
  email: 'test@test.com',
  password: 'test123'
});
console.log('Auth test:', authTest);
```

---

## 🔧 Tests de l'API Métier

### 1. Incidents
```bash
# Récupérer tous les incidents
Invoke-WebRequest -Uri "http://localhost:8085/api/incidents" -Method GET

# Créer un nouvel incident
$incident = @{
    titre = "Test d'incident"
    description = "Description de test"
    secteurId = 1
    statut = "REDIGE"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8085/api/incidents" -Method POST -Body $incident -ContentType "application/json"
```

### 2. Upload de Photos
```bash
# Test d'upload multipart (simulation)
# Note: Utilisez la page frontend pour les tests réels d'upload
```

### 3. Secteurs
```bash
# Récupérer tous les secteurs
Invoke-WebRequest -Uri "http://localhost:8085/api/secteurs" -Method GET
```

---

## 🏥 Diagnostic des Problèmes

### Erreur CORS
```bash
# Symptôme: "Access to fetch at 'http://localhost:8085' has been blocked by CORS policy"
# Solution: Vérifier CorsConfig.java et redémarrer le backend
```

### Backend Non Accessible
```bash
# Test de connectivité
Test-NetConnection -ComputerName localhost -Port 8085

# Vérifier les processus Java
Get-Process -Name java -ErrorAction SilentlyContinue
```

### Frontend Non Accessible
```bash
# Test de connectivité
Test-NetConnection -ComputerName localhost -Port 5173

# Vérifier si Vite fonctionne
Get-Process -Name node -ErrorAction SilentlyContinue
```

---

## 📊 Résultats Attendus

### ✅ Tests Réussis
- Status Code: **200 OK**
- Headers CORS présents
- Réponses JSON valides
- Pas d'erreurs dans la console

### ❌ Indicateurs d'Échec
- Status Code: **404, 500, 502**
- Erreurs CORS dans la console
- Timeout de connexion
- Réponses vides ou mal formées

---

## 🚀 Commandes de Démarrage Rapide

### Backend
```bash
cd backend
mvn clean spring-boot:run
```

### Frontend
```bash
cd frontend
npm run dev
```

### Script Automatique
```bash
# Dans le répertoire racine
.\start-services.ps1
```

---

## 📞 Support

En cas de problème:
1. Vérifiez les logs des services
2. Testez avec la page `/test-connectivite`
3. Consultez `INTEGRATION_GUIDE.md`
4. Utilisez les commandes de diagnostic ci-dessus