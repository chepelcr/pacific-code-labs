/**
 * On-device translation via the Chrome built-in Translator API
 * (https://developer.chrome.com/docs/ai/translator-api). The model runs locally
 * and downloads on first use, so nothing leaves the editor's machine. Used by
 * the admin bilingual fields to auto-fill the opposite language.
 *
 * Availability is narrow on purpose: Chrome 138+ on desktop, in a secure context
 * (localhost counts — which is exactly where the admin runs in dev). Everything
 * here degrades silently: if the API is missing or a call fails, helpers return
 * null and callers simply leave the field for the editor to fill by hand.
 */

export type Lang = "es" | "en";

// The Translator API isn't in the TS DOM libs yet — declare the slice we use.
interface TranslatorInstance {
  translate(text: string): Promise<string>;
}
interface TranslatorFactory {
  availability(opts: { sourceLanguage: string; targetLanguage: string }): Promise<
    "unavailable" | "downloadable" | "downloading" | "available"
  >;
  create(opts: {
    sourceLanguage: string;
    targetLanguage: string;
    monitor?: (m: EventTarget) => void;
  }): Promise<TranslatorInstance>;
}
declare global {
  // eslint-disable-next-line no-var
  var Translator: TranslatorFactory | undefined;
}

/** True when the browser exposes the built-in Translator API. */
export function translatorSupported(): boolean {
  return typeof self !== "undefined" && "Translator" in self;
}

// One Translator instance per source→target pair, created lazily and reused.
const translators = new Map<string, Promise<TranslatorInstance | null>>();

function getTranslator(source: Lang, target: Lang): Promise<TranslatorInstance | null> {
  const key = `${source}->${target}`;
  let existing = translators.get(key);
  if (existing) return existing;

  const factory = (self as unknown as { Translator?: TranslatorFactory }).Translator;
  if (!factory) return Promise.resolve(null);

  existing = (async () => {
    try {
      const availability = await factory.availability({
        sourceLanguage: source,
        targetLanguage: target,
      });
      if (availability === "unavailable") return null;
      return await factory.create({ sourceLanguage: source, targetLanguage: target });
    } catch {
      return null;
    }
  })();
  translators.set(key, existing);
  return existing;
}

/**
 * Translate a single string. Returns the translation, or null when the API is
 * unavailable, the input is blank, or the call fails. Never throws.
 */
export async function translateText(
  text: string,
  source: Lang,
  target: Lang,
): Promise<string | null> {
  if (!text.trim() || source === target || !translatorSupported()) return null;
  try {
    const translator = await getTranslator(source, target);
    if (!translator) return null;
    return await translator.translate(text);
  } catch {
    return null;
  }
}
