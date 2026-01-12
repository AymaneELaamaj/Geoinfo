-- ============================================
-- SCRIPT D'INITIALISATION BASE DE DONNÉES
-- GeoInfo - Plateforme de gestion des incidents
-- ============================================

-- Activer l'extension PostGIS si pas déjà fait
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- INSERTION DES SECTEURS
-- ============================================
INSERT INTO secteurs (nom, description, color) VALUES
('Infrastructure', 'Routes, ponts, bâtiments publics', '#3b82f6'),
('Environnement', 'Espaces verts, pollution, déchets', '#10b981'),
('Sécurité', 'Éclairage public, sécurité routière', '#ef4444'),
('Services Publics', 'Eau, électricité, assainissement', '#f59e0b'),
('Transport', 'Transports en commun, signalisation', '#8b5cf6')
ON CONFLICT (nom) DO NOTHING;

-- ============================================
-- INSERTION DES PROVINCES (sans géométrie)
-- ============================================
INSERT INTO provinces (nom, code) VALUES
('Casablanca', '20000'),
('Rabat', '10000'),
('Marrakech', '40000'),
('Fès', '30000'),
('Tanger', '90000'),
('Agadir', '80000'),
('Meknès', '50000'),
('Oujda', '60000'),
('Kénitra', '14000'),
('Tétouan', '93000'),
('Safi', '46000'),
('Mohammedia', '28000'),
('Khouribga', '25000'),
('Béni Mellal', '23000'),
('El Jadida', '24000')
ON CONFLICT (nom) DO NOTHING;

-- ============================================
-- INSERTION DES UTILISATEURS DE TEST
-- ============================================

-- Administrateur
-- Email: admin@geoinfo.ma
-- Mot de passe: password123
INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, telephone, role, date_creation, actif) VALUES
('Admin', 'Système', 'admin@geoinfo.ma', 
 '$2a$10$xJ3kIuyxuGXPqWVqZqVqJe8YqVqJe8YqVqJe8YqVqJe8YqVqJe8Yq', 
 '0612345678', 'ADMIN', CURRENT_TIMESTAMP, true)
ON CONFLICT (email) DO NOTHING;

-- Professionnels par secteur
-- Tous avec mot de passe: password123

-- Professionnel Infrastructure
INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, telephone, role, date_creation, actif) VALUES
('Alami', 'Hassan', 'pro.infrastructure@geoinfo.ma', 
 '$2a$10$xJ3kIuyxuGXPqWVqZqVqJe8YqVqJe8YqVqJe8YqVqJe8YqVqJe8Yq', 
 '0623456789', 'PROFESSIONNEL', CURRENT_TIMESTAMP, true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO professionnels (id, secteur_affectate, type_incident, disponible) 
SELECT id, 1, 'ROUTE', true FROM utilisateurs WHERE email = 'pro.infrastructure@geoinfo.ma'
ON CONFLICT DO NOTHING;

-- Professionnel Environnement
INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, telephone, role, date_creation, actif) VALUES
('Benali', 'Fatima', 'pro.environnement@geoinfo.ma', 
 '$2a$10$xJ3kIuyxuGXPqWVqZqVqJe8YqVqJe8YqVqJe8YqVqJe8YqVqJe8Yq', 
 '0634567890', 'PROFESSIONNEL', CURRENT_TIMESTAMP, true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO professionnels (id, secteur_affectate, type_incident, disponible) 
SELECT id, 2, 'ESPACES_VERTS', true FROM utilisateurs WHERE email = 'pro.environnement@geoinfo.ma'
ON CONFLICT DO NOTHING;

-- Professionnel Sécurité
INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, telephone, role, date_creation, actif) VALUES
('Tazi', 'Mohammed', 'pro.securite@geoinfo.ma', 
 '$2a$10$xJ3kIuyxuGXPqWVqZqVqJe8YqVqJe8YqVqJe8YqVqJe8YqVqJe8Yq', 
 '0645678901', 'PROFESSIONNEL', CURRENT_TIMESTAMP, true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO professionnels (id, secteur_affectate, type_incident, disponible) 
SELECT id, 3, 'ECLAIRAGE_PUBLIC', true FROM utilisateurs WHERE email = 'pro.securite@geoinfo.ma'
ON CONFLICT DO NOTHING;

-- Citoyens de test
INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, telephone, role, date_creation, actif) VALUES
('Citoyen', 'Test 1', 'citoyen1@test.ma', 
 '$2a$10$xJ3kIuyxuGXPqWVqZqVqJe8YqVqJe8YqVqJe8YqVqJe8YqVqJe8Yq', 
 '0656789012', 'CITOYEN', CURRENT_TIMESTAMP, true),
('Citoyen', 'Test 2', 'citoyen2@test.ma', 
 '$2a$10$xJ3kIuyxuGXPqWVqZqVqJe8YqVqJe8YqVqJe8YqVqJe8YqVqJe8Yq', 
 '0667890123', 'CITOYEN', CURRENT_TIMESTAMP, true)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- INCIDENTS DE TEST
-- ============================================

-- Incident 1 : Infrastructure / Rabat
INSERT INTO incidents (type_incident, description, latitude, longitude, province, secteur_id, statut, date_declaration, location)
VALUES
    ('Nid-de-poule dangereux',
     'Un gros nid-de-poule sur l''avenue Mohammed V compromet la sécurité des usagers',
     34.020882, -6.84165, 'Rabat',
     (SELECT id FROM secteurs WHERE nom = 'Infrastructure'),
     'VALIDE',
     NOW() - INTERVAL '2 days',
     ST_SetSRID(ST_MakePoint(-6.84165, 34.020882), 4326));

-- Incident 2 : Environnement / Casablanca
INSERT INTO incidents (type_incident, description, latitude, longitude, province, secteur_id, statut, date_declaration, location)
VALUES
    ('Dépôt sauvage de déchets',
     'Accumulation de déchets devant le parc de la Ligue Arabe, créant une nuisance',
     33.589886, -7.603869, 'Casablanca',
     (SELECT id FROM secteurs WHERE nom = 'Environnement'),
     'REDIGE',
     NOW() - INTERVAL '1 day',
     ST_SetSRID(ST_MakePoint(-7.603869, 33.589886), 4326));

-- Incident 3 : Infrastructure / Marrakech
INSERT INTO incidents (type_incident, description, latitude, longitude, province, secteur_id, statut, date_declaration, location)
VALUES
    ('Lampadaire éteint',
     'Lampadaire défaillant dans le quartier Guéliz, réduisant la visibilité nocturne',
     31.634637, -8.008156, 'Marrakech',
     (SELECT id FROM secteurs WHERE nom = 'Infrastructure'),
     'VALIDE',
     NOW() - INTERVAL '3 days',
     ST_SetSRID(ST_MakePoint(-8.008156, 31.634637), 4326));

-- ============================================
-- AFFICHAGE DES COMPTES CRÉÉS
-- ============================================
SELECT 
    '=== COMPTES DE TEST CRÉÉS ===' as info,
    '' as email,
    '' as mot_de_passe,
    '' as role
UNION ALL
SELECT 
    'Administrateur',
    'admin@geoinfo.ma',
    'password123',
    'ADMIN'
UNION ALL
SELECT 
    'Professionnel Infrastructure',
    'pro.infrastructure@geoinfo.ma',
    'password123',
    'PROFESSIONNEL'
UNION ALL
SELECT 
    'Professionnel Environnement',
    'pro.environnement@geoinfo.ma',
    'password123',
    'PROFESSIONNEL'
UNION ALL
SELECT 
    'Professionnel Sécurité',
    'pro.securite@geoinfo.ma',
    'password123',
    'PROFESSIONNEL'
UNION ALL
SELECT 
    'Citoyen 1',
    'citoyen1@test.ma',
    'password123',
    'CITOYEN'
UNION ALL
SELECT 
    'Citoyen 2',
    'citoyen2@test.ma',
    'password123',
    'CITOYEN';
