// components/theme-provider.tsx
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';
type Language = 'fr' | 'en' | 'ar';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultLanguage?: Language;
  storageKey?: string;
  languageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  direction: 'ltr' | 'rtl';
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  language: 'fr',
  setLanguage: () => null,
  direction: 'ltr',
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  defaultLanguage = 'fr',
  storageKey = 'warehouse-ui-theme',
  languageKey = 'warehouse-language',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem(languageKey) as Language) || defaultLanguage
  );

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [language, direction]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    language,
    setLanguage: (language: Language) => {
      localStorage.setItem(languageKey, language);
      setLanguage(language);
    },
    direction,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// Export corrigé avec vérification
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};