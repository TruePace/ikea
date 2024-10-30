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

    // Force disable system dark mode with comprehensive CSS
    const style = document.createElement('style');
    style.textContent = `
      /* Reset all color schemes to light by default */
      * {
        color-scheme: light !important;
      }

      /* Force light mode styles regardless of system preference */
      @media (prefers-color-scheme: dark) {
        html[data-force-theme="light"],
        html[data-force-theme="light"] body,
        html[data-force-theme="light"] *:not(.force-dark) {
          background-color: white !important;
          color: black !important;
          border-color: inherit !important;
          color-scheme: light !important;
        }

        html[data-force-theme="light"] .bg-base-100 {
          background-color: white !important;
        }

        html[data-force-theme="light"] .btn-primary {
          background-color: #2563eb !important;
          color: white !important;
        }

        html[data-force-theme="light"] header,
        html[data-force-theme="light"] nav,
        html[data-force-theme="light"] .dropdown-content {
          background-color: white !important;
          color: black !important;
        }
      }

      /* Explicit dark mode styles when app theme is dark */
      html[data-force-theme="dark"],
      html[data-force-theme="dark"] body {
        background-color: rgb(17 24 39) !important;
        color: rgb(229 231 235) !important;
        color-scheme: dark !important;
      }

      html[data-force-theme="dark"] .bg-base-100 {
        background-color: rgb(17 24 39) !important;
      }

      html[data-force-theme="dark"] header,
      html[data-force-theme="dark"] nav {
        background-color: rgb(17 24 39) !important;
        color: rgb(229 231 235) !important;
      }

      html[data-force-theme="dark"] .dropdown-content {
        background-color: rgb(55 65 81) !important;
        color: rgb(229 231 235) !important;
      }

      /* Fix for buttons and interactive elements */
      html[data-force-theme="light"] .btn,
      html[data-force-theme="light"] .button,
      html[data-force-theme="light"] button:not(.force-dark) {
        color-scheme: light !important;
        background-color: inherit !important;
      }

      /* Transition smoothing */
      body, header, nav, .btn, .dropdown-content {
        transition: background-color 0.3s ease, color 0.3s ease !important;
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
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    root.setAttribute('data-force-theme', newTheme);
    
    // Force immediate update of critical elements
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    
    if (newTheme === 'light') {
      document.body.style.backgroundColor = 'white';
      document.body.style.color = 'black';
      if (header) header.style.backgroundColor = 'white';
      if (nav) nav.style.backgroundColor = 'white';
    } else {
      document.body.style.backgroundColor = 'rgb(17 24 39)';
      document.body.style.color = 'rgb(229 231 235)';
      if (header) header.style.backgroundColor = 'rgb(17 24 39)';
      if (nav) nav.style.backgroundColor = 'rgb(17 24 39)';
    }
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