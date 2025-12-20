# Documentation API - Plateforme GeoInfo

## 📚 Table des Matières
- [Authentification](#authentification)
- [Incidents](#incidents)
- [Statistiques](#statistiques)
- [Utilisateurs](#utilisateurs)
- [Professionnels](#professionnels)
- [Citoyens](#citoyens)

---

## 🔐 Authentification

Toutes les routes protégées nécessitent un header `Authorization: Bearer <token>`.

### POST `/api/auth/login`
Connexion d'un utilisateur

**Request Body:**
```json
{
  "email": "admin@geoinfo.ma",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "utilisateur": {
    "id": 1,
    "nom": "Admin",
    "prenom": "Système",
    "email": "admin@geoinfo.ma",
    "role": "admin",
    "telephone": "0612345678"
  }
}
```

**Errors:**
- `401 Unauthorized` - Email ou mot de passe incorrect

---

### POST `/api/auth/register`
Inscription d'un nouvel utilisateur

**Request Body:**
```json
{
  "nom": "Doe",
  "prenom": "John",
  "email": "john.doe@example.com",
  "motDePasse": "securePassword123",
  "telephone": "0612345678",
  "role": "citoyen"
}
```

**Response (201 Created):**
```json
{
  "id": 10,
  "nom": "Doe",
  "prenom": "John",
  "email": "john.doe@example.com",
  "role": "citoyen",
  "telephone": "0612345678"
}
```

---

### GET `/api/auth/me`
Récupère l'utilisateur actuellement connecté

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "nom": "Admin",
  "prenom": "Système",
  "email": "admin@geoinfo.ma",
  "role": "admin",
  "telephone": "0612345678"
}
```

---

## 🚨 Incidents

### GET `/api/incidents`
Récupère tous les incidents (publique)

**Query Parameters:** Aucun

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "titre": "Route endommagée",
    "typeIncident": "Route endommagée",
    "description": "Nid de poule dangereux",
    "photoURL": "/uploads/incident_1.jpg",
    "latitude": "33.5731",
    "longitude": "-7.5898",
    "dateDeclaration": "2024-12-10T10:30:00",
    "statut": "PUBLIE",
    "secteurId": 1,
    "provinceId": 2,
    "professionnelId": null
  }
]
```

---

### GET `/api/incidents/search`
Recherche d'incidents avec filtres et pagination

**Query Parameters:**
- `statut` (optionnel) - Statut de l'incident
- `secteur` (optionnel) - Nom du secteur
- `typeIncident` (optionnel) - Type d'incident
- `province` (optionnel) - Nom de la province
- `page` (défaut: 0) - Numéro de page
- `size` (défaut: 10) - Taille de la page

**Exemple:**
```
GET /api/incidents/search?statut=PUBLIE&secteur=Infrastructure&page=0&size=10
```

**Response (200 OK):**
```json
{
  "content": [...],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 45,
  "totalPages": 5
}
```

---

### GET `/api/incidents/{id}`
Récupère un incident par son ID (publique)

**Response (200 OK):**
```json
{
  "id": 1,
  "titre": "Route endommagée",
  "typeIncident": "Route endommagée",
  "description": "Nid de poule dangereux",
  "latitude": "33.5731",
  "longitude": "-7.5898",
  "statut": "PUBLIE"
}
```

---

### POST `/api/incidents/{id}/valider`
Valide un incident (Admin uniquement)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "statut": "VALIDE",
  ...
}
```

**Errors:**
- `401 Unauthorized` - Token manquant ou invalide
- `403 Forbidden` - Rôle insuffisant

---

### POST `/api/incidents/{id}/rejeter`
Rejette un incident (Admin uniquement)

**Query Parameters:**
- `motif` (requis) - Motif du rejet

**Exemple:**
```
POST /api/incidents/5/rejeter?motif=Information insuffisante
```

**Response (200 OK):**
```json
{
  "id": 5,
  "statut": "REJETE",
  "motifRejet": "Information insuffisante"
}
```

---

### POST `/api/incidents/{id}/traiter`
Marque un incident comme traité (Professionnel/Admin)

**Query Parameters:**
- `description` (requis) - Description du traitement

**Exemple:**
```
POST /api/incidents/3/traiter?description=Réparation effectuée
```

---

### POST `/api/incidents/{id}/en-cours`
Met un incident en cours de traitement

**Response (200 OK):**
```json
{
  "id": 3,
  "statut": "EN_COURS_DE_TRAITEMENT"
}
```

---

### POST `/api/incidents/{id}/bloquer`
Bloque un incident

**Query Parameters:**
- `raison` (requis) - Raison du blocage

---

### POST `/api/incidents/{id}/rediriger`
Redirige un incident vers un autre secteur

**Query Parameters:**
- `nouveauSecteurId` (requis) - ID du nouveau secteur

---

### GET `/api/incidents/stats`
Récupère les statistiques des incidents (publique)

**Response (200 OK):**
```json
{
  "total": 150,
  "traites": 80,
  "enCours": 45,
  "publies": 120,
  "rejetes": 15,
  "parSecteur": {
    "Infrastructure": 60,
    "Environnement": 40,
    "Sécurité": 30
  },
  "parProvince": {
    "Casablanca": 50,
    "Rabat": 40
  }
}
```

---

## 👥 Citoyens

### POST `/api/citoyens/incidents`
Crée un nouvel incident (avec photo optionnelle)

**Content-Type:** `multipart/form-data`

**Form Data:**
- `data` (JSON) - Données de l'incident
- `photo` (File, optionnel) - Photo de l'incident

**Exemple data:**
```json
{
  "titre": "Route endommagée",
  "typeIncident": "Route endommagée",
  "description": "Nid de poule",
  "latitude": "33.5731",
  "longitude": "-7.5898"
}
```

**Response (200 OK):**
```json
{
  "id": 25,
  "titre": "Route endommagée",
  "statut": "PRISE_EN_COMPTE",
  "photoURL": "/uploads/incident_25.jpg"
}
```

---

### GET `/api/citoyens/incidents/carte`
Récupère tous les incidents pour affichage sur carte (publique)

**Response:** Liste complète des incidents avec coordonnées GPS

---

### GET `/api/citoyens/incidents/{ime}`
Récupère les incidents déclarés par un citoyen spécifique

**Path Parameter:**
- `ime` - Identifiant mobile (IMEI)

---

## 📊 Statistiques

### GET `/api/statistics`
Statistiques globales (publique)

---

### GET `/api/statistics/sectors`
Statistiques par secteur

---

### GET `/api/statistics/provinces`
Statistiques par province

---

### GET `/api/statistics/types`
Statistiques par type d'incident

---

## 👨‍💼 Utilisateurs (Admin)

### GET `/api/utilisateurs`
Liste tous les utilisateurs (Admin)

**Headers:**
```
Authorization: Bearer <admin_token>
```

---

### GET `/api/utilisateurs/{id}`
Récupère un utilisateur par ID (Admin)

---

### POST `/api/utilisateurs`
Crée un nouvel utilisateur (Admin)

---

### DELETE `/api/utilisateurs/{id}`
Supprime un utilisateur (Admin)

---

## 🔧 Professionnels

### GET `/api/professionnels`
Liste tous les professionnels (Professionnel/Admin)

---

### GET `/api/professionnels/consulterIncidentsBySecteur/{secteur}`
Récupère les incidents d'un secteur spécifique

**Path Parameter:**
- `secteur` - Nom du secteur

**Query Parameters:**
- `typeIncident` (optionnel) - Filtrer par type

---

## 📋 Statuts des Incidents

Les statuts possibles sont :
- `PRISE_EN_COMPTE` - Incident créé, en attente de validation
- `VALIDE` - Validé par l'admin
- `PUBLIE` - Publié et visible publiquement
- `EN_COURS_DE_TRAITEMENT` - Pris en charge par un professionnel
- `TRAITE` - Traitement terminé
- `REJETE` - Rejeté par l'admin
- `BLOQUE` - Bloqué temporairement
- `REDIRIGE` - Redirigé vers un autre secteur

---

## 🔑 Rôles et Permissions

### Admin
- Validation/Rejet des incidents
- Gestion des utilisateurs
- Accès à toutes les fonctionnalités

### Professionnel
- Traitement des incidents de leur secteur
- Mise à jour des statuts
- Consultation des incidents assignés

### Citoyen
- Création d'incidents
- Consultation publique
- Suivi de leurs propres incidents

---

## 🧪 Comptes de Test

### Administrateur
```
Email: admin@geoinfo.ma
Mot de passe: password123
```

### Professionnels
```
Infrastructure: pro.infrastructure@geoinfo.ma / password123
Environnement: pro.environnement@geoinfo.ma / password123
Sécurité: pro.securite@geoinfo.ma / password123
```

### Citoyens
```
Citoyen 1: citoyen1@test.ma / password123
Citoyen 2: citoyen2@test.ma / password123
```

---

## 🚀 Démarrage

### Backend
```bash
cd backend
./mvnw spring-boot:run
```
Backend accessible sur: `http://localhost:8081`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend accessible sur: `http://localhost:5173`

### Swagger UI
Documentation interactive: `http://localhost:8081/swagger-ui.html`

---

## 🔒 Sécurité

- Authentification JWT avec expiration de 24h
- Mots de passe hashés avec BCrypt
- CORS configuré pour `localhost:5173`
- Validation des inputs côté backend
- Protection CSRF désactivée (API stateless)

---

## 📝 Notes Techniques

### Upload de Photos
- Taille max: 10MB
- Format: multipart/form-data
- Stockage: `/uploads` du backend

### Intersection Spatiale
- Utilise PostGIS pour la géolocalisation
- Calcul automatique de la province via lat/lon
- Type de géométrie: Point (SRID 4326)

### Pagination
- Page par défaut: 0
- Taille par défaut: 10 éléments
- Format de réponse: Spring Data Page

---

## 🐛 Debugging

### Logs Backend
```bash
tail -f backend/logs/spring-boot.log
```

### Vérifier la connexion DB
```sql
SELECT * FROM utilisateur WHERE email = 'admin@geoinfo.ma';
```

### Tester l'authentification
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@geoinfo.ma","password":"password123"}'
```
