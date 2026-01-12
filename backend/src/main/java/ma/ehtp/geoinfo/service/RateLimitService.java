package ma.ehtp.geoinfo.service;

import lombok.extern.slf4j.Slf4j;
import ma.ehtp.geoinfo.exception.TooManyAttemptsException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service de rate limiting pour limiter les tentatives de récupération UUID
 * Limite : 5 tentatives par heure par adresse IP
 * 
 * NOTE: Pour une solution production avec plusieurs instances backend,
 * migrer vers Redis pour un stockage distribué
 */
@Service
@Slf4j
public class RateLimitService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MS = 3600000; // 1 heure en millisecondes

    // Map: IP -> Liste des timestamps des tentatives
    private final ConcurrentHashMap<String, List<Long>> attempts = new ConcurrentHashMap<>();

    /**
     * Vérifie si l'IP a dépassé la limite de tentatives
     * 
     * @param ipAddress Adresse IP du client
     * @throws TooManyAttemptsException si la limite est dépassée
     */
    public void checkRateLimit(String ipAddress) {
        long now = System.currentTimeMillis();

        // Récupérer ou créer la liste des tentatives pour cette IP
        List<Long> ipAttempts = attempts.computeIfAbsent(ipAddress, k -> new ArrayList<>());

        // Nettoyer les tentatives expirées (plus vieilles que 1 heure)
        synchronized (ipAttempts) {
            ipAttempts.removeIf(timestamp -> (now - timestamp) > WINDOW_MS);

            // Vérifier la limite
            if (ipAttempts.size() >= MAX_ATTEMPTS) {
                log.warn("Rate limit dépassé pour IP: {} ({} tentatives dans la dernière heure)",
                        ipAddress, ipAttempts.size());
                throw new TooManyAttemptsException(
                        "Trop de tentatives. Veuillez réessayer dans 1 heure.");
            }

            // Enregistrer cette tentative
            ipAttempts.add(now);
            log.info("Tentative de récupération UUID enregistrée pour IP: {} ({}/{})",
                    ipAddress, ipAttempts.size(), MAX_ATTEMPTS);
        }
    }

    /**
     * Réinitialise le compteur pour une IP spécifique (admin uniquement)
     */
    public void resetRateLimit(String ipAddress) {
        attempts.remove(ipAddress);
        log.info("Rate limit réinitialisé pour IP: {}", ipAddress);
    }

    /**
     * Nettoie toutes les entrées expirées (optionnel, pour économiser mémoire)
     * À appeler périodiquement via un scheduler
     */
    public void cleanupExpiredEntries() {
        long now = System.currentTimeMillis();
        int cleanedCount = 0;

        for (String ip : attempts.keySet()) {
            List<Long> ipAttempts = attempts.get(ip);
            if (ipAttempts != null) {
                synchronized (ipAttempts) {
                    ipAttempts.removeIf(timestamp -> (now - timestamp) > WINDOW_MS);
                    if (ipAttempts.isEmpty()) {
                        attempts.remove(ip);
                        cleanedCount++;
                    }
                }
            }
        }

        if (cleanedCount > 0) {
            log.info("Nettoyage rate limiting: {} entrées supprimées", cleanedCount);
        }
    }
}
