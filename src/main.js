// Import Bootstrap CSS (RTL build) from node_modules so Vite can bundle it
import "bootstrap/dist/css/bootstrap.rtl.min.css";
// Import Bootstrap JS bundle (for components such as navbar, modal, etc.)
import "bootstrap";
// Import Axios HTTP client from node_modules
import axios from "axios";
// Import centralized theme configuration & helpers
import { THEMES, applyTheme } from "./themeConfig";
// Import our own global styles for the weather app
import "../style.css";

// Cache references to DOM elements used by the app
const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const resultCard = document.getElementById("weather-result");
const resultLocation = document.getElementById("result-location");
const resultTemp = document.getElementById("result-temp");
const resultDescription = document.getElementById("result-description");
const resultExtra = document.getElementById("result-extra");
const messageBox = document.getElementById("weather-message");
const themeToggleButton = document.getElementById("theme-toggle");

// Keep track of the current theme name ("light" | "dark")
let currentTheme = "light";

// Base endpoints for the Open-Meteo APIs
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

// Show a Bootstrap alert with a given text and type (info, warning, danger, ...)
function showMessage(text, type = "info") {
  messageBox.textContent = text;
  messageBox.className = `alert alert-${type} mt-3`;
  messageBox.classList.remove("d-none");
}

// Hide the alert and clear its text
function clearMessage() {
  messageBox.classList.add("d-none");
  messageBox.textContent = "";
}

// Show the result card
function showResult() {
  resultCard.classList.remove("d-none");
}

// Hide the result card
function hideResult() {
  resultCard.classList.add("d-none");
}

// Fetch latitude/longitude by city name from Open-Meteo geocoding API
async function fetchCoordinatesByCity(city) {
  const response = await axios.get(GEO_URL, {
    params: {
      name: city,
      count: 1,
      language: "he",
      format: "json",
    },
  });

  if (!response.data || !response.data.results || response.data.results.length === 0) {
    // No results for this city name
    throw new Error("העיר לא נמצאה, נסה שם אחר");
  }

  // Return the first matching location object
  return response.data.results[0];
}

// Fetch current weather data for a given set of coordinates
async function fetchWeather(latitude, longitude) {
  const response = await axios.get(WEATHER_URL, {
    params: {
      latitude,
      longitude,
      current_weather: true,
      hourly: "temperature_2m",
      timezone: "auto",
    },
  });

  return response.data;
}

// Format ISO local time into a human-readable Hebrew string
function formatLocalTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString("he-IL", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Main form submit handler: orchestrates fetching and displaying the weather
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();
  hideResult();

  const city = cityInput.value.trim();
  if (!city) {
    // Guard clause: no city provided
    showMessag("נא להזין שם עיר", "warning");
    return;
  }

  // Indicate loading state to the user
  showMessage("טוען נתוני מזג אוויר...", "info");

  try {
    // 1. Convert the city name to coordinates
    const location = await fetchCoordinatesByCity(city);
    // 2. Use the coordinates to fetch current weather
    const weather = await fetchWeather(location.latitude, location.longitude);

    const current = weather.current_weather;

    // 3. Update UI with the received data
    resultLocation.textContent = `${location.name}, ${location.country}`;
    resultTemp.textContent = `${current.temperature}°C`;
    resultDescription.textContent = `רוח: ${current.windspeed} קמ״ש, כיוון: ${current.winddirection}°`;
    const formattedTime = formatLocalTime(current.time);
    resultExtra.textContent = `שעה מקומית: ${formattedTime}`;

    showResult();
    clearMessage();
  } catch (error) {
    // Log error for debugging and show a user-friendly message
    console.error(error);
    showMessage("אירעה שגיאה בעת הבאת נתוני מזג האוויר. נסה שוב בעוד רגע.", "danger");
  }
});

// Handle light/dark theme toggling
function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  const theme = THEMES[currentTheme];
  applyTheme(theme);

  // Update button label according to the next possible state
  themeToggleButtons.textContent = currentTheme === "light" ? "מצב לילה" : "מצב יום";
}

if (themeToggleButton) {
  themeToggleButton.addEventListener("click", toggleTheme);
}

// Initialize app with default theme
applyTheme(THEMES[currentTheme]);
