// App.tsx version ultra-simplifiée
import { useState } from 'react';
import { ThemeProvider, useTheme } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { ReceptionForm } from '@/components/reception-form';
import { ReceptionTable } from '@/components/reception-table';
import { useTranslation } from '@/lib/i18n';

function AppContent() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { language } = useTheme();
  const t = useTranslation();

  const translate = (key: string) => {
    return t(language, key);
  };

  const handleReceptionAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/20">
      {/* Header sans icônes problématiques */}
      <header className="sticky top-0 z-50 border-b bg-white/95 dark:bg-slate-950/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo avec texte simple */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <span className="text-white font-bold text-lg">WR</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {translate('app.title')}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {translate('app.subtitle')}
                </p>
              </div>
            </div>

            {/* Badge version */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                v2.0
              </span>
            </div>

            {/* Actions sans icônes */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <section>
            <ReceptionForm onReceptionAdded={handleReceptionAdded} />
          </section>
          
          <section>
            <ReceptionTable refreshTrigger={refreshTrigger} />
          </section>
        </div>
      </main>

      <footer className="border-t bg-white/80 dark:bg-slate-950/80 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {translate('app.footer')} • © 2024 Warehouse System • v2.0.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="warehouse-theme">
      <AppContent />
    </ThemeProvider>
  );
}

export default App;