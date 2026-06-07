"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";

// Context Interface
interface ThemeContextType {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  systemTheme: string | undefined;
  resolvedTheme: string | undefined;
  toggleTheme: () => void;
  setLightTheme: () => void;
  setDarkTheme: () => void;
  setSystemTheme: () => void;
  getThemeIcon: () => string;
  getThemeLabel: () => string;
  mounted: boolean;
  isLight: boolean;
  isDark: boolean;
  isSystem: boolean;
}

// Context Creation
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider Component (wraps external library)
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="tools-hub-theme"
      enableColorScheme
      disableTransitionOnChange
    >
      <ThemeContextWrapper>{children}</ThemeContextWrapper>
    </NextThemesProvider>
  );
}

// Internal wrapper to provide custom functionality
function ThemeContextWrapper({ children }: { children: React.ReactNode }) {
  const { theme, setTheme, systemTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const getThemeIcon = () => {
    if (!mounted) return "sun";
    
    if (theme === "system") {
      return systemTheme === "dark" ? "moon" : "sun";
    }
    
    return theme === "dark" ? "moon" : "sun";
  };

  const getThemeLabel = () => {
    if (!mounted) return "وضع فاتح";

    if (theme === "system") {
      return systemTheme === "dark" ? "النظام (داكن)" : "النظام (فاتح)";
    }

    return theme === "dark" ? "وضع داكن" : "وضع فاتح";
  };

  const setLightTheme = () => setTheme("light");
  const setDarkTheme = () => setTheme("dark");
  const setSystemTheme = () => setTheme("system");
  
  const value = {
    theme,
    setTheme,
    systemTheme,
    resolvedTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    getThemeIcon,
    getThemeLabel,
    mounted,
    isLight: mounted && resolvedTheme === "light",
    isDark: mounted && resolvedTheme === "dark",
    isSystem: theme === "system"
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom Hook
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}