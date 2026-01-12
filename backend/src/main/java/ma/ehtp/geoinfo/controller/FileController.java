package ma.ehtp.geoinfo.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Contrôleur pour servir les fichiers uploadés (photos d'incidents)
 * Endpoint public accessible sans authentification
 */
@RestController
@RequestMapping("/uploads")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
public class FileController {

    @Value("${file.upload-dir}")
    private String uploadDir;

    /**
     * GET /uploads/{filename}
     * Sert un fichier uploadé (photo d'incident)
     * 
     * @param filename Nom du fichier à servir
     * @return Fichier avec le content-type approprié
     */
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            Path file = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(file.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                log.warn("Fichier non trouvé ou non lisible: {}", filename);
                return ResponseEntity.notFound().build();
            }

            // Déterminer le content-type
            String contentType = Files.probeContentType(file);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            log.info("📸 Serving file: {} ({})", filename, contentType);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (Exception e) {
            log.error("Erreur lors de la lecture du fichier: {}", filename, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
