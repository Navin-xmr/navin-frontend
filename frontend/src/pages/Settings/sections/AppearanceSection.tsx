import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@hooks/useTheme';

const AppearanceSection: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>

      <div className="bg-gray-50 dark:bg-[rgba(19,186,186,0.05)] border border-gray-200 dark:border-[rgba(98,255,255,0.2)] rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-4">Color Theme</h3>

        <div className="flex gap-3">
          {/* Light mode option */}
          <button
            type="button"
            onClick={() => theme === 'dark' && toggleTheme()}
            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              theme === 'light'
                ? 'border-teal-500 dark:border-[#62ffff] bg-teal-50 dark:bg-[rgba(98,255,255,0.1)]'
                : 'border-gray-200 dark:border-[rgba(98,255,255,0.1)] hover:border-teal-300 dark:hover:border-[rgba(98,255,255,0.3)]'
            }`}
            aria-pressed={theme === 'light'}
          >
            <Sun size={22} className="text-amber-500 dark:text-amber-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-slate-300">Light</span>
          </button>

          {/* Dark mode option */}
          <button
            type="button"
            onClick={() => theme === 'light' && toggleTheme()}
            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              theme === 'dark'
                ? 'border-teal-500 dark:border-[#62ffff] bg-teal-50 dark:bg-[rgba(98,255,255,0.1)]'
                : 'border-gray-200 dark:border-[rgba(98,255,255,0.1)] hover:border-teal-300 dark:hover:border-[rgba(98,255,255,0.3)]'
            }`}
            aria-pressed={theme === 'dark'}
          >
            <Moon size={22} className="text-indigo-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-slate-300">Dark</span>
          </button>

          {/* System preference option */}
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('navin-theme');
              window.location.reload();
            }}
            className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 dark:border-[rgba(98,255,255,0.1)] hover:border-teal-300 dark:hover:border-[rgba(98,255,255,0.3)] transition-all cursor-pointer"
            title="Use system preference"
          >
            <Monitor size={22} className="text-gray-400 dark:text-slate-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-slate-300">System</span>
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-500 dark:text-slate-500">
          Preference is saved locally and persists across sessions.
        </p>
      </div>
    </div>
  );
};

export default AppearanceSection;
