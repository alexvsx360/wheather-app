// Centralized theme configuration for the weather app.
// All colors and spacing that depend on light/dark mode live here.

export const THEMES = {
  light: {
    name: "light",
    cssVars: {
      "--app-bg": "#f8f9fa",
      "--app-card-bg": "#ffffff",
      "--app-text": "#212529",
      "--app-muted": "#6c757d",
    },
    bootstrapBodyClass: "bg-light",
  },
  dark: {
    name: "dark",
    cssVars: {
      // Very dark background for the whole page
      "--app-bg": "#020617",
      // Slightly lighter card to create clear separation from the page
      "--app-card-bg": "#111827",
      // High-contrast text color
      "--app-text": "#f9fafb",
      // Muted text that is still readable on dark background
      "--app-muted": "#9ca3af",
    },
    bootstrapBodyClass: "bg-dark",
  },
};

// Apply the given theme by setting CSS variables on the document root
export function applyTheme(theme) {
  const root = document.documentElement;
  Object.entries(theme.cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Also adjust body background utility class to match Bootstrap palette
  const body = document.body;
  body.classList.remove("bg-light", "bg-dark");
  body.classList.add(theme.bootstrapBodyClass);
}


