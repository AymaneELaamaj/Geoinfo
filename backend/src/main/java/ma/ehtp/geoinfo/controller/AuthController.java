package ma.ehtp.geoinfo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.ehtp.geoinfo.dto.request.LoginRequest;
import ma.ehtp.geoinfo.dto.response.AuthResponse;
import ma.ehtp.geoinfo.entity.Professionnel;
import ma.ehtp.geoinfo.entity.Utilisateur;
import ma.ehtp.geoinfo.repository.ProfessionnelRepository;
import ma.ehtp.geoinfo.repository.UtilisateurRepository;
import ma.ehtp.geoinfo.security.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Contrôleur d'authentification
 * Gère la connexion et l'inscription des utilisateurs
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
public class AuthController {

        private final AuthenticationManager authenticationManager;
        private final JwtTokenProvider tokenProvider;
        private final UtilisateurRepository utilisateurRepository;
        private final ProfessionnelRepository professionnelRepository;

        /**
         * POST /api/auth/login
         * Authentifie un utilisateur et retourne un token JWT
         */
        @PostMapping("/login")
        public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
                log.info("Tentative de connexion pour: {}", loginRequest.getEmail());

                // Authentifier l'utilisateur
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                loginRequest.getEmail(),
                                                loginRequest.getMotDePasse()));

                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Récupérer l'utilisateur
                Utilisateur utilisateur = utilisateurRepository.findByEmail(loginRequest.getEmail())
                                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

                // Générer le token JWT
                String token = tokenProvider.generateToken(utilisateur);

                // Construire la réponse avec secteurId si professionnel
                Long secteurId = null;
                String secteurNom = null;

                if (utilisateur.getRole() == Utilisateur.Role.PROFESSIONNEL) {
                        Professionnel professionnel = professionnelRepository.findById(utilisateur.getId())
                                        .orElse(null);
                        if (professionnel != null && professionnel.getSecteur() != null) {
                                secteurId = professionnel.getSecteur().getId();
                                secteurNom = professionnel.getSecteur().getNom();
                                log.info("Professionnel {} affecté au secteur: {} (ID: {})",
                                                utilisateur.getEmail(), secteurNom, secteurId);
                        }
                }

                AuthResponse.UtilisateurDTO utilisateurDTO = AuthResponse.UtilisateurDTO.builder()
                                .id(utilisateur.getId())
                                .nom(utilisateur.getNom())
                                .prenom(utilisateur.getPrenom())
                                .email(utilisateur.getEmail())
                                .role(utilisateur.getRole().name())
                                .telephone(utilisateur.getTelephone())
                                .actif(utilisateur.getActif())
                                .secteurId(secteurId)
                                .secteurNom(secteurNom)
                                .build();

                AuthResponse response = AuthResponse.builder()
                                .token(token)
                                .type("Bearer")
                                .utilisateur(utilisateurDTO)
                                .build();

                log.info("Connexion réussie pour: {} ({}) - secteurId: {}",
                                utilisateur.getEmail(), utilisateur.getRole(), secteurId);

                return ResponseEntity.ok(response);
        }

        /**
         * GET /api/auth/me
         * Retourne les informations de l'utilisateur connecté
         */
        @GetMapping("/me")
        public ResponseEntity<AuthResponse.UtilisateurDTO> getCurrentUser(Authentication authentication) {
                if (authentication == null || !authentication.isAuthenticated()) {
                        return ResponseEntity.status(401).build();
                }

                String email = authentication.getName();
                Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

                AuthResponse.UtilisateurDTO utilisateurDTO = AuthResponse.UtilisateurDTO.builder()
                                .id(utilisateur.getId())
                                .nom(utilisateur.getNom())
                                .prenom(utilisateur.getPrenom())
                                .email(utilisateur.getEmail())
                                .role(utilisateur.getRole().name())
                                .telephone(utilisateur.getTelephone())
                                .actif(utilisateur.getActif())
                                .build();

                return ResponseEntity.ok(utilisateurDTO);
        }

        /**
         * GET /api/auth/test
         * Endpoint de test pour vérifier que le backend fonctionne
         */
        @GetMapping("/test")
        public ResponseEntity<Map<String, String>> test() {
                return ResponseEntity.ok(Map.of(
                                "status", "OK",
                                "message", "Backend CityAlert opérationnel",
                                "timestamp", java.time.LocalDateTime.now().toString()));
        }
}
