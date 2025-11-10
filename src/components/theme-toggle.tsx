// components/theme-toggle.tsx
import { Moon, Sun, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/theme-provider';

const languages = {
  fr: { name: 'Français', flag: '🇫🇷' },
  en: { name: 'English', flag: '🇺🇸' },
  ar: { name: 'العربية', flag: '🇸🇦' },
};

export function ThemeToggle() {
  const { theme, setTheme, language, setLanguage } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {/* Sélecteur de langue */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Globe className="h-[1.2rem] w-[1.2rem]" />
            <span className="absolute -top-1 -right-1 text-xs">
              {languages[language].flag}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {Object.entries(languages).map(([code, { name, flag }]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => setLanguage(code as any)}
              className="flex items-center gap-2"
            >
              <span>{flag}</span>
              <span>{name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Toggle du thème */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
}