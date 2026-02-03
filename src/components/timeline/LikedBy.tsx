"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useReactionUsers } from "@/hooks/useReactions";
import { useAuthContext } from "@/contexts/AuthContext";
import { LikesModal } from "./LikesModal";

interface LikedByProps {
  postId: string;
  likesCount: number;
}

export function LikedBy({ postId, likesCount }: LikedByProps) {
  const { user } = useAuthContext();
  const { reactionUsers, isLoading } = useReactionUsers(postId);
  const [showLikesModal, setShowLikesModal] = useState(false);

  // Organizar usuários: priorizar o usuário atual se ele curtiu
  const currentUserLike =
    user?.id && reactionUsers
      ? reactionUsers.find((u) => u.user_id === user.id)
      : null;
  const otherUsers = reactionUsers
    ? reactionUsers.filter((u) => u.user_id !== user?.id)
    : [];

  // Embaralhar outros usuários aleatoriamente (sempre chamar useMemo antes de qualquer return)
  const shuffledOtherUsers = useMemo(() => {
    if (otherUsers.length === 0) return [];
    const shuffled = [...otherUsers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [otherUsers]);

  // Se não há curtidas, não mostrar nada
  if (likesCount === 0) {
    return null;
  }

  // Se está carregando, não mostrar nada ainda
  if (isLoading || !reactionUsers) {
    return null;
  }

  // Se não há usuários mas há curtidas (pode ser que o hook ainda não carregou)
  if (reactionUsers.length === 0) {
    return null;
  }

  // Lista de usuários para mostrar nos avatares (máximo 5): usuário atual primeiro, depois outros aleatórios
  const avatarsToShow: typeof reactionUsers = [];
  if (currentUserLike) {
    avatarsToShow.push(currentUserLike);
  }
  // Adicionar outros usuários aleatórios até completar 5 no total
  const remainingSlots = 5 - avatarsToShow.length;
  avatarsToShow.push(...shuffledOtherUsers.slice(0, remainingSlots));

  // Lista de usuários para mostrar nos nomes (máximo 2): usuário atual primeiro, depois os outros (para mobile)
  const usersToShow: typeof reactionUsers = [];
  if (currentUserLike) {
    usersToShow.push(currentUserLike);
  }
  // Adicionar outros usuários até completar 2 no total
  const remainingNameSlots = 2 - usersToShow.length;
  usersToShow.push(...otherUsers.slice(0, remainingNameSlots));

  // Lista de usuários para mostrar nos nomes na versão desktop (máximo 4): usuário atual primeiro, depois os outros
  const usersToShowDesktop: typeof reactionUsers = [];
  if (currentUserLike) {
    usersToShowDesktop.push(currentUserLike);
  }
  // Adicionar outros usuários até completar 4 no total
  const remainingNameSlotsDesktop = 4 - usersToShowDesktop.length;
  usersToShowDesktop.push(...otherUsers.slice(0, remainingNameSlotsDesktop));

  // Contar quantas pessoas restam (para mobile - 2 nomes)
  const remainingCount = reactionUsers.length - usersToShow.length;

  // Contar quantas pessoas restam (para desktop - 4 nomes)
  const remainingCountDesktop =
    reactionUsers.length - usersToShowDesktop.length;

  // Se há 2 ou menos usuários, mostrar todos
  if (reactionUsers.length <= 2) {
    const userNames = reactionUsers.map((u) => u.full_name || u.name);
    const lastUser = userNames.pop();
    const namesText =
      userNames.length > 0 ? `${userNames.join(", ")} e ${lastUser}` : lastUser;

    return (
      <div className="-ml-2 -mr-4 pr-4 pb-2 flex items-center gap-1.5 w-full">
        <div className="flex relative flex-shrink-0">
          {avatarsToShow.slice(0, 5).map((u, index) => {
            // Alternar posição vertical para criar efeito de empilhamento
            const verticalOffset = index % 2 === 0 ? "-1.5px" : "1.5px";
            return (
              <Avatar
                key={u.id}
                className="w-5 h-5 border-2 border-white dark:border-black flex-shrink-0"
                style={{
                  zIndex: avatarsToShow.length - index,
                  transform: `translateY(${verticalOffset})`,
                  marginLeft: index === 0 ? "0" : "-7px",
                }}
              >
                <AvatarImage src={u.avatar_url || undefined} alt={u.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                  {(u.full_name || u.name).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            );
          })}
        </div>
        <p
          className="text-xs text-gray-900 dark:text-white flex-1 min-w-0 overflow-hidden"
          style={{ fontSize: "clamp(0.6rem, 1.5vw, 0.7rem)" }}
        >
          <span className="font-semibold whitespace-nowrap">
            Curtido por{" "}
            {reactionUsers.map((u, index) => (
              <span key={u.id} className="inline">
                {index > 0 && index < reactionUsers.length - 1 && ", "}
                {index === reactionUsers.length - 1 && index > 0 && " e "}
                <Link
                  href={`/perfil/${u.user_id}`}
                  className="text-inherit no-underline hover:opacity-80 transition-opacity"
                >
                  {u.full_name || u.name}
                </Link>
              </span>
            ))}
          </span>
        </p>
      </div>
    );
  }

  // Se há mais de 2 usuários, mostrar os 2 primeiros e "outras X pessoas"
  const firstTwoNames = usersToShow.map((u) => u.full_name || u.name);
  // Formatar nomes: "João e Maria"
  const namesText =
    firstTwoNames.length === 2
      ? `${firstTwoNames[0]} e ${firstTwoNames[1]}`
      : firstTwoNames[0];

  return (
    <>
      {/* Versão Mobile: mostrar apenas 2 nomes + "e outras X pessoas" */}
      <div className="-ml-2 -mr-4 pr-4 pb-2 flex items-center gap-1.5 w-full md:hidden">
        <div className="flex relative flex-shrink-0">
          {avatarsToShow.slice(0, 5).map((u, index) => {
            // Alternar posição vertical para criar efeito de empilhamento
            const verticalOffset = index % 2 === 0 ? "-1.5px" : "1.5px";
            return (
              <Avatar
                key={u.id}
                className="w-5 h-5 border-2 border-white dark:border-black flex-shrink-0"
                style={{
                  zIndex: avatarsToShow.length - index,
                  transform: `translateY(${verticalOffset})`,
                  marginLeft: index === 0 ? "0" : "-7px",
                }}
              >
                <AvatarImage src={u.avatar_url || undefined} alt={u.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                  {(u.full_name || u.name).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            );
          })}
        </div>
        <p
          className="text-xs text-gray-900 dark:text-white flex-1 min-w-0 overflow-hidden"
          style={{ fontSize: "clamp(0.6rem, 1.5vw, 0.7rem)" }}
        >
          <span className="font-semibold whitespace-nowrap">
            Curtido por{" "}
            {usersToShow.map((u, index) => (
              <span key={u.id} className="inline">
                {index > 0 && ", "}
                <Link
                  href={`/perfil/${u.user_id}`}
                  className="text-inherit no-underline hover:opacity-80 transition-opacity"
                >
                  {u.full_name || u.name}
                </Link>
              </span>
            ))}
            {remainingCount > 0 && (
              <>
                {" e "}
                <button
                  onClick={() => setShowLikesModal(true)}
                  className="font-semibold hover:underline text-gray-900 dark:text-white underline"
                >
                  outras {remainingCount}{" "}
                  {remainingCount === 1 ? "pessoa" : "pessoas"}
                </button>
              </>
            )}
          </span>
        </p>
      </div>

      {/* Versão Desktop: mostrar 4 nomes + "e outras X pessoas" */}
      <div className="-ml-2 -mr-4 pr-4 pb-2 flex items-center gap-1.5 w-full hidden md:flex">
        <div className="flex relative flex-shrink-0">
          {avatarsToShow.slice(0, 5).map((u, index) => {
            // Alternar posição vertical para criar efeito de empilhamento
            const verticalOffset = index % 2 === 0 ? "-1.5px" : "1.5px";
            return (
              <Avatar
                key={u.id}
                className="w-5 h-5 border-2 border-white dark:border-black flex-shrink-0"
                style={{
                  zIndex: avatarsToShow.length - index,
                  transform: `translateY(${verticalOffset})`,
                  marginLeft: index === 0 ? "0" : "-7px",
                }}
              >
                <AvatarImage src={u.avatar_url || undefined} alt={u.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                  {(u.full_name || u.name).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            );
          })}
        </div>
        <p
          className="text-xs text-gray-900 dark:text-white flex-1 min-w-0 overflow-hidden"
          style={{ fontSize: "clamp(0.6rem, 1.5vw, 0.7rem)" }}
        >
          <span className="font-semibold whitespace-nowrap">
            Curtido por{" "}
            {usersToShowDesktop.map((u, index) => (
              <span key={u.id} className="inline">
                {index > 0 && ", "}
                <Link
                  href={`/perfil/${u.user_id}`}
                  className="text-inherit no-underline hover:opacity-80 transition-opacity"
                >
                  {u.full_name || u.name}
                </Link>
              </span>
            ))}
            {remainingCountDesktop > 0 && (
              <>
                {" e "}
                <button
                  onClick={() => setShowLikesModal(true)}
                  className="font-semibold hover:underline text-gray-900 dark:text-white underline"
                >
                  outras {remainingCountDesktop}{" "}
                  {remainingCountDesktop === 1 ? "pessoa" : "pessoas"}
                </button>
              </>
            )}
          </span>
        </p>
      </div>

      <LikesModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        postId={postId}
      />
    </>
  );
}
