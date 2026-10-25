const request = require('supertest');
const app = require('../server');
const { describeCode } = require('../weather');

const geoOk = { results: [{ name: 'Pune', country: 'India', latitude: 18.52, longitude: 73.85 }] };
const forecastOk = {
  current: { temperature_2m: 27.5, relative_humidity_2m: 60, wind_speed_10m: 8.4, weather_code: 2 },
  daily: {
    time: ['2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29'],
    temperature_2m_max: [31, 32, 30, 29, 30],
    temperature_2m_min: [20, 21, 20, 19, 20],
    weather_code: [2, 1, 3, 61, 0],
  },
};

function mockFetch(...bodies) {
  const spy = jest.spyOn(global, 'fetch');
  bodies.forEach((b) => spy.mockResolvedValueOnce({ ok: true, json: async () => b }));
  return spy;
}

afterEach(() => jest.restoreAllMocks());

describe('Weather Dashboard API', () => {
  test('GET /health returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET / serves the frontend page', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Weather Dashboard');
  });

  test('GET /api/weather without city returns 400', async () => {
    const res = await request(app).get('/api/weather');
    expect(res.statusCode).toBe(400);
  });

  test('GET /api/weather for unknown city returns 404', async () => {
    mockFetch({});
    const res = await request(app).get('/api/weather?city=Nowhereville');
    expect(res.statusCode).toBe(404);
  });

  test('GET /api/weather returns city and current conditions', async () => {
    mockFetch(geoOk, forecastOk);
    const res = await request(app).get('/api/weather?city=Pune');
    expect(res.statusCode).toBe(200);
    expect(res.body.city).toBe('Pune');
    expect(res.body.country).toBe('India');
    expect(res.body.current.temperature).toBe(27.5);
    expect(res.body.current.description).toBe('Partly cloudy');
  });

  test('GET /api/weather returns a 5-day forecast', async () => {
    mockFetch(geoOk, forecastOk);
    const res = await request(app).get('/api/weather?city=Pune');
    expect(res.body.forecast).toHaveLength(5);
    expect(res.body.forecast[3].description).toBe('Light rain');
  });

  test('GET /api/weather returns 502 when the weather service fails', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: false, status: 500 });
    const res = await request(app).get('/api/weather?city=Pune');
    expect(res.statusCode).toBe(502);
  });

  test('describeCode maps known and unknown codes', () => {
    expect(describeCode(0)).toBe('Clear sky');
    expect(describeCode(12345)).toBe('Unknown');
  });
});
