package ma.ehtp.geoinfo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.Point;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Entité Incident - Représente un incident urbain signalé
 * Utilise PostGIS pour la géolocalisation (Point geometry)
 * 
 * Workflow des statuts:
 * REDIGE → VALIDE → PRIS_EN_COMPTE → EN_COURS_DE_TRAITEMENT → TRAITE
 * ↘ REJETE
 * ↘ BLOQUE
 * ↘ REDIRIGE
 */
@Entity
@Table(name = "incidents", indexes = {
        @Index(name = "idx_incident_statut", columnList = "statut"),
        @Index(name = "idx_incident_secteur", columnList = "secteur_id"),
        @Index(name = "idx_incident_date", columnList = "date_declaration")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ============================================
    // INFORMATIONS DE BASE (Fiche incident)
    // ============================================

    @Column(nullable = false, length = 100)
    private String typeIncident; // Ex: "Route endommagée", "Fuite d'eau"

    @Column(columnDefinition = "TEXT")
    private String description;

    // ============================================
    // GÉOLOCALISATION (OBLIGATOIRE)
    // ============================================

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(columnDefinition = "geometry(Point,4326)")
    private Point location; // Géométrie PostGIS

    @Column(length = 200)
    private String nomLocal; // Nom du local/lieu (ex: "École primaire Mohamed V")

    @Column(length = 500)
    private String localisation; // Adresse ou description du lieu

    @Column(nullable = false, length = 100)
    private String province; // Calculée automatiquement par intersection spatiale

    // ============================================
    // MÉDIA
    // ============================================

    @Column(length = 500)
    private String photoUrl;

    // ============================================
    // DATES
    // ============================================

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateDeclaration;

    @LastModifiedDate
    @Column
    private LocalDateTime dateModification;

    @Column
    private LocalDateTime dateTraitement;

    // ============================================
    // STATUT ET WORKFLOW
    // ============================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatutIncident statut = StatutIncident.REDIGE;

    @Column(columnDefinition = "TEXT")
    private String motifRejet; // Si statut = REJETE

    @Column(columnDefinition = "TEXT")
    private String descriptionTraitement; // Retour du professionnel

    // ============================================
    // RELATIONS
    // ============================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "secteur_id", nullable = false)
    private Secteur secteur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "declarant_id")
    private Utilisateur declarant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professionnel_affecte_id")
    private Professionnel professionnelAffecte;

    // ============================================
    // TRAÇABILITÉ CITOYEN ANONYME
    // ============================================

    @Column(length = 50)
    private String deviceId; // Identifiant anonyme du citoyen (UUID PWA)

    @Column(length = 255)
    private String citizenEmail; // Email optionnel pour récupération multi-appareils

    /**
     * Enum des statuts d'incident selon le cahier des charges
     */
    public enum StatutIncident {
        REDIGE, // Incident créé, en attente validation admin
        VALIDE, // Validé par admin, publié sur carte
        REJETE, // Rejeté par admin (avec motif)
        PRIS_EN_COMPTE, // Pris en charge par professionnel
        EN_COURS_DE_TRAITEMENT, // En cours de traitement
        TRAITE, // Traitement terminé
        BLOQUE, // Bloqué temporairement
        REDIRIGE // Redirigé vers autre professionnel
    }

    /**
     * Constructeur pour création d'incident par citoyen
     */
    public Incident(String typeIncident, String description,
            Double latitude, Double longitude, Secteur secteur,
            String photoUrl, Utilisateur declarant, String deviceId) {
        this.typeIncident = typeIncident;
        this.description = description;
        this.latitude = latitude;
        this.longitude = longitude;
        this.secteur = secteur;
        this.photoUrl = photoUrl;
        this.declarant = declarant;
        this.deviceId = deviceId;
        this.statut = StatutIncident.REDIGE;
    }
}
