// src/components/ThemeToggle/ThemeToggle.tsx
'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Montagem adiada evita hydration mismatch: tema pode diferir entre SSR e client
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ver comentário acima
    setMounted(true);
  }, []);

  if (!mounted) return null; // ou um placeholder com as mesmas dimensões

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      className="flex cursor-pointer items-center gap-2 rounded-lg border border-black/10 px-3 py-2"
    >
      {isDark ? <Sun /> : <Moon />}
      <span className="text-sm font-medium">
        {isDark ? 'Modo claro' : 'Modo escuro'}
      </span>
    </button>
  );
};
