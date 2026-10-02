"use client";

import {
  Bell,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Heart,
  Info,
  MessageCircle,
  Share2,
  ShieldCheck,
  Star,
  Trophy,
  TriangleAlert,
  UserPlus,
} from "lucide-react";
export function NotificationIcon({
  type,
  className = "",
}: {
  type: string;
  className?: string;
}) {
  const icons = {
    message: MessageCircle,
    support: MessageCircle,
    comment: MessageCircle,
    reply: MessageCircle,
    favorite: Heart,
    like: Heart,
    premium_like: Heart,
    review: Star,
    recommendation: Star,
    booking: CalendarDays,
    system: Bell,
    info: Info,
    share: Share2,
    verification: ShieldCheck,
    achievement: Trophy,
    success: CheckCircle2,
    warning: TriangleAlert,
    error: CircleAlert,
    follow: UserPlus,
  };
  const Icon = icons[type as keyof typeof icons] || Bell;
  const tone =
    type === "error"
      ? "text-red-700 dark:text-red-300"
      : type === "warning"
        ? "text-amber-700 dark:text-amber-300"
        : "text-[var(--cl-teal)]";
  return (
    <span
      aria-hidden="true"
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--cl-mist)] ${tone} ${className}`}
    >
      <Icon className="h-5 w-5" strokeWidth={1.8} />
    </span>
  );
}
