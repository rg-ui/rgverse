# 🚀 RG VERSE — Premium Smart Study Platform & Telegram Mini App

> **RG VERSE** is an educational learning portal featuring PhysicsWallah, NextToppers, and Apna College course catalogs, lecture streaming, DPPs, and notes viewer with instant thumbnail loading and zero-CORS reverse proxy.

---

## ✨ Features

- 📚 **Comprehensive Course Hub**: Access 670+ PW batches, 46 NextToppers courses, and Apna College lectures.
- ⚡ **Built-in Reverse Proxy (`server.js`)**: Real-time server-side proxy for upstream course and lecture data with CORS enabled.
- 🚀 **Blazing-Fast Image Caching**: 24-hour memory caching for lecture thumbnails, reducing load times down to sub-2ms.
- 🎨 **Modular Branding ([`config.js`](config.js))**: Easily configure app name, logo, Telegram bots, social channels, and banners from a single config file.
- 📱 **Telegram Mini App & Web Responsive**: Optimized for both Telegram WebApp and desktop/mobile browsers.

---

## 🛠️ Quick Start

### 1. Installation
```bash
git clone git@github.com:rg-ui/rgverse.git
cd rgverse
npm install
```

### 2. Run the Server
```bash
npm start
```

### 3. Open in Browser
Visit [http://localhost:3000/app](http://localhost:3000/app)

---

## 📁 Project Structure

```
RGVerse/
├── config.js              # Centralized branding & settings
├── index.html             # Application entry point
├── server.js              # Express server with reverse proxy & caching
├── package.json           # Dependencies and scripts
└── static/
    ├── brand-logo.webp    # RG Verse official logo
    ├── css/
    │   └── app-tailwind.min.css
    ├── images/
    │   └── remote/        # Localized category & social thumbnails
    └── js/
        ├── App.js
        ├── ApnaCollege.js
        ├── ContentScreen.js
        ├── HomeScreen.js
        ├── NextTopper.js
        ├── OtherScreens.js
        ├── PWCourseScreens.js
        ├── ProfileScreen.js
        ├── PwCatalog.js
        ├── Shared.js
        └── apna-public.js
```

---

## 📄 License
MIT License © 2026 RG Verse
