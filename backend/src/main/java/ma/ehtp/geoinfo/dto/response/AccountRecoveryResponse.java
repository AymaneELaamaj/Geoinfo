package ma.ehtp.geoinfo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO de réponse pour la récupération d'un compte
 * Contient le résultat de la récupération et les incidents associés
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountRecoveryResponse {

    private boolean success;
    private int incidentsCount;
    private String message;
    private List<IncidentResponse> incidents;
}
