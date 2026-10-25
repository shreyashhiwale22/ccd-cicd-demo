const express = require('express');
const path = require('path');
const { getWeather } = require('./weather');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Change this text for the "source code change and re-run" step of the report.
const HEALTH_MESSAGE = 'Server is running - version 1';

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: HEALTH_MESSAGE });
});

app.get('/api/weather', async (req, res) => {
  const city = (req.query.city || '').trim();
  if (!city) return res.status(400).json({ error: 'Provide a city, e.g. /api/weather?city=Pune' });
  try {
    const data = await getWeather(city);
    if (!data) return res.status(404).json({ error: `City "${city}" not found` });
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Weather service unavailable' });
  }
});

module.exports = app;
