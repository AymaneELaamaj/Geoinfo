package ma.ehtp.geoinfo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la récupération d'un compte via UUID
 * Utilisé quand un citoyen change d'appareil
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountRecoveryRequest {

    @NotBlank(message = "UUID requis")
    @Pattern(regexp = "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$", message = "Format UUID v4 invalide", flags = Pattern.Flag.CASE_INSENSITIVE)
    private String uuid;
}
