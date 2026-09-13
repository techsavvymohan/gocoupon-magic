"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AdminThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
});

export function AdminThemeProvider({ children }) {
  // Always default to Dark Mode on initial load
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    // Ensure dark mode class is applied to root element on mount
    document.documentElement.classList.add("dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);

    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme === "dark" ? "admin-dark-mode dark bg-zinc-950 text-white min-h-screen" : "admin-light-mode bg-[#f8fafc] text-zinc-900 min-h-screen"}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}
