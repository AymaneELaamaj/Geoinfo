package ma.ehtp.geoinfo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la réponse d'authentification
 * Contient le token JWT et les informations utilisateur
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private UtilisateurDTO utilisateur;

    /**
     * DTO imbriqué pour les informations utilisateur
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UtilisateurDTO {
        private Long id;
        private String nom;
        private String prenom;
        private String email;
        private String role;
        private String telephone;
        private Boolean actif;
        // Champs spécifiques aux professionnels
        private Long secteurId;
        private String secteurNom;
    }

    /**
     * Constructeur simplifié
     */
    public AuthResponse(String token, UtilisateurDTO utilisateur) {
        this.token = token;
        this.type = "Bearer";
        this.utilisateur = utilisateur;
    }
}
