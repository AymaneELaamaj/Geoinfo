package ma.ehtp.geoinfo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.MultiPolygon;

/**
 * Entité Province - Représente une province avec sa géométrie
 * Utilise PostGIS pour stocker les polygones de délimitation
 * Permet le calcul automatique de la province par intersection spatiale
 */
@Entity
@Table(name = "provinces")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Province {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nom;

    @Column(length = 50)
    private String code; // Code postal ou code province

    @Column(columnDefinition = "geometry(MultiPolygon,4326)")
    private MultiPolygon geometry; // Géométrie PostGIS pour intersection spatiale

    /**
     * Constructeur simplifié sans géométrie
     */
    public Province(String nom, String code) {
        this.nom = nom;
        this.code = code;
    }
}
