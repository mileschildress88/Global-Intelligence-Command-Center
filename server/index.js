const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
const rateLimit = require('express-rate-limit');
const Parser = require('rss-parser');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const rssParser = new Parser({ timeout: 8000 });

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
    cache.set(cacheKey, response.data, 120); // 2 min — matches client poll interval
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
    const delay = (ms) => new Promise(r => setTimeout(r, ms));
    const results = [];
    for (const s of symbols) {
      const r = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${s}&apikey=${apiKey}`);
      results.push(r);
      await delay(200);
    }
    const data = results.reduce((acc, curr, i) => {
      acc[symbols[i]] = curr.data['Global Quote'];
      return acc;
    }, {});
    // Alpha Vantage returns empty Global Quote on rate limit — detect and fail clearly
    if (!data['SPY'] || Object.keys(data['SPY']).length === 0) {
      console.warn('Alpha Vantage rate limited or key invalid');
      return res.status(429).json({ error: 'Rate limited' });
    }
    cache.set(cacheKey, data, 4 * 60 * 60); // 4 hours — Alpha Vantage is 25 req/day
    res.json(data);
  } catch (error) {
    console.error('Stock API error:', error?.response?.data || error.message);
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
    { name:'Delhi',        lat:28.6,   lng:77.2   },
    { name:'Phoenix',      lat:33.4,   lng:-112.0  },
    { name:'Sydney',       lat:-33.8,  lng:151.2   },
    { name:'Cairo',        lat:30.0,   lng:31.2    },
    { name:'São Paulo',    lat:-23.5,  lng:-46.6   },
    { name:'Lagos',        lat:6.5,    lng:3.4     },
    { name:'Moscow',       lat:55.7,   lng:37.6    },
    { name:'Tokyo',        lat:35.7,   lng:139.7   },
    { name:'Los Angeles',  lat:34.0,   lng:-118.2  },
    { name:'Jakarta',      lat:-6.2,   lng:106.8   },
    { name:'Karachi',      lat:24.9,   lng:67.0    },
    { name:'Miami',        lat:25.8,   lng:-80.2   },
    { name:'Cape Town',    lat:-33.9,  lng:18.4    },
    { name:'Riyadh',       lat:24.7,   lng:46.7    },
    { name:'London',       lat:51.5,   lng:-0.1    },
    { name:'Beijing',      lat:39.9,   lng:116.4   }
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

// News Proxy (RSS — no API key required, categorized by type + region)
app.get('/api/news', async (req, res) => {
  const cacheKey = 'news_data';
  const cachedData = cache.get(cacheKey);
  if (cachedData) return res.set('X-Cache', 'HIT').json(cachedData);

  const feeds = [
    // === GLOBAL / GEOPOLITICAL — one feed per continent ===
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml',                          category: 'global', source: 'BBC News' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',               category: 'global', source: 'NY Times' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml',                            category: 'global', source: 'Al Jazeera' },        // Middle East
    { url: 'https://rss.dw.com/xml/rss-en-all',                                    category: 'global', source: 'Deutsche Welle' },    // Europe
    { url: 'https://www3.nhk.or.jp/rss/news/cat0.xml',                             category: 'global', source: 'NHK World' },         // Japan / Asia
    { url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',           category: 'global', source: 'Times of India' },    // South Asia
    { url: 'https://www.abc.net.au/news/feed/51120/rss.xml',                       category: 'global', source: 'ABC Australia' },     // Oceania
    { url: 'https://en.mercopress.com/rss',                                        category: 'global', source: 'MercoPress' },        // Latin America
    { url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml',                   category: 'global', source: 'BBC Africa' },        // Africa
    { url: 'https://feeds.reuters.com/reuters/topNews',                            category: 'global', source: 'Reuters' },

    // === ENVIRONMENTAL / CLIMATE ===
    { url: 'https://www.theguardian.com/environment/rss',                          category: 'environmental', source: 'The Guardian' },
    { url: 'https://earthobservatory.nasa.gov/feeds/earth-observatory.rss',        category: 'environmental', source: 'NASA Earth' },
    { url: 'https://insideclimatenews.org/feed/',                                  category: 'environmental', source: 'Inside Climate News' },
    { url: 'https://www.carbonbrief.org/feed',                                     category: 'environmental', source: 'Carbon Brief' },
    { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',        category: 'environmental', source: 'BBC Science' },

    // === MARKET / FINANCIAL ===
    { url: 'https://feeds.reuters.com/reuters/businessNews',                       category: 'market', source: 'Reuters Business' },
    { url: 'https://feeds.marketwatch.com/marketwatch/topstories/',                category: 'market', source: 'MarketWatch' },
    { url: 'https://finance.yahoo.com/news/rssindex',                              category: 'market', source: 'Yahoo Finance' },
    { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',               category: 'market', source: 'CNBC Markets' },
    { url: 'https://feeds.reuters.com/reuters/companyNews',                        category: 'market', source: 'Reuters Business' },

    // === WEATHER ===
    { url: 'https://www.nhc.noaa.gov/index-at.xml',                               category: 'weather', source: 'NHC Atlantic' },
    { url: 'https://www.nhc.noaa.gov/index-ep.xml',                               category: 'weather', source: 'NHC Pacific' },
    { url: 'https://www.theguardian.com/world/natural-disasters/rss',             category: 'weather', source: 'Guardian Disasters' },
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml',                         category: 'weather', source: 'BBC Weather' },      // filtered by keywords client-side
  ];

  try {
    const results = await Promise.allSettled(
      feeds.map(f => rssParser.parseURL(f.url).then(feed => ({ feed, meta: f })))
    );

    const seen = new Set();
    const articles = [];

    for (const result of results) {
      if (result.status !== 'fulfilled') continue;
      const { feed, meta } = result.value;
      for (const item of (feed.items || []).slice(0, 6)) {
        if (!item.title) continue;
        const key = item.title.slice(0, 60).toLowerCase();
        if (seen.has(key)) continue; // deduplicate
        seen.add(key);
        articles.push({
          title: item.title,
          description: item.contentSnippet || item.summary || '',
          source: { name: meta.source },
          publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
          url: item.link || '',
          category: meta.category,
        });
      }
    }

    articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    const payload = { articles: articles.slice(0, 80) };
    cache.set(cacheKey, payload, 5 * 60);
    res.json(payload);
  } catch (error) {
    console.error('News RSS error:', error.message);
    res.status(500).json({ error: 'Failed to fetch news data' });
  }
});

// USGS Earthquake Feed (free, real-time, no key)
app.get('/api/earthquakes', async (req, res) => {
  const cacheKey = 'earthquake_data';
  const cached = cache.get(cacheKey);
  if (cached) return res.set('X-Cache', 'HIT').json(cached);

  try {
    const response = await axios.get(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson',
      { timeout: 8000 }
    );
    cache.set(cacheKey, response.data, 10 * 60); // 10 min cache
    res.json(response.data);
  } catch (error) {
    console.error('USGS error:', error.message);
    res.status(500).json({ error: 'Failed to fetch earthquake data' });
  }
});

// Commodities: Gold (CoinGecko pax-gold) + WTI Oil (Yahoo Finance)
app.get('/api/market/commodities', async (req, res) => {
  const cacheKey = 'commodities_data';
  const cached = cache.get(cacheKey);
  if (cached) return res.set('X-Cache', 'HIT').json(cached);

  let gold = null, oil = null;

  // Gold via pax-gold on CoinGecko (1 PAXG = 1 troy oz gold, free, no key)
  try {
    const r = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: { ids: 'pax-gold', vs_currencies: 'usd', include_24hr_change: 'true' },
      timeout: 8000,
    });
    const g = r.data['pax-gold'];
    if (g) gold = { price: g.usd, change24h: g.usd_24h_change };
  } catch (e) {
    console.warn('Gold (PAXG) fetch failed:', e.message);
  }

  // WTI Crude Oil via Yahoo Finance (CL=F futures, no key required)
  try {
    const r = await axios.get('https://query1.finance.yahoo.com/v8/finance/chart/CL=F', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 8000,
    });
    const meta = r.data?.chart?.result?.[0]?.meta;
    if (meta?.regularMarketPrice) {
      const price = meta.regularMarketPrice;
      const prev = meta.previousClose || meta.chartPreviousClose || price;
      const change24h = ((price - prev) / prev) * 100;
      oil = { price, change24h };
    }
  } catch (e) {
    console.warn('Oil (WTI) fetch failed:', e.message);
  }

  const payload = { gold, oil };
  cache.set(cacheKey, payload, 5 * 60); // 5 min cache
  res.json(payload);
});

// CNN Fear & Greed Index
app.get('/api/feargreed', async (req, res) => {
  const cacheKey = 'feargreed_data';
  const cachedData = cache.get(cacheKey);
  if (cachedData) return res.set('X-Cache', 'HIT').json(cachedData);

  try {
    const response = await axios.get('https://production.dataviz.cnn.io/index/fearandgreed/graphdata', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.cnn.com/',
        'Accept': 'application/json',
      }
    });
    const fg = response.data.fear_and_greed;
    const payload = {
      score: Math.round(fg.score),
      rating: fg.rating,
      previousClose: Math.round(fg.previous_close),
      previousWeek: Math.round(fg.previous_1_week),
      previousMonth: Math.round(fg.previous_1_month),
      timestamp: fg.timestamp,
    };
    cache.set(cacheKey, payload, 10 * 60); // 10 min — matches client poll interval
    res.json(payload);
  } catch (error) {
    console.error('Fear & Greed error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch Fear & Greed data' });
  }
});

// Forex — Frankfurter API (ECB data, free, no key, single call)
app.get('/api/market/forex', async (req, res) => {
  const cacheKey = 'forex_data';
  const cached = cache.get(cacheKey);
  if (cached) return res.set('X-Cache', 'HIT').json(cached);

  try {
    // Two calls: today + yesterday for 24h change
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const [todayRes, yestRes] = await Promise.all([
      axios.get('https://api.frankfurter.app/latest?from=USD', { timeout: 8000 }),
      axios.get(`https://api.frankfurter.app/${yesterday}?from=USD`, { timeout: 8000 }),
    ]);

    const today = todayRes.data?.rates ?? {};
    const yest  = yestRes.data?.rates ?? today;

    // Frankfurter returns rates per 1 USD. Convert to standard pair notation.
    const pair = (todayRate, yestRate) => ({
      rate: todayRate,
      change24h: yestRate ? ((todayRate - yestRate) / yestRate) * 100 : 0,
    });

    const result = {
      eurUsd: pair(today.EUR ? +(1 / today.EUR).toFixed(5) : 0, yest.EUR ? 1 / yest.EUR : 0),
      gbpUsd: pair(today.GBP ? +(1 / today.GBP).toFixed(5) : 0, yest.GBP ? 1 / yest.GBP : 0),
      usdJpy: pair(today.JPY ? +today.JPY.toFixed(3) : 0,  yest.JPY ?? 0),
      usdChf: pair(today.CHF ? +today.CHF.toFixed(5) : 0,  yest.CHF ?? 0),
      audUsd: pair(today.AUD ? +(1 / today.AUD).toFixed(5) : 0, yest.AUD ? 1 / yest.AUD : 0),
      usdCad: pair(today.CAD ? +today.CAD.toFixed(5) : 0,  yest.CAD ?? 0),
    };

    cache.set(cacheKey, result, 5 * 60);
    res.json(result);
  } catch (error) {
    console.warn('Forex fetch failed:', error.message);
    res.status(500).json({ error: 'Failed to fetch forex data' });
  }
});

// GDELT Conflict Events — free, no key, 65k+ sources (gdeltproject.org)
app.get('/api/gdelt', async (req, res) => {
  const cacheKey = 'gdelt_data';
  const cached = cache.get(cacheKey);
  if (cached) return res.set('X-Cache', 'HIT').json(cached);

  try {
    const query = 'conflict OR attack OR war OR protest OR coup OR explosion OR military OR bombing OR riot OR clash OR airstrike OR offensive OR siege OR invasion OR insurgent';
    const r = await axios.get('https://api.gdeltproject.org/api/v2/doc/doc', {
      params: {
        query,
        mode: 'artlist',
        format: 'json',
        maxrecords: 250,
        sort: 'datedesc',
        timespan: '24h',
        sourcelang: 'english',
      },
      timeout: 12000,
    });
    const articles = r.data?.articles ?? [];
    cache.set(cacheKey, articles, 15 * 60); // 15 min cache
    res.json(articles);
  } catch (error) {
    console.warn('GDELT fetch failed:', error.message);
    res.status(500).json({ error: 'Failed to fetch GDELT data' });
  }
});

// Groq AI Proxy (free tier — get key at console.groq.com)
app.post('/api/ai/analyze', async (req, res) => {
  const { prompt } = req.body;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing GROQ_API_KEY' });

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Groq API error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'AI Analysis failed' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
