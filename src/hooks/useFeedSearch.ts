import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { LocationFilter } from "./useLocationFilters";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export interface FeedSearchState {
  searchQuery: string;
  locationFilter: LocationFilter;
  isSearching: boolean;
}

export function useFeedSearch() {
  const { profile } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState<LocationFilter>({
    type: "state", // Default to state
    city: undefined,
    state: undefined,
    country: "Brasil",
  });
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Initialize from profile or URL on mount
  useEffect(() => {
    if (profile) {
      setLocationFilter({
        type: (profile as any).feed_location_filter_type || "state",
        city: (profile as any).feed_location_filter_city || undefined,
        state: (profile as any).feed_location_filter_state || undefined,
        country: (profile as any).feed_location_filter_country || "Brasil",
      });
    }
  }, [profile]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setIsDebouncing(true);
    // Debounce is handled by the UI component or useDebounce hook in the query
    setTimeout(() => setIsDebouncing(false), 500);
  }, []);

  const handleLocationChange = useCallback(
    async (newFilter: LocationFilter) => {
      setLocationFilter(newFilter);

      // Persist to profile if authenticated
      if (profile?.id) {
        try {
          await supabase
            .from("profiles")
            .update({
              feed_location_filter_type: newFilter.type,
              feed_location_filter_city: newFilter.city || null,
              feed_location_filter_state: newFilter.state || null,
              feed_location_filter_country:
                newFilter.country === "Brasil" ? "BR" : newFilter.country, // Normalize if needed, though better done in backend/hook
              updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id);
        } catch (error) {
          console.error("Failed to persist filter:", error);
        }
      }
    },
    [profile],
  );

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    handleLocationChange({
      type: "all",
      city: undefined,
      state: undefined,
      country: undefined,
    });
  }, [handleLocationChange]);

  return {
    searchQuery,
    locationFilter,
    isDebouncing,
    setSearchQuery: handleSearchChange,
    setLocationFilter: handleLocationChange,
    clearFilters,
  };
}
