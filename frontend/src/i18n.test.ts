import { describe, it, expect, beforeEach } from 'vitest';
import i18n from './i18n';

describe('i18n html lang attribute', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('sets document.documentElement.lang on init and updates on languageChanged', async () => {
    expect(document.documentElement.lang).toBe('en');

    await i18n.changeLanguage('fr');
    expect(document.documentElement.lang).toBe('fr');

    await i18n.changeLanguage('es');
    expect(document.documentElement.lang).toBe('es');

    await i18n.changeLanguage('en');
    expect(document.documentElement.lang).toBe('en');
  });
});
