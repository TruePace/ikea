import React from 'react';
import { useTheme } from './ThemeProvider';
// import { Moon, Sun } from 'lucide-react';
import { FaMoon,FaSun } from 'react-icons/fa';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <FaMoon className="h-5 w-5 text-gray-800 dark:text-gray-200" />
      ) : (
        <FaSun className="h-5 w-5 text-gray-800 dark:text-gray-200" />
      )}
    </button>
  );
};