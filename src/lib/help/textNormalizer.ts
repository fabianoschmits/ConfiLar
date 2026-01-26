/**
 * Text normalization utility for help system
 * Removes accents, converts to lowercase, removes punctuation
 */

/**
 * Remove accents from text (á → a, ç → c, etc.)
 */
export function removeAccents(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Remove punctuation from text
 */
export function removePunctuation(text: string): string {
  return text.replace(/[^\w\s]|_/g, " ").replace(/\s+/g, " ");
}

/**
 * Common Portuguese stop words to filter out
 */
const STOP_WORDS = new Set([
  "a",
  "o",
  "e",
  "de",
  "da",
  "do",
  "em",
  "um",
  "uma",
  "os",
  "as",
  "dos",
  "das",
  "para",
  "com",
  "por",
  "que",
  "se",
  "na",
  "no",
  "ao",
  "à",
  "é",
  "ou",
  "como",
  "mais",
  "mas",
  "foi",
  "ele",
  "ela",
  "seu",
  "sua",
  "meu",
  "minha",
  "esse",
  "essa",
  "este",
  "esta",
  "isso",
  "isto",
  "aquele",
  "aquela",
  "aquilo",
  "me",
  "te",
  "nos",
  "vos",
  "lhe",
  "lhes",
  "mim",
  "ti",
  "si",
  "nós",
  "vós",
  "eles",
  "elas",
  "eu",
  "tu",
  "você",
  "vocês",
  "nós",
]);

/**
 * Normalize text for keyword matching
 * @param text - Text to normalize
 * @param filterStopWords - Whether to filter out common stop words
 * @returns Array of normalized words
 */
export function normalizeText(text: string, filterStopWords = true): string[] {
  // Convert to lowercase
  let normalized = text.toLowerCase();

  // Remove accents
  normalized = removeAccents(normalized);

  // Remove punctuation
  normalized = removePunctuation(normalized);

  // Split into words
  const words = normalized
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  // Filter stop words if requested
  if (filterStopWords) {
    return words.filter((word) => !STOP_WORDS.has(word));
  }

  return words;
}

/**
 * Normalize text to a single string (for simple comparisons)
 */
export function normalizeTextString(text: string): string {
  return normalizeText(text, false).join(" ");
}
