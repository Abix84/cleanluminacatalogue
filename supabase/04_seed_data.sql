-- ==========================================
-- DONNÉES INITIALES (SEED DATA)
-- CleanExpress & Lumina Distribution
-- ==========================================

-- ==========================================
-- 1. MARQUES
-- ==========================================

-- Marques CleanExpress
INSERT INTO brands (name) VALUES
  ('ATLAS'),
  ('Clean Bag'),
  ('Dar Al Alwan'),
  ('Decoland'),
  ('Délicia'),
  ('Extra Clean'),
  ('Fibrax'),
  ('Forza Clean'),
  ('Frams'),
  ('GoldenDam'),
  ('Hachfa'),
  ('Isabel'),
  ('Louganet'),
  ('Luxabrosse'),
  ('MAMA menage'),
  ('Medinet'),
  ('Netsol'),
  ('Oriber'),
  ('PALC'),
  ('SpeedFire'),
  ('STERIMAX'),
  ('TECMECA'),
  ('Toma Net'),
  ('VDF Savon Liquide'),
  ('Vico')
ON CONFLICT (name) DO NOTHING;

-- Marques Lumina Distribution
INSERT INTO brands (name) VALUES
  ('Force Xpress')
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- 2. CATÉGORIES
-- ==========================================

INSERT INTO utility_categories (name, color) VALUES
  -- 1. Détergents ménagers
  ('Détergents multi-usages', '#FF6B6B'),
  ('Nettoyants sols (carrelage, marbre, parquet…)', '#4ECDC4'),
  ('Nettoyants sanitaires (salle de bain, WC)', '#45B7D1'),
  ('Nettoyants cuisine', '#FFA07A'),
  ('Nettoyants vitres', '#98D8C8'),
  ('Désinfectants ménagers', '#F7DC6F'),
  ('Produits d''entretien pour meubles et bois', '#BB8FCE'),
  
  -- 2. Lessives & soins du linge
  ('Lessive liquide', '#85C1E2'),
  ('Lessive en poudre', '#F8B739'),
  ('Lessive capsules', '#E74C3C'),
  ('Lessive spéciale teintures foncées / délicates', '#9B59B6'),
  ('Adoucissants / assouplissants', '#3498DB'),
  ('Détachants textiles', '#1ABC9C'),
  ('Désinfectants pour linge', '#E67E22'),
  
  -- 3. Produits d'hygiène corporelle
  ('Savon liquide et solide', '#16A085'),
  ('Gel douche', '#27AE60'),
  ('Shampooing / après-shampooing', '#2ECC71'),
  ('Crèmes lavantes pour mains', '#F39C12'),
  ('Gel hydroalcoolique', '#E74C3C'),
  
  -- 4. Produits pour vaisselle
  ('Liquide vaisselle à la main', '#3498DB'),
  ('Tablettes / gel pour lave-vaisselle', '#9B59B6'),
  ('Rinçage / sel régénérant', '#34495E'),
  ('Dégraissants vaisselle', '#E67E22'),
  
  -- 5. Désinfectants & assainissants
  ('Désinfectants surfaces', '#C0392B'),
  ('Désinfectants sols', '#8E44AD'),
  ('Aérosols désinfectants', '#2980B9'),
  ('Désinfectants alimentaires (HACCP)', '#27AE60'),
  ('Bactéricide, fongicide, virucide', '#16A085'),
  
  -- 6. Dégraissants & décapants
  ('Dégraissants industriels', '#F39C12'),
  ('Dégraissants cuisine (four, plaque, hotte)', '#E67E22'),
  ('Décapants sols', '#D35400'),
  ('Anti-calcaire', '#95A5A6'),
  ('Nettoyants pour acier inoxydable', '#7F8C8D'),
  
  -- 7. Produits sanitaires & WC
  ('Gel WC', '#3498DB'),
  ('Pastilles WC', '#2980B9'),
  ('Blocs WC', '#5DADE2'),
  ('Désodorisants pour toilettes', '#85C1E2'),
  ('Nettoyants anti-calcaire WC', '#AED6F1'),
  
  -- 8. Produits pour vitres & miroirs
  ('Nettoyant vitres standard', '#52BE80'),
  ('Nettoyant anti-buée', '#58D68D'),
  ('Nettoyant vitres à base d''alcool', '#82E0AA'),
  
  -- 9. Déodorants & assainisseurs d'air
  ('Aérosols parfumés', '#F1948A'),
  ('Désodorisants textiles', '#EC7063'),
  ('Neutraliseurs d''odeurs', '#E74C3C'),
  ('Diffuseurs automatiques ou manuels', '#CB4335'),
  
  -- 10. Produits industriels & professionnels
  ('Détergents concentrés', '#85929E'),
  ('Détergents pour machines industrielles', '#5D6D7E'),
  ('Produits pour lave-batterie', '#34495E'),
  ('Détergents pour sols d''entrepôts', '#2C3E50'),
  ('Nettoyants haute pression', '#1B2631'),
  
  -- 11. Gamme écologique / éco-responsable
  ('Détergents écologiques certifiés', '#27AE60'),
  ('Savon noir', '#229954'),
  ('Bicarbonate de soude', '#52BE80'),
  ('Vinaigre ménager', '#58D68D'),
  ('Lessives sans phosphates', '#82E0AA'),
  
  -- 12. Accessoires & consommables
  ('Éponges, brosses, serpillières', '#95A5A6'),
  ('Sacs poubelle', '#7F8C8D'),
  ('Gants ménagers', '#566573'),
  ('Balais / raclettes', '#34495E'),
  ('Papiers essuie-tout / bobines', '#2C3E50')
ON CONFLICT (name) DO NOTHING;

