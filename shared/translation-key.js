// Stable keys let templates keep readable Turkish copy while Transloco owns both dictionaries.
export function translationKey(text) {
  let hash = 2166136261;
  for (const char of text.trim()) { hash ^= char.codePointAt(0); hash = Math.imul(hash, 16777619); }
  return `text_${(hash >>> 0).toString(16)}`;
}
