# Documentation de la Logique Métier - Système de Gestion des Incidents

## 📋 Vue d'ensemble

Ce document décrit la logique métier complète implémentée pour les rôles **ADMIN** et **PROFESSIONNEL** dans le système de gestion des incidents géolocalisés.

---

## 🔄 Cycle de Vie d'un Incident

### Schéma du workflow

```
CITOYEN crée incident
    ↓
[REDIGE] ────────────────────────────────┐
    ↓                                     │
[EN_ATTENTE_VALIDATION] (automatique)    │
    ↓                                     │
ADMIN valide ou rejette                  │
    ├─→ [VALIDE_PUBLIE] (visible pros)   │
    └─→ [REJETE] + motifRejet ───────────┘
                ↓
       PROFESSIONNEL traite
                ↓
         [PRIS_EN_COMPTE]
                ↓
           [EN_COURS]
                ↓
        ┌──────┼──────┐
        │      │      │
    [TRAITE] [BLOQUE] [REDIRIGE]
        │      │          │
        ↓      ↓          ↓
      FIN   ADMIN    Autre PRO
           débloque
```

---

## 👨‍💼 Rôle ADMIN

### 🎯 Responsabilités principales

1. **Validation/Rejet des incidents déclarés par les citoyens**
2. **Gestion CRUD complète des utilisateurs** (citoyens et professionnels)
3. **Affectation des incidents aux professionnels**
4. **Suivi et statistiques globales**

### 📌 Endpoints Admin

#### 1. Gestion des Incidents

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| `GET` | `/api/admin/incidents/en-attente` | Liste des incidents REDIGE ou EN_ATTENTE_VALIDATION | - |
| `PUT` | `/api/admin/incidents/{id}/valider` | Valide l'incident → statut `VALIDE_PUBLIE` | `{ "commentaireAdmin": "..." }` (optionnel) |
| `PUT` | `/api/admin/incidents/{id}/rejeter` | Rejette l'incident → statut `REJETE` | `{ "motifRejet": "..." }` **OBLIGATOIRE** |
| `GET` | `/api/admin/incidents` | Tous les incidents (tous statuts) | - |
| `GET` | `/api/admin/incidents/{id}` | Détails d'un incident | - |
| `GET` | `/api/admin/incidents/rejetes` | Liste des incidents rejetés | - |

#### 2. Gestion des Utilisateurs

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| `GET` | `/api/admin/utilisateurs` | Liste tous les utilisateurs | - |
| `GET` | `/api/admin/utilisateurs/{id}` | Détails d'un utilisateur | - |
| `POST` | `/api/admin/utilisateurs` | Créer un citoyen/utilisateur | `UtilisateurDTO` |
| `POST` | `/api/admin/professionnels` | Créer un professionnel avec secteur | `CreateProfessionnelDTO` |
| `PUT` | `/api/admin/utilisateurs/{id}` | Modifier un utilisateur | `UtilisateurDTO` |
| `PUT` | `/api/admin/professionnels/{id}` | Modifier un professionnel | `UpdateProfessionnelDTO` |
| `DELETE` | `/api/admin/utilisateurs/{id}` | Supprimer un utilisateur | - |
| `DELETE` | `/api/admin/professionnels/{id}` | Supprimer un professionnel | - |
| `PATCH` | `/api/admin/professionnels/{id}/toggle-status` | Activer/Désactiver un professionnel | - |

#### 3. Affectation des Incidents

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/admin/incidents/{incidentId}/affecter/{professionnelId}` | Affecter un incident validé à un professionnel |
| `PUT` | `/api/admin/incidents/{incidentId}/reaffecter/{professionnelId}` | Réaffecter un incident à un autre professionnel |

#### 4. Dashboard & Statistiques

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/admin/dashboard` | Dashboard avec statistiques globales |
| `GET` | `/api/admin/statistiques/secteurs` | Statistiques par secteur |
| `GET` | `/api/admin/rapports/professionnels` | Rapport d'activité des professionnels |
| `GET` | `/api/admin/historique?page=0&size=20` | Historique des actions admin |

### 📝 Règles Métier Admin

#### Validation d'incident
```java
// Conditions :
- Incident au statut REDIGE ou EN_ATTENTE_VALIDATION
- Passe au statut VALIDE_PUBLIE
- Devient visible par les professionnels du secteur concerné
- dateCreation est mise à jour automatiquement
```

#### Rejet d'incident
```java
// Conditions :
- motifRejet est OBLIGATOIRE (validation Jakarta)
- Incident passe au statut REJETE
- motifRejet stocké dans incident.motifRejet
- L'incident n'est plus traitable
```

#### Création de Professionnel
```java
// Champs obligatoires :
- nom, prenom, email, motDePasse, telephone
- secteurAffectate (Integer - ID du secteur)
- typeIncident (Enum - type d'incident géré)
- role = PROFESSIONNEL (automatique)
- actif = true (par défaut)
```

---

## 👷 Rôle PROFESSIONNEL

### 🎯 Responsabilités principales

1. **Récupération des incidents validés** de son secteur et type d'incident
2. **Mise à jour du statut** des incidents affectés
3. **Ajout de descriptions de traitement** (retourTraitement)
4. **Suivi de ses incidents en cours**

### 📌 Endpoints Professionnel

#### 1. Consultation des Incidents

| Méthode | Endpoint | Description | Paramètres |
|---------|----------|-------------|------------|
| `GET` | `/api/professionnel/incidents` | Incidents affectés au pro connecté | `?statut=...&page=0&size=10&sortBy=dateCreation&sortDir=desc` |
| `GET` | `/api/professionnel/incidents/{id}` | Détails d'un incident affecté | - |

**Filtrage automatique** :
- Statut = `VALIDE_PUBLIE` (incidents prêts à être pris en compte)
- Secteur = `professionnelAffecte.secteurAffectate`
- Type = `professionnelAffecte.typeIncident`

#### 2. Changement de Statut

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| `PUT` | `/api/professionnel/incidents/{id}/prendre-en-compte` | `VALIDE_PUBLIE` → `PRIS_EN_COMPTE` | - |
| `PUT` | `/api/professionnel/incidents/{id}/demarrer` | `PRIS_EN_COMPTE` → `EN_COURS` | - |
| `PUT` | `/api/professionnel/incidents/{id}/traiter` | `EN_COURS` → `TRAITE` | `{ "descriptionTraitement": "..." }` **OBLIGATOIRE** |
| `PUT` | `/api/professionnel/incidents/{id}/bloquer` | `EN_COURS` → `BLOQUE` | `{ "motifBlocage": "..." }` **OBLIGATOIRE** |
| `PUT` | `/api/professionnel/incidents/{id}/debloquer` | `BLOQUE` → `EN_COURS` | - |
| `PUT` | `/api/professionnel/incidents/{id}/rediriger/{nouveauProId}` | `EN_COURS` → `REDIRIGE` + réaffectation | `{ "motifRedirection": "..." }` **OBLIGATOIRE** |

#### 3. Dashboard Professionnel

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/professionnel/dashboard` | Statistiques personnelles du pro |
| `GET` | `/api/professionnel/profil` | Informations de profil |
| `PUT` | `/api/professionnel/profil` | Modifier son profil |
| `GET` | `/api/professionnel/historique?page=0&size=20` | Historique des traitements |
| `GET` | `/api/professionnel/statistiques` | Statistiques détaillées |
| `GET` | `/api/professionnel/collegues` | Professionnels du même secteur |

### 📝 Règles Métier Professionnel

#### Récupération des incidents
```java
// Conditions :
- incident.statut == VALIDE_PUBLIE
- incident.secteur.id == professionnel.secteurAffectate
- incident.typeIncident == professionnel.typeIncident
- Tri par défaut : dateCreation DESC
```

#### Prise en compte
```java
// Conditions :
- Incident au statut VALIDE_PUBLIE
- Incident affecté au professionnel connecté
- Passe au statut PRIS_EN_COMPTE
- dateTraitement mise à jour
```

#### Traitement terminé
```java
// Conditions :
- Incident au statut EN_COURS
- descriptionTraitement OBLIGATOIRE (non vide)
- Passe au statut TRAITE
- descriptionTraitement stockée dans incident.descriptionTraitement
- dateTraitement mise à jour
```

#### Blocage d'incident
```java
// Conditions :
- Incident au statut EN_COURS
- motifBlocage OBLIGATOIRE
- Passe au statut BLOQUE
- motifBlocage stocké dans incident.motifRejet
- Nécessite déblocage par le pro ou admin
```

#### Redirection vers un collègue
```java
// Conditions :
- Incident au statut EN_COURS
- Nouveau professionnel existe et est actif
- motifRedirection OBLIGATOIRE
- Passe au statut REDIRIGE
- professionnelAffecte changé vers le nouveau pro
```

---

## 🗂️ Structure des DTOs

### ValidationIncidentDTO
```java
{
    "commentaireAdmin": "string" // Optionnel
}
```

### RejetIncidentDTO
```java
{
    "motifRejet": "string" // OBLIGATOIRE - @NotBlank
}
```

### UpdateStatutIncidentDTO
```java
{
    "nouveauStatut": "PRIS_EN_COMPTE|EN_COURS|TRAITE|BLOQUE|REDIRIGE",
    "descriptionTraitement": "string" // Obligatoire pour TRAITE
}
```

### CreateProfessionnelDTO
```java
{
    "nom": "string",
    "prenom": "string",
    "email": "string",
    "motDePasse": "string",
    "telephone": "string",
    "secteurAffectate": 1, // ID du secteur
    "typeIncident": "EAU|ELECTRICITE|ROUTE|..." // Enum
}
```

---

## 🛡️ Sécurité

### Authentification
- **JWT Token** requis pour tous les endpoints `/api/admin/*` et `/api/professionnel/*`
- Header : `Authorization: Bearer <token>`

### Autorisations
- `@PreAuthorize("hasRole('ADMIN')")` pour tous les endpoints admin
- `@PreAuthorize("hasRole('PROFESSIONNEL')")` pour tous les endpoints professionnel
- Les professionnels ne peuvent voir/modifier **que leurs incidents affectés**

### Endpoints publics
```java
/api/incidents/**     // Déclaration d'incidents par citoyens
/api/secteurs/**      // Liste des secteurs
/api/provinces/**     // Liste des provinces
/api/auth/login       // Connexion
/api/init/**          // Initialisation admin (DEV ONLY)
```

---

## 📊 Entités Principales

### Incident
```java
- id: Integer
- titre: String
- description: String
- latitude: Double
- longitude: Double
- adresse: String
- statut: Enum (statut)
- motifRejet: String
- descriptionTraitement: String
- dateCreation: LocalDateTime
- dateTraitement: LocalDateTime
- citoyen: Citoyen
- secteur: Secteur
- province: Province
- professionnelAffecte: Professionnel
- typeIncident: Enum
```

### Professionnel (extends Utilisateur)
```java
- secteurAffectate: Integer (ID du secteur)
- typeIncident: Enum
- actif: Boolean
- incidents: List<Incident> (OneToMany)
```

### Utilisateur
```java
- id: Integer
- nom: String
- prenom: String
- email: String
- motDePasse: String
- telephone: String
- role: Enum (ADMIN|PROFESSIONNEL|CITOYEN)
- dateCreation: LocalDateTime
```

---

## ⚠️ Points d'Attention

### 🔴 SÉCURITÉ CRITIQUE
```
⚠️ Les mots de passe sont actuellement stockés EN CLAIR (plain text)
⚠️ Cette configuration est UNIQUEMENT pour le développement
⚠️ À CORRIGER avant production : réactiver BCryptPasswordEncoder
```

### Problèmes connus
1. **DevTools désactivé** : Classloader conflict avec PasswordEncoder
2. **Pas d'envoi d'emails** : Notifications admin/pro à implémenter
3. **Pas de validation géographique** : Les coordonnées ne sont pas vérifiées

### Améliorations suggérées
- [ ] Réactiver l'encodage des mots de passe (BCrypt)
- [ ] Ajouter un système de notifications (email/SMS)
- [ ] Implémenter la validation géographique des coordonnées
- [ ] Ajouter des tests unitaires et d'intégration
- [ ] Pagination systématique pour tous les endpoints liste
- [ ] Logs d'audit pour les actions admin

---

## 🧪 Tests

### Scénario de test Admin
```bash
# 1. Connexion admin
POST /api/auth/login
{ "email": "admin@geo.ma", "motDePasse": "admin123" }

# 2. Liste incidents en attente
GET /api/admin/incidents/en-attente
Authorization: Bearer <token>

# 3. Valider un incident
PUT /api/admin/incidents/1/valider
Authorization: Bearer <token>
{ "commentaireAdmin": "Incident vérifié et validé" }

# 4. Rejeter un incident
PUT /api/admin/incidents/2/rejeter
Authorization: Bearer <token>
{ "motifRejet": "Doublon - incident déjà signalé" }

# 5. Créer un professionnel
POST /api/admin/professionnels
Authorization: Bearer <token>
{
  "nom": "Alami",
  "prenom": "Hassan",
  "email": "h.alami@geo.ma",
  "motDePasse": "pro123",
  "telephone": "0612345678",
  "secteurAffectate": 1,
  "typeIncident": "EAU"
}
```

### Scénario de test Professionnel
```bash
# 1. Connexion professionnel
POST /api/auth/login
{ "email": "h.alami@geo.ma", "motDePasse": "pro123" }

# 2. Liste mes incidents
GET /api/professionnel/incidents?statut=VALIDE_PUBLIE
Authorization: Bearer <token>

# 3. Prendre en compte un incident
PUT /api/professionnel/incidents/1/prendre-en-compte
Authorization: Bearer <token>

# 4. Démarrer le traitement
PUT /api/professionnel/incidents/1/demarrer
Authorization: Bearer <token>

# 5. Terminer le traitement
PUT /api/professionnel/incidents/1/traiter
Authorization: Bearer <token>
{ "descriptionTraitement": "Fuite réparée, pression rétablie" }

# 6. Bloquer un incident
PUT /api/professionnel/incidents/2/bloquer
Authorization: Bearer <token>
{ "motifBlocage": "Attente de pièces de rechange" }

# 7. Rediriger vers un collègue
PUT /api/professionnel/incidents/3/rediriger/5
Authorization: Bearer <token>
{ "motifRedirection": "Incident hors de ma zone d'intervention" }
```

---

## 📖 Références

- **Enum statut** : `/backend/src/main/java/org/example/geo/enuM/statut.java`
- **AdminController** : `/backend/src/main/java/org/example/geo/controller/AdminController.java`
- **ProfessionnelController** : `/backend/src/main/java/org/example/geo/controller/ProfessionnelController.java`
- **AdminService** : `/backend/src/main/java/org/example/geo/service/AdminService.java`
- **ProfessionnelService** : `/backend/src/main/java/org/example/geo/service/ProfessionnelService.java`

---

*Dernière mise à jour : Documentation générée après implémentation du cahier des charges*
