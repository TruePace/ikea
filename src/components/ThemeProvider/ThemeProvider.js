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
    
    // Add meta tags to force color scheme
    const metaColorScheme = document.createElement('meta');
    metaColorScheme.name = 'color-scheme';
    metaColorScheme.content = 'normal';
    document.head.appendChild(metaColorScheme);

    // Force disable system dark mode with CSS
    const style = document.createElement('style');
    style.textContent = `
      /* Force light mode styles regardless of system preference */
      @media (prefers-color-scheme: dark) {
        html[data-force-theme="light"] {
          background-color: white !important;
          color: black !important;
          color-scheme: light !important;
        }

        html[data-force-theme="light"] * {
          color-scheme: light !important;
        }
      }

      /* Force dark mode styles when app theme is dark */
      html[data-force-theme="dark"] {
        background-color: rgb(17 24 39) !important;
        color-scheme: dark !important;
      }

      html[data-force-theme="dark"] * {
        color-scheme: dark !important;
      }
    `;
    document.head.appendChild(style);

    // Check saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Apply theme
    applyTheme(savedTheme);

    return () => {
      document.head.removeChild(metaColorScheme);
      document.head.removeChild(style);
    };
  }, []);

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    
    // Remove existing classes
    root.classList.remove('light', 'dark');
    
    // Add new theme class
    root.classList.add(newTheme);
    
    // Set force-theme attribute
    root.setAttribute('data-force-theme', newTheme);
    
    // Update body background and text color
    if (newTheme === 'light') {
      document.body.style.backgroundColor = 'white';
      document.body.style.color = 'black';
    } else {
      document.body.style.backgroundColor = 'rgb(17 24 39)'; // dark:bg-gray-900
      document.body.style.color = 'rgb(229 231 235)'; // dark:text-gray-200
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);