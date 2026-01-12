# 🚀 Guide de Déploiement CityAlert Backend

## 📋 Prérequis Production

- Java 17+
- PostgreSQL 14+ avec PostGIS
- 2GB RAM minimum
- 10GB espace disque

---

## 🐳 Déploiement Docker (Recommandé)

### 1. Avec Docker Compose

```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f backend

# Arrêter
docker-compose down
```

### 2. Build manuel

```bash
# Build l'image
docker build -t geoinfo-backend .

# Exécuter
docker run -d \
  -p 8085:8085 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/geoinfo \
  -e SPRING_DATASOURCE_PASSWORD=votre_password \
  -v ./uploads:/app/uploads \
  --name geoinfo-backend \
  geoinfo-backend
```

---

## 💻 Déploiement Manuel

### 1. Compiler l'application

```bash
mvn clean package -DskipTests
```

Le JAR sera dans `target/geoinfo-1.0.0.jar`

### 2. Configurer la base de données

```sql
CREATE DATABASE geoinfo;
\c geoinfo
CREATE EXTENSION postgis;
```

Exécuter le script d'initialisation :
```bash
psql -U postgres -d geoinfo -f src/main/resources/init-data.sql
```

### 3. Configuration Production

Créer `application-prod.properties` :

```properties
# Base de données
spring.datasource.url=jdbc:postgresql://VOTRE_HOST:5432/geoinfo
spring.datasource.username=VOTRE_USER
spring.datasource.password=VOTRE_PASSWORD

# JWT (CHANGER EN PRODUCTION!)
jwt.secret=VOTRE_SECRET_SECURISE_MINIMUM_256_BITS

# Uploads
file.upload-dir=/var/geoinfo/uploads

# Logging
logging.level.root=WARN
logging.level.ma.ehtp.geoinfo=INFO

# Hibernate
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
```

### 4. Démarrer l'application

```bash
java -jar target/geoinfo-1.0.0.jar --spring.profiles.active=prod
```

Ou avec systemd :

```bash
sudo nano /etc/systemd/system/geoinfo.service
```

```ini
[Unit]
Description=CityAlert Backend
After=postgresql.service

[Service]
Type=simple
User=geoinfo
WorkingDirectory=/opt/geoinfo
ExecStart=/usr/bin/java -jar /opt/geoinfo/geoinfo-1.0.0.jar --spring.profiles.active=prod
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Activer :
```bash
sudo systemctl enable geoinfo
sudo systemctl start geoinfo
sudo systemctl status geoinfo
```

---

## 🔒 Sécurité Production

### 1. Changer le secret JWT

Générer un secret sécurisé :
```bash
openssl rand -base64 64
```

### 2. Activer HTTPS

Utiliser un reverse proxy (Nginx) :

```nginx
server {
    listen 443 ssl;
    server_name api.geoinfo.ma;

    ssl_certificate /etc/ssl/certs/geoinfo.crt;
    ssl_certificate_key /etc/ssl/private/geoinfo.key;

    location /api {
        proxy_pass http://localhost:8085;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads {
        proxy_pass http://localhost:8085;
    }
}
```

### 3. Firewall

```bash
# Autoriser uniquement le port HTTPS
sudo ufw allow 443/tcp
sudo ufw deny 8085/tcp
```

---

## 📊 Monitoring

### Logs

```bash
# Logs en temps réel
tail -f /var/log/geoinfo/spring.log

# Logs Docker
docker-compose logs -f backend
```

### Health Check

```bash
curl http://localhost:8085/api/auth/test
```

### Métriques (Spring Actuator)

Ajouter dans `pom.xml` :
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

Endpoints disponibles :
- `/actuator/health` - Santé de l'application
- `/actuator/metrics` - Métriques
- `/actuator/info` - Informations

---

## 🔄 Mise à jour

```bash
# Arrêter l'application
sudo systemctl stop geoinfo

# Backup de la base de données
pg_dump -U postgres geoinfo > backup_$(date +%Y%m%d).sql

# Déployer la nouvelle version
sudo cp target/geoinfo-1.0.0.jar /opt/geoinfo/

# Redémarrer
sudo systemctl start geoinfo
```

---

## 🐛 Dépannage

### L'application ne démarre pas

```bash
# Vérifier les logs
journalctl -u geoinfo -n 100

# Vérifier Java
java -version

# Vérifier PostgreSQL
sudo systemctl status postgresql
```

### Erreur de connexion base de données

```bash
# Tester la connexion
psql -h localhost -U postgres -d geoinfo

# Vérifier PostGIS
psql -d geoinfo -c "SELECT PostGIS_version();"
```

### Problème d'upload

```bash
# Vérifier les permissions
ls -la /var/geoinfo/uploads
sudo chown -R geoinfo:geoinfo /var/geoinfo/uploads
sudo chmod 755 /var/geoinfo/uploads
```

---

## ✅ Checklist de Déploiement

- [ ] PostgreSQL 14+ installé avec PostGIS
- [ ] Base de données créée et initialisée
- [ ] Secret JWT changé
- [ ] Mot de passe admin changé
- [ ] HTTPS configuré
- [ ] Firewall configuré
- [ ] Backup automatique configuré
- [ ] Monitoring en place
- [ ] Logs configurés
- [ ] Tests de charge effectués
