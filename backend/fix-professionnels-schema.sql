-- Script pour corriger la structure de la table professionnels
-- Problème: deux colonnes pour le secteur (secteur_id et secteur_affectate) toutes deux NOT NULL

-- 1. D'abord, voir la structure actuelle
-- \d professionnels

-- 2. Supprimer la contrainte NOT NULL sur secteur_id (la colonne inutilisée)
ALTER TABLE professionnels ALTER COLUMN secteur_id DROP NOT NULL;

-- 3. Ou bien si secteur_id n'existe pas encore, le problème pourrait être inversé
-- Dans ce cas, commenter la ligne ci-dessus et décommenter celle-ci:
-- ALTER TABLE professionnels ALTER COLUMN secteur_affectate DROP NOT NULL;

-- 4. S'il y a des données, mettre à jour pour synchroniser les deux colonnes
-- UPDATE professionnels SET secteur_id = secteur_affectate WHERE secteur_id IS NULL;

-- Exécuter ce script avec:
-- psql -U postgres -d geoinfo -f fix-professionnels-schema.sql
