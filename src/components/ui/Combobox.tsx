"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

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
import { getCategories } from "@/data/services";

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  required?: boolean;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Selecionar opção...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhuma opção encontrada.",
  className,
  buttonClassName,
  disabled = false,
  required = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", buttonClassName)}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-full p-0", className)}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Combobox específico para categorias de profissionais
export function ComboboxCategorias({
  value,
  onValueChange,
  className,
  disabled = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}) {
  // Obter categorias dos serviços centralizados
  const categories = getCategories();

  const categorias = [
    { value: "all", label: "Todas as categorias" },
    ...categories.map((category) => ({
      value: category.toLowerCase().replace(/\s+/g, "-"),
      label: category,
    })),
  ];

  return (
    <Combobox
      options={categorias}
      value={value}
      onValueChange={onValueChange}
      placeholder="Selecionar categoria..."
      searchPlaceholder="Buscar categoria..."
      emptyMessage="Nenhuma categoria encontrada."
      className={className}
      disabled={disabled}
    />
  );
}

// Combobox específico para estados brasileiros
export function ComboboxEstados({
  value,
  onValueChange,
  className,
  disabled = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}) {
  const estados = [
    { value: "ac", label: "Acre" },
    { value: "al", label: "Alagoas" },
    { value: "ap", label: "Amapá" },
    { value: "am", label: "Amazonas" },
    { value: "ba", label: "Bahia" },
    { value: "ce", label: "Ceará" },
    { value: "df", label: "Distrito Federal" },
    { value: "es", label: "Espírito Santo" },
    { value: "go", label: "Goiás" },
    { value: "ma", label: "Maranhão" },
    { value: "mt", label: "Mato Grosso" },
    { value: "ms", label: "Mato Grosso do Sul" },
    { value: "mg", label: "Minas Gerais" },
    { value: "pa", label: "Pará" },
    { value: "pb", label: "Paraíba" },
    { value: "pr", label: "Paraná" },
    { value: "pe", label: "Pernambuco" },
    { value: "pi", label: "Piauí" },
    { value: "rj", label: "Rio de Janeiro" },
    { value: "rn", label: "Rio Grande do Norte" },
    { value: "rs", label: "Rio Grande do Sul" },
    { value: "ro", label: "Rondônia" },
    { value: "rr", label: "Roraima" },
    { value: "sc", label: "Santa Catarina" },
    { value: "sp", label: "São Paulo" },
    { value: "se", label: "Sergipe" },
    { value: "to", label: "Tocantins" },
  ];

  return (
    <Combobox
      options={estados}
      value={value}
      onValueChange={onValueChange}
      placeholder="Selecionar estado..."
      searchPlaceholder="Buscar estado..."
      emptyMessage="Nenhum estado encontrado."
      className={className}
      disabled={disabled}
    />
  );
}

// Combobox específico para tipos de usuário
export function ComboboxTipoUsuario({
  value,
  onValueChange,
  className,
  disabled = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}) {
  const tipos = [
    { value: "client", label: "Cliente" },
    { value: "professional", label: "Profissional" },
  ];

  return (
    <Combobox
      options={tipos}
      value={value}
      onValueChange={onValueChange}
      placeholder="Selecionar tipo de usuário..."
      searchPlaceholder="Buscar tipo..."
      emptyMessage="Nenhum tipo encontrado."
      className={className}
      disabled={disabled}
    />
  );
}
