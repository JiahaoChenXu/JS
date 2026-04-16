/* =========================================================
   WANDR — Travel Dashboard  |  main.js
   APIs: Open-Meteo (weather, gratis) + Frankfurter (forex, gratis)
   ========================================================= */

// ── i18n ─────────────────────────────────────────────────

const translations = {
  es: {
    hero_eyebrow:        "Tu viaje empieza aquí",
    hero_title:          "¿A dónde<br/><em>vas?</em>",
    label_origin:        "🛫 Origen",
    label_destination:   "🛬 Destino",
    opt_choose_origin:   "Elige tu ciudad",
    opt_choose_destination: "Elige destino",
    btn_explore:         "Explorar destino",
    loading:             "Cargando datos…",
    card_summary:        "Destino",
    card_weather:        "Tiempo",
    card_currency:       "Moneda",
    card_tip:            "Consejo de viaje",
    meta_temp:           "Temp.",
    meta_currency:       "Moneda",
    meta_origin:         "Desde",
    weather_feels:       "Sensación",
    weather_wind:        "Viento",
    weather_humidity:    "Humedad",
    rain_none:           "☀️ Sin lluvia",
    rain_possible:       "🌦️ Posible lluvia",
    rain_likely:         "🌧️ Probable lluvia",
    footer_text:         "Powered por Open-Meteo y Frankfurter API",
    err_same_city:       "⚠️ El origen y el destino no pueden ser la misma ciudad.",
    err_weather:         "No se pudo obtener el tiempo. Intenta de nuevo.",
    err_currency:        "No se pudo obtener el tipo de cambio.",
  },
  en: {
    hero_eyebrow:        "Your journey begins here",
    hero_title:          "Where are<br/><em>you going?</em>",
    label_origin:        "🛫 Origin",
    label_destination:   "🛬 Destination",
    opt_choose_origin:   "Choose your city",
    opt_choose_destination: "Choose destination",
    btn_explore:         "Explore destination",
    loading:             "Loading data…",
    card_summary:        "Destination",
    card_weather:        "Weather",
    card_currency:       "Currency",
    card_tip:            "Travel Tip",
    meta_temp:           "Temp.",
    meta_currency:       "Currency",
    meta_origin:         "From",
    weather_feels:       "Feels like",
    weather_wind:        "Wind",
    weather_humidity:    "Humidity",
    rain_none:           "☀️ No rain",
    rain_possible:       "🌦️ Possible rain",
    rain_likely:         "🌧️ Probable rain",
    footer_text:         "Powered by Open-Meteo & Frankfurter API",
    err_same_city:       "⚠️ Origin and destination cannot be the same city.",
    err_weather:         "Could not fetch weather data. Please try again.",
    err_currency:        "Could not fetch exchange rate.",
  }
};

let currentLang = "es";

function t(key) {
  return translations[currentLang][key] ?? translations.en[key] ?? key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (el.tagName === "OPTION") {
      el.textContent = val;
    } else {
      el.innerHTML = val;
    }
  });
  document.getElementById("lang-label").textContent = currentLang === "es" ? "EN" : "ES";
  document.documentElement.lang = currentLang;
}

// ── City Data ─────────────────────────────────────────────

const CITIES = {
  barcelona: { name: "Barcelona", country: "España",        lat: 41.3888, lon: 2.1590,   currency: "EUR", flag: "🇪🇸" },
  london:    { name: "London",    country: "United Kingdom", lat: 51.5074, lon: -0.1278,  currency: "GBP", flag: "🇬🇧" },
  paris:     { name: "Paris",     country: "France",         lat: 48.8566, lon: 2.3522,   currency: "EUR", flag: "🇫🇷" },
  new_york:  { name: "New York",  country: "United States",  lat: 40.7128, lon: -74.0060, currency: "USD", flag: "🇺🇸" },
  tokyo:     { name: "Tokyo",     country: "Japan",          lat: 35.6762, lon: 139.6503, currency: "JPY", flag: "🇯🇵" },
  berlin:    { name: "Berlin",    country: "Germany",        lat: 52.5200, lon: 13.4050,  currency: "EUR", flag: "🇩🇪" },
  rome:      { name: "Rome",      country: "Italy",          lat: 41.9028, lon: 12.4964,  currency: "EUR", flag: "🇮🇹" },
  dubai:     { name: "Dubai",     country: "UAE",            lat: 25.2048, lon: 55.2708,  currency: "AED", flag: "🇦🇪" },
  sydney:    { name: "Sydney",    country: "Australia",      lat: -33.8688, lon: 151.2093,currency: "AUD", flag: "🇦🇺" },
};

// ── WMO Weather codes → emoji + description ───────────────

function weatherCodeInfo(code) {
  if (code === 0)               return { emoji: "☀️",  desc: { es: "Despejado",        en: "Clear sky" } };
  if (code <= 2)                return { emoji: "🌤️", desc: { es: "Parcialmente nublado", en: "Partly cloudy" } };
  if (code === 3)               return { emoji: "☁️",  desc: { es: "Nublado",           en: "Overcast" } };
  if (code <= 49)               return { emoji: "🌫️", desc: { es: "Niebla",            en: "Fog" } };
  if (code <= 59)               return { emoji: "🌦️", desc: { es: "Llovizna",          en: "Drizzle" } };
  if (code <= 69)               return { emoji: "🌧️", desc: { es: "Lluvia",            en: "Rain" } };
  if (code <= 79)               return { emoji: "❄️",  desc: { es: "Nieve",             en: "Snow" } };
  if (code <= 84)               return { emoji: "🌦️", desc: { es: "Chubascos",         en: "Showers" } };
  if (code <= 94)               return { emoji: "⛈️", desc: { es: "Tormenta",          en: "Thunderstorm" } };
  return { emoji: "⛈️", desc: { es: "Tormenta fuerte", en: "Heavy storm" } };
}

function rainLabel(prob) {
  if (prob <= 20) return t("rain_none");
  if (prob <= 50) return t("rain_possible");
  return t("rain_likely");
}

// ── Tip Generator ─────────────────────────────────────────

function generateTip(city, weather, convertedAmount, originCurrency, destCurrency, amount) {
  const name = city.name;
  const temp = weather.temp;
  const tips_es = [
    temp >= 25 ? `☀️ Hace buen tiempo para pasear por ${name}. ¡Lleva protector solar!`
               : temp <= 10 ? `🧥 Recuerda llevar chaqueta: la temperatura en ${name} es bastante baja.`
               : `🌤️ Tiempo agradable en ${name}. ¡Perfecto para explorar la ciudad!`,
    `💱 ${amount} ${originCurrency} equivalen a ${convertedAmount} ${destCurrency}.`,
    `✈️ Tu viaje desde ${CITIES[document.getElementById("origin-select").value]?.name ?? "origen"} a ${name} promete ser una gran aventura.`,
  ];
  const tips_en = [
    temp >= 25 ? `☀️ Great weather to walk around ${name}. Don't forget sunscreen!`
               : temp <= 10 ? `🧥 Pack a jacket — temperatures in ${name} are quite low.`
               : `🌤️ Pleasant weather in ${name}. Perfect for exploring the city!`,
    `💱 ${amount} ${originCurrency} is approximately ${convertedAmount} ${destCurrency}.`,
    `✈️ Your trip from ${CITIES[document.getElementById("origin-select").value]?.name ?? "origin"} to ${name} promises to be a great adventure.`,
  ];
  const pool = currentLang === "es" ? tips_es : tips_en;
  // pick a tip based on temperature focus first, then currency note
  const idx = Math.abs(temp) % 2 === 0 ? 0 : 1;
  return pool[idx];
}

// ── Fetch: Weather ────────────────────────────────────────

async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,wind_speed_10m,weather_code` +
    `&wind_speed_unit=kmh&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather API error");
  const data = await res.json();
  const c = data.current;
  return {
    temp:      Math.round(c.temperature_2m),
    feels:     Math.round(c.apparent_temperature),
    humidity:  c.relative_humidity_2m,
    wind:      Math.round(c.wind_speed_10m),
    rainProb:  c.precipitation_probability ?? 0,
    code:      c.weather_code,
  };
}

// ── Fetch: Currency (Frankfurter — exact daily rates) ─────

async function fetchRate(from, to) {
  if (from === to) return { rate: 1, date: "—" };
  const url = `https://api.frankfurter.app/latest?from=${from}&to=${to}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Currency API error");
  const data = await res.json();
  return { rate: data.rates[to], date: data.date };
}

// ── DOM Helpers ───────────────────────────────────────────

function show(el)  { el.classList.remove("hidden"); }
function hide(el)  { el.classList.add("hidden"); }

function setLoading(on) {
  const ls = document.getElementById("loading-state");
  const cg = document.getElementById("cards-grid");
  if (on) { show(ls); hide(cg); } else { hide(ls); show(cg); }
}

function showError(msg) {
  const es = document.getElementById("error-state");
  document.getElementById("error-msg").textContent = msg;
  show(es);
  setTimeout(() => hide(es), 6000);
}

// ── Render ────────────────────────────────────────────────

let currentRate = 1;
let currentDestCurrency = "EUR";
let currentOriginCurrency = "EUR";

function renderCurrencyResult(amount) {
  const converted = (amount * currentRate).toLocaleString(currentLang === "es" ? "es-ES" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  document.getElementById("currency-result").textContent = `${converted} ${currentDestCurrency}`;
  return `${converted}`;
}

async function loadDashboard(originKey, destKey) {
  const origin = CITIES[originKey];
  const dest   = CITIES[destKey];

  // show content area
  const dc = document.getElementById("dashboard-content");
  show(dc);

  // hide error
  hide(document.getElementById("error-state"));

  setLoading(true);

  let weather, rateData;

  // Fetch in parallel
  try {
    [weather, rateData] = await Promise.all([
      fetchWeather(dest.lat, dest.lon),
      fetchRate(origin.currency, dest.currency),
    ]);
  } catch (e) {
    setLoading(false);
    hide(document.getElementById("cards-grid"));
    showError(e.message.includes("Weather") ? t("err_weather") : t("err_currency"));
    return;
  }

  setLoading(false);

  // Store for re-use
  currentRate           = rateData.rate;
  currentDestCurrency   = dest.currency;
  currentOriginCurrency = origin.currency;

  // ── Summary ──
  document.getElementById("summary-city").textContent    = `${dest.flag} ${dest.name}`;
  document.getElementById("summary-country").textContent = dest.country;
  document.getElementById("summary-temp").textContent    = `${weather.temp}°C`;
  document.getElementById("summary-currency").textContent= dest.currency;
  document.getElementById("summary-origin").textContent  = `${origin.flag} ${origin.name}`;

  // ── Weather ──
  const wInfo = weatherCodeInfo(weather.code);
  document.getElementById("weather-temp").textContent    = `${weather.temp}°C`;
  document.getElementById("weather-emoji").textContent   = wInfo.emoji;
  document.getElementById("weather-feels").textContent   = `${weather.feels}°C`;
  document.getElementById("weather-wind").textContent    = `${weather.wind} km/h`;
  document.getElementById("weather-humidity").textContent= `${weather.humidity}%`;

  const prob = weather.rainProb;
  document.getElementById("rain-label-text").textContent = rainLabel(prob);
  document.getElementById("rain-percent").textContent    = `${prob}%`;
  const fill = document.getElementById("rain-bar-fill");
  setTimeout(() => { fill.style.width = `${prob}%`; }, 100);

  // ── Currency ──
  document.getElementById("currency-from-name").textContent = `${origin.currency} (${origin.name})`;
  document.getElementById("currency-to-name").textContent   = `${dest.currency} (${dest.name})`;
  document.getElementById("currency-from-label").textContent= origin.currency;
  document.getElementById("currency-rate-text").textContent =
    `1 ${origin.currency} = ${rateData.rate.toFixed(4)} ${dest.currency} · ${rateData.date}`;

  const amount = parseFloat(document.getElementById("currency-amount").value) || 100;
  const convertedStr = renderCurrencyResult(amount);

  // ── Tip ──
  document.getElementById("tip-message").textContent =
    generateTip(dest, weather, convertedStr, origin.currency, dest.currency, amount);
}

// ── Event Listeners ───────────────────────────────────────

const originSelect  = document.getElementById("origin-select");
const citySelect    = document.getElementById("city-select");
const exploreBtn    = document.getElementById("explore-btn");
const currencyInput = document.getElementById("currency-amount");
const langToggle    = document.getElementById("lang-toggle");

function updateExploreBtn() {
  exploreBtn.disabled = !(originSelect.value && citySelect.value);
}

originSelect.addEventListener("change", updateExploreBtn);
citySelect.addEventListener("change", updateExploreBtn);

exploreBtn.addEventListener("click", () => {
  const o = originSelect.value;
  const d = citySelect.value;
  if (!o || !d) return;
  if (o === d) {
    showError(t("err_same_city"));
    const dc = document.getElementById("dashboard-content");
    show(dc);
    return;
  }
  loadDashboard(o, d);
});

currencyInput.addEventListener("input", () => {
  const val = parseFloat(currencyInput.value);
  if (!isNaN(val) && val >= 0) {
    renderCurrencyResult(val);
  }
});

langToggle.addEventListener("click", () => {
  currentLang = currentLang === "es" ? "en" : "es";
  applyTranslations();
  // Re-render tip if dashboard is active
  if (!document.getElementById("dashboard-content").classList.contains("hidden") &&
      !document.getElementById("cards-grid").classList.contains("hidden")) {
    const o = originSelect.value;
    const d = citySelect.value;
    if (o && d && o !== d) {
      // Just re-render the tip text and labels without refetching
      const dest   = CITIES[d];
      const origin = CITIES[o];
      const amount = parseFloat(currencyInput.value) || 100;
      const converted = (amount * currentRate).toLocaleString(currentLang === "es" ? "es-ES" : "en-US", {
        minimumFractionDigits: 2, maximumFractionDigits: 2,
      });
      document.getElementById("currency-from-name").textContent = `${origin.currency} (${origin.name})`;
      document.getElementById("currency-to-name").textContent   = `${dest.currency} (${dest.name})`;
      document.getElementById("currency-from-label").textContent= origin.currency;
      document.getElementById("rain-label-text").textContent    =
        rainLabel(parseInt(document.getElementById("rain-percent").textContent));

      // Fetch temp from summary for tip
      const tempStr = document.getElementById("summary-temp").textContent;
      const temp = parseInt(tempStr) || 20;
      document.getElementById("tip-message").textContent =
        generateTip(dest, { temp }, converted, origin.currency, dest.currency, amount);
    }
  }
});

// ── Init ──────────────────────────────────────────────────

applyTranslations();