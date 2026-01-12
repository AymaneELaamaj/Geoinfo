package ma.ehtp.geoinfo.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Service de stockage de fichiers
 * Gère l'upload et le stockage des photos d'incidents
 */
@Service
@Slf4j
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${file.upload-dir}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
            log.info("Répertoire de stockage créé : {}", this.fileStorageLocation);
        } catch (Exception ex) {
            log.error("Impossible de créer le répertoire de stockage", ex);
            throw new RuntimeException("Impossible de créer le répertoire de stockage", ex);
        }
    }

    /**
     * Stocke un fichier et retourne le nom du fichier
     * 
     * @param file Fichier à stocker
     * @return Nom du fichier stocké
     */
    public String storeFile(MultipartFile file) {
        // Normaliser le nom du fichier
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());

        log.info("📁 DÉBUT stockage fichier: {}", originalFilename);
        log.info("📊 Taille du fichier: {} bytes", file.getSize());

        try {
            // Vérifier si le fichier contient des caractères invalides
            if (originalFilename.contains("..")) {
                throw new RuntimeException(
                        "Le nom du fichier contient une séquence de chemin invalide : " + originalFilename);
            }

            // Générer un nom de fichier unique
            String fileExtension = "";
            if (originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString() + fileExtension;

            // Copier le fichier vers le répertoire de stockage
            Path targetLocation = this.fileStorageLocation.resolve(newFilename);
            log.info("💾 Stockage vers: {}", targetLocation.toAbsolutePath());

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            log.info("✅ Fichier stocké avec succès: {} -> {}", originalFilename, newFilename);
            log.info("📍 Chemin complet: {}", targetLocation.toAbsolutePath());

            return newFilename;
        } catch (IOException ex) {
            log.error("❌ Impossible de stocker le fichier : {}", originalFilename, ex);
            throw new RuntimeException("Impossible de stocker le fichier : " + originalFilename, ex);
        }
    }

    /**
     * Supprime un fichier
     * 
     * @param filename Nom du fichier à supprimer
     */
    public void deleteFile(String filename) {
        try {
            Path filePath = this.fileStorageLocation.resolve(filename).normalize();
            Files.deleteIfExists(filePath);
            log.info("Fichier supprimé : {}", filename);
        } catch (IOException ex) {
            log.error("Impossible de supprimer le fichier : {}", filename, ex);
        }
    }

    /**
     * Construit l'URL d'accès au fichier
     * 
     * @param filename Nom du fichier
     * @return URL complète du fichier
     */
    public String getFileUrl(String filename) {
        if (filename == null || filename.isEmpty()) {
            return null;
        }
        // URL complète avec le port backend (8085)
        return "http://localhost:8085/uploads/" + filename;
    }

    /**
     * Vérifie si un fichier est une image valide
     * 
     * @param file Fichier à vérifier
     * @return true si c'est une image valide
     */
    public boolean isValidImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            return false;
        }

        return contentType.equals("image/jpeg") ||
                contentType.equals("image/png") ||
                contentType.equals("image/webp") ||
                contentType.equals("image/jpg");
    }

    /**
     * Vérifie la taille du fichier
     * 
     * @param file           Fichier à vérifier
     * @param maxSizeInBytes Taille maximale en bytes
     * @return true si la taille est valide
     */
    public boolean isValidSize(MultipartFile file, long maxSizeInBytes) {
        return file != null && file.getSize() <= maxSizeInBytes;
    }
}
