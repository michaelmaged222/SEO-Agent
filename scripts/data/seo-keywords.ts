/**
 * Target keywords for Puppyfy UAE, grouped by intent and priority.
 * The SEO agent uses these to audit meta tags, plan articles and track coverage.
 * Update this file as the business adds breeds or enters new markets.
 */

export type KeywordGroup = {
  intent: "transactional" | "informational" | "navigational";
  priority: "high" | "medium" | "low";
  keywords: string[];
};

/** Primary transactional keywords — these drive purchases. */
export const transactional: KeywordGroup = {
  intent: "transactional",
  priority: "high",
  keywords: [
    "buy puppy dubai",
    "puppies for sale uae",
    "puppy shop dubai",
    "pet shop dubai",
    "puppy price dubai",
    "buy maltese puppy dubai",
    "buy pomeranian puppy dubai",
    "buy golden retriever puppy uae",
    "buy shih tzu puppy dubai",
    "buy labrador puppy dubai",
    "buy cavapoo puppy uae",
    "buy toy poodle dubai",
    "buy french bulldog uae",
    "buy husky puppy dubai",
    "buy german shepherd puppy uae",
    "teacup puppies for sale dubai",
    "mini puppies for sale uae",
    "imported puppies uae",
    "buy puppy abu dhabi",
    "buy puppy sharjah",
    "puppy delivery uae",
    "puppies with vaccination dubai",
    "puppy with papers dubai",
    "puppy with microchip uae",
  ],
};

/** Informational keywords — these drive organic reach through articles. */
export const informational: KeywordGroup = {
  intent: "informational",
  priority: "medium",
  keywords: [
    "puppy vaccination schedule uae",
    "how much does a puppy cost in dubai",
    "best dog breeds for apartments dubai",
    "how to import puppy to uae",
    "puppy heat safety uae",
    "golden retriever vs labrador",
    "teacup toy mini puppy sizes",
    "how to choose healthy puppy",
    "first week with new puppy",
    "pomeranian care guide",
    "puppy food guide uae",
    "dog grooming tips dubai",
    "dog registration uae municipality",
    "pet travel rules uae",
    "puppy training tips beginners",
    "best small dogs for families",
    "hypoallergenic dog breeds uae",
    "maltese vs shih tzu comparison",
    "puppy potty training apartment",
    "dog parks dubai",
    "vet clinic near me dubai",
    "pet insurance uae",
    "puppy teething tips",
    "dog socialization tips",
    "raw diet for dogs uae",
    "best dog food brands uae",
    "puppy growth stages",
    "when to spay neuter puppy uae",
    "summer grooming tips dogs",
    "puppy separation anxiety",
  ],
};

/** Breed-specific long-tail keywords mapped to breed slugs. */
export const breedKeywords: Record<string, string[]> = {
  "maltese-puppies": [
    "maltese puppy price dubai",
    "maltese dog uae",
    "buy maltese dubai",
    "maltese grooming tips",
    "maltese temperament",
  ],
  "shih-tzu-puppies": [
    "shih tzu puppy price uae",
    "shih tzu grooming dubai",
    "buy shih tzu dubai",
    "shih tzu temperament",
  ],
  "white-pomeranian-puppies": [
    "pomeranian puppy price dubai",
    "white pomeranian uae",
    "buy pomeranian dubai",
    "pomeranian grooming",
    "pomeranian sizes teacup mini",
  ],
  "golden-retriever-puppies-english-cream-double-coat": [
    "golden retriever puppy dubai",
    "english cream golden retriever uae",
    "golden retriever price uae",
  ],
  "black-labrador-puppies": [
    "labrador puppy dubai",
    "black lab puppy uae",
    "labrador price dubai",
  ],
  "cavapoo-puppies": [
    "cavapoo puppy price dubai",
    "cavapoo uae",
    "buy cavapoo dubai",
    "cavapoo temperament",
  ],
  "apricot-chocolate-red-toy-poodle": [
    "toy poodle price dubai",
    "toy poodle uae",
    "poodle grooming dubai",
  ],
  "german-shepherd-puppies": [
    "german shepherd puppy dubai",
    "german shepherd price uae",
    "buy german shepherd uae",
  ],
  "huskey": [
    "husky puppy dubai",
    "husky price uae",
    "husky in hot weather",
    "buy husky dubai",
  ],
  "pug-puppies": [
    "pug puppy price dubai",
    "buy pug dubai",
    "pug care hot weather",
  ],
};

/** All keyword groups for iteration. */
export const allGroups: KeywordGroup[] = [transactional, informational];

/** Flat list of every target keyword. */
export function allKeywords(): string[] {
  return [...transactional.keywords, ...informational.keywords, ...Object.values(breedKeywords).flat()];
}

/** Keywords that should appear in a page's meta title or description for a given breed slug. */
export function breedTargetKeywords(slug: string): string[] {
  return breedKeywords[slug] ?? [];
}
