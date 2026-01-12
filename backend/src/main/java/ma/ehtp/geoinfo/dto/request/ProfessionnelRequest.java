package ma.ehtp.geoinfo.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la création d'un professionnel par l'admin
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfessionnelRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    private String prenom; // Optionnel

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String motDePasse;

    @NotBlank(message = "Le téléphone est obligatoire")
    private String telephone;

    @NotNull(message = "Le secteur est obligatoire")
    private Long secteurAffectate;

    @NotBlank(message = "Le type d'incident est obligatoire")
    private String typeIncident; // Enum Professionnel.TypeIncident
}
