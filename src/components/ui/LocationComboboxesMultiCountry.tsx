"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { useTranslations } from "next-intl";
import { LocationService } from "@/lib/location/LocationService";
import { State, City } from "@/lib/location/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // This import was in the original content but not in the instruction's code edit. Keeping it for completeness.
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationComboboxesMultiCountryProps {
  country?: string;
  stateCode?: string;
  city?: string;
  modal?: boolean;
  onCountryChange?: (country: string) => void;
  onStateChange?: (stateCode: string) => void;
  onCityChange?: (city: string) => void;
  className?: string;
}

const COUNTRIES = [
  { code: "BR", name: "Brasil", flag: "🇧🇷" },
  { code: "US", name: "United States", flag: "🇺🇸" },
];

export function LocationComboboxesMultiCountry({
  country: initialCountry,
  stateCode: initialStateCode,
  city: initialCity,
  modal = false,
  onCountryChange,
  onStateChange,
  onCityChange,
  className,
}: LocationComboboxesMultiCountryProps) {
  const { country: contextCountry, locationService } = useLocale();
  const t = useTranslations("location");

  const [country, setCountry] = useState<string>(
    initialCountry || contextCountry || "BR",
  );
  const [stateCode, setStateCode] = useState<string>(initialStateCode || "");
  const [city, setCity] = useState<string>(initialCity || "");

  // Atualizar estado interno quando as props mudarem
  useEffect(() => {
    if (initialCountry) setCountry(initialCountry);
  }, [initialCountry]);

  useEffect(() => {
    if (initialStateCode) setStateCode(initialStateCode);
  }, [initialStateCode]);

  useEffect(() => {
    if (initialCity) setCity(initialCity);
  }, [initialCity]);

  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const [countryOpen, setCountryOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  // Atualizar locationService quando país mudar
  useEffect(() => {
    if (country && (country === "BR" || country === "US")) {
      locationService.setCountry(country as "BR" | "US");
      loadStates();
    }
  }, [country, locationService]);

  // Carregar estados
  const loadStates = useCallback(async () => {
    if (!country || (country !== "BR" && country !== "US")) return;

    setLoadingStates(true);
    try {
      const service = new LocationService(country as "BR" | "US");
      const statesData = await service.getStates();
      setStates(statesData);
    } catch (error) {
      console.error("Erro ao carregar estados:", error);
    } finally {
      setLoadingStates(false);
    }
  }, [country]);

  // Carregar cidades quando estado mudar
  useEffect(() => {
    if (stateCode && country) {
      loadCities(stateCode);
    } else {
      setCities([]);
    }
  }, [stateCode, country]);

  const loadCities = useCallback(
    async (state: string) => {
      if (!state || !country) return;

      setLoadingCities(true);
      try {
        const service = new LocationService(country as "BR" | "US");
        const citiesData = await service.getCitiesByState(state);
        setCities(citiesData);
      } catch (error) {
        console.error("Erro ao carregar cidades:", error);
      } finally {
        setLoadingCities(false);
      }
    },
    [country],
  );

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    setStateCode("");
    setCity("");
    setStates([]);
    setCities([]);
    onCountryChange?.(newCountry);
  };

  const handleStateChange = (newStateCode: string) => {
    setStateCode(newStateCode);
    setCity("");
    setCities([]);
    onStateChange?.(newStateCode);
  };

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    onCityChange?.(newCity);
  };

  const selectedCountry = COUNTRIES.find((c) => c.code === country);
  const selectedState = states.find((s) => s.code === stateCode);
  const selectedCity = cities.find((c) => c.name === city);

  return (
    <div className={cn("grid grid-cols-1 gap-2 sm:gap-3", className)}>
      {/* País removido - fixo em BR */}

      {/* Estado */}
      <Popover open={stateOpen} onOpenChange={setStateOpen} modal={modal}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={stateOpen}
            className={cn(
              "w-full justify-between",
              "!bg-white dark:!bg-gray-900",
              "hover:!bg-white dark:hover:!bg-gray-900",
              "focus:!bg-white dark:focus:!bg-gray-900",
              "focus-visible:!bg-white dark:focus-visible:!bg-gray-900",
              "active:!bg-white dark:active:!bg-gray-900",
            )}
            disabled={!country || loadingStates}
          >
            {loadingStates ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : selectedState ? (
              selectedState.name
            ) : (
              t("selectState")
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] sm:w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder={t("selectState")} />
            <CommandList>
              <CommandEmpty>
                {loadingStates ? "Carregando..." : "Nenhum estado encontrado."}
              </CommandEmpty>
              <CommandGroup>
                {states.map((state) => (
                  <CommandItem
                    key={state.code}
                    value={state.code}
                    onSelect={(currentValue) => {
                      handleStateChange(state.code);
                      setStateOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        stateCode === state.code ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="truncate">{state.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Cidade */}
      <Popover open={cityOpen} onOpenChange={setCityOpen} modal={modal}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={cityOpen}
            className={cn(
              "w-full justify-between",
              "!bg-white dark:!bg-gray-900",
              "hover:!bg-white dark:hover:!bg-gray-900",
              "focus:!bg-white dark:focus:!bg-gray-900",
              "focus-visible:!bg-white dark:focus-visible:!bg-gray-900",
              "active:!bg-white dark:active:!bg-gray-900",
            )}
            disabled={!stateCode || loadingCities}
          >
            {loadingCities ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : selectedCity ? (
              selectedCity.name
            ) : (
              t("selectCity")
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] sm:w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder={t("selectCity")} />
            <CommandList>
              <CommandEmpty>
                {loadingCities ? "Carregando..." : "Nenhuma cidade encontrada."}
              </CommandEmpty>
              <CommandGroup>
                {cities.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={c.name}
                    onSelect={(currentValue) => {
                      handleCityChange(c.name);
                      setCityOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        city === c.name ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="truncate">{c.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
