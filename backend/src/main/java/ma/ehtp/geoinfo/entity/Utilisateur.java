package ma.ehtp.geoinfo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Entité Utilisateur - Classe parent polymorphique
 * Utilise l'héritage JOINED pour Professionnel et Citoyen
 * 
 * Rôles possibles: ADMIN, PROFESSIONNEL, CITOYEN
 */
@Entity
@Table(name = "utilisateurs")
@Inheritance(strategy = InheritanceType.JOINED)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String motDePasse; // Stocké en BCrypt

    @Column(length = 20)
    private String telephone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @Column
    private Boolean actif = true;

    /**
     * Enum des rôles utilisateurs
     */
    public enum Role {
        ADMIN,
        PROFESSIONNEL,
        CITOYEN
    }

    /**
     * Constructeur pour la création d'utilisateur
     */
    public Utilisateur(String nom, String prenom, String email, String motDePasse, String telephone, Role role) {
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.motDePasse = motDePasse;
        this.telephone = telephone;
        this.role = role;
        this.actif = true;
    }
}
