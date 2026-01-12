package ma.ehtp.geoinfo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entité Secteur - Représente un secteur d'intervention
 * Ex: Infrastructure, Environnement, Sécurité
 */
@Entity
@Table(name = "secteurs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Secteur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 7)
    private String color; // Couleur hex pour affichage (ex: #3b82f6)

    /**
     * Constructeur simplifié
     */
    public Secteur(String nom, String description, String color) {
        this.nom = nom;
        this.description = description;
        this.color = color;
    }
}
