-- =====================================================
-- VERIFICAR ESTRUTURA ATUAL DO BANCO
-- =====================================================

-- 1. VERIFICAR ESTRUTURA DE points_packages
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'points_packages' 
ORDER BY ordinal_position;

-- 2. VERIFICAR ESTRUTURA DE points_purchases
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'points_purchases' 
ORDER BY ordinal_position;

-- 3. VERIFICAR ESTRUTURA DE points_withdrawals
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'points_withdrawals' 
ORDER BY ordinal_position;

-- 4. VERIFICAR ESTRUTURA DE points_transfers
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'points_transfers' 
ORDER BY ordinal_position;

-- 5. VERIFICAR ESTRUTURA DE points_store_items
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'points_store_items' 
ORDER BY ordinal_position;

-- 6. VERIFICAR ESTRUTURA DE points_store_purchases
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'points_store_purchases' 
ORDER BY ordinal_position;

-- 7. VERIFICAR ESTRUTURA DE points_system_config
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'points_system_config' 
ORDER BY ordinal_position;

-- 8. VERIFICAR DADOS EXISTENTES EM points_packages
SELECT * FROM points_packages LIMIT 5;

-- 9. VERIFICAR CONSTRAINTS DE points_packages
SELECT 
  tc.constraint_name, 
  tc.constraint_type, 
  ccu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu 
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'points_packages';
