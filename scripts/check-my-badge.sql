-- Verificar badge do usuário logado
-- Substitua o UUID pelo seu ID de usuário

SELECT 
  p.id,
  p.full_name,
  urs.tier,
  urs.total_referrals,
  urs.total_points,
  urs.rank,
  urs.referral_code,
  CASE urs.tier
    WHEN 'diamond' THEN '💠 Diamante'
    WHEN 'platinum' THEN '💎 Platina'
    WHEN 'gold' THEN '🥇 Ouro'
    WHEN 'silver' THEN '🥈 Prata'
    WHEN 'bronze' THEN '🥉 Bronze'
    ELSE '⚪ Sem Badge'
  END as badge_visual
FROM profiles p
LEFT JOIN user_referral_stats urs ON urs.user_id = p.id
WHERE p.id = 'ab14ee2f-99b4-4606-bcc4-653b908f5978' -- SEU ID AQUI
OR p.full_name = 'Luis Silva Santos'; -- OU SEU NOME

-- Ver todos os usuários com badges
SELECT 
  p.full_name,
  urs.tier,
  urs.total_referrals,
  CASE urs.tier
    WHEN 'diamond' THEN '💠'
    WHEN 'platinum' THEN '💎'
    WHEN 'gold' THEN '🥇'
    WHEN 'silver' THEN '🥈'
    WHEN 'bronze' THEN '🥉'
    ELSE '⚪'
  END as badge
FROM profiles p
INNER JOIN user_referral_stats urs ON urs.user_id = p.id
WHERE urs.tier != 'none'
ORDER BY urs.total_referrals DESC;

