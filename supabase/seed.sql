-- ==========================================================================
-- AFTERDARK — DONNÉES DE DÉMONSTRATION (FICTIVES)
--
-- Tous les lieux ci-dessous sont INVENTÉS pour la démonstration : noms,
-- descriptions et disponibilités ne correspondent à aucun établissement réel.
-- Les adresses ne donnent qu'une rue et un arrondissement (pas de numéro),
-- les coordonnées sont plausibles mais approximatives.
-- Photos : Unsplash (images.unsplash.com), URL vérifiées le 19/10/2026.
--
-- Exécution : à coller dans l'éditeur SQL de Supabase (SQL Editor > Run).
--
-- Le script est REJOUABLE sans doublon et ne supprime aucune ligne :
--   - chaque ligne a un identifiant explicite ;
--   - INSERT ... ON CONFLICT ... DO UPDATE : si la ligne existe déjà,
--     elle est mise à jour au lieu de provoquer une erreur ;
--   - à la fin, setval réaligne les compteurs d'identifiants pour que les
--     prochains lieux créés par l'API ne réutilisent pas un id déjà pris.
--
-- Aucune clé ni aucun secret dans ce fichier.
-- ==========================================================================

BEGIN;

-- --------------------------------------------------------------------------
-- 1. CATÉGORIES
-- Les id 1 à 6 existent déjà dans la base : on garde leurs noms et leurs
-- icônes, on adapte seulement les couleurs à la palette AFTERDARK.
--   - famille vert acide  = "Hidden Spots" (lieux secrets)
--   - famille violet      = "After Hours"  (sorties)
--   - gris clair          = Culture
-- Toutes les couleurs ont un contraste d'au moins 4.5:1 sur le fond #101311.
-- Les id 7 à 9 sont les nouvelles catégories.
-- --------------------------------------------------------------------------
INSERT INTO public.categories (id, name, icon, color) VALUES
  (1, 'Bars cachés',     'martini',    '#8D78FF'),
  (2, 'Rooftops',        'building-2', '#C9BEFF'),
  (3, 'Spots photo',     'camera',     '#C3F25C'),
  (4, 'Lieux insolites', 'moon-star',  '#D4FF70'),
  (5, 'Vie nocturne',    'music-2',    '#A996FF'),
  (6, 'Points de vue',   'eye',        '#E9FFB5'),
  (7, 'Jardins cachés',  'trees',      '#9FD356'),
  (8, 'Culture',         'palette',    '#DDE2D8'),
  (9, 'Late Night',      'utensils',   '#7B66F0')
ON CONFLICT (id) DO UPDATE SET
  name  = EXCLUDED.name,
  icon  = EXCLUDED.icon,
  color = EXCLUDED.color;

-- --------------------------------------------------------------------------
-- 2. LIEUX (table principale du CRUD)
-- La première image de chaque tableau sert de couverture.
-- Deux lieux sont volontairement indisponibles (available = false)
-- pour montrer l'affichage grisé.
-- --------------------------------------------------------------------------
INSERT INTO public.spots (id, name, category_id, description, images, available) VALUES
  (1, 'Le Jardin des Lanternes', 7,
   '[Démo — lieu fictif] Un jardin suspendu caché derrière une porte cochère, éclairé de lanternes à la tombée de la nuit. On y entre comme dans un secret.',
   ARRAY[
     'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1600&q=80',
     'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=1600&q=80'
   ], TRUE),

  (2, 'Passage Minuit', 4,
   '[Démo — lieu fictif] Un passage couvert oublié où les vitrines restent allumées après minuit. Parfait pour une balade hors du temps.',
   ARRAY[
     'https://images.unsplash.com/photo-1471623432079-b009d30b6729?auto=format&fit=crop&w=1600&q=80',
     'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?auto=format&fit=crop&w=1600&q=80'
   ], TRUE),

  (3, 'Le Balcon de Belleville', 6,
   '[Démo — lieu fictif] Un belvédère discret d''où l''on voit toute la ville s''allumer, la tour Eiffel en ligne de mire.',
   ARRAY[
     'https://images.unsplash.com/photo-1500313830540-7b6650a74fd0?auto=format&fit=crop&w=1600&q=80',
     'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?auto=format&fit=crop&w=1600&q=80'
   ], TRUE),

  (4, 'Toit Néon', 2,
   '[Démo — lieu fictif] Un rooftop sous guirlandes lumineuses, au-dessus des toits en zinc. DJ set imaginaire le vendredi.',
   ARRAY[
     'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1600&q=80',
     'https://images.unsplash.com/photo-1524396309943-e03f5249f002?auto=format&fit=crop&w=1600&q=80'
   ], TRUE),

  (5, 'L''Alambic Secret', 1,
   '[Démo — lieu fictif] Un speakeasy sans enseigne : il faut trouver la bonne porte. Cocktails fumés et lumière violette.',
   ARRAY[
     'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=1600&q=80',
     'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1600&q=80',
     'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1600&q=80'
   ], TRUE),

  (6, 'Café des Insomniaques', 9,
   '[Démo — lieu fictif] Le café de ceux qui ne dorment pas : espresso, playlists lo-fi et conversations jusqu''au petit matin.',
   ARRAY[
     'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=80',
     'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=80'
   ], TRUE),

  (7, 'La Cave Électrique', 5,
   '[Démo — lieu fictif] Une cave voûtée transformée en salle de concerts live. Son brut, lumières saturées, foule au plus près de la scène.',
   ARRAY[
     'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
     'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=80'
   ], TRUE),

  (8, 'Galerie Lumen', 8,
   '[Démo — lieu fictif] Une galerie qui ouvre ses portes en nocturne : peinture ancienne et installations lumineuses dans le même lieu.',
   ARRAY[
     'https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&w=1600&q=80',
     'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1600&q=80'
   ], TRUE),

  (9, 'Escalier des Reflets', 3,
   '[Démo — lieu fictif] Des marches où les néons se reflètent après la pluie. Le spot préféré des photographes de nuit.',
   ARRAY[
     'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1600&q=80',
     'https://images.unsplash.com/photo-1556103255-4443dbae8e5a?auto=format&fit=crop&w=1600&q=80'
   ], TRUE),

  (10, 'Quai des Ombres', 3,
   '[Démo — lieu fictif] Un bout de quai au ras de l''eau, idéal pour capter l''heure bleue et les lumières des ponts.',
   ARRAY[
     'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1600&q=80',
     'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80'
   ], TRUE),

  (11, 'Bistrot Quatre Heures', 9,
   '[Démo — lieu fictif] Une table tardive pour les fins de soirée affamées. Indisponible dans la démo pour montrer l''état grisé.',
   ARRAY[
     'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
     'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80'
   ], FALSE),

  (12, 'Cour des Glycines', 7,
   '[Démo — lieu fictif] Une cour intérieure sous verrière, envahie de plantes. Un îlot de calme à deux pas de l''agitation.',
   ARRAY[
     'https://images.unsplash.com/photo-1560624052-449f5ddf0c31?auto=format&fit=crop&w=1600&q=80',
     'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=1600&q=80'
   ], TRUE),

  (13, 'Le Club Souterrain', 5,
   '[Démo — lieu fictif] Un club caché sous la ville, pluie de confettis et basses profondes. Indisponible dans la démo.',
   ARRAY[
     'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1600&q=80',
     'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80'
   ], FALSE),

  (14, 'Bar des Archives', 1,
   '[Démo — lieu fictif] Un bar à cocktails aux étagères dorées, où chaque recette porte le nom d''un document oublié.',
   ARRAY[
     'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1600&q=80',
     'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1600&q=80'
   ], TRUE)
ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description,
  images      = EXCLUDED.images,
  available   = EXCLUDED.available;

-- --------------------------------------------------------------------------
-- 3. FICHES DE LOCALISATION (une par lieu)
-- Le conflit est testé sur spot_id (UNIQUE) plutôt que sur id : si l'API a
-- déjà créé une fiche pour ce lieu, on la met à jour au lieu d'échouer.
-- --------------------------------------------------------------------------
INSERT INTO public.spot_infos (id, spot_id, address, city, latitude, longitude) VALUES
  (1,  1,  'Rue de la Roquette, 75011 Paris',         'Paris', 48.8556, 2.3780),
  (2,  2,  'Passage des Panoramas, 75002 Paris',      'Paris', 48.8711, 2.3420),
  (3,  3,  'Rue Piat, 75020 Paris',                   'Paris', 48.8718, 2.3847),
  (4,  4,  'Rue du Faubourg Saint-Denis, 75010 Paris','Paris', 48.8735, 2.3540),
  (5,  5,  'Rue Oberkampf, 75011 Paris',              'Paris', 48.8650, 2.3740),
  (6,  6,  'Rue des Martyrs, 75009 Paris',            'Paris', 48.8800, 2.3390),
  (7,  7,  'Rue de Lappe, 75011 Paris',               'Paris', 48.8538, 2.3725),
  (8,  8,  'Rue de Turenne, 75003 Paris',             'Paris', 48.8600, 2.3640),
  (9,  9,  'Rue Foyatier, 75018 Paris',               'Paris', 48.8857, 2.3415),
  (10, 10, 'Quai de la Tournelle, 75005 Paris',       'Paris', 48.8510, 2.3540),
  (11, 11, 'Rue Montorgueil, 75002 Paris',            'Paris', 48.8650, 2.3470),
  (12, 12, 'Rue de Charonne, 75011 Paris',            'Paris', 48.8545, 2.3820),
  (13, 13, 'Boulevard de Clichy, 75018 Paris',        'Paris', 48.8822, 2.3376),
  (14, 14, 'Rue des Archives, 75003 Paris',           'Paris', 48.8615, 2.3570)
ON CONFLICT (spot_id) DO UPDATE SET
  address   = EXCLUDED.address,
  city      = EXCLUDED.city,
  latitude  = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;

-- --------------------------------------------------------------------------
-- 4. RÉALIGNEMENT DES COMPTEURS D'IDENTIFIANTS
-- Comme on a inséré des id "à la main", le compteur automatique ne le sait
-- pas : sans cette étape, le prochain POST /api/spots essaierait l'id 1 et
-- échouerait (id déjà pris). On place chaque compteur sur le plus grand id.
-- --------------------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('public.categories', 'id'), (SELECT MAX(id) FROM public.categories));
SELECT setval(pg_get_serial_sequence('public.spots', 'id'),      (SELECT MAX(id) FROM public.spots));
SELECT setval(pg_get_serial_sequence('public.spot_infos', 'id'), (SELECT MAX(id) FROM public.spot_infos));

COMMIT;
