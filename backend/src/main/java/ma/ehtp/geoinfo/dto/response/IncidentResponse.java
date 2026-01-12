package ma.ehtp.geoinfo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO pour la réponse d'un incident
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentResponse {

    private Long id;
    private String typeIncident;
    private String description;
    private Double latitude;
    private Double longitude;
    private String province;
    private String nomLocal; // Nom du local/lieu
    private String localisation; // Adresse/description du lieu
    private String photoUrl;
    private LocalDateTime dateDeclaration;
    private String statut;
    private Long secteurId;
    private String secteurNom;
    private String motifRejet;
    private String descriptionTraitement;
    private Long declarantId;
    private Long professionnelAffecteId;
    private String deviceId; // UUID anonyme du citoyen
}
