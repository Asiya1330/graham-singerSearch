/** Canonical voice types, ordered by vocal range (highest to lowest). */
export const VOICE_TYPE_OPTIONS = [
  "Soprano",
  "Mezzo-Soprano",
  "Contralto",
  "Countertenor",
  "Tenor",
  "Baritone",
  "Bass-Baritone",
  "Bass",
] as const;

export type VoiceType = (typeof VOICE_TYPE_OPTIONS)[number];

/**
 * Maps repertoire_reference.voice_type_primary (snake_case catalog keys)
 * to the singer-facing labels in VOICE_TYPE_OPTIONS.
 */
export const VOICE_TYPE_DB_TO_LABEL: Record<string, VoiceType> = {
  soprano: "Soprano",
  mezzo_soprano: "Mezzo-Soprano",
  contralto: "Contralto",
  countertenor: "Countertenor",
  tenor: "Tenor",
  baritone: "Baritone",
  bass_baritone: "Bass-Baritone",
  bass: "Bass",
};
