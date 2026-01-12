package ma.ehtp.geoinfo.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.ehtp.geoinfo.entity.Secteur;
import ma.ehtp.geoinfo.entity.Utilisateur;
import ma.ehtp.geoinfo.repository.SecteurRepository;
import ma.ehtp.geoinfo.repository.UtilisateurRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Contrôleur de débogage temporaire
 * À SUPPRIMER EN PRODUCTION
 */
@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
public class DebugController {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecteurRepository secteurRepository;

    /**
     * Vérifier si l'admin existe
     */
    @GetMapping("/check-admin")
    public ResponseEntity<Map<String, Object>> checkAdmin() {
        Map<String, Object> response = new HashMap<>();

        Utilisateur admin = utilisateurRepository.findByEmail("admin@geoinfo.ma").orElse(null);

        if (admin == null) {
            response.put("exists", false);
            response.put("message", "Admin n'existe pas");
        } else {
            response.put("exists", true);
            response.put("email", admin.getEmail());
            response.put("role", admin.getRole());
            response.put("actif", admin.getActif());
            response.put("passwordStartsWith",
                    admin.getMotDePasse().substring(0, Math.min(10, admin.getMotDePasse().length())));
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Tester le hash du mot de passe
     */
    @GetMapping("/test-password")
    public ResponseEntity<Map<String, Object>> testPassword(@RequestParam String password) {
        Map<String, Object> response = new HashMap<>();

        Utilisateur admin = utilisateurRepository.findByEmail("admin@geoinfo.ma").orElse(null);

        if (admin == null) {
            response.put("error", "Admin n'existe pas");
        } else {
            boolean matches = passwordEncoder.matches(password, admin.getMotDePasse());
            response.put("passwordMatches", matches);
            response.put("testedPassword", password);
            response.put("storedHashStart",
                    admin.getMotDePasse().substring(0, Math.min(20, admin.getMotDePasse().length())));
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Générer un hash BCrypt
     */
    @GetMapping("/generate-hash")
    public ResponseEntity<Map<String, Object>> generateHash(@RequestParam String password) {
        Map<String, Object> response = new HashMap<>();

        String hash = passwordEncoder.encode(password);
        response.put("password", password);
        response.put("hash", hash);

        return ResponseEntity.ok(response);
    }

    /**
     * Mettre à jour le mot de passe de l'admin
     */
    @GetMapping("/fix-admin-password")
    public ResponseEntity<Map<String, Object>> fixAdminPassword() {
        Map<String, Object> response = new HashMap<>();

        Utilisateur admin = utilisateurRepository.findByEmail("admin@geoinfo.ma").orElse(null);

        if (admin == null) {
            response.put("error", "Admin n'existe pas");
        } else {
            // Générer un nouveau hash pour "password123"
            String newHash = passwordEncoder.encode("password123");
            admin.setMotDePasse(newHash);
            utilisateurRepository.save(admin);

            response.put("success", true);
            response.put("message", "Mot de passe mis à jour");
            response.put("newHash", newHash);
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Initialiser les secteurs par défaut
     */
    @GetMapping("/init-secteurs")
    public ResponseEntity<Map<String, Object>> initSecteurs() {
        Map<String, Object> response = new HashMap<>();
        List<Secteur> secteursCreated = new ArrayList<>();

        // Définir les secteurs
        String[][] secteursData = {
                { "Infrastructure", "Routes, ponts, réseaux d'eau et d'électricité", "#3B82F6" },
                { "Environnement", "Pollution, déchets, espaces verts", "#10B981" },
                { "Sécurité", "Éclairage public, criminalité, accidents", "#EF4444" },
                { "Urbanisme", "Construction illégale, aménagement urbain", "#F59E0B" },
                { "Transport", "Transports en commun, circulation", "#8B5CF6" },
                { "Santé", "Services de santé, hygiène publique", "#EC4899" }
        };

        // Créer les secteurs
        for (String[] data : secteursData) {
            // Vérifier si le secteur existe déjà
            if (!secteurRepository.existsByNom(data[0])) {
                Secteur secteur = new Secteur();
                secteur.setNom(data[0]);
                secteur.setDescription(data[1]);
                secteur.setColor(data[2]);
                secteurRepository.save(secteur);
                secteursCreated.add(secteur);
            }
        }

        response.put("success", true);
        response.put("message", secteursCreated.size() + " secteur(s) créé(s)");
        response.put("total", secteurRepository.count());

        return ResponseEntity.ok(response);
    }

    /**
     * Vérifier la connexion à la base de données et les données
     */
    @GetMapping("/db-status")
    public ResponseEntity<Map<String, Object>> checkDatabaseStatus() {
        Map<String, Object> response = new HashMap<>();

        try {
            // Compter les éléments dans chaque table
            long utilisateursCount = utilisateurRepository.count();
            long secteursCount = secteurRepository.count();

            response.put("connected", true);
            response.put("utilisateurs_count", utilisateursCount);
            response.put("secteurs_count", secteursCount);
            response.put("message", "Connexion à la base de données OK");

            // Lister les utilisateurs
            List<Map<String, Object>> users = new ArrayList<>();
            utilisateurRepository.findAll().forEach(u -> {
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("id", u.getId());
                userInfo.put("email", u.getEmail());
                userInfo.put("role", u.getRole());
                userInfo.put("actif", u.getActif());
                users.add(userInfo);
            });
            response.put("utilisateurs", users);

            // Lister les secteurs
            List<Map<String, Object>> secs = new ArrayList<>();
            secteurRepository.findAll().forEach(s -> {
                Map<String, Object> secInfo = new HashMap<>();
                secInfo.put("id", s.getId());
                secInfo.put("nom", s.getNom());
                secs.add(secInfo);
            });
            response.put("secteurs", secs);

        } catch (Exception e) {
            response.put("connected", false);
            response.put("error", e.getMessage());
            log.error("Erreur connexion DB", e);
        }

        return ResponseEntity.ok(response);
    }
}
