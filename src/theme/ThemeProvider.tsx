import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

type Ctx = { theme: 'light'|'dark', toggle: () => void }
const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<'light'|'dark'>(() => (localStorage.getItem('theme') as any) || 'light');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return <ThemeCtx.Provider value={{ theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }}>{children}</ThemeCtx.Provider>
}

export const useTheme = () => useContext(ThemeCtx)!;
