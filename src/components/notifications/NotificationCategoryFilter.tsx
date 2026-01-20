"use client";

import {
  MessageCircle,
  Star,
  Calendar,
  Shield,
  Trophy,
  Activity,
  AlertCircle,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type NotificationCategory =
  | "all"
  | "message"
  | "review"
  | "booking"
  | "verification"
  | "achievement"
  | "system"
  | "warning";

interface NotificationCategoryFilterProps {
  currentCategory: NotificationCategory;
  onSelectCategory: (category: NotificationCategory) => void;
}

export function NotificationCategoryFilter({
  currentCategory,
  onSelectCategory,
}: NotificationCategoryFilterProps) {
  const getIcon = (id: NotificationCategory) => {
    switch (id) {
      case "all":
        return <Bell className="w-4 h-4" />;
      case "message":
        return <MessageCircle className="w-4 h-4" />;
      case "review":
        return <Star className="w-4 h-4" />;
      case "booking":
        return <Calendar className="w-4 h-4" />;
      case "verification":
        return <Shield className="w-4 h-4" />;
      case "achievement":
        return <Trophy className="w-4 h-4" />;
      case "system":
        return <Activity className="w-4 h-4" />;
      case "warning":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const categories: { id: NotificationCategory; label: string }[] = [
    { id: "all", label: "Todas" },
    { id: "message", label: "Mensagens" },
    { id: "review", label: "Avaliações" },
    { id: "booking", label: "Agendamentos" },
    { id: "verification", label: "Verificação" },
    { id: "achievement", label: "Conquistas" },
    { id: "system", label: "Sistema" },
    { id: "warning", label: "Alertas" },
  ];

  return (
    <>
      {/* Mobile View - Dropdown */}
      <div className="w-full md:hidden mb-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
          Filtrar por:
        </label>
        <Select
          value={currentCategory}
          onValueChange={(value) =>
            onSelectCategory(value as NotificationCategory)
          }
        >
          <SelectTrigger className="w-full bg-background border-input">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                  {getIcon(cat.id)}
                  <span>{cat.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop View - Buttons */}
      <div className="hidden md:flex flex-wrap gap-2 pb-2">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={currentCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 transition-all rounded-full h-8",
              currentCategory === cat.id
                ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                : "border-dashed hover:border-solid hover:bg-muted/50 text-muted-foreground hover:text-foreground",
            )}
          >
            {getIcon(cat.id)}
            <span>{cat.label}</span>
          </Button>
        ))}
      </div>
    </>
  );
}
