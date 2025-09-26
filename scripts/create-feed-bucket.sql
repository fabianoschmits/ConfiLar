-- Script para criar bucket de imagens do feed no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar bucket para imagens do feed
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'feed-images',
  'feed-images', 
  true,
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Configurar políticas de acesso para o bucket
-- Política para permitir leitura pública
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'feed-images');

-- Política para permitir upload apenas para usuários autenticados
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'feed-images' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir que usuários atualizem apenas seus próprios arquivos
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'feed-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que usuários deletem apenas seus próprios arquivos
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'feed-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE id = 'feed-images';
