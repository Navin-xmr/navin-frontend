import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES, useLanguage } from './useLanguage';

const changeLanguageMock = vi.fn();
let currentLanguage = 'en';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      get language() {
        return currentLanguage;
      },
      changeLanguage: changeLanguageMock,
    },
  }),
}));

describe('useLanguage', () => {
  beforeEach(() => {
    currentLanguage = 'en';
    changeLanguageMock.mockReset().mockImplementation(async (language: string) => {
      currentLanguage = language;
    });
    localStorage.clear();
  });

  it('returns the current language and supported language list', () => {
    currentLanguage = 'fr';
    const { result } = renderHook(() => useLanguage());

    expect(result.current.language).toBe('fr');
    expect(result.current.supportedLanguages).toEqual(SUPPORTED_LANGUAGES);
  });

  it('changes the i18n language and persists the selection', async () => {
    const { result } = renderHook(() => useLanguage());

    await act(async () => {
      await result.current.changeLanguage('es');
    });

    expect(changeLanguageMock).toHaveBeenCalledWith('es');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('es');
  });
});
