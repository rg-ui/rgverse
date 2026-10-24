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

const NOTICE_POPUP_HTML = `<div class="flex flex-col items-center justify-center text-center mt-2 px-3">
  <!-- Status Icon -->
  <div class="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex justify-center items-center text-white text-3xl shadow-lg shadow-orange-500/30 mb-3 animate-pulse">
    <i class="fas fa-tools"></i>
  </div>

  <!-- Heading -->
  <h2 class="text-xl font-extrabold text-slate-800 leading-tight">
    Server Load Notice ⚠️
  </h2>
  <h2 class="text-xl font-extrabold text-orange-600 leading-tight mb-2">
    Videos Jald Hi Fix Ho Jayenge! 🚀
  </h2>

  <!-- Description -->
  <p class="text-xs text-slate-500 leading-relaxed max-w-sm mb-3">
    Heavy traffic aur high server load ke kaaran kuch videos play hone mein temporary dikkat aa rahi hai.
    <b class="text-slate-700">Hamari tech team isko actively solve kar rahi hai</b> aur sabhi lectures bohot jald normal chalna shuru ho jayenge. Tab tak kripya thoda dhairya rakhein! 🙏
  </p>

  <!-- Features -->
  <div class="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 mb-3 text-left space-y-2">
    <div class="flex items-center gap-2">
      <span class="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
        <i class="fas fa-server text-xs"></i>
      </span>
      <span class="text-xs font-semibold text-slate-700">
        Heavy Server Load — High traffic ke kaaran temporary issue
      </span>
    </div>

    <div class="flex items-center gap-2">
      <span class="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
        <i class="fas fa-wrench text-xs"></i>
      </span>
      <span class="text-xs font-semibold text-slate-700">
        Fixing In Progress — Sabhi streams jald restore ho jayengi
      </span>
    </div>

    <div class="flex items-center gap-2">
      <span class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
        <i class="fas fa-bell text-xs"></i>
      </span>
      <span class="text-xs font-semibold text-slate-700">
        Instant Alerts — Live status updates Telegram par milenge
      </span>
    </div>
  </div>

  <!-- Buttons -->
  <button
    onclick="window.openExternalLink('https://t.me/RGVerseOfficial')"
    class="w-full bg-gradient-to-r from-[#0088cc] to-[#0077b5] text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-blue-500/30 flex justify-center items-center active:scale-95 transition-transform tracking-wide mb-2"
  >
    <i class="fab fa-telegram-plane mr-2"></i>
    JOIN RG VERSE OFFICIAL
  </button>

  <button
    onclick="window.openExternalLink('https://whatsapp.com/channel/RGVerseCommunity')"
    class="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-green-500/30 flex justify-center items-center active:scale-95 transition-transform tracking-wide mb-2"
  >
    <i class="fab fa-whatsapp mr-2"></i>
    JOIN WHATSAPP CHANNEL
  </button>

  <button
    onclick="window.dismissWaPopup && window.dismissWaPopup()"
    class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs flex justify-center items-center active:scale-95 transition-transform"
  >
    Thik Hai, Samajh Gaya (Continue)
  </button>

  <!-- Bottom Note -->
  <p class="text-[10px] text-slate-400 mt-2">
    ❤️ RG Verse Team • Always Working For You 🇮🇳
  </p>
</div>`;

// Core Backend Proxy Function (APIs, Watch Pages, Video Players, Streams)
async function proxyToBackend(req, res) {
  // Override /api/app_config with RG Verse Server Notice Popup
  if (req.originalUrl === '/api/app_config' || req.originalUrl.startsWith('/api/app_config?')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.json({
      success: true,
      wa_popup_enabled: "on",
      wa_popup_title1: "Server Update ⚠️",
      wa_popup_title2: "Videos Jald Hi Fix Ho Jayenge! 🚀",
      wa_popup_link: "https://whatsapp.com/channel/RGVerseCommunity",
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

// 3. Apna College data proxy
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
