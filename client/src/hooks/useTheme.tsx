import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark-pro" | "light-clean" | "neon-cyber" | "corporate";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("renx-theme") as Theme;
    return savedTheme || "dark-pro";
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove("theme-dark-pro", "theme-light-clean", "theme-neon-cyber", "theme-corporate");
    
    // Add new theme class
    root.classList.add(`theme-${theme}`);
    
    // Save to localStorage
    localStorage.setItem("renx-theme", theme);
  }, [theme]);

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}