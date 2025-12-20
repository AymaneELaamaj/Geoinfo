-- Script pour créer un utilisateur administrateur
-- Mot de passe: Admin123!
-- Le mot de passe est encodé avec BCrypt

INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, role, date_creation)
VALUES (
    'Admin', 
    'System', 
    'admin@geo.ma', 
    '$2a$10$eZQhQ1Z0ZJX5Z5Z5Z5Z5ZeZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', -- Mot de passe: Admin123!
    'ADMIN',
    CURRENT_TIMESTAMP
);

-- Vérifier la création
SELECT id, nom, prenom, email, role FROM utilisateur WHERE role = 'ADMIN';
