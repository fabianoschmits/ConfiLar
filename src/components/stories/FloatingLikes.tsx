"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LikeUser {
  id: string;
  full_name: string;
  avatar_url?: string;
  is_premium: boolean;
  created_at: string;
}

interface FloatingLikesProps {
  likeUsers: LikeUser[];
  isVisible: boolean;
}

interface FloatingLike extends LikeUser {
  animationId: string;
  delay: number;
}

export function FloatingLikes({ likeUsers, isVisible }: FloatingLikesProps) {
  const [floatingLikes, setFloatingLikes] = useState<FloatingLike[]>([]);
  const lastLikesHashRef = useRef<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Criar um "hash" estável dos likes para comparar mudanças
  // Inclui quantidade e IDs para detectar novos likes imediatamente
  const likesHash = useMemo(() => {
    if (!likeUsers || likeUsers.length === 0) return "";
    // Incluir quantidade e IDs para detectar novos likes
    return `${likeUsers.length}-${likeUsers
      .map((like) => `${like.id}-${like.is_premium}`)
      .sort()
      .join(",")}`;
  }, [likeUsers]);

  useEffect(() => {
    // Limpar timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!isVisible || !likeUsers || likeUsers.length === 0) {
      setFloatingLikes([]);
      lastLikesHashRef.current = "";
      return;
    }

    // Só atualizar se os likes realmente mudaram (comparar hash)
    if (likesHash === lastLikesHashRef.current) {
      return; // Nada mudou, não fazer nada
    }

    lastLikesHashRef.current = likesHash;

    // Função para embaralhar array (Fisher-Yates shuffle - verdadeiramente aleatório)
    const shuffleArray = <T,>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Função para criar novo conjunto de likes
    const createFloatingLikes = () => {
      // Mostrar 3-5 likes aleatórios (ou menos se não houver tantos)
      const numToShow = Math.min(
        Math.max(3, Math.floor(Math.random() * 3) + 3),
        likeUsers.length,
      );

      // Embaralhar verdadeiramente aleatório usando Fisher-Yates
      const shuffled = shuffleArray(likeUsers);
      const selected = shuffled.slice(0, numToShow);

      // Criar likes com delays escalonados aleatórios (entre 0 e 400ms)
      return selected.map((like, index) => ({
        ...like,
        animationId: `${like.id}-${Date.now()}-${Math.random()}-${index}`,
        delay: index * 200 + Math.random() * 100, // Delay base + variação aleatória
      }));
    };

    // Criar primeiro conjunto
    setFloatingLikes(createFloatingLikes());

    // Criar um loop contínuo para sempre mostrar novos likes aleatórios
    // Intervalo variável entre 3-5 segundos para mais aleatoriedade
    const scheduleNext = () => {
      const nextInterval = 3000 + Math.random() * 2000; // Entre 3-5 segundos
      timeoutRef.current = setTimeout(() => {
        setFloatingLikes(createFloatingLikes());
        scheduleNext(); // Agendar próximo ciclo
      }, nextInterval);
    };

    // Iniciar o ciclo contínuo
    if (likeUsers.length > 0) {
      scheduleNext();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [likesHash, isVisible, likeUsers]); // Agora podemos usar likeUsers porque comparamos o hash

  if (!isVisible || floatingLikes.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 md:right-[calc((100vw-42rem)/2+1rem)] md:max-w-2xl bottom-0 top-0 pointer-events-none z-20 w-20">
      {floatingLikes.map((like) => (
        <FloatingHeart key={like.animationId} like={like} />
      ))}
    </div>
  );
}

function FloatingHeart({ like }: { like: FloatingLike }) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Delay para iniciar a animação
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, like.delay);

    return () => clearTimeout(timer);
  }, [like.delay]);

  if (!shouldRender) return null;

  return (
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2"
      style={{
        animation: "floatHeart 3.5s ease-out forwards",
        animationDelay: "0ms",
      }}
    >
      <div className="relative flex items-center justify-center">
        {/* Coração de fundo */}
        <div
          className={`absolute inset-0 rounded-full blur-md ${
            like.is_premium
              ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
              : "bg-gradient-to-r from-red-400 to-red-600"
          }`}
          style={{ transform: "scale(1.2)" }}
        />

        {/* Container do coração com avatar */}
        <div
          className={`relative flex items-center justify-center w-16 h-16 rounded-full ${
            like.is_premium
              ? "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600"
              : "bg-gradient-to-br from-red-400 via-red-500 to-red-600"
          } shadow-lg`}
        >
          {/* Avatar do usuário */}
          <Avatar className="w-10 h-10 border-2 border-white">
            <AvatarImage src={like.avatar_url || undefined} />
            <AvatarFallback className="bg-white text-xs font-bold">
              {like.full_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Ícone de coração pequeno no canto */}
          <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md">
            <Heart
              className={`h-3 w-3 ${
                like.is_premium
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-red-500 fill-red-500"
              }`}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes floatHeart {
          0% {
            transform: translateY(0) translateX(0) scale(0.5);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          15% {
            transform: translateY(-15vh) translateX(0) scale(1);
          }
          30% {
            transform: translateY(-30vh) translateX(25px) scale(1) rotate(15deg);
          }
          50% {
            transform: translateY(-50vh) translateX(-25px) scale(0.95)
              rotate(-15deg);
          }
          70% {
            transform: translateY(-70vh) translateX(20px) scale(0.85)
              rotate(10deg);
          }
          85% {
            opacity: 0.9;
            transform: translateY(-85vh) translateX(-15px) scale(0.7);
          }
          95% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100vh) translateX(0) scale(0.4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
