-- Tambahkan data diri tambahan ke tabel profil yang sudah ada.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone VARCHAR(30),
  ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS birth_place VARCHAR(100);
