package ma.ehtp.geoinfo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Entité Professionnel - Hérite de Utilisateur
 * Représente un professionnel affecté à un secteur et type d'incident
 */
@Entity
@Table(name = "professionnels")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Professionnel extends Utilisateur {

    /**
     * Relation vers le Secteur affecté
     * Un professionnel appartient à un seul secteur
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "secteur_affectate", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Secteur secteur;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TypeIncident typeIncident;

    @Column
    private Boolean disponible = true;

    /**
     * Enum des types d'incidents gérés par les professionnels
     */
    public enum TypeIncident {
        EAU,
        ELECTRICITE,
        ROUTE,
        ASSAINISSEMENT,
        ECLAIRAGE_PUBLIC,
        DECHETS,
        ESPACES_VERTS,
        SECURITE,
        AUTRE
    }

    /**
     * Constructeur pour la création d'un professionnel
     */
    public Professionnel(String nom, String prenom, String email, String motDePasse,
            String telephone, Secteur secteur, TypeIncident typeIncident) {
        super(nom, prenom, email, motDePasse, telephone, Role.PROFESSIONNEL);
        this.secteur = secteur;
        this.typeIncident = typeIncident;
        this.disponible = true;
    }

    /**
     * Getter pour l'ID du secteur (compatibilité avec le frontend)
     */
    public Long getSecteurAffectate() {
        return secteur != null ? secteur.getId() : null;
    }

    /**
     * Setter pour l'ID du secteur (compatibilité - ne fait rien, utiliser
     * setSecteur())
     * 
     * @deprecated Utiliser setSecteur(Secteur) à la place
     */
    public void setSecteurAffectate(Long secteurId) {
        // Ne fait rien - doit être géré par le service qui charge le Secteur
    }
}
