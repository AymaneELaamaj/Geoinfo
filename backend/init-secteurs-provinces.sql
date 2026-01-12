-- Script d'initialisation des secteurs et provinces
-- À exécuter dans pgAdmin

-- 1. Supprimer les données existantes (optionnel)
-- DELETE FROM secteurs;
-- DELETE FROM provinces;

-- 2. Insérer les secteurs
INSERT INTO secteurs (nom, description, couleur) VALUES
('Infrastructure', 'Routes, ponts, réseaux d''eau et d''électricité', '#3B82F6'),
('Environnement', 'Pollution, déchets, espaces verts', '#10B981'),
('Sécurité', 'Éclairage public, criminalité, accidents', '#EF4444'),
('Urbanisme', 'Construction illégale, aménagement urbain', '#F59E0B'),
('Transport', 'Transports en commun, circulation', '#8B5CF6'),
('Santé', 'Services de santé, hygiène publique', '#EC4899')
ON CONFLICT (nom) DO NOTHING;

-- 3. Insérer les provinces (exemples pour le Maroc)
INSERT INTO provinces (nom, code, geom) VALUES
('Casablanca', 'CASA', NULL),
('Rabat', 'RABA', NULL),
('Marrakech', 'MARR', NULL),
('Fès', 'FES', NULL),
('Tanger', 'TANG', NULL),
('Agadir', 'AGAD', NULL),
('Meknès', 'MEKN', NULL),
('Tétouan', 'TETO', NULL),
('Oujda', 'OUJD', NULL),
('Kenitra', 'KENI', NULL),
('Salé', 'SALE', NULL),
('Mohammedia', 'MOHA', NULL)
ON CONFLICT (nom) DO NOTHING;

-- 4. Vérifier les insertions
SELECT 'Secteurs' as type, COUNT(*) as count FROM secteurs
UNION ALL
SELECT 'Provinces' as type, COUNT(*) as count FROM provinces;

-- 5. Afficher les secteurs
SELECT id, nom, description, couleur FROM secteurs ORDER BY nom;
