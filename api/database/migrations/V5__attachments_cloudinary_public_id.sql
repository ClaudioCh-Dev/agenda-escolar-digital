-- Cloudinary public_id para borrado remoto de archivos
ALTER TABLE attachments
  ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT;
