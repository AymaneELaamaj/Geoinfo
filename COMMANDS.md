# 🛠️ Commandes Utiles - GeoInfo

## 📦 Installation et Configuration

### Backend
```bash
# Construire le projet
cd backend
./mvnw clean install

# Démarrer en mode développement
./mvnw spring-boot:run

# Démarrer en mode debug
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"

# Tester
./mvnw test

# Build JAR pour production
./mvnw clean package -DskipTests
```

### Frontend
```bash
# Installer les dépendances
cd frontend
npm install

# Démarrer en développement
npm run dev

# Build pour production
npm run build

# Prévisualiser le build
npm run preview

# Linter
npm run lint
```

---

## 🗄️ Base de Données

### Commandes PostgreSQL

```bash
# Se connecter
psql -U postgres

# Créer la base
CREATE DATABASE geoinfo;

# Activer PostGIS
\c geoinfo
CREATE EXTENSION postgis;

# Lister les tables
\dt

# Voir la structure d'une table
\d+ incident

# Exécuter un fichier SQL
\i backend/src/main/resources/test-users.sql

# Quitter
\q
```

### Requêtes Utiles

```sql
-- Compter les incidents
SELECT COUNT(*) FROM incident;

-- Voir les utilisateurs
SELECT id, nom, prenom, email, role FROM utilisateur;

-- Incidents par statut
SELECT statut, COUNT(*) 
FROM incident 
GROUP BY statut;

-- Incidents par province
SELECT p.nom, COUNT(i.id) 
FROM province p 
LEFT JOIN incident i ON p.id = i.province_id 
GROUP BY p.nom;

-- Supprimer tous les incidents (dev uniquement!)
TRUNCATE TABLE incident CASCADE;

-- Reset auto-increment
ALTER SEQUENCE incident_id_seq RESTART WITH 1;

-- Voir les incidents avec géolocalisation
SELECT id, titre, 
  ST_X(location) as longitude, 
  ST_Y(location) as latitude 
FROM incident 
WHERE location IS NOT NULL;
```

---

## 🔐 Authentification et Sécurité

### Générer un nouveau JWT Secret (Production)

```bash
# Utiliser openssl
openssl rand -base64 64

# Ou en PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Tester l'API avec cURL

```bash
# Login
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@geoinfo.ma","password":"password123"}'

# Sauvegarder le token
$TOKEN = "eyJhbGciOiJIUzUxMiJ9..."

# Accéder à une route protégée
curl -X GET http://localhost:8081/api/utilisateurs \
  -H "Authorization: Bearer $TOKEN"

# Créer un incident avec photo
curl -X POST http://localhost:8081/api/citoyens/incidents \
  -H "Authorization: Bearer $TOKEN" \
  -F 'data={"titre":"Test","typeIncident":"Route endommagée","latitude":"33.5","longitude":"-7.5"}' \
  -F 'photo=@image.jpg'
```

---

## 🧪 Tests

### Backend Tests

```bash
# Tous les tests
./mvnw test

# Tests d'un package spécifique
./mvnw test -Dtest=org.example.geo.controller.*

# Tests d'une classe
./mvnw test -Dtest=IncidentControllerTest

# Tests avec couverture
./mvnw test jacoco:report
```

### Script PowerShell de Test Intégration

```powershell
# Exécuter le script de test
.\test-integration.ps1

# Ou manuellement:
$response = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" `
  -Method Post `
  -Body '{"email":"admin@geoinfo.ma","password":"password123"}' `
  -ContentType "application/json"

$token = $response.token
Write-Host "Token: $token"
```

---

## 📊 Logs et Debugging

### Backend Logs

```bash
# Voir les logs en temps réel
tail -f backend/logs/spring-boot.log

# Chercher dans les logs
grep "ERROR" backend/logs/spring-boot.log

# Logs des 100 dernières lignes
tail -100 backend/logs/spring-boot.log
```

### Frontend Console (Browser DevTools)

```javascript
// Vérifier le token
console.log(localStorage.getItem('user'));

// Vérifier les requêtes API
// Network tab → Filter: XHR

// Nettoyer le localStorage
localStorage.clear();
```

---

## 🐳 Docker (Optionnel)

### Backend Dockerfile

```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Commandes Docker

```bash
# Build backend image
docker build -t geoinfo-backend:latest ./backend

# Run backend
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/geoinfo \
  geoinfo-backend:latest

# Build frontend image
docker build -t geoinfo-frontend:latest ./frontend

# Run frontend
docker run -p 5173:5173 geoinfo-frontend:latest
```

### Docker Compose (PostgreSQL + Backend + Frontend)

```yaml
version: '3.8'
services:
  db:
    image: postgis/postgis:14-3.3
    environment:
      POSTGRES_DB: geoinfo
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      - db
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/geoinfo

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  pgdata:
```

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

---

## 🔄 Git

### Commits Standards

```bash
# Feature
git commit -m "feat: add JWT authentication"

# Fix
git commit -m "fix: resolve CORS issue"

# Documentation
git commit -m "docs: update API documentation"

# Refactor
git commit -m "refactor: improve incident service"

# Style
git commit -m "style: format code with prettier"

# Test
git commit -m "test: add incident controller tests"
```

### Branches

```bash
# Créer une branche feature
git checkout -b feature/incident-workflow

# Créer une branche fix
git checkout -b fix/cors-configuration

# Merger dans main
git checkout main
git merge feature/incident-workflow

# Supprimer la branche
git branch -d feature/incident-workflow
```

---

## 📦 Build et Déploiement

### Backend Production Build

```bash
# Build JAR
./mvnw clean package -DskipTests

# JAR créé dans:
ls target/*.jar

# Démarrer le JAR
java -jar target/geo-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### Frontend Production Build

```bash
# Build
npm run build

# Files dans: dist/

# Servir avec un serveur static
npx serve -s dist -l 3000
```

---

## 🔍 Monitoring

### Backend Health Check

```bash
# Health endpoint (si Actuator activé)
curl http://localhost:8081/actuator/health

# Info endpoint
curl http://localhost:8081/actuator/info

# Metrics
curl http://localhost:8081/actuator/metrics
```

### Database Health

```sql
-- Connexions actives
SELECT count(*) FROM pg_stat_activity;

-- Taille de la base
SELECT pg_size_pretty(pg_database_size('geoinfo'));

-- Tables les plus volumineuses
SELECT 
  schemaname, 
  tablename, 
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🧹 Nettoyage

### Backend

```bash
# Nettoyer Maven
./mvnw clean

# Supprimer les logs
rm -rf backend/logs/*

# Supprimer target
rm -rf backend/target
```

### Frontend

```bash
# Nettoyer node_modules
rm -rf frontend/node_modules
rm -rf frontend/package-lock.json

# Nettoyer dist
rm -rf frontend/dist

# Réinstaller
npm install
```

### Base de Données

```sql
-- Supprimer toutes les données (dev uniquement!)
TRUNCATE TABLE incident CASCADE;
TRUNCATE TABLE citoyen CASCADE;
TRUNCATE TABLE professionnel CASCADE;
TRUNCATE TABLE utilisateur CASCADE;

-- Re-créer les utilisateurs de test
\i backend/src/main/resources/test-users.sql
```

---

## 🚀 Démarrage Rapide Complet

### En un seul script (PowerShell)

```powershell
# Créer un fichier start-dev.ps1

# Démarrer PostgreSQL (si service Windows)
Start-Service postgresql-x64-14

# Démarrer Backend (nouveau terminal)
Start-Process powershell -ArgumentList "cd backend; ./mvnw spring-boot:run"

# Attendre 30 secondes
Start-Sleep -Seconds 30

# Démarrer Frontend (nouveau terminal)
Start-Process powershell -ArgumentList "cd frontend; npm run dev"

# Ouvrir le navigateur
Start-Process "http://localhost:5173"

Write-Host "✅ GeoInfo démarré!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:8081" -ForegroundColor Cyan
Write-Host "Swagger: http://localhost:8081/swagger-ui.html" -ForegroundColor Cyan
```

```bash
# Exécuter
.\start-dev.ps1
```

---

## 🎯 Checklist Pré-Production

- [ ] Changer `jwt.secret` en production
- [ ] Activer HTTPS (SSL/TLS)
- [ ] Configurer firewall (ports 80, 443 seulement)
- [ ] Utiliser `spring.jpa.hibernate.ddl-auto=validate`
- [ ] Désactiver `spring.jpa.show-sql`
- [ ] Configurer CORS avec domaines prod
- [ ] Activer rate limiting
- [ ] Configurer backup DB automatique
- [ ] Mettre en place monitoring (Prometheus/Grafana)
- [ ] Configurer logs centralisés (ELK)
- [ ] Tests de charge (JMeter/k6)
- [ ] Sécurité scan (OWASP ZAP)

---

**📘 Pour plus d'informations, consultez:**
- [README.md](README.md)
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
