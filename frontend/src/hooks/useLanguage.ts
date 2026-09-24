import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const LANGUAGE_STORAGE_KEY = 'language';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'fr', label: 'Français', shortLabel: 'FR' },
  { code: 'es', label: 'Español', shortLabel: 'ES' },
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]['code'];

export interface UseLanguageReturn {
  language: string;
  changeLanguage: (lang: string) => Promise<void>;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

export const useLanguage = (): UseLanguageReturn => {
  const { i18n } = useTranslation();

  const changeLanguage = useCallback(
    async (lang: string) => {
      await i18n.changeLanguage(lang);
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        } catch {
          // Ignore storage exceptions (e.g. storage disabled or quota exceeded)
        }
      }
    },
    [i18n],
  );

  return {
    language: i18n.language || 'en',
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
};

export default useLanguage;
