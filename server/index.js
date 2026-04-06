const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;
const cache = new NodeCache({ stdTTL: 60 });

app.use(cors());
app.use(express.json());

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' }
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'AI rate limit exceeded' }
});

app.use('/api/', generalLimiter);
app.use('/api/ai/analyze', aiLimiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Crypto Proxy
app.get('/api/market/crypto', async (req, res) => {
  const cacheKey = 'crypto_data';
  const cachedData = cache.get(cacheKey);
  if (cachedData) return res.set('X-Cache', 'HIT').json(cachedData);

  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'bitcoin,ethereum,solana',
        vs_currencies: 'usd',
        include_24hr_change: 'true'
      }
    });
    cache.set(cacheKey, response.data, 60);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch crypto data' });
  }
});

// Stocks/Market Proxy (Alpha Vantage)
app.get('/api/market/stocks', async (req, res) => {
  const cacheKey = 'stock_data';
  const cachedData = cache.get(cacheKey);
  if (cachedData) return res.set('X-Cache', 'HIT').json(cachedData);

  const apiKey = process.env.ALPHA_VANTAGE_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing API Key' });

  try {
    const symbols = ['SPY', 'QQQ', '^VIX'];
    const results = await Promise.all(symbols.map(s => 
      axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${s}&apikey=${apiKey}`)
    ));
    const data = results.reduce((acc, curr, i) => {
      acc[symbols[i]] = curr.data['Global Quote'];
      return acc;
    }, {});
    cache.set(cacheKey, data, 300);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

// Environmental Proxy (OpenAQ)
app.get('/api/environmental', async (req, res) => {
  const cacheKey = 'env_data';
  const cachedData = cache.get(cacheKey);
  if (cachedData) return res.set('X-Cache', 'HIT').json(cachedData);

  try {
    const response = await axios.get('https://api.openaq.org/v2/latest', {
      params: { limit: 200, parameter: 'pm25', order_by: 'value', sort: 'desc' }
    });
    cache.set(cacheKey, response.data, 300);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch environmental data' });
  }
});

// Weather Proxy (Open-Meteo)
app.get('/api/weather', async (req, res) => {
  const cacheKey = 'weather_data';
  const cachedData = cache.get(cacheKey);
  if (cachedData) return res.set('X-Cache', 'HIT').json(cachedData);

  const cities = [
    { name:'Delhi',     lat:28.6,   lng:77.2  },
    { name:'Phoenix',   lat:33.4,   lng:-112.0 },
    { name:'Sydney',    lat:-33.8,  lng:151.2  },
    { name:'Cairo',     lat:30.0,   lng:31.2   }
  ];

  try {
    const results = await Promise.all(cities.map(c => 
      axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lng}&current_weather=true`)
    ));
    const data = results.map((r, i) => ({ ...cities[i], weather: r.data.current_weather }));
    cache.set(cacheKey, data, 600);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// News Proxy (GNews)
app.get('/api/news', async (req, res) => {
  const cacheKey = 'news_data';
  const cachedData = cache.get(cacheKey);
  if (cachedData) return res.set('X-Cache', 'HIT').json(cachedData);

  const apiKey = process.env.GNEWS_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing API Key' });

  try {
    const response = await axios.get(`https://gnews.io/api/v4/search?q=climate+crisis+OR+flood+OR+wildfire+OR+market+crash&lang=en&max=10&token=${apiKey}`);
    cache.set(cacheKey, response.data, 300);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news data' });
  }
});

// Gemini AI Proxy
app.post('/api/ai/analyze', async (req, res) => {
  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing API Key' });

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Analysis failed' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
