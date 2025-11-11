// components/theme-toggle.tsx
import { useTheme } from '@/components/theme-provider';

export function ThemeToggle() {
  const { theme, setTheme, language, setLanguage } = useTheme();

  const languages = {
    fr: { name: 'Français', flag: '🇫🇷' },
    en: { name: 'English', flag: '🇺🇸' },
    ar: { name: 'العربية', flag: '🇸🇦' },
  };

  return (
    <div className="flex items-center gap-2">
      {/* Sélecteur de langue */}
      <div className="relative">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          className="appearance-none bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        >
          {Object.entries(languages).map(([code, { name, flag }]) => (
            <option key={code} value={code}>
              {flag} {name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Toggle du thème */}
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Toggle theme"
      >
        <svg
          className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <svg
          className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </button>
    </div>
  );
}