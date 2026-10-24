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

  // === HOME BANNER CONFIGURATION (UG CODING & SKILLS) ===
  banner: {
    enabled: true,
    badge: "UG SKILLS & CAREER",
    hubName: "SKILLS & CODING",
    titlePrefix: "Apna College Coding & ",
    highlight: "Creative Skills",
    titleSuffix: " — All Batches Included!",
    kicker: "CODING • VIDEO EDITING • GRAPHIC DESIGN • UG SKILLS",
    messages: [
      "Apna College Coding — All Batches Included (Delta, Sigma & Alpha).",
      "Full-Stack Web Dev & DSA in Java/C++ for College Students.",
      "Professional Video Editing & Motion Graphics for Creators.",
      "Graphic Design, UI/UX & Thumbnail Mastery for Freelancers.",
      "Targeted for UG Students to Learn High-Income In-Demand Skills."
    ],
    bgImage: "/static/images/coding-skills-banner.jpg",
    ctaText: "Explore Batches"
  },

  // === USER & INTERFACE DEFAULTS ===
  defaultStudentName: "RG Student",
  footerText: "Made with ❤️ in India by RG Verse",
  copyrightText: "© 2026 RG Verse. All Rights Reserved.",

  // === NOTICE POPUP ===
  noticePopup: {
    enabled: true,
    html: `<div class="flex flex-col items-center justify-center text-center py-3 px-2">
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
</div>`
  }
};
