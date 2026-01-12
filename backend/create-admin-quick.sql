-- Script de création rapide de l'admin
-- Mot de passe: password123

-- Supprimer l'admin s'il existe déjà
DELETE FROM utilisateurs WHERE email = 'admin@geoinfo.ma';

-- Créer l'admin avec BCrypt hash pour "password123"
INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, telephone, role, date_creation, actif) 
VALUES (
    'Admin', 
    'Système', 
    'admin@geoinfo.ma', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCu', 
    '0612345678', 
    'ADMIN', 
    CURRENT_TIMESTAMP, 
    true
);

-- Vérifier
SELECT id, nom, prenom, email, role, actif FROM utilisateurs WHERE email = 'admin@geoinfo.ma';
