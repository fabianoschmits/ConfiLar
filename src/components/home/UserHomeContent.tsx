"use client";

import Link from "next/link";
import {
  Search,
  MapPin,
  ChevronRight,
  Settings,
  HelpCircle,
  UserPlus,
  BriefcaseBusiness,
  Rows3,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getHomeShortcuts } from "@/lib/app-navigation";
import { ShortcutLink } from "@/components/navigation/ShortcutLink";
import type { Profile } from "@/types/database";

type HomeProfile = Pick<
  Profile,
  | "id"
  | "user_type"
  | "full_name"
  | "avatar_url"
  | "location_city"
  | "location_state"
>;

export function UserHomeContent({
  profile,
  onOpenChat,
  onEditProfile,
}: {
  profile: HomeProfile;
  onOpenChat: () => void;
  onEditProfile: () => void;
}) {
  const professional = profile.user_type === "professional";
  const firstName =
    (profile.full_name || "").trim().split(/\s+/)[0] || "bem-vindo";
  const location = [profile.location_city, profile.location_state]
    .filter(Boolean)
    .join(" - ");
  const discover = professional
    ? {
        href: "/buscar",
        title: "Encontre profissionais",
        description: "Conheça quem trabalha na sua região",
        icon: Search,
      }
    : {
        href: "/classificados",
        title: "Serviços e pedidos",
        description: "Explore os anúncios da comunidade",
        icon: BriefcaseBusiness,
      };

  return (
    <div className="app-screen">
      <div className="app-page app-page--narrow home-dashboard">
        <header className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold leading-tight text-[var(--cl-ink)] sm:text-3xl">
              Olá, {firstName}
            </h1>
            <p className="mt-1 text-sm text-[var(--cl-ink-secondary)]">
              {professional
                ? "Seu trabalho, suas conexões."
                : "O que vamos resolver hoje?"}
            </p>
            {location && (
              <p className="mt-2 flex items-start gap-1.5 text-sm text-[var(--cl-ink-muted)]">
                <MapPin
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0"
                />
                <span>{location}</span>
              </p>
            )}
          </div>
          <Link
            href={`/perfil/${profile.id}`}
            aria-label="Ver meu perfil"
            className="home-avatar-link shrink-0 rounded-full"
          >
            <Avatar className="h-16 w-16 border border-[var(--cl-border)]">
              <AvatarImage
                src={profile.avatar_url || undefined}
                alt={profile.full_name}
                className="object-cover"
              />
              <AvatarFallback className="bg-[var(--cl-mist)] text-xl text-[var(--cl-teal)]">
                {firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        </header>

        <section className="home-primary" aria-labelledby="home-primary-title">
          <h2
            id="home-primary-title"
            className="text-xl font-extrabold leading-tight"
          >
            {professional
              ? "Encontre sua próxima oportunidade"
              : "Encontre alguém de confiança"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--cl-ink-secondary)]">
            {professional
              ? "Veja os pedidos da comunidade e apresente seus serviços nos classificados."
              : "Busque profissionais, conheça os serviços e converse antes de contratar."}
          </p>
          {professional ? (
            <Button asChild className="mt-4 w-full sm:w-auto">
              <Link href="/classificados">
                <BriefcaseBusiness
                  aria-hidden="true"
                  className="mr-2 h-5 w-5"
                />
                Explorar classificados
                <ChevronRight aria-hidden="true" className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Link href="/buscar" className="home-search mt-4">
              <Search
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-[var(--cl-teal)]"
              />
              <span>Qual serviço você precisa?</span>
              <ChevronRight
                aria-hidden="true"
                className="ml-auto h-4 w-4 shrink-0"
              />
            </Link>
          )}
        </section>

        <section aria-labelledby="home-shortcuts-title">
          <h2 id="home-shortcuts-title" className="mb-3 text-lg font-extrabold">
            Meus atalhos
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {getHomeShortcuts(profile).map((shortcut) => (
              <ShortcutLink
                key={shortcut.id}
                shortcut={shortcut}
                onOpenChat={onOpenChat}
                className="home-shortcut"
              >
                <span className="home-shortcut-icon">
                  <shortcut.icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="text-sm font-extrabold">{shortcut.label}</span>
                <span className="text-xs leading-relaxed text-[var(--cl-ink-secondary)]">
                  {shortcut.description}
                </span>
              </ShortcutLink>
            ))}
          </div>
        </section>

        <section aria-labelledby="home-discover-title">
          <h2 id="home-discover-title" className="mb-3 text-lg font-extrabold">
            Na comunidade
          </h2>
          <div className="home-link-list">
            <Link href={discover.href} className="home-list-link">
              <discover.icon
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-[var(--cl-teal)]"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold">
                  {discover.title}
                </span>
                <span className="block text-xs leading-relaxed text-[var(--cl-ink-secondary)]">
                  {discover.description}
                </span>
              </span>
              <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0" />
            </Link>
            <Link href="/feed" className="home-list-link">
              <Rows3
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-[var(--cl-teal)]"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold">
                  Feed social
                </span>
                <span className="block text-xs leading-relaxed text-[var(--cl-ink-secondary)]">
                  Compartilhe e acompanhe as publicações
                </span>
              </span>
              <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </section>

        <section aria-labelledby="home-account-title">
          <h2 id="home-account-title" className="mb-3 text-lg font-extrabold">
            Sua conta
          </h2>
          <div className="home-link-list">
            <button
              type="button"
              onClick={onEditProfile}
              className="home-list-link"
            >
              <Settings
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-[var(--cl-teal)]"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold">
                  Editar meu perfil
                </span>
                <span className="block text-xs leading-relaxed text-[var(--cl-ink-secondary)]">
                  Foto, dados pessoais e preferências
                </span>
              </span>
              <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0" />
            </button>
            {professional && (
              <Link href="/indicacoes" className="home-list-link">
                <UserPlus
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-[var(--cl-teal)]"
                />
                <span className="flex-1 text-sm font-extrabold">
                  Convidar amigos
                </span>
                <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0" />
              </Link>
            )}
            <Link href="/ajuda" className="home-list-link">
              <HelpCircle
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-[var(--cl-teal)]"
              />
              <span className="flex-1 text-sm font-extrabold">
                Preciso de ajuda
              </span>
              <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0" />
            </Link>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[var(--cl-ink-muted)]">
            Todos os atalhos estão no menu da sua foto, no cabeçalho.
          </p>
        </section>
      </div>
    </div>
  );
}
