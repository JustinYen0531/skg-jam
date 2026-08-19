import { translateDialogueLine } from './dialogueTranslations';

export type GameLanguage = 'en' | 'zh-Hant';

export const DEFAULT_GAME_LANGUAGE: GameLanguage = 'en';
export const GAME_LANGUAGE_STORAGE_KEY = 'skg.game-language';

export const LANGUAGE_LABELS: Readonly<Record<GameLanguage, string>> = {
  en: 'English',
  'zh-Hant': '繁體中文',
};

export const loadGameLanguage = (): GameLanguage => {
  if (typeof window === 'undefined') return DEFAULT_GAME_LANGUAGE;
  return window.localStorage.getItem(GAME_LANGUAGE_STORAGE_KEY) === 'zh-Hant'
    ? 'zh-Hant'
    : DEFAULT_GAME_LANGUAGE;
};

export const saveGameLanguage = (language: GameLanguage): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(GAME_LANGUAGE_STORAGE_KEY, language);
  }
};

export const toggleGameLanguage = (language: GameLanguage): GameLanguage =>
  language === 'en' ? 'zh-Hant' : 'en';

export const translateDialogueLines = (
  lines: readonly string[],
  language: GameLanguage,
): readonly string[] => lines.map((line) => translateDialogueLine(line, language));

export const getLanguageToggleLabel = (language: GameLanguage): string =>
  language === 'en' ? '中文' : 'EN';

export const getLanguageToggleDescription = (language: GameLanguage): string =>
  language === 'en' ? 'Switch dialogue to Traditional Chinese' : '切換回英文對話';
