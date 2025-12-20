# 🌟 SYSTÈME COMPLET DE GESTION D'INCIDENTS URBAINS

## 📋 RÉSUMÉ DU PROJET

Ce projet est un système complet de gestion d'incidents urbains avec une architecture moderne Spring Boot + React, permettant aux citoyens de signaler des incidents, aux professionnels de les traiter, et aux administrateurs de superviser l'ensemble du processus.

## 🏗️ ARCHITECTURE TECHNIQUE

### Backend (Spring Boot 3.5.8)
- **Framework**: Spring Boot avec Spring Security
- **Authentification**: JWT (JSON Web Tokens)
- **Base de données**: PostgreSQL avec JPA/Hibernate
- **Architecture**: MVC avec services, repositories, et DTOs
- **Port**: 8080

### Frontend (React 19.1.1 + Vite)
- **Framework**: React avec Hooks et Context API
- **Bundler**: Vite pour le développement rapide
- **Routing**: React Router DOM v6
- **Styles**: CSS moderne avec design responsive
- **Port**: 5174 (ou 5173)

## 👥 RÔLES UTILISATEURS

### 🏛️ ADMINISTRATEUR
**Fonctionnalités principales :**
- Tableau de bord avec statistiques complètes
- Validation/rejet des incidents signalés
- Gestion des utilisateurs professionnels
- Création de comptes professionnels
- Supervision globale du système
- Génération de rapports

**Pages disponibles :**
- `/admin` - Tableau de bord administrateur
- `/admin/utilisateurs` - Gestion des utilisateurs

### 🔧 PROFESSIONNEL
**Fonctionnalités principales :**
- Tableau de bord personnel avec incidents assignés
- Gestion du statut des incidents (En cours → Résolu)
- Vue des incidents de leur secteur
- Gestion de leur profil et disponibilité
- Historique de leurs interventions

**Pages disponibles :**
- `/pro` - Tableau de bord professionnel
- `/professionnel/incidents` - Gestion des incidents
- `/professionnel/profil` - Profil professionnel

### 🏠 CITOYEN
**Fonctionnalités principales :**
- Signalement d'incidents avec photos
- Suivi de leurs signalements
- Consultation des incidents résolus
- Accès à la carte interactive

**Pages disponibles :**
- `/` - Accueil public
- `/declarer-incident` - Déclaration d'incident
- `/incidents` - Consultation des incidents
- `/carte` - Carte SIG interactive

## 🔐 SYSTÈME D'AUTHENTIFICATION

### JWT (JSON Web Tokens)
- **Génération**: Lors de la connexion avec username/password
- **Stockage**: localStorage côté frontend
- **Expiration**: Configurable (défaut : 24h)
- **Refresh**: Token automatiquement renouvelé si valide

### Sécurité
- **Mots de passe**: Hashage BCrypt
- **Endpoints**: Protection par rôle
- **CORS**: Configuré pour le développement
- **Validation**: Contrôle des données côté backend

## 🎯 FLUX DE TRAVAIL DES INCIDENTS

### 1. SIGNALEMENT (Citoyen)
```
Citoyen → Formulaire de signalement → Statut: EN_ATTENTE
```

### 2. VALIDATION (Administrateur)
```
EN_ATTENTE → [Admin valide] → VALIDE
EN_ATTENTE → [Admin rejette] → REJETE (avec motif)
```

### 3. TRAITEMENT (Professionnel)
```
VALIDE → [Pro prend en charge] → EN_COURS
EN_COURS → [Pro termine] → RESOLU (avec commentaire)
```

## 🗂️ STRUCTURE DES DONNÉES

### Entités principales
- **Utilisateur** : Base commune (nom, prénom, email, rôle)
- **Citoyen** : Extension d'Utilisateur (adresse, téléphone)
- **Professionnel** : Extension d'Utilisateur (spécialité, secteur, disponibilité)
- **Incident** : Core entity (titre, description, localisation, statut, photo)
- **Secteur** : Zones géographiques de compétence

### Statuts d'incidents
- `EN_ATTENTE` : Incident signalé, en attente de validation
- `VALIDE` : Validé par l'admin, assignable aux pros
- `EN_COURS` : En cours de traitement par un professionnel
- `RESOLU` : Incident résolu par le professionnel
- `REJETE` : Rejeté par l'administrateur

## 🌐 API ENDPOINTS

### Authentification
- `POST /api/auth/connexion` - Connexion utilisateur
- `POST /api/auth/inscription` - Inscription citoyen
- `GET /api/auth/profil` - Profil utilisateur connecté

### Incidents
- `GET /api/incidents` - Liste des incidents publics
- `POST /api/incidents` - Signaler un incident
- `GET /api/incidents/{id}` - Détails d'un incident

### Administration
- `GET /api/admin/dashboard` - Stats administrateur
- `GET /api/admin/incidents/attente` - Incidents en attente
- `POST /api/admin/incidents/{id}/valider` - Valider incident
- `POST /api/admin/incidents/{id}/rejeter` - Rejeter incident
- `GET /api/admin/professionnels` - Liste des professionnels
- `POST /api/admin/professionnels` - Créer professionnel

### Professionnel
- `GET /api/professionnel/dashboard` - Stats professionnel
- `GET /api/professionnel/incidents/assignes` - Incidents assignés
- `POST /api/professionnel/incidents/{id}/statut` - Maj statut
- `PUT /api/professionnel/profil` - Maj profil

## 🎨 INTERFACE UTILISATEUR

### Design System
- **Couleurs** : Palette moderne avec bleus, verts, et oranges
- **Typography** : Hiérarchie claire avec titres et sous-titres
- **Composants** : Cards, modals, formulaires, boutons cohérents
- **Responsive** : Adaptation mobile/tablet/desktop
- **Accessibilité** : Contraste et navigation clavier

### Composants réutilisables
- **LoadingSpinner** : Indicateur de chargement
- **ProtectedRoute** : Route avec vérification de rôle
- **Layout** : Structure commune avec navbar et footer
- **StatCard** : Cartes de statistiques
- **IncidentCard** : Affichage d'incident

## 🚀 LANCEMENT DU SYSTÈME

### Prérequis
- Java 17+
- Maven 3.6+
- Node.js 16+
- PostgreSQL 13+

### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
**URL**: http://localhost:8080

### Frontend
```bash
cd frontend
npm install
npm run dev
```
**URL**: http://localhost:5174

## 📊 FONCTIONNALITÉS AVANCÉES

### Tableaux de bord
- **Statistiques en temps réel** : Incidents par statut, secteur, période
- **Graphiques interactifs** : Évolution temporelle, répartition géographique
- **Métriques de performance** : Temps de réponse, taux de résolution

### Gestion des incidents
- **Filtrage avancé** : Par statut, secteur, date, priorité
- **Recherche textuelle** : Dans titre et description
- **Pagination intelligente** : Chargement progressif
- **Actions en lot** : Validation/rejet multiple

### Profils utilisateurs
- **Gestion complète** : Informations personnelles, préférences
- **Changement mot de passe** : Sécurisé avec validation
- **Statut disponibilité** : Pour les professionnels
- **Historique d'activité** : Suivi des actions

## 🔧 CONFIGURATION

### Variables d'environnement (Backend)
```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/gestion_incidents
spring.datasource.username=postgres
spring.datasource.password=password

# JWT
app.jwt.secret=mySecretKey
app.jwt.expiration=86400000

# Upload
app.upload.dir=uploads/
```

### Configuration API (Frontend)
```javascript
// src/services/api.js
const API_BASE_URL = 'http://localhost:8080/api';
```

## 📈 PERFORMANCES ET OPTIMISATIONS

### Backend
- **Lazy Loading** : Chargement JPA optimisé
- **Pagination** : Évite la surcharge mémoire
- **Index DB** : Sur colonnes fréquemment requêtées
- **Connection Pool** : Gestion optimisée des connexions

### Frontend
- **Code Splitting** : Chargement par route
- **Lazy Loading** : Composants à la demande
- **Memo/Callback** : Optimisation des re-renders
- **Service Worker** : Mise en cache des assets

## 🛡️ SÉCURITÉ

### Mesures implémentées
- **CSRF Protection** : Token dans les en-têtes
- **XSS Prevention** : Validation et échappement
- **SQL Injection** : Requêtes préparées JPA
- **Password Policy** : Longueur minimale, complexité
- **Role-Based Access** : Contrôle granulaire des permissions

## 📱 RESPONSIVE DESIGN

### Breakpoints
- **Mobile** : < 768px
- **Tablet** : 768px - 1024px  
- **Desktop** : > 1024px

### Adaptations
- **Navigation** : Menu hamburger sur mobile
- **Formulaires** : Champs empilés verticalement
- **Cartes** : Grille responsive automatique
- **Modals** : Plein écran sur mobile

## 🔄 WORKFLOW DE DÉVELOPPEMENT

### Git Flow
```bash
main          # Production stable
develop       # Intégration continue
feature/*     # Nouvelles fonctionnalités
hotfix/*      # Correctifs urgents
```

### Tests
- **Unit Tests** : Services et utilitaires
- **Integration Tests** : APIs et base de données
- **E2E Tests** : Parcours utilisateur complets

## 📞 SUPPORT ET MAINTENANCE

### Logs et monitoring
- **Backend** : Logback avec niveaux configurables
- **Frontend** : Console.error pour les erreurs
- **Monitoring** : Health checks et métriques

### Documentation
- **API** : Swagger/OpenAPI générée automatiquement
- **Code** : Commentaires JSDoc et Javadoc
- **Architecture** : Diagrammes et guides techniques

---

## 🎉 FÉLICITATIONS !

Vous disposez maintenant d'un **système complet de gestion d'incidents urbains** avec :
- ✅ Architecture moderne et scalable
- ✅ Authentification JWT sécurisée  
- ✅ Interfaces utilisateur intuitives
- ✅ Gestion complète des rôles
- ✅ API REST documentée
- ✅ Design responsive

Le système est prêt pour la **production** et peut facilement être étendu avec de nouvelles fonctionnalités !

**URL Frontend**: http://localhost:5174
**URL Backend**: http://localhost:8080