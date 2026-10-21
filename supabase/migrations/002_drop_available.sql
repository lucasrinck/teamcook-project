-- ==========================================================================
-- ⚠️ DÉJÀ APPLIQUÉ sur la base Supabase du projet (19/10/2026) : NE PAS RÉEXÉCUTER dessus.
--
-- Choix de l'équipe : la disponibilité n'est plus utilisée dans l'application.
-- Pour recréer la base à l'identique : 001_init.sql, puis ce fichier, puis seed.sql.
-- ==========================================================================

ALTER TABLE public.spots DROP COLUMN available;
