import { useState, useEffect } from "react";
import { MapPin, Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationComboboxesMultiCountry } from "@/components/ui/LocationComboboxesMultiCountry";
import { useIBGE } from "@/hooks/useIBGE";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { LocationFilter } from "@/hooks/useLocationFilters";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

interface FeedFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilter: LocationFilter;
  onApply: (filter: LocationFilter) => void;
}

export function FeedFilterModal({
  isOpen,
  onClose,
  currentFilter,
  onApply,
}: FeedFilterModalProps) {
  const { profile } = useAuthContext();
  const { country: contextCountry } = useLocale();
  const { estados, loadCidades } = useIBGE();

  // Local state for the form
  const [selectedType, setSelectedType] = useState<LocationFilter["type"]>(
    currentFilter.type,
  );
  const [selectedCountry] = useState<string>("BR");
  const [selectedState, setSelectedState] = useState(currentFilter.state || "");
  const [selectedCity, setSelectedCity] = useState(currentFilter.city || "");

  // Helper for state sigla vs name
  const [stateSigla, setStateSigla] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedType(currentFilter.type);
      setSelectedType(currentFilter.type);
      setSelectedState(currentFilter.state || "");
      setSelectedCity(currentFilter.city || "");

      // Try to resolve sigla from name if needed
      if (currentFilter.state && currentFilter.country === "Brasil") {
        const est = estados.find(
          (e) =>
            e.nome === currentFilter.state || e.sigla === currentFilter.state,
        );
        if (est) {
          setStateSigla(est.sigla);
          loadCidades(est.sigla);
        }
      }
    }
  }, [isOpen, currentFilter, estados, loadCidades]);

  const handleApply = () => {
    onApply({
      type: selectedType,
      country: selectedType === "all" ? undefined : selectedCountry,
      state: selectedType === "all" ? undefined : selectedState,
      city: selectedType === "all" ? undefined : selectedCity,
    });
    onClose();
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Filtrar Feed"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedType("state");
              setSelectedState("");
              setSelectedCity("");
              setStateSigla("");
            }}
          >
            Resetar
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            Aplicar
          </Button>
        </>
      }
    >
      <div className="space-y-6 pb-4">
        {/* Location Type Selection */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Mostrar posts de
          </label>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => setSelectedType("state")}
              className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                selectedType === "state"
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                  : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              <div
                className={`p-2 rounded-full ${selectedType === "state" ? "bg-primary-100 dark:bg-primary-900/40" : "bg-gray-100 dark:bg-gray-800"}`}
              >
                <MapPin className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Meu Estado / Região</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {profile?.location_state || "Localização do perfil"}
                </div>
              </div>
              {selectedType === "state" && <Check className="h-4 w-4" />}
            </button>

            <button
              onClick={() => {
                setSelectedType("custom");
                // Preenchimento automático com códigos para os comboboxes
                // Preenchimento automático com códigos para os comboboxes
                if (profile?.location_state) {
                  const est = estados.find(
                    (e) =>
                      e.nome === profile.location_state ||
                      e.sigla === profile.location_state,
                  );
                  if (est) {
                    setSelectedState(est.nome);
                    setStateSigla(est.sigla);
                    loadCidades(est.sigla);
                  } else {
                    setSelectedState(profile.location_state);
                    setStateSigla(profile.location_state);
                  }
                }
                if (profile?.location_city) {
                  setSelectedCity(profile.location_city);
                }
              }}
              className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                selectedType === "custom" || selectedType === "local"
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                  : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              <div
                className={`p-2 rounded-full ${selectedType === "custom" || selectedType === "local" ? "bg-primary-100 dark:bg-primary-900/40" : "bg-gray-100 dark:bg-gray-800"}`}
              >
                <MapPin className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Cidade Específica</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Escolha uma cidade ou estado
                </div>
              </div>
              {(selectedType === "custom" || selectedType === "local") && (
                <Check className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={() => setSelectedType("all")}
              className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                selectedType === "all"
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                  : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              <div
                className={`p-2 rounded-full ${selectedType === "all" ? "bg-primary-100 dark:bg-primary-900/40" : "bg-gray-100 dark:bg-gray-800"}`}
              >
                <Globe className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Todos os Locais</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Ver posts de todo o mundo
                </div>
              </div>
              {selectedType === "all" && <Check className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Location Selector (Only if Custom/Local) */}
        {(selectedType === "custom" || selectedType === "local") && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2">
            <LocationComboboxesMultiCountry
              stateCode={stateSigla}
              onStateChange={(code) => {
                setStateSigla(code);
                const est = estados.find((e) => e.sigla === code);
                if (est) setSelectedState(est.nome);
                else setSelectedState(code);
              }}
              onCityChange={setSelectedCity}
            />
          </div>
        )}
      </div>
    </ResponsiveModal>
  );
}
