# JS
# Travel Dashboard ✈️🌍

> Práctica evaluable de HTML5, CSS3 y JavaScript vanilla.  
> Dashboard interactivo que muestra información útil para viajar a diferentes ciudades (clima, moneda, conversión EUR → moneda local y recomendaciones).

## 📌 Descripción

Aplicación web que permite al usuario seleccionar una ciudad y visualizar en tiempo real:

- Resumen de la ciudad (nombre, país, temperatura actual, moneda local)
- Información meteorológica (temperatura y probabilidad de lluvia con representación visual/textual)
- Conversor de divisas (EUR → moneda local de la ciudad seleccionada)
- Mensaje o recomendación de viaje generado dinámicamente según los datos cargados

Los datos se obtienen mediante **fetch** desde APIs externas:
- **Clima**: OpenMeteo API
- **Conversión de moneda**: ExchangeRate-API o FetchMock (según disponibilidad)

## 🧰 Tecnologías utilizadas

| Tecnología | Uso |
|------------|------|
| HTML5 | Estructura semántica del documento |
| CSS3 | Diseño responsive, Mobile First, Flexbox/Grid |
| JavaScript (ES6+) | Lógica de la app, manipulación del DOM, eventos asíncronos |
| Fetch / Async-Await | Consumo de APIs externas |
| Git | Control de versiones (mínimo 20 commits requeridos) |
| Vercel | Despliegue y hosting de la aplicación |

## 🧪 Funcionalidades principales

### 1. Selector de ciudades
- Ciudades predefinidas: Barcelona, London, Paris, New York, Tokyo
- Cada ciudad tiene: nombre, país, latitud, longitud, moneda local

### 2. Resumen de la destinación
- Muestra ciudad, país, temperatura actual y moneda local

### 3. Información meteorológica (API)
- Temperatura actual (°C)
- Probabilidad de lluvia (%)
- Clasificación textual/visual:
  - 0–20% → ☀️ Sin lluvia
  - 20–50% → 🌦️ Posible lluvia
  - ≥50%   → 🌧️ Probable lluvia

### 4. Conversor de moneda (API)
- Introducir cantidad en EUR
- Muestra conversión a la moneda local de la ciudad seleccionada

### 5. Mensaje dinámico de viaje
- Ejemplos:  
  - *"☀️ Hoy hace buen tiempo para pasear por Londres."*  
  - *"🧥 Recuerda llevar chaqueta: la temperatura es baja."*  
  - *"💶 100 EUR equivalen a 15000 JPY."*

## 📱 Diseño responsive

- Enfoque **Mobile First**
- Adaptación fluida a tablets y desktop
- Estructura visual clara con:
  - Cabecera
  - Selector de ciudad
  - Cards de información (resumen, clima, conversor)

## 🗂️ Estructura del proyecto
TravelDashboard/
├── index.html # Estructura principal
├── css/
│ └── style.css # Estilos responsive y mobile first
├── js/
│ └── main.js # Lógica JS (fetch, eventos, DOM)
├── assets/ # Imágenes, iconos, etc.
└── README.md # Este archivo

## 🚀 Cómo ejecutar el proyecto

### Opción 1: Local
```bash
git clone https://github.com/tu-usuario/travel-dashboard.git
cd travel-dashboard
```
# Abrir index.html con Live Server o similar

### Opción 2: Deploy en Vercel
```bash
vercel --prod
```

## 🌍 APIs utilizadas

| API | Endpoint ejemplo | Uso |
|-----|----------------|------|
| OpenMeteo | `api.open-meteo.com/v1/forecast?latitude=...&current_weather=true&hourly=precipitation_probability` | Clima actual y probabilidad de lluvia |
| ExchangeRate-API | `api.exchangerate-api.com/v4/latest/EUR` | Conversión EUR → moneda local |
