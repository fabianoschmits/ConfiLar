"use client";

import { CompleteProfileData } from "@/hooks/useProfileData";
import {
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Music2,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

interface SocialLinksDisplayProps {
  profile: CompleteProfileData;
}

const socialPlatforms = [
  {
    key: "instagram_url" as keyof CompleteProfileData,
    icon: Instagram,
    label: "Instagram",
    baseUrl: "https://instagram.com/",
    color: "from-purple-500 to-pink-500",
    hoverColor: "hover:from-purple-600 hover:to-pink-600",
  },
  {
    key: "facebook_url" as keyof CompleteProfileData,
    icon: Facebook,
    label: "Facebook",
    baseUrl: "https://facebook.com/",
    color: "from-blue-600 to-blue-700",
    hoverColor: "hover:from-blue-700 hover:to-blue-800",
  },
  {
    key: "linkedin_url" as keyof CompleteProfileData,
    icon: Linkedin,
    label: "LinkedIn",
    baseUrl: "https://linkedin.com/in/",
    color: "from-blue-500 to-blue-600",
    hoverColor: "hover:from-blue-600 hover:to-blue-700",
  },
  {
    key: "twitter_url" as keyof CompleteProfileData,
    icon: Twitter,
    label: "Twitter/X",
    baseUrl: "https://x.com/",
    color: "from-sky-400 to-sky-500",
    hoverColor: "hover:from-sky-500 hover:to-sky-600",
  },
  {
    key: "youtube_url" as keyof CompleteProfileData,
    icon: Youtube,
    label: "YouTube",
    baseUrl: "https://youtube.com/@",
    color: "from-red-500 to-red-600",
    hoverColor: "hover:from-red-600 hover:to-red-700",
  },
  {
    key: "tiktok_url" as keyof CompleteProfileData,
    icon: Music2,
    label: "TikTok",
    baseUrl: "https://tiktok.com/@",
    color: "from-gray-800 to-gray-900",
    hoverColor: "hover:from-gray-900 hover:to-black",
  },
];

export function SocialLinksDisplay({ profile }: SocialLinksDisplayProps) {
  // Filtrar apenas as redes sociais que o usuário configurou
  const activeSocials = socialPlatforms.filter(
    (platform) => profile[platform.key],
  );

  // Adicionar WhatsApp se configurado
  const hasWhatsApp = profile.whatsapp_number;

  // Se não há nenhuma rede social configurada, não renderizar nada
  if (activeSocials.length === 0 && !hasWhatsApp) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="text-2xl">🔗</span>
        Redes Sociais
      </h3>
      <div className="flex flex-wrap gap-3">
        {activeSocials.map((platform) => {
          const Icon = platform.icon;
          const handle = profile[platform.key] as string;
          // Se o valor já for uma URL (devido a dados legados), usar direto.
          // Caso contrário, construir com baseUrl.
          const url = handle.startsWith("http")
            ? handle
            : `${platform.baseUrl}${handle}`;

          return (
            <Link
              key={platform.key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r ${platform.color} ${platform.hoverColor} text-white shadow-lg transform hover:scale-105 transition-all duration-200`}
              title={`Visitar ${platform.label}`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{platform.label}</span>
            </Link>
          );
        })}

        {hasWhatsApp && (
          <Link
            href={`https://wa.me/${profile.whatsapp_number?.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
            title="Enviar mensagem no WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">WhatsApp</span>
          </Link>
        )}
      </div>
    </div>
  );
}
