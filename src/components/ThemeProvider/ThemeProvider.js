// ThemeProvider.js
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Force color scheme
    const meta = document.createElement('meta');
    meta.name = 'color-scheme';
    meta.content = 'only light';
    document.head.appendChild(meta);

    // Add style to override system preferences
    const style = document.createElement('style');
    style.textContent = `
      /* Override system dark mode */
      @media (prefers-color-scheme: dark) {
        html {
          color-scheme: only light !important;
        }
        
        html[data-theme="light"] {
          background-color: white !important;
          color: black !important;
        }
        
        html[data-theme="light"] * {
          color-scheme: only light !important;
        }
      }

      /* Explicit dark mode styles when theme is dark */
      html[data-theme="dark"] {
        background-color: rgb(17 24 39) !important;
        color: rgb(229 231 235) !important;
        color-scheme: dark !important;
      }

      html[data-theme="dark"] * {
        color-scheme: dark !important;
      }
    `;
    document.head.appendChild(style);

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);

    return () => {
      document.head.removeChild(meta);
      document.head.removeChild(style);
    };
  }, []);

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add new theme class
    root.classList.add(newTheme);
    
    // Set data-theme attribute
    root.setAttribute('data-theme', newTheme);
    
    // Update body styles
    document.body.style.backgroundColor = newTheme === 'light' ? 'white' : 'rgb(17 24 39)';
    document.body.style.color = newTheme === 'light' ? 'black' : 'rgb(229 231 235)';
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);