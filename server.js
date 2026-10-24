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

// Serve static assets first
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname)));

// High-speed memory cache
const cache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 1 min for general APIs
const IMAGE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours for thumbnails

const NOTICE_POPUP_HTML = `<div class="flex flex-col items-center justify-center text-center py-3 px-2">
  <!-- Status Icon -->
  <div class="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-500 rounded-full flex justify-center items-center text-2xl shadow-sm mb-3">
    <i class="fas fa-exclamation-triangle"></i>
  </div>

  <!-- Notice Message -->
  <h2 class="text-base sm:text-lg font-bold text-slate-800 leading-snug mb-5 px-2">
    Kuchh videos nahi chal rahe hain, jaldi hi fix ho jaaega.
  </h2>

  <!-- Action Button -->
  <button
    onclick="window.dismissWaPopup && window.dismissWaPopup()"
    class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all"
  >
    Theek Hai
  </button>
</div>`;

// Core Backend Proxy Function (APIs, Watch Pages, Video Players, Streams)
async function proxyToBackend(req, res) {
  // Override /api/app_config with RG Verse Server Notice Popup
  if (req.originalUrl === '/api/app_config' || req.originalUrl.startsWith('/api/app_config?')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.json({
      success: true,
      wa_popup_enabled: "on",
      wa_popup_title1: "Notice ⚠️",
      wa_popup_title2: "",
      wa_popup_link: "https://t.me/RGVerseOfficial",
      wa_popup_html: NOTICE_POPUP_HTML
    });
  }

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
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': req.headers['accept'] || '*/*',
        'Referer': REMOTE_API_BASE + '/app',
      }
    };

    if (req.headers['cookie']) {
      fetchOptions.headers['Cookie'] = req.headers['cookie'];
    }

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
    const timeout = setTimeout(() => controller.abort(), 25000);
    fetchOptions.signal = controller.signal;

    const remoteRes = await fetch(targetUrl, fetchOptions);
    clearTimeout(timeout);

    // Forward cookies if any
    const setCookie = remoteRes.headers.get('set-cookie');
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }

    const contentType = remoteRes.headers.get('content-type') || 'text/html';

    // JSON or HTML / Text responses
    if (contentType.includes('application/json') || contentType.includes('text/')) {
      let text = await remoteRes.text();

      // Convert absolute Heroku domain to relative local paths
      text = text
        .replace(/https:\/\/(?:akkistudyxpro|RG\s*VERSE)-44094a367971\.herokuapp\.com/gi, '')
        .replace(/https:\/\/akkistudyxpro-44094a367971\.herokuapp\.com/gi, '');

      // Rebrand to RG Verse
      text = text
        .replace(/Akki\s*Study\s*X\s*Pro/gi, 'RG VERSE')
        .replace(/Akki\s*Study\s*X\s*Main/gi, 'RG Verse Official')
        .replace(/Akki\s*Study\s*X/gi, 'RG VERSE')
        .replace(/AKKI\s*STUDY\s*X/gi, 'RG VERSE')
        .replace(/AKKISTUDYX1/gi, 'RGVerseOfficial')
        .replace(/AkkiRobo_Bot/gi, 'RGVerseBot')
        .replace(/AkkiStudyX_App/gi, 'RGVerseBot')
        .replace(/t\.me\/AKKISTUDYX1/gi, 't.me/RGVerseOfficial')
        .replace(/Made By Akki In/gi, 'Made with ❤️ by RG Verse in');

      // Only cache API json, do not cache dynamic player sessions
      if (req.method === 'GET' && remoteRes.status === 200 && req.originalUrl.startsWith('/api/')) {
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
      // Binary data: Images, Video Streams, PDFs
      const arrayBuffer = await remoteRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (req.method === 'GET' && remoteRes.status === 200 && isThumb) {
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
      if (isThumb) {
        res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
      }
      return res.send(buffer);
    }
  } catch (err) {
    console.error(`[Proxy Error] ${req.method} ${targetUrl}:`, err.message);

    const cached = cache.get(cacheKey);
    if (cached) {
      res.setHeader('Content-Type', cached.contentType);
      res.setHeader('X-Cache', 'STALE');
      return res.status(cached.status).send(cached.data);
    }

    res.status(502).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>RG Verse Player Error</title>
      </head>
      <body style="background:#090d16;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
        <div style="text-align:center;padding:24px;">
          <h2 style="color:#f43f5e;margin-bottom:8px;">Video Stream Unavailable</h2>
          <p style="color:#94a3b8;max-width:400px;line-height:1.6;font-size:14px;">${err.message}</p>
          <button onclick="window.location.reload()" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;padding:10px 24px;border-radius:12px;cursor:pointer;font-weight:bold;margin-top:12px;">Retry</button>
        </div>
      </body>
      </html>
    `);
  }
}

// 1. API endpoints proxy
app.all('/api/*', proxyToBackend);

// 2. Video Player & Watch routes proxy (PW, Apna College, NextToppers, Streams)
app.all('/ac/watch/*', proxyToBackend);
app.all('/pw/watch/*', proxyToBackend);
app.all('/nexttopper/watch/*', proxyToBackend);
app.all('/watch/*', proxyToBackend);
app.all('/watch_pdf_ext*', proxyToBackend);
app.all('/dl/*', proxyToBackend);
app.all('/stream/*', proxyToBackend);
app.all('/video/*', proxyToBackend);
app.all('/player/*', proxyToBackend);

// 3. Apna College local data & fallback proxy
app.use('/data', express.static(path.join(__dirname, 'data'), {
  maxAge: '1h',
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
}));

app.all('/data/*', async (req, res) => {
  const cleanPath = req.originalUrl.replace(/^\//, '').split('?')[0];
  const localFile = path.join(__dirname, cleanPath);
  if (fs.existsSync(localFile) && fs.statSync(localFile).isFile()) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.sendFile(localFile);
  }

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
      res.status(remoteRes.status);
      res.setHeader('Content-Type', contentType);
      return res.send(text);
    }
  } catch (err) {
    console.error(`[Apna Proxy Error] ${targetUrl}:`, err.message);
  }

  const cachedFallback = cache.get(cacheKey);
  if (cachedFallback) {
    res.setHeader('Content-Type', cachedFallback.contentType);
    res.setHeader('X-Cache', 'STALE');
    return res.status(200).send(cachedFallback.data);
  }
  res.status(404).json({ error: 'Batch data not found' });
});

// 4. SPA Route handler: Client app routes like /app, /, etc. load index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 RG VERSE Study Platform is LIVE!`);
  console.log(`🌐 Local URL:   http://localhost:${PORT}`);
  console.log(`📱 App URL:     http://localhost:${PORT}/app`);
  console.log(`⚡ Full Video Players & Streaming Engine Active`);
  console.log(`=================================================`);
});
