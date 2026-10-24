// Owner's CORS-enabled public JSON. No cookies, auth spoofing or locked access.
(function () {
  "use strict";
  const ORIGIN = (typeof window !== "undefined" && window.location && window.location.origin && window.location.origin !== "null") ? window.location.origin : "https://ac.lrnt.ccwu.cc",
    cache = new Map(),
    pending = new Map();
  const MEDIA = new Set([
    "embed-ssl.wistia.com",
    "embed.wistia.com",
    "fast.wistia.net",
  ]);
  const NOTES = new Set([
    "api.asia-se1.learnworlds.com",
    "lwfiles.mycourse.app",
  ]);
  const ID = /^[a-z0-9][a-z0-9-]{0,99}$/;
  function id(value) {
    if (typeof value !== "string" || !ID.test(value))
      throw Error("Invalid Apna College batch.");
    return value;
  }
  function safeUrl(value, hosts) {
    if (
      typeof value !== "string" ||
      value.length > 4096 ||
      /[\x00-\x1f]/.test(value)
    )
      return "";
    try {
      const url = new URL(value);
      return url.protocol === "https:" &&
        hosts.has(url.hostname) &&
        !url.username &&
        !url.password &&
        (!url.port || url.port === "443")
        ? url.href
        : "";
    } catch (_) {
      return "";
    }
  }
  function stream(item) {
    if (!item || item.isLocked === true || item.drmProtected === true)
      return "";
    const url = safeUrl(item.link, MEDIA);
    return url &&
      /\.(m3u8|mp4)$/i.test(new URL(url).pathname) &&
      /^https:\/\/[A-Za-z0-9._~/%?&=:+-]+$/.test(url)
      ? url
      : "";
  }
  function noteUrl(item) {
    return item && item.isLocked !== true && item.drmProtected !== true
      ? safeUrl(item.url, NOTES)
      : "";
  }
  function count(value) {
    return Number.isInteger(value) && value >= 0 ? Math.min(value, 100000) : 0;
  }
  function cleanBatch(item) {
    if (!item || !ID.test(String(item.id || ""))) return null;
    return {
      id: item.id,
      name: String(item.name || "Apna College Batch").slice(0, 240),
      image: safeUrl(
        item.image,
        new Set(["lwfiles.mycourse.app", "ac.lrnt.ccwu.cc"]),
      ),
      videoCount: count(item.videoCount),
      pdfCount: count(item.pdfCount),
      source: "apna",
    };
  }
  async function fetchFromUrl(url) {
    const controller = new AbortController(),
      timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, {
        mode: "cors",
        credentials: "omit",
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) return null;
      const text = await response.text();
      if (!text || text.startsWith("<!DOCTYPE") || text.startsWith("<html") || text.includes("cf-browser-verification")) {
        return null;
      }
      return JSON.parse(text);
    } catch (_) {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  function load(path) {
    const hit = cache.get(path);
    if (hit && hit.until > Date.now()) return Promise.resolve(hit.data);
    if (pending.has(path)) return pending.get(path);

    const origins = [
      (typeof window !== "undefined" && window.location && window.location.origin) ? window.location.origin : "",
      "https://ac.lrnt.ccwu.cc"
    ].filter(Boolean);

    const task = (async () => {
      for (const origin of origins) {
        const fullUrl = origin.replace(/\/+$/, "") + path;
        const result = await fetchFromUrl(fullUrl);
        if (result) {
          cache.set(path, { data: result, until: Date.now() + 180000 });
          if (cache.size > 80) cache.delete(cache.keys().next().value);
          return result;
        }
      }
      throw Error("Apna College source is temporarily unavailable. Please retry.");
    })().finally(() => {
      pending.delete(path);
    });

    pending.set(path, task);
    return task;
  }
  async function rawBatch(batchId) {
    const data = await load("/data/batch/" + id(batchId) + ".json");
    if (!data || Array.isArray(data) || data.id !== batchId)
      throw Error("Invalid Apna College batch data.");
    return data;
  }
  window.ApnaCollegePublic = {
    async catalogue() {
      const data = await load("/data/batches.json");
      if (!Array.isArray(data)) throw Error("Invalid Apna College catalogue.");
      return [
        ...new Map(
          data
            .slice(0, 2000)
            .map(cleanBatch)
            .filter(Boolean)
            .map((x) => [x.id, x]),
        ).values(),
      ];
    },
    async batch(batchId) {
      const data = await rawBatch(batchId),
        result = cleanBatch(data);
      if (!result) throw Error("Invalid Apna College batch.");
      for (const kind of ["lectures", "notes"]) {
        const raw = data[kind] || [];
        if (!Array.isArray(raw)) throw Error("Invalid course resources.");
        result[kind] = raw
          .slice(0, 10000)
          .map((item, index) => {
            if (!item || typeof item !== "object") return null;
            return {
              index,
              title: String(item.title || "Study Material").slice(0, 320),
              order: count(item.orderIdx),
              available: !!(kind === "lectures" ? stream(item) : noteUrl(item)),
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.order - b.order || a.index - b.index);
      }
      return result;
    },
    async playback(batchId, index) {
      if (!Number.isInteger(index) || index < 0 || index >= 10000)
        throw Error("Invalid lecture.");
      const data = await rawBatch(batchId),
        items = Array.isArray(data.lectures) ? data.lectures : [],
        item = items[index],
        url = stream(item);
      if (!url) throw Error("This lecture has no authorized playable stream.");
      const playlist = items
        .slice(0, 10000)
        .map((peer, position) => {
          const video = stream(peer);
          return video
            ? {
                index: position,
                id: batchId + ":" + position,
                title: String(peer.title || "Lecture").slice(0, 320),
                url: video,
                href: "/ac/watch/" + batchId + "/" + position,
              }
            : null;
        })
        .filter(Boolean);
      return {
        stream: url,
        title: String(item.title || "Lecture").slice(0, 320),
        playlist,
      };
    },
    async note(batchId, index) {
      if (!Number.isInteger(index) || index < 0 || index >= 10000)
        throw Error("Invalid notes.");
      const data = await rawBatch(batchId),
        url = noteUrl(Array.isArray(data.notes) ? data.notes[index] : null);
      if (!url) throw Error("These notes have no authorized file link.");
      return url;
    },
  };
})();
