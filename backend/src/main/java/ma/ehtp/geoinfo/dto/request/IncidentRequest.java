package ma.ehtp.geoinfo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la création d'un incident par un citoyen
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IncidentRequest {

    @NotBlank(message = "Le type d'incident est obligatoire")
    private String typeIncident;

    private String description;

    private String nomLocal; // Nom du local/lieu

    private String localisation; // Adresse ou description du lieu

    @NotNull(message = "La latitude est obligatoire")
    private Double latitude;

    @NotNull(message = "La longitude est obligatoire")
    private Double longitude;

    @NotNull(message = "Le secteur est obligatoire")
    private Long secteurId;

    // Identifiant anonyme du citoyen (UUID généré par la PWA)
    private String deviceId;

    // Email optionnel du citoyen pour récupération multi-appareils
    private String citizenEmail;
}
