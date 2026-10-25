// Helpers around the free Open-Meteo APIs (no API key needed).
const CODES = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  80: 'Rain showers', 81: 'Rain showers', 82: 'Violent rain showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail',
};

function describeCode(code) {
  return CODES[code] || 'Unknown';
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Upstream error ${res.status}`);
  return res.json();
}

async function getWeather(city) {
  const geo = await getJson(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
  );
  if (!geo.results || geo.results.length === 0) return null;
  const place = geo.results[0];

  const f = await getJson(
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${place.latitude}&longitude=${place.longitude}` +
    '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min' +
    '&timezone=auto&forecast_days=5'
  );

  return {
    city: place.name,
    country: place.country,
    current: {
      temperature: f.current.temperature_2m,
      humidity: f.current.relative_humidity_2m,
      windSpeed: f.current.wind_speed_10m,
      code: f.current.weather_code,
      description: describeCode(f.current.weather_code),
    },
    forecast: f.daily.time.map((date, i) => ({
      date,
      max: f.daily.temperature_2m_max[i],
      min: f.daily.temperature_2m_min[i],
      code: f.daily.weather_code[i],
      description: describeCode(f.daily.weather_code[i]),
    })),
  };
}

module.exports = { describeCode, getWeather };
