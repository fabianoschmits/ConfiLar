"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "card" | "text" | "avatar" | "button" | "circle";
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

export function Skeleton({
  className,
  variant = "default",
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const baseClasses = "skeleton-shimmer bg-gray-200 dark:bg-zinc-800";

  const variantClasses = {
    default: "rounded-md",
    card: "rounded-lg border border-gray-200 dark:border-gray-700",
    text: "rounded",
    avatar: "rounded-full",
    button: "rounded-md",
    circle: "rounded-full",
  };

  const combinedStyle = {
    ...(width && { width: typeof width === "number" ? `${width}px` : width }),
    ...(height && {
      height: typeof height === "number" ? `${height}px` : height,
    }),
    ...style,
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={combinedStyle}
      {...props}
    />
  );
}

// Skeletons pré-definidos para casos comuns
export function PostSkeleton() {
  return (
    <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-fade-in">
      {/* Header do post */}
      <div className="flex items-center space-x-3">
        <Skeleton variant="avatar" width={40} height={40} />
        <div className="space-y-2 flex-1">
          <Skeleton width="25%" height={16} />
          <Skeleton width="15%" height={12} />
        </div>
      </div>

      {/* Conteúdo do post */}
      <div className="space-y-2">
        <Skeleton width="100%" height={20} />
        <Skeleton width="80%" height={20} />
        <Skeleton width="60%" height={20} />
      </div>

      {/* Imagens */}
      <div className="grid grid-cols-2 gap-2">
        <Skeleton width="100%" height={120} />
        <Skeleton width="100%" height={120} />
      </div>

      {/* Ações */}
      <div className="flex items-center space-x-4">
        <Skeleton width={60} height={32} />
        <Skeleton width={80} height={32} />
        <Skeleton width={60} height={32} />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Header do perfil */}
      <div className="flex items-center space-x-4">
        <Skeleton variant="avatar" width={80} height={80} />
        <div className="space-y-3 flex-1">
          <Skeleton width="40%" height={24} />
          <Skeleton width="30%" height={16} />
          <Skeleton width="50%" height={14} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center space-y-2">
          <Skeleton width="100%" height={20} />
          <Skeleton width="60%" height={14} />
        </div>
        <div className="text-center space-y-2">
          <Skeleton width="100%" height={20} />
          <Skeleton width="60%" height={14} />
        </div>
        <div className="text-center space-y-2">
          <Skeleton width="100%" height={20} />
          <Skeleton width="60%" height={14} />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Skeleton width="100%" height={16} />
        <Skeleton width="90%" height={16} />
        <Skeleton width="70%" height={16} />
      </div>
    </div>
  );
}

// Skeleton para a seção de Stories
export function StoriesSkeleton() {
  return (
    <div className="bg-[var(--cl-surface)] border-b border-gray-200 dark:border-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 min-w-[70px] flex-shrink-0"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse border-2 border-gray-300 dark:border-gray-700" />
              </div>
              <div className="h-3 w-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Skeleton para um post do feed (estilo Instagram)
export function InstagramPostSkeleton() {
  return (
    <article className="bg-[var(--cl-surface)] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
      {/* Header do post */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Skeleton variant="avatar" width={40} height={40} />
          <div className="space-y-2">
            <Skeleton width={120} height={16} />
            <Skeleton width={80} height={12} />
          </div>
        </div>
        <Skeleton width={24} height={24} className="rounded-full" />
      </div>

      {/* Imagem/Media do post */}
      <div className="w-full bg-gray-100 dark:bg-gray-900">
        <Skeleton width="100%" height={400} className="rounded-none" />
      </div>

      {/* Botões de interação */}
      <div className="flex items-center gap-1 px-4 py-2 border-t border-gray-100 dark:border-gray-800/50">
        <Skeleton width={16} height={16} className="rounded" />
        <Skeleton width={16} height={16} className="rounded" />
        <Skeleton width={16} height={16} className="rounded" />
        <Skeleton width={16} height={16} className="rounded ml-1" />
      </div>

      {/* Descrição e curtidas */}
      <div className="px-4 py-2 space-y-2">
        <Skeleton width={100} height={14} />
        <div className="space-y-1">
          <Skeleton width="100%" height={16} />
          <Skeleton width="80%" height={16} />
        </div>
      </div>
    </article>
  );
}

// Skeleton completo para a página de feed (mantido para compatibilidade, mas não deve ser usado)
// Use InstagramPostSkeleton diretamente para os posts
export function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <InstagramPostSkeleton key={i} />
      ))}
    </div>
  );
}

export function ClassifiedsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 animate-fade-in"
        >
          <Skeleton width="100%" height={120} />
          <Skeleton width="80%" height={18} />
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={16} />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2"
          >
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={24} />
            <Skeleton width="80%" height={12} />
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
          <Skeleton width="50%" height={20} />
          <Skeleton width="100%" height={200} />
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
          <Skeleton width="50%" height={20} />
          <Skeleton width="100%" height={200} />
        </div>
      </div>
    </div>
  );
}

// Skeleton para lista de transações
export function TransactionSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-4 p-4 border rounded-lg animate-fade-in"
        >
          <Skeleton variant="circle" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={12} />
          </div>
          <Skeleton width={80} height={20} />
        </div>
      ))}
    </div>
  );
}

// Skeleton para cards de pacotes
export function PackageSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <Skeleton width="50%" height={24} />
            <Skeleton variant="circle" width={48} height={48} />
          </div>
          <Skeleton width="30%" height={20} />
          <div className="space-y-2">
            <Skeleton width="100%" height={16} />
            <Skeleton width="90%" height={16} />
            <Skeleton width="80%" height={16} />
          </div>
          <Skeleton width="100%" height={40} />
        </div>
      ))}
    </div>
  );
}

// Skeleton para card de anúncio classificado
export function ClassifiedsCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.06)] animate-fade-in bg-white dark:bg-zinc-900">
      <div className="px-4 pt-4 pb-3 flex items-start gap-3">
        <Skeleton variant="circle" width={44} height={44} />
        <div className="space-y-1.5 flex-1">
          <Skeleton width="45%" height={16} className="rounded" />
          <Skeleton width="35%" height={12} className="rounded" />
          <Skeleton width="55%" height={10} className="rounded" />
        </div>
        <Skeleton width={70} height={24} className="rounded-full" />
      </div>

      <div className="px-4 pb-3 grid grid-cols-1 sm:grid-cols-[42%_1fr] gap-3">
        <Skeleton width="100%" height={160} className="rounded-xl" />
        <div className="space-y-2 py-1">
          <Skeleton width="80%" height={20} className="rounded" />
          <Skeleton width="100%" height={12} />
          <Skeleton width="90%" height={12} />
          <Skeleton width="60%" height={12} />
          <div className="flex gap-1.5 pt-2">
            <Skeleton width={56} height={22} className="rounded-full" />
            <Skeleton width={56} height={22} className="rounded-full" />
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-slate-100 dark:border-zinc-800 flex justify-between">
        <div className="flex gap-3">
          <Skeleton width={40} height={20} className="rounded" />
          <Skeleton width={40} height={20} className="rounded" />
        </div>
        <Skeleton width={96} height={36} className="rounded-full" />
      </div>
    </div>
  );
}

export function ClassifiedsListSkeleton({
  viewMode = "grid",
}: {
  viewMode?: "grid" | "list";
}) {
  const count = viewMode === "grid" ? 6 : 4;
  return (
    <div
      className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ClassifiedsCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton para card de usuário (buscar, favoritos)
export function UserCardSkeleton() {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 relative border-gray-200 dark:border-gray-800 animate-fade-in">
      <CardContent className="p-6">
        {/* Badge de Serviços (canto superior direito) */}
        <div className="absolute top-2 right-2">
          <Skeleton width={70} height={24} className="rounded-md" />
        </div>

        {/* Header do Card */}
        <div className="flex items-start space-x-3 mb-4">
          {/* Avatar */}
          <Skeleton variant="circle" width={64} height={64} />

          <div className="flex-1 min-w-0 space-y-2">
            {/* Nome */}
            <Skeleton width="60%" height={20} />

            {/* Badges (Tipo e Disponibilidade) */}
            <div className="flex items-center gap-2 flex-wrap">
              <Skeleton width={90} height={20} className="rounded-full" />
              <Skeleton width={80} height={20} className="rounded-full" />
            </div>

            {/* Localização */}
            <Skeleton width="70%" height={14} />
          </div>
        </div>

        {/* Separator Line Top */}
        <div className="h-px bg-gray-100 dark:bg-gray-800 my-3" />

        {/* Bio */}
        <div className="mb-4 space-y-2">
          <Skeleton width="100%" height={16} />
          <Skeleton width="85%" height={16} />
        </div>

        {/* Separator Line Bottom */}
        <div className="h-px bg-gray-100 dark:bg-gray-800 my-3" />

        {/* Avaliações */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex gap-1 mr-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} width={16} height={16} className="rounded-sm" />
            ))}
          </div>
          <Skeleton width={120} height={14} />
        </div>

        {/* Footer do Card */}
        <div className="flex items-center justify-between">
          <Skeleton width={80} height={14} />
          <div className="flex gap-2">
            <Skeleton width={36} height={32} className="rounded-md" />
            <Skeleton width={36} height={32} className="rounded-md" />
            <Skeleton width={90} height={32} className="rounded-md" />
            <Skeleton width={36} height={32} className="rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton para lista de usuários
export function UserListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <UserCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton completo para página de perfil
export function ProfilePageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header do perfil */}
      <Card className="mb-8">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          {/* Header com 3 pontinhos */}
          <div className="flex justify-end mb-4">
            <Skeleton width={32} height={32} className="rounded-md" />
          </div>

          <div className="flex flex-col items-center text-center space-y-6">
            {/* Avatar Centralizado */}
            <Skeleton variant="circle" width={120} height={120} />

            {/* Nome e Badges Centralizados */}
            <div className="space-y-3 w-full">
              <Skeleton width="50%" height={32} className="mx-auto" />

              {/* Badges */}
              <div className="flex flex-wrap justify-center items-center gap-2">
                <Skeleton width={100} height={24} className="rounded-full" />
                <Skeleton width={100} height={24} className="rounded-full" />
              </div>

              {/* Informações de Rating e Tipo Centralizadas */}
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <Skeleton width={150} height={16} />
                <Skeleton width={100} height={16} />
                <Skeleton width={120} height={16} />
              </div>

              {/* Bio Centralizada */}
              <div className="space-y-2 pt-2 max-w-2xl mx-auto">
                <Skeleton width="100%" height={16} />
                <Skeleton width="90%" height={16} className="mx-auto" />
                <Skeleton width="70%" height={16} className="mx-auto" />
              </div>
            </div>

            {/* Botões de Ação Centralizados */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Skeleton width={180} height={40} className="rounded-md" />
              <Skeleton width={140} height={40} className="rounded-md" />
            </div>

            {/* Estatísticas */}
            <div className="w-full max-w-2xl mx-auto mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="text-center space-y-1">
                    <Skeleton width={60} height={28} className="mx-auto" />
                    <Skeleton width={80} height={14} className="mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs skeleton */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex space-x-4">
          <Skeleton width={100} height={40} />
          <Skeleton width={100} height={40} />
          <Skeleton width={100} height={40} />
          <Skeleton width={100} height={40} />
        </div>
      </div>

      {/* Conteúdo das tabs */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2"
              >
                <Skeleton width="100%" height={150} />
                <Skeleton width="80%" height={16} />
                <Skeleton width="60%" height={14} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Skeleton para card de avaliação
export function ReviewCardSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 animate-fade-in bg-[var(--cl-surface)]">
      <div className="flex items-start space-x-3">
        {/* Avatar do revisor */}
        <Skeleton variant="circle" width={48} height={48} />

        <div className="flex-1 space-y-2">
          {/* Nome e data */}
          <div className="flex items-center justify-between">
            <Skeleton width="40%" height={18} />
            <Skeleton width="30%" height={14} />
          </div>

          {/* Rating com estrelas */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  width={16}
                  height={16}
                  className="rounded-sm"
                />
              ))}
            </div>
            <Skeleton width={80} height={14} />
          </div>

          {/* Comentário */}
          <div className="space-y-2 pt-2">
            <Skeleton width="100%" height={16} />
            <Skeleton width="90%" height={16} />
            <Skeleton width="70%" height={16} />
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <Skeleton width={80} height={32} className="rounded-md" />
        <Skeleton width={80} height={32} className="rounded-md" />
        <Skeleton width={80} height={32} className="rounded-md" />
      </div>
    </div>
  );
}

// Skeleton para lista de avaliações
export function ReviewListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ReviewCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton para card de favorito
export function FavoriteCardSkeleton() {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-[var(--cl-surface)] border-gray-200 dark:border-gray-700 animate-fade-in">
      <CardContent className="p-3 sm:p-4">
        {/* Header do Card com Avatar e Info do Usuário */}
        <div className="flex items-start space-x-3 mb-3">
          <Skeleton variant="circle" width={48} height={48} />

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton width="50%" height={20} />
              <Skeleton width={24} height={24} className="rounded-md" />
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2">
              <Skeleton width={90} height={20} className="rounded-full" />
              <Skeleton width={80} height={20} className="rounded-full" />
            </div>
          </div>
        </div>

        {/* Conteúdo do Card */}
        <div className="mb-3 space-y-2">
          {/* Bio */}
          <Skeleton width="100%" height={16} />
          <Skeleton width="85%" height={16} />

          {/* Localização e data */}
          <div className="space-y-1 pt-2">
            <Skeleton width="60%" height={14} />
            <Skeleton width="50%" height={14} />
            <Skeleton width="70%" height={14} />
          </div>
        </div>

        {/* Footer do Card */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <Skeleton width={100} height={32} className="rounded-md" />
          <Skeleton width={36} height={32} className="rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton para lista de favoritos
export function FavoriteListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <FavoriteCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton para card de indicação
export function ReferralCardSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 animate-fade-in">
      <div className="flex items-center space-x-3">
        <Skeleton variant="circle" width={48} height={48} />

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton width="50%" height={18} />
            <Skeleton width={80} height={20} className="rounded-full" />
          </div>

          <Skeleton width="40%" height={14} />
          <Skeleton width="60%" height={14} />
        </div>
      </div>
    </div>
  );
}

// Skeleton para lista de indicações
export function ReferralListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ReferralCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton para tabela admin
export function AdminTableSkeleton({
  rows = 5,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden animate-fade-in">
      {/* Header */}
      <div
        className="bg-gray-50 dark:bg-gray-900 p-4 grid gap-4"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width="80%" height={16} />
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="p-4 grid gap-4"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {Array.from({ length: cols }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                width={colIndex === cols - 1 ? "60%" : "90%"}
                height={16}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton para card de ranking
export function RankingCardSkeleton() {
  return (
    <Card className="transition-all duration-200 hover:shadow-md animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Posição */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-900">
            <Skeleton width={24} height={24} />
          </div>

          {/* Avatar */}
          <Skeleton variant="circle" width={48} height={48} />

          {/* Informações */}
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton width="50%" height={20} />
            <div className="flex items-center gap-2">
              <Skeleton width={80} height={20} className="rounded-full" />
              <Skeleton width={40} height={14} />
            </div>
          </div>

          {/* Pontos */}
          <div className="text-right space-y-1">
            <Skeleton width={80} height={24} />
            <Skeleton width={60} height={14} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton para lista de ranking
export function RankingListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <RankingCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton para card de transferência
export function TransferCardSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton variant="circle" width={40} height={40} />
          <div className="space-y-2">
            <Skeleton width={120} height={16} />
            <Skeleton width={80} height={12} />
          </div>
        </div>
        <Skeleton width={80} height={20} />
      </div>

      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <Skeleton width="100%" height={14} />
      </div>
    </div>
  );
}

// Skeleton para lista de transferências
export function TransferListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <TransferCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton para dashboard de indicações
export function ReferralDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2"
          >
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={24} />
            <Skeleton width="80%" height={12} />
          </div>
        ))}
      </div>

      {/* Link card */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
        <Skeleton width="30%" height={20} />
        <Skeleton width="100%" height={50} />
        <Skeleton width="100%" height={40} />
      </div>

      {/* Leaderboard */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
        <Skeleton width="40%" height={24} />
        <ReferralListSkeleton count={5} />
      </div>
    </div>
  );
}

// Skeleton para a landing page (página inicial)
export function LandingPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header Flutuante Skeleton */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center bg-white/10 dark:bg-black/30 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/20">
            {/* Logo */}
            <Skeleton width={180} height={48} className="rounded-lg" />

            {/* Navigation (desktop) */}
            <nav className="hidden md:flex items-center space-x-6">
              <Skeleton width={60} height={20} />
              <Skeleton width={60} height={20} />
            </nav>

            {/* Actions (desktop) */}
            <div className="hidden md:flex items-center gap-3">
              <Skeleton width={100} height={36} className="rounded-md" />
              <Skeleton width={140} height={36} className="rounded-md" />
            </div>

            {/* Mobile menu button */}
            <Skeleton width={32} height={32} className="md:hidden rounded-md" />
          </div>
        </div>
      </header>

      {/* Hero Section Skeleton */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-gray-900/95" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32 w-full">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <Skeleton width={200} height={32} className="rounded-full" />
          </div>

          {/* Title */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
            <Skeleton width={300} height={64} className="rounded-lg" />
            <Skeleton width={200} height={64} className="rounded-lg" />
            <Skeleton width={50} height={64} className="rounded-lg" />
          </div>

          {/* Description */}
          <div className="max-w-4xl mx-auto mb-4 space-y-2">
            <Skeleton width="100%" height={28} className="rounded" />
            <Skeleton width="90%" height={28} className="rounded mx-auto" />
          </div>

          {/* Sub description */}
          <div className="max-w-3xl mx-auto mb-12 space-y-2">
            <Skeleton width="100%" height={20} className="rounded" />
            <Skeleton width="85%" height={20} className="rounded mx-auto" />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Skeleton width={200} height={56} className="rounded-lg" />
            <Skeleton width={200} height={56} className="rounded-lg" />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
              >
                <Skeleton
                  width={80}
                  height={48}
                  className="mb-2 rounded-lg mx-auto"
                />
                <Skeleton
                  width={100}
                  height={16}
                  className="mb-1 rounded mx-auto"
                />
                <Skeleton width={80} height={12} className="rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sections Skeleton */}
      <section className="py-24 bg-[var(--cl-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Skeleton
              width={150}
              height={24}
              className="rounded-full mx-auto mb-4"
            />
            <Skeleton
              width={400}
              height={48}
              className="rounded-lg mx-auto mb-4"
            />
            <Skeleton width={600} height={24} className="rounded mx-auto" />
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="border-0 shadow-xl rounded-lg overflow-hidden"
              >
                <Skeleton width="100%" height={256} className="rounded-none" />
                <div className="p-6 space-y-2">
                  <Skeleton width="80%" height={20} />
                  <Skeleton width="100%" height={16} />
                  <Skeleton width="90%" height={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Skeleton */}
      <footer className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2 space-y-4">
              <Skeleton width={140} height={38} className="rounded-lg" />
              <Skeleton width="100%" height={16} />
              <Skeleton width="90%" height={16} />
            </div>
            <div className="space-y-4">
              <Skeleton width={100} height={24} />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} width={120} height={16} />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton width={100} height={24} />
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} width={180} height={16} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
