/**
 * RG VERSE - Centralized Branding & Configuration File
 * ----------------------------------------------------
 * Aap apni app ki saari branding, names, logos, Telegram bots aur social links
 * yahan se ek hi jagah edit kar sakte hain!
 */

window.APP_CONFIG = {
  // === PRIMARY BRANDING ===
  appName: "RG VERSE",
  appFullName: "RG Study Verse",
  appSubtitle: "RG Study Verse",
  editionBadge: "PREMIUM EDITION",
  tagline: "Your Ultimate Smart Learning Hub",
  brandLogo: "/static/brand-logo.webp",
  favicon: "/static/brand-logo.webp",

  // === BACKEND API SERVER ===
  // Empty "" routes requests through our local proxy to eliminate CORS errors and enable high-speed caching.
  // Change to another backend domain if deploying separately.
  serverUrl: "",
  apnaCollegeOrigin: "",

  // === TELEGRAM & BOT SETTINGS ===
  telegramBotName: "RGVerseBot",
  telegramBotUrl: "https://t.me/RGVerseBot",
  telegramChannelName: "RG Verse Official",
  telegramChannelUrl: "https://t.me/RGVerseOfficial",
  fallbackBot: "RGVerseBot",

  // === SOCIAL CHANNELS ===
  whatsappUrl: "https://whatsapp.com/channel/RGVerseCommunity",
  youtubeUrl: "https://www.youtube.com/@RGVerse",
  instagramUrl: "https://www.instagram.com/rgverse_official",
  contactUrl: "https://t.me/RGVerseBot",

  // Socials Screen Cards
  socialCards: [
    {
      name: "Telegram Channel",
      desc: "Daily Batches & Notes",
      image: "/static/images/remote/m9k6R.jpg",
      link: "https://t.me/RGVerseOfficial"
    },
    {
      name: "RG Verse Bot",
      desc: "Instant Plan & Materials",
      image: "/static/brand-logo.webp",
      link: "https://t.me/RGVerseBot"
    },
    {
      name: "WhatsApp Community",
      desc: "Official Channel",
      image: "/static/images/remote/9eIrB.jpg",
      link: "https://whatsapp.com/channel/RGVerseCommunity"
    },
    {
      name: "YouTube Channel",
      desc: "Lectures & Updates",
      image: "/static/images/remote/s5B6h.jpg",
      link: "https://www.youtube.com/@RGVerse"
    },
    {
      name: "Instagram",
      desc: "Reels & Announcements",
      image: "/static/images/remote/CpqFL.jpg",
      link: "https://www.instagram.com/rgverse_official"
    },
    {
      name: "PW & Top Batches",
      desc: "IIT, NEET & Boards",
      image: "/static/images/remote/6kl7K.jpg",
      link: "#batches"
    }
  ],

  // === HOME BANNER CONFIGURATION ===
  banner: {
    enabled: true,
    title: "RG VERSE",
    highlight: "Smart Learning",
    kicker: "LEARN • GROW • EXCEL",
    messages: [
      "Access Premium Batches & DPPs in One Place.",
      "PW, NextToppers, Apna College & More.",
      "Smart Video Streaming with Custom Speed.",
      "High-speed Notes & PDF Viewer.",
      "Empowering Every Student with RG Verse."
    ],
    bgImage: "/static/images/traivoai-home-banner.webp",
    ctaText: "Explore Batches"
  },

  // === USER & INTERFACE DEFAULTS ===
  defaultStudentName: "RG Student",
  footerText: "Made with ❤️ in India by RG Verse",
  copyrightText: "© 2026 RG Verse. All Rights Reserved.",

  // === NOTICE POPUP (HEAVY LOAD & FIX NOTICE) ===
  noticePopup: {
    enabled: true,
    html: `<div class="flex flex-col items-center justify-center text-center mt-2 px-3">
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
</div>`
  }
};
