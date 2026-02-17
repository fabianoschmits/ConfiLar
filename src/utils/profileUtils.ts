import { Profile } from "@/types/database";

/**
 * Verifica se um usuário possui o status Pro ativo,
 * validando tanto a flag is_pro quanto a data de expiração.
 */
export function isProUser(profile: Profile | null | undefined): boolean {
  if (!profile) return false;

  // Se não tem flag Pro, nem precisa checar data
  if (!profile.is_pro) return false;

  // Se não tem data de expiração, por segurança assumimos que não é Pro
  // (ou que algo está errado no registro)
  if (!profile.pro_expires_at) return false;

  const expiresAt = new Date(profile.pro_expires_at);
  const now = new Date();

  return expiresAt > now;
}

/**
 * Retorna o tempo restante formatado do status Pro
 */
export function getProRemainingTime(
  expiresAtStr: string | null | undefined,
): string | null {
  if (!expiresAtStr) return null;

  const expiresAt = new Date(expiresAtStr);
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  return `${hours}h`;
}
