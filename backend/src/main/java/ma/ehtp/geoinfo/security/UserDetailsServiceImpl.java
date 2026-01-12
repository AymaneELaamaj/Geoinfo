package ma.ehtp.geoinfo.security;

import lombok.RequiredArgsConstructor;
import ma.ehtp.geoinfo.entity.Utilisateur;
import ma.ehtp.geoinfo.repository.UtilisateurRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Collections;

/**
 * Service de chargement des détails utilisateur pour Spring Security
 * Implémente UserDetailsService pour l'authentification
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Utilisateur non trouvé avec l'email: " + email));

        // Vérifier si l'utilisateur est actif
        if (!utilisateur.getActif()) {
            throw new UsernameNotFoundException("Utilisateur désactivé: " + email);
        }

        return User.builder()
                .username(utilisateur.getEmail())
                .password(utilisateur.getMotDePasse())
                .authorities(getAuthorities(utilisateur))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(!utilisateur.getActif())
                .build();
    }

    /**
     * Convertit le rôle de l'utilisateur en autorités Spring Security
     */
    private Collection<? extends GrantedAuthority> getAuthorities(Utilisateur utilisateur) {
        return Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + utilisateur.getRole().name()));
    }

    /**
     * Charge un utilisateur par son ID
     */
    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Utilisateur non trouvé avec l'ID: " + id));

        return User.builder()
                .username(utilisateur.getEmail())
                .password(utilisateur.getMotDePasse())
                .authorities(getAuthorities(utilisateur))
                .build();
    }
}
