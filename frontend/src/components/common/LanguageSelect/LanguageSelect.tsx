import React from 'react';
import { useLanguage } from '@hooks/useLanguage';
import { useTranslation } from 'react-i18next';

export interface LanguageSelectProps {
  compact?: boolean;
  variant?: 'navbar' | 'default';
  className?: string;
  'aria-label'?: string;
}

export const LanguageSelect: React.FC<LanguageSelectProps> = ({
  compact = false,
  variant = 'default',
  className = '',
  'aria-label': ariaLabel,
}) => {
  const { language, changeLanguage, supportedLanguages } = useLanguage();
  const { t } = useTranslation(['common']);

  const baseNavbarCls = `bg-gradient-card backdrop-blur-md text-white border border-primary/30 rounded-lg font-medium cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-glow-blue focus:outline-none focus:border-primary focus:shadow-glow-blue appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2300d4c8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat ${
    compact
      ? 'pl-3 pr-7 py-1.5 text-xs bg-[length:1em] bg-[right_0.4rem_center]'
      : 'pl-3 pr-8 py-2 text-sm bg-[length:1.2em] bg-[right_0.4rem_center]'
  }`;

  const baseDefaultCls =
    'bg-white dark:bg-[#0B0E14] border border-gray-300 dark:border-[#1E293B] text-gray-900 dark:text-[#F1F5F9] rounded-lg px-3.5 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-[#62ffff] cursor-pointer appearance-none bg-[url(\'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E\')] bg-no-repeat pr-9 bg-[length:1.2em] bg-[right_0.6rem_center] transition-colors';

  const selectClassName = `${variant === 'navbar' ? baseNavbarCls : baseDefaultCls} ${className}`;
  const currentLang = language.slice(0, 2);

  return (
    <select
      value={currentLang}
      onChange={(e) => void changeLanguage(e.target.value)}
      aria-label={ariaLabel || t('language', 'Language')}
      className={selectClassName}
      style={variant === 'navbar' ? { colorScheme: 'dark' } : undefined}
    >
      {supportedLanguages.map((lang) => (
        <option
          key={lang.code}
          value={lang.code}
          className={
            variant === 'navbar'
              ? 'bg-background text-white'
              : 'bg-white dark:bg-[#121620] text-gray-900 dark:text-white'
          }
        >
          {compact ? lang.shortLabel : lang.label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelect;
