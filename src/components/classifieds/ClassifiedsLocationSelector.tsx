"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  EstadoCombobox,
  CidadeCombobox,
} from "@/components/ui/LocationComboboxes";
import { useAuthContext } from "@/contexts/AuthContext";
import type { LocationFilter } from "@/hooks/useLocationFilters";
import { cn } from "@/lib/utils";

interface ClassifiedsLocationSelectorProps {
  location: LocationFilter;
  onChange: (location: LocationFilter) => void;
  className?: string;
}

export function ClassifiedsLocationSelector({
  location,
  onChange,
  className,
}: ClassifiedsLocationSelectorProps) {
  const { profile } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(location.state || "");
  const [city, setCity] = useState(location.city || "");

  useEffect(() => {
    setState(location.state || "");
    setCity(location.city || "");
  }, [location.state, location.city]);

  const displayLabel = useMemo(() => {
    if (location.city && location.state) {
      return `${location.city} - ${location.state}`;
    }
    if (location.state) {
      return location.state;
    }
    if (profile?.location_city && profile?.location_state) {
      return `${profile.location_city} - ${profile.location_state}`;
    }
    if (profile?.location_state) {
      return profile.location_state;
    }
    return "Todas as regiões";
  }, [location.city, location.state, profile]);

  const applyLocation = () => {
    if (city && state) {
      onChange({ type: "custom", state, city, country: "Brasil" });
    } else if (state) {
      onChange({ type: "state", state, city: undefined, country: "Brasil" });
    } else {
      onChange({ type: "all" });
    }
    setOpen(false);
  };

  const clearLocation = () => {
    setState("");
    setCity("");
    onChange({ type: "all" });
    setOpen(false);
  };

  const useMyLocation = () => {
    if (!profile?.location_state) return;
    const nextState = profile.location_state;
    const nextCity = profile.location_city || "";
    setState(nextState);
    setCity(nextCity);
    onChange({
      type: nextCity ? "custom" : "state",
      state: nextState,
      city: nextCity || undefined,
      country: "Brasil",
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 max-w-[220px] sm:max-w-[280px] text-sm font-medium text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white transition-colors",
            className,
          )}
          aria-label="Selecionar localidade"
        >
          <MapPin className="h-4 w-4 text-slate-500 dark:text-zinc-400 shrink-0" />
          <span className="truncate">{displayLabel}</span>
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[300px] p-4 rounded-2xl border-slate-100 dark:border-zinc-800 shadow-lg"
      >
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Filtrar por localidade
          </p>
          <EstadoCombobox
            value={state}
            onValueChange={(value) => {
              setState(value);
              setCity("");
            }}
            className="rounded-xl"
          />
          <CidadeCombobox
            estadoSigla={state}
            value={city}
            onValueChange={setCity}
            disabled={!state}
            className="rounded-xl"
          />
          <div className="flex flex-col gap-2 pt-1">
            {profile?.location_state && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={useMyLocation}
                className="justify-start rounded-xl text-slate-600"
              >
                Usar minha localização
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearLocation}
                className="flex-1 rounded-xl"
              >
                Todas
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={applyLocation}
                className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-900 text-white"
              >
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
