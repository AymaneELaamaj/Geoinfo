# 🚨 CityAlert Backend - Spring Boot

Backend de la plateforme CityAlert de signalement et gestion des incidents urbains.

## 🚀 Technologies

- **Spring Boot** 3.3.4
- **Java** 17
- **PostgreSQL** 14+ avec **PostGIS**
- **JWT** pour l'authentification
- **Hibernate Spatial** pour les requêtes géospatiales
- **Maven** pour la gestion des dépendances

## 📋 Prérequis

- Java 17+
- Maven 3.6+
- PostgreSQL 14+ avec extension PostGIS
- Port 8085 disponible

## ⚙️ Configuration

### 1. Base de données

```bash
# Créer la base de données
psql -U postgres
CREATE DATABASE geoinfo;
\c geoinfo
CREATE EXTENSION postgis;
\q
```

### 2. Configuration application

Modifier `src/main/resources/application.properties` :

```properties
spring.datasource.username=postgres
spring.datasource.password=VOTRE_MOT_DE_PASSE
```

### 3. Initialiser les données

```bash
psql -U postgres -d geoinfo -f src/main/resources/init-data.sql
```

## 🏃 Démarrage

```bash
# Compiler
mvn clean install

# Démarrer
mvn spring-boot:run
```

Le backend sera disponible sur : **http://localhost:8085**

## 📚 Documentation API

- **Swagger UI** : http://localhost:8085/swagger-ui.html
- **API Docs** : http://localhost:8085/api-docs

## 🔑 Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@geoinfo.ma | password123 |
| Pro Infrastructure | pro.infrastructure@geoinfo.ma | password123 |
| Pro Environnement | pro.environnement@geoinfo.ma | password123 |
| Pro Sécurité | pro.securite@geoinfo.ma | password123 |
| Citoyen 1 | citoyen1@test.ma | password123 |
| Citoyen 2 | citoyen2@test.ma | password123 |

## 🧪 Tests

```bash
# Test de connexion
curl -X POST http://localhost:8085/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@geoinfo.ma","motDePasse":"password123"}'

# Test backend
curl http://localhost:8085/api/auth/test
```

## 📁 Structure

```
src/main/java/ma/ehtp/geoinfo/
├── config/          # Configuration (Security, CORS)
├── controller/      # Contrôleurs REST
├── dto/            # Data Transfer Objects
├── entity/         # Entités JPA
├── exception/      # Gestion des erreurs
├── repository/     # Repositories Spring Data
├── security/       # JWT et authentification
└── service/        # Logique métier
```

## 🔒 Sécurité

- Authentification JWT (expiration 24h)
- Mots de passe BCrypt
- CORS configuré pour localhost:5173, 5174
- Routes protégées par rôles

## 📊 Phase 1 - Terminée ✅

- [x] Structure Maven
- [x] Configuration PostgreSQL + PostGIS
- [x] Entités JPA (Utilisateur, Professionnel, Incident, Secteur, Province)
- [x] Repositories avec requêtes spatiales
- [x] Sécurité JWT complète
- [x] AuthController (/login, /me)
- [x] Script d'initialisation SQL

## 🔜 Prochaines phases

- Phase 2 : API Citoyens (déclaration incidents)
- Phase 3 : API Admin (validation/rejet)
- Phase 4 : API Professionnels (traitement)
- Phase 5 : API Publique (consultation)
- Phase 6 : Services avancés (PostGIS, stats)
