package ma.ehtp.geoinfo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Classe principale de l'application CityAlert
 * 
 * Application de signalement et gestion d'incidents urbains
 * Permet aux citoyens de déclarer des problèmes géolocalisés
 * et aux professionnels de les traiter efficacement.
 */
@SpringBootApplication
@EnableJpaAuditing
public class GeoInfoApplication {

    public static void main(String[] args) {
        SpringApplication.run(GeoInfoApplication.class, args);
        System.out.println("\n" +
                "╔════════════════════════════════════════════════════════════╗\n" +
                "║                                                            ║\n" +
                "║            🚨  CITYALERT BACKEND STARTED  🚨              ║\n" +
                "║                                                            ║\n" +
                "║  API disponible sur: http://localhost:8085/api             ║\n" +
                "║  Swagger UI: http://localhost:8085/swagger-ui.html         ║\n" +
                "║                                                            ║\n" +
                "╚════════════════════════════════════════════════════════════╝\n");
    }
}
