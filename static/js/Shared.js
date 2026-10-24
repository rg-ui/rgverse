(() => {
  window.tg = (window.Telegram && window.Telegram.WebApp) || null;
  if (
    window.tg &&
    window.tg.initDataUnsafe &&
    Object.keys(window.tg.initDataUnsafe).length > 0
  ) {
    window.tg.expand();
    window.tg.setHeaderColor("#f8fafc");
  }
  window.SERVER_URL = (window.APP_CONFIG && typeof window.APP_CONFIG.serverUrl === "string") ? window.APP_CONFIG.serverUrl : "";
  window.openExternalLink = (url) => {
    const isTg =
      window.tg &&
      window.tg.initDataUnsafe &&
      Object.keys(window.tg.initDataUnsafe).length > 0;
    const isNativeApp = !!window.ReactNativeWebView;
    if (isNativeApp) {
      window.open(url, "_blank");
    } else if (isTg) {
      if (url.includes("t.me")) {
        window.tg.openTelegramLink(url);
        setTimeout(() => {
          if (window.tg.close) window.tg.close();
        }, 800);
      } else {
        window.tg.openLink(url);
      }
    } else {
      window.open(url, "_blank");
    }
  };
  window.triggerFastDownload = (videoUrl, videoTitle) => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          action: "download_video",
          url: videoUrl,
          fileName: videoTitle || "Video Course",
        }),
      );
    } else {
      window.showAppAlert(
        ("Please use " + ((window.APP_CONFIG && window.APP_CONFIG.appName) || "RG VERSE") + " Mobile App to download videos offline."),
      );
    }
  };
  window.safeEncode = (str) => {
    try {
      return encodeURIComponent(str);
    } catch (e) {
      return encodeURIComponent(String(str).replace(/[\uD800-\uDFFF]/g, ""));
    }
  };
  window.showAppAlert = (message, callback = null) => {
    const isTg =
      window.tg &&
      window.tg.initDataUnsafe &&
      Object.keys(window.tg.initDataUnsafe).length > 0;
    if (isTg && window.tg.showAlert) {
      try {
        window.tg.showAlert(message, callback);
        return;
      } catch (e) {}
    }
    const overlayId = "akki-custom-alert";
    if (document.getElementById(overlayId)) return;
    const overlay = document.createElement("div");
    overlay.id = overlayId;
    overlay.className =
      "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-6 animate-fade-in";
    overlay.innerHTML = `
        <div class="bg-white w-full max-w-sm rounded-[28px] p-6 text-center shadow-2xl slide-up relative overflow-hidden" onclick="event.stopPropagation()">
            <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <div class="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[20px] flex items-center justify-center mx-auto mb-4 text-2xl border border-indigo-100 shadow-sm">
                <i class="fas fa-bell"></i>
            </div>
            <h3 class="font-black text-[18px] text-slate-800 mb-2">${(window.APP_CONFIG && window.APP_CONFIG.appName) || "RG VERSE"}</h3>
            <p class="text-[13px] font-semibold text-slate-500 mb-6 px-2 leading-relaxed">${message}</p>
            <button id="akki-alert-btn" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-extrabold text-[15px] shadow-[0_8px_15px_-5px_rgba(79,70,229,0.5)] active:scale-95 transition-transform">
                OK, Got it
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById("akki-alert-btn").onclick = () => {
      document.body.removeChild(overlay);
      if (callback && typeof callback === "function") callback();
    };
  };
  window.DataManager = {
    cache: {},
    cacheExpiryMinutes: 5,
    getCache: function (url) {
      const cacheKey = "akki_data_" + url.split("&_t=")[0].split("?_t=")[0];
      let cachedItem = this.cache[cacheKey];
      if (!cachedItem) {
        try {
          let localData = localStorage.getItem(cacheKey);
          if (localData) {
            if (localData.includes("RG VERSE-") || localData.includes("akkistudyxpro-")) {
              localData = localData.replace(/https?:\/\/[^/]+\/api\/thumb\//g, "/api/thumb/");
              try { localStorage.setItem(cacheKey, localData); } catch(e) {}
            }
            cachedItem = JSON.parse(localData);
            this.cache[cacheKey] = cachedItem;
          }
        } catch (e) {}
      }
      if (cachedItem) {
        const isExpired =
          Date.now() - cachedItem.timestamp >
          this.cacheExpiryMinutes * 60 * 1e3;
        if (isExpired) {
          delete this.cache[cacheKey];
          localStorage.removeItem(cacheKey);
          return null;
        }
        return cachedItem.data;
      }
      return null;
    },
    pendingMetadata: {},
    metadataRefresh: {},
    fetch: function (url) {
      if (!/\/api\/(batches|subjects|chapters)(?:\?|$)/.test(url))
        return this.fetchUnshared(url);
      const key = url.split("&_t=")[0].split("?_t=")[0];
      const cached = this.getCache(url);
      if (
        cached &&
        (this.pendingMetadata[key] ||
          Date.now() - (this.metadataRefresh[key] || 0) < 3e4)
      )
        return Promise.resolve(cached);
      if (this.pendingMetadata[key]) return this.pendingMetadata[key];
      this.metadataRefresh[key] = Date.now();
      const request = this.fetchUnshared(url).finally(() => {
        delete this.pendingMetadata[key];
      });
      this.pendingMetadata[key] = request;
      return request;
    },
    fetchUnshared: async function (url) {
      const cacheKey = "akki_data_" + url.split("&_t=")[0].split("?_t=")[0];
      let cachedItem = this.cache[cacheKey];
      if (!cachedItem) {
        try {
          const localData = localStorage.getItem(cacheKey);
          if (localData) cachedItem = JSON.parse(localData);
        } catch (e) {}
      }
      const bypassCache = url.includes("/api/files");
      const isExpired = bypassCache
        ? true
        : cachedItem
          ? Date.now() - cachedItem.timestamp >
            this.cacheExpiryMinutes * 60 * 1e3
          : true;
      if (cachedItem && !isExpired) {
        fetch(url)
          .then((r) => r.json())
          .then((j) => {
            let normalized = Array.isArray(j) ? { success: true, data: j } : j;
            if (normalized.success || Array.isArray(normalized.data)) {
              if (!normalized.success) normalized.success = true;
              const newCache = { data: normalized, timestamp: Date.now() };
              this.cache[cacheKey] = newCache;
              localStorage.setItem(cacheKey, JSON.stringify(newCache));
            }
          })
          .catch(() => {});
        return cachedItem.data;
      }
      try {
        let res = await fetch(url);
        let json = await res.json();
        let normalizedData = Array.isArray(json)
          ? { success: true, data: json }
          : json;
        if (
          normalizedData.data &&
          typeof normalizedData.success === "undefined"
        ) {
          normalizedData.success = true;
        }
        if (normalizedData.success || Array.isArray(normalizedData.data)) {
          const newCache = { data: normalizedData, timestamp: Date.now() };
          this.cache[cacheKey] = newCache;
          localStorage.setItem(cacheKey, JSON.stringify(newCache));
        }
        return normalizedData;
      } catch (e) {
        return { success: false, data: [] };
      }
    },
    processFiles: function (files) {
      if (!files || !Array.isArray(files)) return [];
      let processedFiles = [];
      for (let f of files) {
        if (f.thumb_url) {
          f.thumb_url = String(f.thumb_url).replace(/https?:\/\/[^/]+\/api\/thumb\//, "/api/thumb/");
        }
        let name = String(f.file_name || "").trim();
        f._originalName = name;
        f._lowerName = name.toLowerCase();
        let numbers = [];
        let regex = /(?:^|\s|[-_\[(:])0*(\d+)(?:$|\s|[-_\]):.])/g;
        let match;
        while ((match = regex.exec(name)) !== null) {
          numbers.push(parseInt(match[1], 10));
        }
        if (numbers.length === 0) {
          let fallback = name.match(/\b0*(\d+)\b/g);
          if (fallback) numbers = fallback.map((n) => parseInt(n, 10));
        }
        f._mainNum = 999999;
        for (let n of numbers) {
          if (n < 1e3) {
            f._mainNum = n;
            break;
          }
        }
        f._compareText = f._lowerName
          .replace(/[:|\-_\[\]()]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        let p = 100;
        if (
          f._lowerName.includes("general") ||
          f._lowerName.includes("intro") ||
          f._lowerName.includes("syllabus") ||
          f._lowerName.includes("overview") ||
          f._lowerName.includes("strategy") ||
          f._lowerName.includes("update")
        ) {
          p = 0;
        }
        f._priority = p;
        f._uploadIndex = processedFiles.length;
        processedFiles.push(f);
      }
      let uniqueFiles = [];
      if (!processedFiles.some((f) => f.upload_sequence === true)) {
        processedFiles.sort(
          (a, b) => (a.message_id || 0) - (b.message_id || 0),
        );
      }
      for (let i = 0; i < processedFiles.length; i++) {
        let current = processedFiles[i];
        let isDup = false;
        for (let j = 0; j < uniqueFiles.length; j++) {
          let existing = uniqueFiles[j];
          if (
            current.file_type === existing.file_type &&
            current.chapter === existing.chapter
          ) {
            if (current._compareText === existing._compareText) {
              isDup = true;
              break;
            }
            let lenC = current._compareText.length;
            let lenE = existing._compareText.length;
            if (lenC > 15 && lenE > 15) {
              if (
                current._compareText.includes(existing._compareText) ||
                existing._compareText.includes(current._compareText)
              ) {
                isDup = true;
                if (
                  current._originalName.length > existing._originalName.length
                ) {
                  uniqueFiles[j] = current;
                }
                break;
              }
            }
          }
        }
        if (!isDup) uniqueFiles.push(current);
      }
      uniqueFiles.sort((a, b) => {
        if (a.upload_sequence || b.upload_sequence) {
          return (a._uploadIndex ?? 0) - (b._uploadIndex ?? 0);
        }
        let chapA = String(a.chapter || "General").trim();
        let chapB = String(b.chapter || "General").trim();
        if (chapA !== chapB) {
          return chapA.localeCompare(chapB, "hi-IN", {
            numeric: true,
            sensitivity: "base",
          });
        }
        if (a._priority !== b._priority) return a._priority - b._priority;
        if (a._mainNum !== 999999 || b._mainNum !== 999999) {
          if (a._mainNum !== b._mainNum) return a._mainNum - b._mainNum;
        }
        let nameCompare = a._lowerName.localeCompare(b._lowerName, "hi-IN", {
          numeric: true,
          sensitivity: "base",
        });
        if (nameCompare !== 0) return nameCompare;
        return (a.message_id || 0) - (b.message_id || 0);
      });
      return uniqueFiles;
    },
  };
  window.BatchCollectionCard = ({
    item,
    isSaved,
    onToggleSave,
    onNavigate,
  }) => {
    if (!item) return null;
    const safeTitle = String(item.title || "Unknown Course").trim();
    const yearMatch = safeTitle.match(/\b(202[4-9])\b/);
    const displayMedium = String(item.medium || "Bilingual");
    const salePrice = String(item.price || "").trim();
    const originalPrice = String(item.original_price || "").trim();
    const offer = String(item.offer || "").trim();
    const isFree = ["FREE", "0", "\u20B90"].includes(salePrice.toUpperCase());
    const prefetchSubjects = () => {
      window.DataManager.fetch(
        `${window.SERVER_URL}/api/subjects?batch=${encodeURIComponent(safeTitle)}`,
      );
    };
    const openSubjects = () => onNavigate("subjects", { batch: safeTitle });
    return React.createElement(
      "article",
      {
        className:
          "group relative w-full min-w-0 overflow-hidden rounded-[24px] border border-white bg-white p-2.5 shadow-[0_8px_24px_rgba(60,67,121,.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(60,67,121,.14)] flex flex-col",
      },
      React.createElement(
        "div",
        { className: "relative" },
        React.createElement(
          "button",
          {
            type: "button",
            onClick: openSubjects,
            onTouchStart: prefetchSubjects,
            onMouseEnter: prefetchSubjects,
            "aria-label": `Open ${safeTitle} batch`,
            className:
              "relative block w-full aspect-[16/9] overflow-hidden rounded-[18px] bg-gradient-to-br from-indigo-100 to-violet-100 focus-visible:ring-2 focus-visible:ring-indigo-500",
          },
          React.createElement(
            "span",
            {
              "aria-hidden": "true",
              className:
                "absolute inset-0 flex items-center justify-center text-4xl text-indigo-400",
            },
            React.createElement("i", { className: "fas fa-graduation-cap" }),
          ),
          item.image &&
            String(item.image).trim() &&
            React.createElement("img", {
              key: item.image,
              src: item.image,
              alt: safeTitle,
              loading: "lazy",
              decoding: "async",
              className:
                "relative h-full w-full object-cover transition duration-300 group-hover:scale-[1.035]",
              onError: (e) => {
                e.currentTarget.style.display = "none";
              },
            }),
        ),
        React.createElement(
          "button",
          {
            type: "button",
            onClick: () => onToggleSave(safeTitle),
            "aria-label": `${isSaved ? "Unsave" : "Save"} ${safeTitle}`,
            "aria-pressed": !!isSaved,
            className: `absolute top-2 right-2 w-11 h-11 rounded-full flex items-center justify-center shadow-sm backdrop-blur-md transition focus-visible:ring-2 focus-visible:ring-indigo-500 ${isSaved ? "bg-white text-pink-500" : "bg-slate-900/60 text-white hover:bg-slate-900/80"}`,
          },
          React.createElement("i", {
            "aria-hidden": "true",
            className: `${isSaved ? "fas" : "far"} fa-heart text-[15px]`,
          }),
        ),
      ),
      React.createElement(
        "div",
        { className: "px-2 pt-3 pb-1 flex flex-col flex-grow min-w-0" },
        React.createElement(
          "button",
          {
            type: "button",
            onClick: openSubjects,
            onTouchStart: prefetchSubjects,
            onMouseEnter: prefetchSubjects,
            className:
              "block w-full text-left rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-500",
          },
          React.createElement(
            "h3",
            {
              className:
                "line-clamp-2 text-[14px] font-black leading-snug text-slate-800 break-words",
            },
            safeTitle,
          ),
        ),
        React.createElement(
          "div",
          {
            className:
              "mt-1 flex items-center gap-2 text-[11px] font-semibold text-slate-500",
          },
          React.createElement("i", {
            "aria-hidden": "true",
            className: "fas fa-language text-indigo-400",
          }),
          displayMedium,
        ),
        (salePrice || offer) &&
          React.createElement(
            "div",
            { className: "mt-3 flex flex-wrap items-center gap-2 text-[12px]" },
            salePrice &&
              React.createElement(
                "span",
                { className: "font-black text-emerald-700" },
                isFree ? "FREE" : salePrice,
              ),
            !isFree &&
              originalPrice &&
              React.createElement(
                "span",
                { className: "text-slate-400 line-through" },
                originalPrice,
              ),
            offer &&
              React.createElement(
                "span",
                { className: "font-bold text-emerald-600 break-words" },
                offer,
              ),
          ),
        React.createElement(
          "button",
          {
            type: "button",
            onClick: () =>
              window.openExternalLink(
                item.link || ((window.APP_CONFIG && window.APP_CONFIG.telegramBotUrl) || "https://t.me/RGVerseBot"),
              ),
            "aria-label": `Update ${safeTitle} batch`,
            className:
              "mt-3 flex min-h-[44px] w-full items-center justify-between gap-2 border-t border-slate-100 py-2 text-left text-[11px] font-extrabold text-indigo-600 rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-500",
          },
          React.createElement(
            "span",
            null,
            yearMatch ? `Batch ${yearMatch[1]}` : "Batch Collection",
          ),
          React.createElement(
            "span",
            { className: "shrink-0" },
            "Update Batch ",
            React.createElement("i", {
              "aria-hidden": "true",
              className: "fas fa-chevron-right ml-1",
            }),
          ),
        ),
      ),
    );
  };
  window.readPwFavorites = () => {
    try {
      const data = JSON.parse(
        localStorage.getItem("akki_pw_favorites_v1") || "{}",
      );
      if (!data || typeof data !== "object" || Array.isArray(data)) return {};
      return Object.fromEntries(
        Object.entries(data)
          .filter(
            ([id, item]) =>
              /^[a-f0-9]{24}$/i.test(id) &&
              item &&
              typeof item.name === "string",
          )
          .map(([id, item]) => [id, { ...item, id }]),
      );
    } catch (_) {
      return {};
    }
  };
  window.togglePwFavorite = (item) => {
    if (!item || !/^[a-f0-9]{24}$/i.test(String(item.id))) return;
    const next = window.readPwFavorites();
    if (next[item.id]) delete next[item.id];
    else
      next[item.id] = {
        id: item.id,
        name: String(item.name),
        image: item.image || "",
        language: item.language || "",
        category: item.category || "PW",
        class: item.class || "",
      };
    try {
      localStorage.setItem("akki_pw_favorites_v1", JSON.stringify(next));
    } catch (_) {
      window.showAppAlert("Unable to save favourites on this device.");
      return;
    }
    window.dispatchEvent(new Event("pw-favorites-changed"));
  };
  window.usePwFavorites = () => {
    const [favorites, setFavorites] = window.React.useState(
      window.readPwFavorites,
    );
    window.React.useEffect(() => {
      const update = () => setFavorites(window.readPwFavorites());
      window.addEventListener("pw-favorites-changed", update);
      window.addEventListener("storage", update);
      return () => {
        window.removeEventListener("pw-favorites-changed", update);
        window.removeEventListener("storage", update);
      };
    }, []);
    return favorites;
  };
  window.PwFavoriteCard = ({ item, isSaved, onNavigate }) =>
    React.createElement(
      "article",
      {
        className:
          "relative min-w-0 overflow-hidden rounded-[24px] border border-white bg-white p-2.5 shadow-sm",
      },
      React.createElement(
        "button",
        {
          type: "button",
          "aria-label": `Open PW batch ${item.name}`,
          onPointerDown: () => window.prefetchPwSubjects(item.id),
          onMouseEnter: () => window.prefetchPwSubjects(item.id),
          onFocus: () => window.prefetchPwSubjects(item.id),
          onClick: () =>
            onNavigate("pw_subjects", {
              batch: item.id,
              subject: null,
              chapter: null,
            }),
          className: "block w-full text-left",
        },
        React.createElement(
          "div",
          {
            className:
              "relative aspect-[16/9] overflow-hidden rounded-[18px] bg-indigo-50",
          },
          React.createElement(
            "span",
            {
              "aria-hidden": "true",
              className:
                "absolute inset-0 flex items-center justify-center text-4xl text-indigo-400",
            },
            React.createElement("i", { className: "fas fa-graduation-cap" }),
          ),
          item.image &&
            React.createElement("img", {
              src: item.image,
              alt: "",
              loading: "lazy",
              decoding: "async",
              className: "relative h-full w-full object-cover",
              onError: (e) => (e.currentTarget.style.display = "none"),
            }),
          React.createElement(
            "span",
            {
              className:
                "absolute bottom-2 left-2 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] font-bold text-white",
            },
            "PW \xB7 ",
            item.category,
          ),
        ),
        React.createElement(
          "div",
          { className: "px-2 pb-2 pt-3" },
          React.createElement(
            "h3",
            {
              className:
                "line-clamp-2 break-words text-[14px] font-black leading-snug text-slate-800",
            },
            item.name,
          ),
          React.createElement(
            "p",
            { className: "mt-1 text-[11px] text-slate-500" },
            item.language || "Language not listed",
          ),
        ),
      ),
      React.createElement(
        "button",
        {
          type: "button",
          "aria-label": `${isSaved ? "Unsave" : "Save"} PW batch ${item.name}`,
          "aria-pressed": !!isSaved,
          onClick: () => window.togglePwFavorite(item),
          className: `absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full shadow-sm ${isSaved ? "bg-white text-pink-500" : "bg-slate-900/60 text-white"}`,
        },
        React.createElement("i", {
          "aria-hidden": "true",
          className: `${isSaved ? "fas" : "far"} fa-heart`,
        }),
      ),
    );
  window.PwBatchResults = ({
    query = "",
    favoritesOnly = false,
    onNavigate,
  }) => {
    const { useState, useEffect } = window.React;
    const favorites = window.usePwFavorites();
    const term = String(query).trim().slice(0, 120);
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({
      items: [],
      total: 0,
      more: false,
      key: "",
      error: "",
    });
    const [loading, setLoading] = useState(false);
    const [retry, setRetry] = useState(0);
    const key = term + ":" + page;
    useEffect(() => {
      setPage(1);
    }, [term]);
    useEffect(() => {
      if (favoritesOnly || !term) return;
      const controller = new AbortController();
      setLoading(true);
      const timer = setTimeout(async () => {
        try {
          const params = new URLSearchParams({
            q: term,
            category: "ALL",
            page: String(page),
            limit: "24",
          });
          const response = await fetch(
            window.SERVER_URL.replace(/\/$/, "") + "/api/pw/batches?" + params,
            { signal: controller.signal },
          );
          const data = await response.json();
          if (!response.ok || !data.success)
            throw Error(data.error || "PW search unavailable");
          if (!controller.signal.aborted)
            setResult({
              items: Array.isArray(data.data) ? data.data : [],
              total: Number(data.total || 0),
              more: !!data.has_more,
              key,
              error: "",
            });
        } catch (error) {
          if (!controller.signal.aborted)
            setResult({
              items: [],
              total: 0,
              more: false,
              key,
              error: error.message || "PW search unavailable",
            });
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      }, 300);
      return () => {
        clearTimeout(timer);
        controller.abort();
      };
    }, [term, page, favoritesOnly, retry]);
    const items = favoritesOnly
      ? Object.values(favorites)
      : result.key === key
        ? result.items
        : [];
    const busy = !favoritesOnly && (loading || result.key !== key);
    if (!favoritesOnly && !term) return null;
    return React.createElement(
      "section",
      {
        "aria-label": favoritesOnly
          ? "Favourite PW batches"
          : "PW search results",
        className: "mt-5",
      },
      React.createElement(
        "div",
        { className: "mb-3 flex items-center justify-between gap-2" },
        React.createElement(
          "h2",
          { className: "text-[16px] font-black text-slate-800" },
          favoritesOnly ? "Favourite PW Batches" : "PW Batches",
        ),
        React.createElement(
          "span",
          { className: "text-[11px] font-semibold text-slate-500" },
          favoritesOnly
            ? items.length
            : busy
              ? "Searching\u2026"
              : result.total,
          " ",
          !busy && "batches",
        ),
      ),
      busy &&
        React.createElement(
          "p",
          {
            role: "status",
            className: "rounded-2xl bg-white p-4 text-sm text-slate-500",
          },
          "Searching PW batches\u2026",
        ),
      !favoritesOnly &&
        !busy &&
        result.error &&
        React.createElement(
          "div",
          {
            role: "alert",
            className: "rounded-2xl bg-rose-50 p-4 text-sm text-rose-700",
          },
          result.error,
          React.createElement(
            "button",
            {
              type: "button",
              className: "ml-2 underline",
              onClick: () => setRetry((x) => x + 1),
            },
            "Retry",
          ),
        ),
      React.createElement(
        "div",
        {
          className:
            "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        },
        items.map((item) =>
          React.createElement(window.PwFavoriteCard, {
            key: item.id,
            item,
            isSaved: !!favorites[item.id],
            onNavigate,
          }),
        ),
      ),
      !busy &&
        !items.length &&
        (favoritesOnly || !result.error) &&
        React.createElement(
          "p",
          {
            className:
              "rounded-2xl bg-white p-5 text-center text-sm text-slate-500",
          },
          favoritesOnly
            ? "Save a PW batch using its heart icon."
            : "No matching PW batches.",
        ),
      !favoritesOnly &&
        !busy &&
        !result.error &&
        (page > 1 || result.more) &&
        React.createElement(
          "div",
          { className: "mt-4 flex items-center justify-center gap-3" },
          React.createElement(
            "button",
            {
              type: "button",
              disabled: page === 1,
              onClick: () => setPage((p) => p - 1),
              className:
                "rounded-xl bg-white px-4 py-3 text-sm font-bold disabled:opacity-40",
            },
            "Previous PW results",
          ),
          React.createElement(
            "span",
            { className: "text-xs text-slate-500" },
            "Page ",
            page,
          ),
          React.createElement(
            "button",
            {
              type: "button",
              disabled: !result.more,
              onClick: () => setPage((p) => p + 1),
              className:
                "rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-40",
            },
            "Next PW results",
          ),
        ),
    );
  };
  window.PwCourseData = (() => {
    const cache = new Map(),
      pending = new Map();
    const read = (url) => {
      const item = cache.get(url);
      if (item && Date.now() - item.time < 18e4) return item.data;
      cache.delete(url);
      return void 0;
    };
    const load = (url) => {
      const cached = read(url);
      if (cached !== void 0) return Promise.resolve(cached);
      if (pending.has(url)) return pending.get(url);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 18e3);
      const request = fetch(url, { signal: controller.signal })
        .then(async (response) => {
          const result = await response.json().catch(() => ({}));
          if (!response.ok || !result.success)
            throw Error(result.error || "Course information unavailable");
          if (cache.size >= 80) cache.delete(cache.keys().next().value);
          cache.set(url, { time: Date.now(), data: result.data });
          return result.data;
        })
        .finally(() => {
          clearTimeout(timer);
          pending.delete(url);
        });
      pending.set(url, request);
      return request;
    };
    const prefetch = (url) => {
      if (pending.size >= 4 && !pending.has(url)) return;
      load(url).catch(() => {});
    };
    return { read, load, prefetch };
  })();
  window.prefetchPwSubjects = (id) =>
    window.PwCourseData.prefetch(
      window.SERVER_URL.replace(/\/$/, "") +
        "/api/studyxpw/batches/" +
        encodeURIComponent(id) +
        "/subjects",
    );
})();
