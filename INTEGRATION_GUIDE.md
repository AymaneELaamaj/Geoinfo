# 📋 Guide d'Intégration Backend-Frontend - FINALIZADO ✅

## 🚀 Intégration Professionnelle Terminée

L'intégration complète Backend-Frontend avec **CORS, authentification, upload de fichiers et endpoints de test** est maintenant **OPÉRATIONNELLE**.

---

## ✅ Configuration Implémentée

### Backend
- [x] **Authentification JWT** implémentée avec Spring Security
- [x] **Endpoints API RESTful** pour tous les modules
- [x] **CORS** configuré pour le frontend (localhost:5173)
- [x] **Upload de fichiers** configuré (10MB max)
- [x] **Base de données PostgreSQL** avec PostGIS
- [x] **Validation des données** côté serveur
- [x] **Gestion des erreurs** avec messages explicites
- [x] **Documentation Swagger** disponible

### Frontend
- [x] **Service API** complet avec gestion des tokens
- [x] **Authentification** connectée au backend
- [x] **Pages principales** intégrées (Dashboard, Incidents, Carte)
- [x] **Gestion d'état** avec Context API
- [x] **Constantes synchronisées** avec le backend
- [x] **Gestion des erreurs** et états de chargement
- [x] **Cartographie** avec Leaflet et clustering

---

## 🔧 Configuration Initiale

### 1. Prérequis

#### Backend
- Java 17+
- Maven 3.6+
- PostgreSQL 14+ avec extension PostGIS
- IDE (IntelliJ IDEA, VS Code, Eclipse)

#### Frontend
- Node.js 18+
- npm ou yarn
- Navigateur moderne

### 2. Configuration de la Base de Données

```bash
# Créer la base de données
psql -U postgres
CREATE DATABASE geoinfo;

# Activer PostGIS
\c geoinfo
CREATE EXTENSION postgis;

# Exécuter le script de création des utilisateurs de test
\i backend/src/main/resources/test-users.sql
```

### 3. Configuration Backend

**Fichier:** `backend/src/main/resources/application.properties`

```properties
# Port du serveur
server.port=8081

# PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/geoinfo
spring.datasource.username=postgres
spring.datasource.password=VOTRE_MOT_DE_PASSE

# JWT (IMPORTANT: Changez en production!)
jwt.secret=geoInfoSecretKeyForJWTTokenGenerationAndValidation2024SecureKey123456789
jwt.expiration=86400000

# Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### 4. Configuration Frontend

**Fichier:** `frontend/.env`

```env
VITE_API_URL=http://localhost:8081/api
```

---

## 🚀 Démarrage des Services

### Démarrer le Backend

```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

**Vérification:**
- API disponible sur: http://localhost:8081
- Swagger UI: http://localhost:8081/swagger-ui.html

### Démarrer le Frontend

```bash
cd frontend
npm install
npm run dev
```

**Vérification:**
- Application disponible sur: http://localhost:5173

---

## 🔐 Flux d'Authentification

### 1. Connexion
```javascript
// Frontend: AuthContext.jsx
const login = async (email, password) => {
  const response = await authAPI.login(email, password);
  // Token stocké automatiquement dans localStorage
  setUser(response.utilisateur);
};
```

### 2. Stockage du Token
```javascript
// api.js - Ajout automatique du token
const getAuthToken = () => {
  const user = localStorage.getItem('user');
  return JSON.parse(user)?.token;
};

// Dans chaque requête
headers: {
  'Authorization': `Bearer ${getAuthToken()}`
}
```

### 3. Gestion de l'Expiration
```javascript
// api.js - Redirection automatique si 401
if (response.status === 401) {
  localStorage.removeItem('user');
  window.location.href = '/connexion';
}
```

---

## 📊 Flux de Données Complet

### Exemple: Affichage des Incidents

```
┌─────────────┐
│  Frontend   │
│  (React)    │
└──────┬──────┘
       │
       │ 1. useEffect(() => fetchIncidents())
       ▼
┌─────────────────┐
│ incidentsAPI    │
│ .getAll()       │
└──────┬──────────┘
       │
       │ 2. GET /api/incidents
       │    Header: Authorization: Bearer <token>
       ▼
┌─────────────────────────┐
│  Backend Spring Boot    │
│  IncidentController     │
└──────┬──────────────────┘
       │
       │ 3. JwtAuthenticationFilter valide le token
       ▼
┌─────────────────┐
│ IncidentService │
└──────┬──────────┘
       │
       │ 4. Requête à la base de données
       ▼
┌─────────────┐
│ PostgreSQL  │
└──────┬──────┘
       │
       │ 5. Retour des données
       ▼
┌─────────────────┐
│  IncidentDTO[]  │
│  (JSON)         │
└──────┬──────────┘
       │
       │ 6. Response HTTP 200
       ▼
┌─────────────┐
│  Frontend   │
│  setState() │
│  Affichage  │
└─────────────┘
```

---

## 🗂️ Structure des Données

### IncidentDTO (Backend → Frontend)

```json
{
  "id": 1,
  "titre": "Route endommagée",
  "typeIncident": "Route endommagée",
  "description": "Description détaillée",
  "photoURL": "/uploads/incident_1.jpg",
  "latitude": "33.5731",
  "longitude": "-7.5898",
  "dateDeclaration": "2024-12-10T10:30:00",
  "statut": "PUBLIE",
  "secteurId": 1,
  "provinceId": 2,
  "professionnelId": null,
  "motifRejet": null
}
```

### Mapping des Statuts

| Backend (Enum)           | Frontend (Affichage) |
|--------------------------|----------------------|
| PRISE_EN_COMPTE          | Prise en compte     |
| VALIDE                   | Validé              |
| PUBLIE                   | Publié              |
| EN_COURS_DE_TRAITEMENT   | En cours            |
| TRAITE                   | Traité              |
| REJETE                   | Rejeté              |
| BLOQUE                   | Bloqué              |
| REDIRIGE                 | Redirigé            |

---

## 🎨 Pages et Endpoints Correspondants

### Page: Dashboard (Statistiques)
```javascript
// Frontend
useEffect(() => {
  statisticsAPI.getGlobal();
}, []);

// Backend
GET /api/incidents/stats
```

### Page: Incidents (Liste)
```javascript
// Frontend
incidentsAPI.getAll();

// Backend
GET /api/incidents
```

### Page: MapView (Carte)
```javascript
// Frontend
incidentsAPI.getForMap();

// Backend
GET /api/citoyens/incidents/carte
```

### Page: AdminDashboard
```javascript
// Validation
incidentsAPI.validate(id);
// → POST /api/incidents/{id}/valider

// Rejet
incidentsAPI.reject(id, motif);
// → POST /api/incidents/{id}/rejeter?motif=...
```

### Page: ProDashboard
```javascript
// Incidents par secteur
professionalsAPI.getIncidentsBySector(secteur);
// → GET /api/professionnels/consulterIncidentsBySecteur/{secteur}

// Traiter
incidentsAPI.process(id, description);
// → POST /api/incidents/{id}/traiter
```

---

## 🔄 Gestion des États

### Loading States
```javascript
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await incidentsAPI.getAll();
      setIncidents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

---

## 🧪 Tests de l'Intégration

### 1. Test de Connexion
```bash
# Terminal
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@geoinfo.ma","password":"password123"}'

# Résultat attendu: Token JWT
```

### 2. Test d'Accès Protégé
```bash
# Récupérer le token puis:
curl -X GET http://localhost:8081/api/utilisateurs \
  -H "Authorization: Bearer <VOTRE_TOKEN>"
```

### 3. Test Upload Photo
```bash
curl -X POST http://localhost:8081/api/citoyens/incidents \
  -F 'data={"titre":"Test","typeIncident":"Route endommagée","latitude":"33.5","longitude":"-7.5"}' \
  -F 'photo=@/chemin/vers/image.jpg'
```

---

## 🐛 Résolution des Problèmes Courants

### Problème: CORS Error
**Symptôme:** `Access to fetch at '...' has been blocked by CORS policy`

**Solution:**
Vérifier `CorsConfig.java`:
```java
.allowedOrigins("http://localhost:5173")
```

### Problème: 401 Unauthorized
**Symptôme:** Toutes les requêtes retournent 401

**Solutions:**
1. Vérifier que le token est bien envoyé
2. Vérifier l'expiration du token (24h par défaut)
3. Re-login si nécessaire

### Problème: Upload échoue
**Symptôme:** Erreur lors de l'upload de photos

**Solutions:**
1. Vérifier la taille du fichier (< 10MB)
2. Vérifier que le dossier `/uploads` existe
3. Vérifier les permissions du dossier

### Problème: Les incidents n'apparaissent pas
**Symptôme:** Liste vide malgré des données en base

**Solutions:**
1. Vérifier que le backend est démarré
2. Ouvrir la console du navigateur (F12)
3. Vérifier les logs backend
4. Tester l'endpoint avec curl/Postman

---

## 📈 Améliorations Futures

### Court Terme
- [ ] WebSockets pour les mises à jour en temps réel
- [ ] Pagination côté frontend
- [ ] Filtres avancés sauvegardés
- [ ] Export des données (CSV, PDF)

### Moyen Terme
- [ ] Notifications push pour les professionnels
- [ ] Système de messagerie interne
- [ ] Historique des modifications
- [ ] Tableau de bord analytique avancé

### Long Terme
- [ ] Application mobile native (React Native)
- [ ] Intelligence artificielle pour classification automatique
- [ ] Intégration avec systèmes SIG existants
- [ ] API publique pour partenaires

---

## 📞 Support

### Documentation
- API: `/API_DOCUMENTATION.md`
- Swagger: `http://localhost:8081/swagger-ui.html`

### Logs
```bash
# Backend
tail -f backend/logs/spring-boot.log

# Frontend (console navigateur)
F12 → Console
```

### Base de Données
```bash
# Accéder à PostgreSQL
psql -U postgres -d geoinfo

# Vérifier les utilisateurs
SELECT * FROM utilisateur;

# Vérifier les incidents
SELECT id, titre, statut FROM incident LIMIT 10;
```

---

## ✅ Points Clés à Retenir

1. **Toujours démarrer le backend avant le frontend**
2. **Les tokens expirent après 24h** - re-login nécessaire
3. **Les statuts utilisent des ENUMS** - respecter la casse exacte
4. **Les IDs sont générés automatiquement** - ne pas les spécifier en création
5. **Les photos sont optionnelles** pour la création d'incidents
6. **La géolocalisation utilise PostGIS** - format: POINT(longitude latitude)
7. **Les rôles sont case-sensitive** - "admin", "professionnel", "citoyen"

---

## 🎉 Conclusion

L'intégration frontend/backend est maintenant complète et opérationnelle. Tous les flux de données fonctionnent correctement et l'authentification est sécurisée avec JWT.

**Prochaines étapes:**
1. Tester tous les scénarios utilisateurs
2. Ajouter des tests unitaires et d'intégration
3. Optimiser les performances
4. Préparer pour la production
