# 🚀 Guide de Démarrage Rapide - GeoInfo

## Installation en 5 Minutes

### Étape 1: Prérequis ✓

```bash
# Vérifier Java 17+
java --version

# Vérifier Node.js 18+
node --version

# Vérifier PostgreSQL 14+
psql --version
```

### Étape 2: Base de Données (2 min)

```bash
# Créer la base de données
psql -U postgres
CREATE DATABASE geoinfo;
\c geoinfo
CREATE EXTENSION postgis;
\q
```

### Étape 3: Configuration (1 min)

**Backend** - Modifier `backend/src/main/resources/application.properties`:
```properties
spring.datasource.password=VOTRE_MOT_DE_PASSE
```

**Frontend** - Créer `frontend/.env`:
```env
VITE_API_URL=http://localhost:8081/api
```

### Étape 4: Démarrage (2 min)

**Terminal 1 - Backend:**
```bash
cd backend
./mvnw spring-boot:run
```
Attendre le message: `Started GeoApplication in X seconds`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Étape 5: Tester 🎉

Ouvrir le navigateur: **http://localhost:5173**

Connexion admin:
- Email: `admin@geoinfo.ma`
- Mot de passe: `password123`

---

## 🔧 Commandes Utiles

### Backend
```bash
# Démarrer
./mvnw spring-boot:run

# Nettoyer et construire
./mvnw clean install

# Tests
./mvnw test
```

### Frontend
```bash
# Installer
npm install

# Développement
npm run dev

# Build production
npm run build

# Preview production
npm run preview
```

### Base de Données
```bash
# Créer utilisateurs de test
psql -U postgres -d geoinfo -f backend/src/main/resources/test-users.sql

# Vérifier les données
psql -U postgres -d geoinfo -c "SELECT * FROM utilisateur;"
```

---

## 🧪 Test d'Intégration

Exécuter le script de test:
```powershell
.\test-integration.ps1
```

---

## 📍 URLs Importantes

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8081 |
| Swagger UI | http://localhost:8081/swagger-ui.html |
| H2 Console | N/A (PostgreSQL) |

---

## 🔑 Comptes de Test

### Administrateur
```
Email: admin@geoinfo.ma
Password: password123
Rôle: Gestion complète
```

### Professionnel Infrastructure
```
Email: pro.infrastructure@geoinfo.ma
Password: password123
Rôle: Traitement incidents infrastructure
```

### Professionnel Environnement
```
Email: pro.environnement@geoinfo.ma
Password: password123
Rôle: Traitement incidents environnement
```

---

## 🐛 Problèmes Courants

### Backend ne démarre pas
```bash
# Vérifier PostgreSQL
sudo systemctl status postgresql  # Linux
# ou vérifier pgAdmin

# Nettoyer Maven
./mvnw clean
```

### Frontend - Module not found
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### CORS Error
Vérifier que `CorsConfig.java` contient:
```java
.allowedOrigins("http://localhost:5173")
```

---

## 📚 Documentation Complète

- [README.md](README.md) - Vue d'ensemble
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API REST
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - Guide technique

---

## ✅ Checklist de Vérification

- [ ] Java 17+ installé
- [ ] PostgreSQL 14+ avec PostGIS
- [ ] Node.js 18+ installé
- [ ] Base de données `geoinfo` créée
- [ ] Extension PostGIS activée
- [ ] Fichiers de config modifiés
- [ ] Backend démarre sans erreur
- [ ] Frontend accessible sur :5173
- [ ] Connexion admin fonctionne

---

**🎉 Félicitations! Votre environnement est prêt!**
