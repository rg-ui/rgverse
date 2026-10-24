const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const REMOTE_API_BASE = 'https://akkistudyxpro-44094a367971.herokuapp.com';
const APNA_API_BASE = 'https://ac.lrnt.ccwu.cc';

// Enable CORS and cache headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static assets
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname)));

// High-speed memory cache
const cache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 1 min for general APIs
const IMAGE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours for thumbnails & images

// 1. Reverse Proxy for /api/* (PW, NextToppers, Thumbnails, Backend)
app.all('/api/*', async (req, res) => {
  const targetUrl = REMOTE_API_BASE + req.originalUrl;
  const cacheKey = `${req.method}:${req.originalUrl}`;
  const isThumb = req.originalUrl.includes('/api/thumb');

  // Check cache for GET requests
  if (req.method === 'GET') {
    const cached = cache.get(cacheKey);
    const ttl = isThumb ? IMAGE_TTL_MS : CACHE_TTL_MS;
    if (cached && (Date.now() - cached.timestamp < ttl)) {
      res.setHeader('Content-Type', cached.contentType);
      res.setHeader('X-Cache', 'HIT');
      if (isThumb || cached.isBinary) {
        res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
      }
      return res.status(cached.status).send(cached.data);
    }
  }

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': req.headers['accept'] || '*/*',
        'Referer': REMOTE_API_BASE + '/app',
      }
    };

    if (req.headers['content-type']) {
      fetchOptions.headers['Content-Type'] = req.headers['content-type'];
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      if (chunks.length > 0) {
        fetchOptions.body = Buffer.concat(chunks);
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    fetchOptions.signal = controller.signal;

    const remoteRes = await fetch(targetUrl, fetchOptions);
    clearTimeout(timeout);

    const contentType = remoteRes.headers.get('content-type') || 'application/json';

    // JSON or text responses
    if (contentType.includes('application/json') || contentType.includes('text/')) {
      let text = await remoteRes.text();

      // IMPORTANT: First strip any absolute Heroku URLs so all links/thumbs become relative local URLs
      text = text
        .replace(/https:\/\/(?:akkistudyxpro|RG\s*VERSE)-44094a367971\.herokuapp\.com/gi, '')
        .replace(/https:\/\/akkistudyxpro-44094a367971\.herokuapp\.com/gi, '');

      // Rebrand visible backend responses without corrupting URLs
      text = text
        .replace(/Akki\s*Study\s*X\s*Pro/gi, 'RG VERSE')
        .replace(/Akki\s*Study\s*X\s*Main/gi, 'RG Verse Official')
        .replace(/Akki\s*Study\s*X/gi, 'RG VERSE')
        .replace(/AKKISTUDYX1/gi, 'RGVerseOfficial')
        .replace(/AkkiRobo_Bot/gi, 'RGVerseBot')
        .replace(/AkkiStudyX_App/gi, 'RGVerseBot')
        .replace(/t\.me\/AKKISTUDYX1/gi, 't.me/RGVerseOfficial')
        .replace(/Made By Akki In/gi, 'Made with ❤️ by RG Verse in');

      if (req.method === 'GET' && remoteRes.status === 200) {
        cache.set(cacheKey, {
          timestamp: Date.now(),
          status: remoteRes.status,
          contentType,
          data: text
        });
      }

      res.status(remoteRes.status);
      res.setHeader('Content-Type', contentType);
      return res.send(text);
    } else {
      // Binary data: Images, Thumbnails, PDFs, etc.
      const arrayBuffer = await remoteRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Cache images for 24 hours for instant loading
      if (req.method === 'GET' && remoteRes.status === 200) {
        cache.set(cacheKey, {
          timestamp: Date.now(),
          status: remoteRes.status,
          contentType,
          data: buffer,
          isBinary: true
        });
      }

      res.status(remoteRes.status);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
      return res.send(buffer);
    }
  } catch (err) {
    console.error(`[API Proxy Error] ${req.method} ${targetUrl}:`, err.message);

    const cached = cache.get(cacheKey);
    if (cached) {
      res.setHeader('Content-Type', cached.contentType);
      res.setHeader('X-Cache', 'STALE');
      return res.status(cached.status).send(cached.data);
    }

    res.status(502).json({
      success: false,
      error: 'Backend request failed: ' + err.message,
      target: targetUrl
    });
  }
});

// 2. Reverse Proxy for /data/* (Apna College)
app.all('/data/*', async (req, res) => {
  const targetUrl = APNA_API_BASE + req.originalUrl;
  const cacheKey = `data:${req.originalUrl}`;

  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS * 5)) {
    res.setHeader('Content-Type', cached.contentType);
    res.setHeader('X-Cache', 'HIT');
    return res.status(cached.status).send(cached.data);
  }

  try {
    const remoteRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    const contentType = remoteRes.headers.get('content-type') || 'application/json';
    const text = await remoteRes.text();

    if (remoteRes.status === 200) {
      cache.set(cacheKey, {
        timestamp: Date.now(),
        status: remoteRes.status,
        contentType,
        data: text
      });
    }

    res.status(remoteRes.status);
    res.setHeader('Content-Type', contentType);
    return res.send(text);
  } catch (err) {
    console.error(`[Apna Proxy Error] ${targetUrl}:`, err.message);
    const cached = cache.get(cacheKey);
    if (cached) {
      res.setHeader('Content-Type', cached.contentType);
      res.setHeader('X-Cache', 'STALE');
      return res.status(cached.status).send(cached.data);
    }
    res.status(502).json({ success: false, error: err.message });
  }
});

// SPA Route handler: Any route like /app, /courses, /profile loads index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 RG VERSE Study Platform is LIVE!`);
  console.log(`🌐 Local URL:   http://localhost:${PORT}`);
  console.log(`📱 App URL:     http://localhost:${PORT}/app`);
  console.log(`⚡ API Backend: Proxied & Fast Image Caching Active`);
  console.log(`=================================================`);
});
