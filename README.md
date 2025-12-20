# 🗺️ GeoInfo - Plateforme de Gestion des Incidents Citoyens

Une plateforme collaborative permettant aux citoyens de signaler des incidents urbains et aux professionnels de les gérer efficacement.

## 📋 Table des Matières
- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Documentation](#documentation)
- [Comptes de Test](#comptes-de-test)

---

## 🎯 Aperçu

GeoInfo est une solution complète de gestion d'incidents citoyens avec trois niveaux d'accès :

### 👤 Public
- Consultation des incidents sur carte interactive
- Visualisation des statistiques
- Filtrage par secteur, province, statut

### 👷 Professionnels
- Gestion des incidents par secteur
- Mise à jour des statuts
- Traitement et suivi des incidents

### 👨‍💼 Administrateurs
- Validation/Rejet des incidents
- Gestion des utilisateurs
- Tableaux de bord avancés

---

## ✨ Fonctionnalités

### Côté Public
- 🗺️ **Carte interactive** avec clustering des incidents
- 📊 **Tableau de bord** avec statistiques en temps réel
- 🔍 **Filtres avancés** (secteur, province, statut, type)
- 📱 **Interface responsive** adaptée mobile

### Côté Professionnel
- 📋 **Liste des incidents** par secteur et type
- ✅ **Gestion des statuts** (En cours, Traité, Bloqué, Redirigé)
- 💬 **Rétro-information** avec descriptions de traitement
- 📈 **Statistiques personnalisées**

### Côté Administration
- ✔️ **Validation d'incidents** avec contrôle qualité
- ❌ **Rejet motivé** avec traçabilité
- 👥 **Gestion des utilisateurs** (CRUD complet)
- 🔐 **Sécurité avancée** avec JWT

### Côté Mobile (API)
- 📸 **Déclaration avec photo** (upload jusqu'à 10MB)
- 📍 **Géolocalisation automatique** (GPS)
- 🏙️ **Intersection spatiale** (Lat/Lon → Province automatique)
- 🔑 **Identification IMEI** pour traçabilité

---

## 🛠️ Technologies

### Backend
- **Framework:** Spring Boot 3.3.4
- **Langage:** Java 17
- **Base de données:** PostgreSQL 14+ avec PostGIS
- **Sécurité:** Spring Security + JWT
- **ORM:** Hibernate / JPA
- **Build:** Maven
- **Documentation:** Swagger/OpenAPI

### Frontend
- **Framework:** React 19
- **Build:** Vite
- **Routing:** React Router v7
- **Cartographie:** Leaflet + React Leaflet
- **Clustering:** react-leaflet-cluster
- **State Management:** Context API
- **Styling:** CSS personnalisé

---

## 🚀 Installation

### Prérequis

#### Backend
```bash
java --version    # Java 17+
mvn --version     # Maven 3.6+
psql --version    # PostgreSQL 14+
```

#### Frontend
```bash
node --version    # Node.js 18+
npm --version     # npm 8+
```

### 1. Cloner le Projet

```bash
git clone <repository-url>
cd geo
```

### 2. Configuration de la Base de Données

```bash
# Créer la base de données
psql -U postgres
CREATE DATABASE geoinfo;

# Activer PostGIS
\c geoinfo
CREATE EXTENSION postgis;

# Créer les utilisateurs de test
\i backend/src/main/resources/test-users.sql
```

### 3. Installer les Dépendances

#### Backend
```bash
cd backend
./mvnw clean install
```

#### Frontend
```bash
cd frontend
npm install
```

---

## ⚙️ Configuration

### Backend (`backend/src/main/resources/application.properties`)

```properties
# Port
server.port=8081

# PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/geoinfo
spring.datasource.username=postgres
spring.datasource.password=VOTRE_MOT_DE_PASSE

# JWT (IMPORTANT: Changer en production!)
jwt.secret=geoInfoSecretKeyForJWTTokenGenerationAndValidation2024SecureKey123456789
jwt.expiration=86400000
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8081/api
```

---

## 🎮 Utilisation

### Démarrer le Backend

```bash
cd backend
./mvnw spring-boot:run
```

✅ Backend disponible sur: **http://localhost:8081**
📚 Swagger UI: **http://localhost:8081/swagger-ui.html**

### Démarrer le Frontend

```bash
cd frontend
npm run dev
```

✅ Frontend disponible sur: **http://localhost:5173**

---

## 📚 Documentation

### Documentation Disponible

| Document | Description |
|----------|-------------|
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Documentation complète de l'API REST |
| [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) | Guide d'intégration Frontend/Backend |
| Swagger UI | Documentation interactive en ligne |

### Endpoints Principaux

```
POST   /api/auth/login           # Authentification
GET    /api/incidents             # Liste des incidents
POST   /api/citoyens/incidents    # Créer un incident
POST   /api/incidents/{id}/valider # Valider (Admin)
POST   /api/incidents/{id}/rejeter # Rejeter (Admin)
POST   /api/incidents/{id}/traiter # Traiter (Pro)
GET    /api/statistics            # Statistiques
```

---

## 🔑 Comptes de Test

### Administrateur
```
Email: admin@geoinfo.ma
Mot de passe: password123
```

### Professionnels

| Secteur | Email | Mot de passe |
|---------|-------|--------------|
| Infrastructure | pro.infrastructure@geoinfo.ma | password123 |
| Environnement | pro.environnement@geoinfo.ma | password123 |
| Sécurité | pro.securite@geoinfo.ma | password123 |

### Citoyens

```
citoyen1@test.ma / password123
citoyen2@test.ma / password123
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           APPLICATION MOBILE                │
│         (Déclaration incidents)             │
└──────────────────┬──────────────────────────┘
                   │ API REST
                   │
┌──────────────────▼──────────────────────────┐
│            BACKEND SPRING BOOT              │
│  ┌────────────────────────────────────┐    │
│  │  Controllers (REST API)            │    │
│  ├────────────────────────────────────┤    │
│  │  Services (Business Logic)         │    │
│  ├────────────────────────────────────┤    │
│  │  Repositories (Data Access)        │    │
│  ├────────────────────────────────────┤    │
│  │  Security (JWT + Spring Security)  │    │
│  └────────────────────────────────────┘    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│        POSTGRESQL + POSTGIS                 │
│   (Stockage données + Géospatial)          │
└─────────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         FRONTEND REACT (VITE)               │
│  ┌────────────────────────────────────┐    │
│  │  Pages (Views)                     │    │
│  ├────────────────────────────────────┤    │
│  │  Components (Reusable UI)          │    │
│  ├────────────────────────────────────┤    │
│  │  Services (API Calls)              │    │
│  ├────────────────────────────────────┤    │
│  │  Contexts (State Management)       │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

---

## 📊 Workflow des Incidents

```
1. DÉCLARATION (Mobile)
   └─> Statut: PRISE_EN_COMPTE
       │
2. VALIDATION (Admin)
   ├─> VALIDÉ → PUBLIÉ (visible sur carte)
   └─> REJETÉ (avec motif)
       │
3. TRAITEMENT (Professionnel)
   ├─> EN_COURS_DE_TRAITEMENT
   ├─> BLOQUÉ (temporaire)
   ├─> REDIRIGÉ (autre secteur)
   └─> TRAITÉ (résolu)
```

---

## 🔒 Sécurité

- ✅ **JWT Authentication** (expiration 24h)
- ✅ **BCrypt Password Hashing**
- ✅ **CORS configuré** pour origines autorisées
- ✅ **Validation des inputs** côté serveur
- ✅ **Protection des routes** par rôle
- ✅ **HTTPS ready** (TLS/SSL en production)

---

## 🧪 Tests

### Tester l'API avec cURL

```bash
# Login
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@geoinfo.ma","password":"password123"}'

# Récupérer les incidents (avec token)
curl -X GET http://localhost:8081/api/incidents \
  -H "Authorization: Bearer <TOKEN>"
```

### Tester avec Postman
1. Importer la collection depuis Swagger
2. Configurer la variable `{{baseUrl}}` = `http://localhost:8081/api`
3. Tester les endpoints

---

## 🐛 Dépannage

### Le backend ne démarre pas
```bash
# Vérifier Java
java --version

# Nettoyer et reconstruire
./mvnw clean install

# Vérifier PostgreSQL
psql -U postgres -c "SELECT version();"
```

### Le frontend affiche des erreurs CORS
```bash
# Vérifier CorsConfig.java
# allowedOrigins doit contenir "http://localhost:5173"
```

### Les incidents ne s'affichent pas
```bash
# Vérifier la connexion DB
psql -U postgres -d geoinfo -c "SELECT COUNT(*) FROM incident;"

# Vérifier les logs
tail -f backend/logs/spring-boot.log
```

---

## 📈 Roadmap

### Phase 1 (Actuel) ✅
- [x] API REST complète
- [x] Authentification JWT
- [x] Interface web fonctionnelle
- [x] Cartographie interactive

### Phase 2 (Court terme)
- [ ] Notifications en temps réel (WebSockets)
- [ ] Export de données (CSV, PDF)
- [ ] Filtres sauvegardés
- [ ] Mode hors ligne (PWA)

### Phase 3 (Moyen terme)
- [ ] Application mobile native
- [ ] Dashboard analytics avancé
- [ ] Système de messagerie interne
- [ ] Multi-langue (AR, FR, EN)

### Phase 4 (Long terme)
- [ ] IA pour classification automatique
- [ ] Intégration SIG municipaux
- [ ] API publique pour partenaires
- [ ] Blockchain pour traçabilité

---

## 👥 Contributeurs

- **Backend:** Spring Boot + PostgreSQL + PostGIS
- **Frontend:** React + Vite + Leaflet
- **Architecture:** REST API + JWT Security

---

## 📄 Licence

[À définir]

---

## 📞 Support

Pour toute question ou problème :
- 📧 Email: support@geoinfo.ma
- 📚 Documentation: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- 🐛 Issues: [GitHub Issues](lien-vers-issues)

---

## 🙏 Remerciements

- OpenStreetMap pour les données cartographiques
- Spring Boot community
- React & Leaflet teams

---

**Made with ❤️ for better cities**
