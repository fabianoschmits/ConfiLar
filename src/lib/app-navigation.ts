import {
  Home,
  Rows3,
  Search,
  BriefcaseBusiness,
  MessageCircle,
  UserRound,
  Heart,
  Star,
  UserPlus,
  FileText,
  Award,
  Coins,
  Crown,
  ShoppingBag,
  Send,
  LogIn,
  type LucideIcon,
} from "lucide-react";

export interface NavigationProfile {
  id: string;
  user_type: "client" | "professional";
}

export type AppShortcut = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
} & ({ href: string; action: "link" } | { action: "chat"; href?: never });

export interface ShortcutGroup {
  id: string;
  label: string;
  shortcuts: AppShortcut[];
}

// One inventory for the tab bar, home and account menu: moving a shortcut
// never removes its destination from the account menu.
export function getShortcutGroups(
  profile: NavigationProfile | null,
): ShortcutGroup[] {
  const groups: ShortcutGroup[] = [
    {
      id: "explore",
      label: "Explorar",
      shortcuts: [
        {
          id: "home",
          label: "Início",
          description: "Seus atalhos e sua conta",
          action: "link",
          href: profile ? "/home" : "/",
          icon: Home,
        },
        {
          id: "feed",
          label: "Feed",
          description: "Publicações da comunidade",
          action: "link",
          href: "/feed",
          icon: Rows3,
        },
        {
          id: "search",
          label: "Buscar",
          description: "Encontre um profissional",
          action: "link",
          href: "/buscar",
          icon: Search,
        },
        {
          id: "classifieds",
          label: "Classificados",
          description: "Serviços e pedidos",
          action: "link",
          href: "/classificados",
          icon: BriefcaseBusiness,
        },
      ],
    },
  ];
  if (!profile) return groups;
  groups.push({
    id: "account",
    label: "Minha conta",
    shortcuts: [
      {
        id: "profile",
        label: "Meu perfil",
        description: "Veja seu perfil público",
        action: "link",
        href: `/perfil/${profile.id}`,
        icon: UserRound,
      },
      {
        id: "messages",
        label: "Mensagens",
        description: "Acesse suas conversas",
        action: "chat",
        icon: MessageCircle,
      },
      {
        id: "favorites",
        label: "Favoritos",
        description: "Seus profissionais salvos",
        action: "link",
        href: "/favoritos",
        icon: Heart,
      },
      {
        id: "reviews",
        label: "Avaliações",
        description: "Acompanhe suas avaliações",
        action: "link",
        href: "/avaliacoes",
        icon: Star,
      },
      {
        id: "referrals",
        label: "Indicações",
        description: "Convide seus amigos",
        action: "link",
        href: "/indicacoes",
        icon: UserPlus,
      },
    ],
  });
  if (profile.user_type === "professional")
    groups.push({
      id: "work",
      label: "Meu trabalho",
      shortcuts: [
        {
          id: "portfolio",
          label: "Portfólio",
          description: "Organize seus projetos",
          action: "link",
          href: "/portfolio",
          icon: FileText,
        },
        {
          id: "reputation",
          label: "Reputação",
          description: "Veja como você é avaliado",
          action: "link",
          href: "/reputacao",
          icon: Award,
        },
      ],
    });
  groups.push({
    id: "points",
    label: "ConfiPoints",
    shortcuts: [
      {
        id: "points",
        label: "Meus pontos",
        description: "Saldo e atividades",
        action: "link",
        href: "/confipoints/dashboard",
        icon: Coins,
      },
      {
        id: "shop",
        label: "Loja Premium",
        description: "Benefícios para sua conta",
        action: "link",
        href: "/confipoints/comprar",
        icon: Crown,
      },
      {
        id: "purchases",
        label: "Minhas compras",
        description: "Histórico de compras",
        action: "link",
        href: "/confipoints/compras",
        icon: ShoppingBag,
      },
      {
        id: "transfer",
        label: "Transferir pontos",
        description: "Envie pontos a alguém",
        action: "link",
        href: "/confipoints/transferir",
        icon: Send,
      },
    ],
  });
  return groups;
}

export function getMobileShortcuts(
  profile: NavigationProfile | null,
): AppShortcut[] {
  const all = getShortcutGroups(profile).flatMap((group) => group.shortcuts);
  const primary = ["home", "feed", "search", "classifieds"].map(
    (id) => all.find((shortcut) => shortcut.id === id)!,
  );
  return [
    ...primary,
    profile
      ? all.find((shortcut) => shortcut.id === "messages")!
      : {
          id: "login",
          label: "Entrar",
          description: "Entre na sua conta",
          action: "link",
          href: "/auth",
          icon: LogIn,
        },
  ];
}

export function getHomeShortcuts(profile: NavigationProfile): AppShortcut[] {
  const all = getShortcutGroups(profile).flatMap((group) => group.shortcuts);
  const ids =
    profile.user_type === "professional"
      ? [
          "portfolio",
          "messages",
          "reputation",
          "reviews",
          "favorites",
          "points",
        ]
      : ["favorites", "messages", "reviews", "profile", "points", "referrals"];
  return ids.map((id) => all.find((shortcut) => shortcut.id === id)!);
}

export function isShortcutActive(
  pathname: string,
  shortcut: AppShortcut,
): boolean {
  return Boolean(
    shortcut.href &&
    (pathname === shortcut.href ||
      (shortcut.href !== "/" && pathname.startsWith(shortcut.href + "/"))),
  );
}
