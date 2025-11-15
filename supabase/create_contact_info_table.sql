-- Table pour stocker les informations de contact
CREATE TABLE IF NOT EXISTS contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_contact_info_updated_at ON contact_info(updated_at);

-- RLS (Row Level Security) - Permettre la lecture à tous les utilisateurs authentifiés
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;

-- Politique : Tous les utilisateurs authentifiés peuvent lire
CREATE POLICY "Les utilisateurs authentifiés peuvent lire les informations de contact"
  ON contact_info
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique : Seuls les admins peuvent modifier
CREATE POLICY "Seuls les admins peuvent modifier les informations de contact"
  ON contact_info
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_contact_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_contact_info_updated_at
  BEFORE UPDATE ON contact_info
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_info_updated_at();

-- Commentaires pour la documentation
COMMENT ON TABLE contact_info IS 'Table pour stocker les informations de contact de l''entreprise';
COMMENT ON COLUMN contact_info.email IS 'Adresse email de contact principale';
COMMENT ON COLUMN contact_info.phone IS 'Numéro de téléphone de contact';
COMMENT ON COLUMN contact_info.address IS 'Adresse postale complète';
COMMENT ON COLUMN contact_info.city IS 'Ville';
COMMENT ON COLUMN contact_info.postal_code IS 'Code postal';
COMMENT ON COLUMN contact_info.country IS 'Pays';
COMMENT ON COLUMN contact_info.website IS 'URL du site web (optionnel)';

