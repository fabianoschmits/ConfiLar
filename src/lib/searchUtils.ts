/**
 * Utility functions for professional search normalization and synonyms
 */

// Basic synonym map for professional services in Portuguese
export const SYNONYM_MAP: Record<string, string[]> = {
  baba: ["cuidadora", "babá", "childcare", "nanny", "crianças"],
  "cuidador de idosos": ["cuidadora", "idosos", "acompanhante", "geriatria"],
  diarista: ["faxina", "limpeza", "limpar", "faxineira", "doméstica"],
  pedreiro: ["obra", "construção", "reforma", "alvenaria", "tijolo"],
  eletricista: ["luz", "energia", "elétrica", "fiação", "curto"],
  encanador: [
    "água",
    "cano",
    "vazamento",
    "hidráulica",
    "torneira",
    "encanamento",
  ],
  pintor: ["pintura", "tinta", "parede", "verniz"],
  jardineiro: ["jardim", "grama", "poda", "plantas", "paisagismo"],
  marceneiro: ["móveis", "madeira", "armário", "marcenaria"],
  manicure: ["unhas", "pé", "mão", "esmalte"],
  cabeleireiro: ["cabelo", "corte", "escova", "progressiva"],
  "mestre de obras": ["mestre", "gerenciamento", "obra", "engenharia"],
  "montador de moveis": ["montagem", "móveis", "instalação", "armário"],
  "limpeza estofados": ["sofá", "tapete", "higienização", "estofado"],
};

/**
 * Normalizes a Portuguese search term by converting to lowercase,
 * removing accents, and handling common plural forms.
 */
export const normalizeSearchTerm = (term: string): string => {
  if (!term) return "";

  // 1. Lowercase and remove accents
  let normalized = term
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  // 2. Handle common Portuguese plurals (very basic heuristics)
  // -oes -> -ao (e.g., coracoes -> coracao - not common for profs)
  // -res -> -r (e.g., pintores -> pintor, cuidadores -> cuidador)
  if (normalized.endsWith("ores")) {
    normalized = normalized.slice(0, -2);
  }
  // -es -> -e (e.g., eletricistas -> eletricista - handles 's' below)
  // -s -> "" (e.g., pedreiros -> pedreiro, babas -> baba)
  else if (normalized.endsWith("s") && normalized.length > 3) {
    // Check if it's -es (like pintores, but we handled -ores above)
    if (normalized.endsWith("es") && !normalized.endsWith("ies")) {
      // but many words end in 'es' like 'eletricistas' -> 'eletricista' (if we remove 's')
      // 'pintores' -> 'pintore' (if we remove 's') -> then remove 'e'?
      // Let's refine:
      if (normalized.endsWith("res")) {
        // redundancy for safety
        normalized = normalized.slice(0, -2);
      } else {
        normalized = normalized.slice(0, -1);
      }
    } else {
      normalized = normalized.slice(0, -1);
    }
  }

  return normalized;
};

/**
 * Expands a search term using the synonym map.
 * Returns an array containing the original term and any mapped categories.
 */
export const expandSearchTerm = (term: string): string[] => {
  const normalized = normalizeSearchTerm(term);
  const results: Set<string> = new Set([normalized, term.toLowerCase()]);

  for (const [category, synonyms] of Object.entries(SYNONYM_MAP)) {
    // Check if normalized term is a synonym
    const normalizedSynonyms = synonyms.map((s) => normalizeSearchTerm(s));

    if (
      category.toLowerCase().includes(normalized) ||
      normalizedSynonyms.some((s) => s === normalized) ||
      synonyms.some((s) => s.toLowerCase().includes(term.toLowerCase()))
    ) {
      results.add(category);
    }
  }

  return Array.from(results);
};

/**
 * Recommends categories based on a search term even if no direct match is found.
 */
export const getRecommendedCategories = (
  term: string,
  availableCategories: string[],
): string[] => {
  const normalized = normalizeSearchTerm(term);

  // Find categories that share synonyms or have partial matches
  const recommendations = availableCategories.filter((cat) => {
    const catNormalized = normalizeSearchTerm(cat);
    if (
      catNormalized.includes(normalized) ||
      normalized.includes(catNormalized)
    )
      return true;

    const synonyms = SYNONYM_MAP[cat.toLowerCase()] || [];
    return synonyms.some((s) => normalizeSearchTerm(s).includes(normalized));
  });

  return recommendations.slice(0, 4);
};
