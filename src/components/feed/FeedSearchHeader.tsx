import { Search, SlidersHorizontal, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFeedSearch } from "@/hooks/useFeedSearch";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FeedFilterModal } from "./FeedFilterModal";

interface FeedSearchHeaderProps {
  onSearch: (query: string) => void;
  onFilterChange: (filter: any) => void;
  currentSearch: string;
  currentFilter: any;
}

export function FeedSearchHeader({
  onSearch,
  onFilterChange,
  currentSearch,
  currentFilter,
}: FeedSearchHeaderProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(currentSearch);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with prop if it changes externally
  useEffect(() => {
    setLocalSearch(currentSearch);
  }, [currentSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
    inputRef.current?.blur();
  };

  const activeFilterCount = [
    // Count active filters
    currentFilter.type !== "all" && currentFilter.type !== "state" ? 1 : 0, // Simplified count logic
    // Add more if we add more filters like category/price later
  ].reduce((a, b) => a + b, 0);

  const getLocationLabel = () => {
    if (currentFilter.type === "all") return "Todos os locais";
    if (currentFilter.type === "state")
      return currentFilter.state || "Meu Estado";
    if (currentFilter.city)
      return `${currentFilter.city}, ${currentFilter.state}`;
    return "Localização";
  };

  return (
    <div className="w-full space-y-3 bg-white dark:bg-black p-4 pb-2 border-b border-gray-100 dark:border-gray-900">
      <div className="flex items-center gap-2">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            ref={inputRef}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Buscar posts, serviços, pessoas..."
            className="pl-9 bg-gray-100 dark:bg-gray-900 border-none h-11 w-full rounded-full"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onSearch("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </form>

        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-11 w-11 shrink-0 rounded-full border-gray-200 dark:border-gray-800 transition-all",
            currentFilter.type !== "all" &&
              "border-primary-500 text-primary-500 bg-primary-50 dark:bg-primary-900/10",
          )}
          onClick={() => setShowFilters(true)}
        >
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Active Filters Display */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => setShowFilters(true)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors",
            currentFilter.type === "all"
              ? "bg-gray-100 dark:bg-gray-800 border-transparent text-gray-600 dark:text-gray-400"
              : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
          )}
        >
          <MapPin className="h-3 w-3" />
          <span className="max-w-[150px] truncate">{getLocationLabel()}</span>
        </button>

        {/* Helper text if "All Locations" is set but search is empty, maybe prompt user? */}
      </div>

      <FeedFilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        currentFilter={currentFilter}
        onApply={onFilterChange}
      />
    </div>
  );
}
