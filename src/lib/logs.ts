/**
 * Sistema de Logs do ConfiLar
 *
 * Funções helper para registrar logs importantes do sistema
 * em português, focando nas ações mais relevantes dos usuários
 */

import { supabase } from "./supabase";

interface LogDetails {
  [key: string]: any;
}

/**
 * Registra um log no sistema
 */
async function createLog(
  level: "INFO" | "WARNING" | "ERROR" | "SUCCESS",
  category: string,
  action: string,
  message: string,
  details?: LogDetails,
  userId?: string,
  endpoint?: string,
  statusCode?: number,
) {
  try {
    const { error } = await supabase.rpc("create_system_log", {
      p_level: level,
      p_category: category,
      p_action: action,
      p_message: message,
      p_details: details || {},
      p_user_id: userId || null,
      p_endpoint: endpoint || null,
      p_status_code: statusCode || null,
    });

    if (error) {
      console.error("Erro ao criar log:", error);
    }
  } catch (error) {
    console.error("Erro ao criar log:", error);
  }
}

/**
 * ============================================
 * LOGS DE AUTENTICAÇÃO
 * ============================================
 */

/**
 * Usuário fez login
 */
export async function logUserLogin(
  userId: string,
  userName: string,
  email: string,
) {
  await createLog(
    "SUCCESS",
    "auth",
    "user_login",
    `${userName} fez login`,
    { email },
    userId,
    "/auth",
    200,
  );
}

/**
 * Usuário fez logout
 */
export async function logUserLogout(userId: string, userName: string) {
  await createLog(
    "INFO",
    "auth",
    "user_logout",
    `${userName} fez logout`,
    {},
    userId,
    "/auth/logout",
    200,
  );
}

/**
 * Novo usuário se cadastrou
 */
export async function logUserSignup(
  userId: string,
  userName: string,
  email: string,
  userType: string,
) {
  await createLog(
    "SUCCESS",
    "auth",
    "user_signup",
    `${userName} criou uma conta`,
    { email, user_type: userType },
    userId,
    "/auth",
    201,
  );
}

/**
 * Usuário recuperou senha
 */
export async function logPasswordReset(email: string) {
  await createLog(
    "INFO",
    "auth",
    "password_reset",
    `Solicitação de recuperação de senha para ${email}`,
    { email },
    undefined,
    "/auth/recuperar-senha",
    200,
  );
}

/**
 * Usuário verificou email
 */
export async function logEmailVerification(userId: string, userName: string) {
  await createLog(
    "SUCCESS",
    "auth",
    "email_verification",
    `${userName} verificou o email`,
    {},
    userId,
    "/auth/verificacao",
    200,
  );
}

/**
 * ============================================
 * LOGS DE POSTS
 * ============================================
 */

/**
 * Usuário criou um post
 */
export async function logPostCreated(
  userId: string,
  userName: string,
  postId: string,
  postType?: string,
) {
  await createLog(
    "INFO",
    "posts",
    "post_created",
    `${userName} criou um post`,
    { post_id: postId, post_type: postType },
    userId,
    "/api/posts",
    201,
  );
}

/**
 * Usuário atualizou um post
 */
export async function logPostUpdated(
  userId: string,
  userName: string,
  postId: string,
) {
  await createLog(
    "INFO",
    "posts",
    "post_updated",
    `${userName} atualizou um post`,
    { post_id: postId },
    userId,
    "/api/posts",
    200,
  );
}

/**
 * Usuário deletou um post
 */
export async function logPostDeleted(
  userId: string,
  userName: string,
  postId: string,
) {
  await createLog(
    "WARNING",
    "posts",
    "post_deleted",
    `${userName} deletou um post`,
    { post_id: postId },
    userId,
    "/api/posts",
    200,
  );
}

/**
 * ============================================
 * LOGS DE CLASSIFICADOS/ANÚNCIOS
 * ============================================
 */

/**
 * Usuário criou um anúncio
 */
export async function logClassifiedCreated(
  userId: string,
  userName: string,
  classifiedId: string,
  title: string,
) {
  await createLog(
    "INFO",
    "classifieds",
    "classified_created",
    `${userName} criou um anúncio: ${title}`,
    { classified_id: classifiedId, title },
    userId,
    "/api/classifieds",
    201,
  );
}

/**
 * Usuário atualizou um anúncio
 */
export async function logClassifiedUpdated(
  userId: string,
  userName: string,
  classifiedId: string,
  title: string,
) {
  await createLog(
    "INFO",
    "classifieds",
    "classified_updated",
    `${userName} atualizou o anúncio: ${title}`,
    { classified_id: classifiedId, title },
    userId,
    "/api/classifieds",
    200,
  );
}

/**
 * Usuário deletou um anúncio
 */
export async function logClassifiedDeleted(
  userId: string,
  userName: string,
  classifiedId: string,
) {
  await createLog(
    "WARNING",
    "classifieds",
    "classified_deleted",
    `${userName} deletou um anúncio`,
    { classified_id: classifiedId },
    userId,
    "/api/classifieds",
    200,
  );
}

/**
 * ============================================
 * LOGS DE PERFIL
 * ============================================
 */

/**
 * Usuário atualizou perfil
 */
export async function logProfileUpdated(userId: string, userName: string) {
  await createLog(
    "INFO",
    "users",
    "profile_updated",
    `${userName} atualizou o perfil`,
    {},
    userId,
    "/api/profile",
    200,
  );
}

/**
 * Usuário completou onboarding
 */
export async function logOnboardingCompleted(userId: string, userName: string) {
  await createLog(
    "SUCCESS",
    "users",
    "onboarding_completed",
    `${userName} completou o onboarding`,
    {},
    userId,
    "/onboarding",
    200,
  );
}

/**
 * ============================================
 * LOGS DE PONTOS/CONFIPOINTS
 * ============================================
 */

/**
 * Usuário ganhou pontos
 */
export async function logPointsEarned(
  userId: string,
  userName: string,
  points: number,
  reason: string,
) {
  await createLog(
    "INFO",
    "points",
    "points_earned",
    `${userName} ganhou ${points} pontos`,
    { points, reason },
    userId,
    "/api/points",
    200,
  );
}

/**
 * Usuário gastou pontos
 */
export async function logPointsSpent(
  userId: string,
  userName: string,
  points: number,
  reason: string,
) {
  await createLog(
    "INFO",
    "points",
    "points_spent",
    `${userName} gastou ${points} pontos`,
    { points, reason },
    userId,
    "/api/points",
    200,
  );
}

/**
 * ============================================
 * LOGS DE INDICAÇÕES
 * ============================================
 */

/**
 * Nova indicação criada
 */
export async function logReferralCreated(
  userId: string,
  userName: string,
  referredUserId: string,
  referredUserName: string,
) {
  await createLog(
    "SUCCESS",
    "referrals",
    "referral_created",
    `${userName} indicou ${referredUserName}`,
    { referred_user_id: referredUserId },
    userId,
    "/api/referrals",
    201,
  );
}

/**
 * ============================================
 * LOGS DE ERROS
 * ============================================
 */

/**
 * Erro no sistema
 */
export async function logError(
  error: Error,
  context: string,
  userId?: string,
  endpoint?: string,
) {
  await createLog(
    "ERROR",
    "system",
    "error",
    `Erro em ${context}: ${error.message}`,
    {
      error_type: error.constructor.name,
      stack: error.stack?.substring(0, 500), // Limitar tamanho do stack
    },
    userId,
    endpoint,
    500,
  );
}

/**
 * ============================================
 * LOGS DE ADMINISTRAÇÃO
 * ============================================
 */

/**
 * Admin baniu usuário
 */
export async function logUserBanned(
  adminUserId: string,
  adminName: string,
  bannedUserId: string,
  bannedUserName: string,
  reason: string,
) {
  await createLog(
    "WARNING",
    "admin",
    "user_banned",
    `${adminName} baniu ${bannedUserName}`,
    { banned_user_id: bannedUserId, reason },
    adminUserId,
    "/gestao-confi/dashboard/bans",
    200,
  );
}

/**
 * Admin desbaniu usuário
 */
export async function logUserUnbanned(
  adminUserId: string,
  adminName: string,
  unbannedUserId: string,
  unbannedUserName: string,
) {
  await createLog(
    "INFO",
    "admin",
    "user_unbanned",
    `${adminName} desbaniu ${unbannedUserName}`,
    { unbanned_user_id: unbannedUserId },
    adminUserId,
    "/admin/bans",
    200,
  );
}
