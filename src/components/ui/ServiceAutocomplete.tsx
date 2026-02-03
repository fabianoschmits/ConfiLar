"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { services } from "@/data/services";

interface ServiceAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ServiceAutocomplete({
  value,
  onChange,
  placeholder = "Selecione um serviço...",
  className = "",
  disabled = false,
}: ServiceAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedService = services.find((service) => service.id === value);

  const filteredServices = searchTerm
    ? services.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : services;

  // Sincronizar searchTerm com value quando value mudar externamente
  useEffect(() => {
    if (value && selectedService) {
      setSearchTerm(selectedService.name);
    } else if (!value) {
      setSearchTerm("");
    }
  }, [value, selectedService]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between", className)}
        >
          {value ? (
            <>
              <Briefcase className="mr-2 h-4 w-4" />
              {selectedService?.name}
            </>
          ) : (
            <>
              <Briefcase className="mr-2 h-4 w-4" />
              {placeholder}
            </>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar serviço..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {filteredServices.length === 0 && (
              <CommandEmpty>Nenhum serviço encontrado.</CommandEmpty>
            )}
            {filteredServices.length > 0 && (
              <CommandGroup>
                {filteredServices.map((service) => (
                  <CommandItem
                    key={service.id}
                    value={service.id}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === service.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{service.name}</div>
                      {service.description && (
                        <div className="text-xs text-gray-500">
                          {service.description}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
