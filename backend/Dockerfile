FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copier les fichiers de configuration Maven
COPY pom.xml .
COPY src ./src

# Compiler l'application
RUN mvn clean package -DskipTests

# Image de production
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copier le JAR compilé
COPY --from=build /app/target/*.jar app.jar

# Créer le répertoire uploads
RUN mkdir -p /app/uploads

# Exposer le port
EXPOSE 8085

# Démarrer l'application
ENTRYPOINT ["java", "-jar", "app.jar"]
