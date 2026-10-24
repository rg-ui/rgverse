(() => {
  const { useState, useEffect, useRef } = window.React;
  const acBase = () =>
    String(window.SERVER_URL || window.location.origin).replace(/\/$/, "");
  const acPath = (id) =>
    acBase() +
    "/api/studyxac/batches" +
    (id ? "/" + encodeURIComponent(id) : "");
  const acCache = new Map();
  const acPending = new Map();
  window.ApnaCollegeData = {
    read(url) {
      const hit = acCache.get(url);
      return hit && hit.expires > Date.now() ? hit.data : void 0;
    },
    load(url) {
      const cached = this.read(url);
      if (cached !== void 0) return Promise.resolve(cached);
      if (acPending.has(url)) return acPending.get(url);
      const prefix = acPath(),
        identifier =
          url === prefix
            ? ""
            : decodeURIComponent(url.slice(prefix.length + 1));
      const promise = (
        identifier
          ? window.ApnaCollegePublic.batch(identifier)
          : window.ApnaCollegePublic.catalogue()
      )
        .then((data) => {
          acCache.set(url, { data, expires: Date.now() + 18e4 });
          if (acCache.size > 60) acCache.delete(acCache.keys().next().value);
          return data;
        })
        .finally(() => acPending.delete(url));
      acPending.set(url, promise);
      return promise;
    },
  };
  window.useApnaCollegeData = (id) => {
    const url = acPath(id),
      cached = window.ApnaCollegeData.read(url);
    const [retry, setRetry] = useState(0),
      [state, setState] = useState({
        url,
        data: cached,
        loading: cached === void 0,
        error: "",
      });
    useEffect(() => {
      let alive = true;
      const initial = window.ApnaCollegeData.read(url);
      setState({ url, data: initial, loading: initial === void 0, error: "" });
      window.ApnaCollegeData.load(url)
        .then((data) => {
          if (alive) setState({ url, data, loading: false, error: "" });
        })
        .catch((error) => {
          if (alive)
            setState({
              url,
              data: void 0,
              loading: false,
              error: error.message,
            });
        });
      return () => {
        alive = false;
      };
    }, [url, retry]);
    return {
      ...(state.url === url
        ? state
        : { data: cached, loading: cached === void 0, error: "" }),
      retry: () => setRetry((x) => x + 1),
    };
  };
  const acFavoritesKey = "akki_apna_favorites_v1";
  const acFavorites = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(acFavoritesKey) || "[]");
      return Array.isArray(raw)
        ? raw
            .filter(
              (x) =>
                x &&
                /^[a-z0-9][a-z0-9-]{0,99}$/.test(x.id) &&
                typeof x.name === "string",
            )
            .slice(0, 200)
        : [];
    } catch (_) {
      return [];
    }
  };
  window.useApnaFavorites = () => {
    const [items, setItems] = useState(acFavorites);
    useEffect(() => {
      const refresh = () => setItems(acFavorites());
      window.addEventListener("apna-favorites-changed", refresh);
      window.addEventListener("storage", refresh);
      return () => {
        window.removeEventListener("apna-favorites-changed", refresh);
        window.removeEventListener("storage", refresh);
      };
    }, []);
    return items;
  };
  const toggleAcFavorite = (item) => {
    var _a;
    const items = acFavorites();
    const next = items.some((x) => x.id === item.id)
      ? items.filter((x) => x.id !== item.id)
      : [
          ...items.slice(-199),
          {
            id: item.id,
            name: item.name,
            image: item.image,
            videoCount: item.videoCount,
            pdfCount: item.pdfCount,
            source: "apna",
          },
        ];
    try {
      localStorage.setItem(acFavoritesKey, JSON.stringify(next));
      window.dispatchEvent(new Event("apna-favorites-changed"));
    } catch (_) {
      (_a = window.showAppAlert) == null
        ? void 0
        : _a.call(window, "Unable to save this batch on your device.");
    }
  };
  window.ApnaCollegeCard = ({ item, isSaved, onNavigate }) => {
    const open = () => onNavigate("ac_batch", { batch: item.id });
    return React.createElement(
      "article",
      {
        className:
          "overflow-hidden rounded-[28px] border border-slate-100 bg-white p-2.5 shadow-sm",
      },
      React.createElement(
        "div",
        { className: "relative" },
        React.createElement(
          "button",
          {
            type: "button",
            onClick: open,
            "aria-label": "Open " + item.name,
            className:
              "block aspect-video w-full overflow-hidden rounded-[20px] bg-indigo-50 text-indigo-500",
          },
          item.image
            ? React.createElement("img", {
                src: item.image,
                alt: item.name,
                loading: "lazy",
                decoding: "async",
                className: "h-full w-full object-cover",
                onError: (e) => {
                  e.currentTarget.style.visibility = "hidden";
                },
              })
            : React.createElement("i", {
                className: "fas fa-graduation-cap text-4xl",
              }),
        ),
        React.createElement(
          "button",
          {
            type: "button",
            onClick: () => toggleAcFavorite(item),
            "aria-pressed": !!isSaved,
            "aria-label": (isSaved ? "Unsave " : "Save ") + item.name,
            className:
              "absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-sm",
          },
          React.createElement("i", {
            className: (isSaved ? "fas" : "far") + " fa-heart",
          }),
        ),
      ),
      React.createElement(
        "button",
        { type: "button", onClick: open, className: "w-full p-3 text-left" },
        React.createElement(
          "h3",
          {
            className:
              "break-words text-[15px] font-extrabold leading-snug text-slate-900",
          },
          item.name,
        ),
        React.createElement(
          "p",
          { className: "mt-2 text-[11px] font-semibold text-slate-500" },
          item.videoCount || 0,
          " lectures \xB7 ",
          item.pdfCount || 0,
          " notes",
        ),
      ),
    );
  };
  window.ApnaCollegeBatchScreen = ({ batchId }) => {
    const { data, loading, error, retry } = window.useApnaCollegeData(batchId);
    const [tab, setTab] = useState("lectures"),
      [query, setQuery] = useState(""),
      [player, setPlayer] = useState(""),
      [playError, setPlayError] = useState("");
    const [opening, setOpening] = useState(false),
      [visibleLimit, setVisibleLimit] = useState(40);
    const playerRef = useRef(""),
      requestRef = useRef(null),
      pdfRef = useRef("");
    const [pdf, setPdf] = useState("");
    const records = Array.isArray(data == null ? void 0 : data[tab])
      ? data[tab]
      : [];
    const matches = records.filter((x) =>
      x.title.toLowerCase().includes(query.trim().toLowerCase()),
    );
    const visible = matches.slice(0, visibleLimit);
    useEffect(() => setVisibleLimit(40), [batchId, tab, query]);
    useEffect(
      () => () => {
        var _a;
        (_a = requestRef.current) == null ? void 0 : _a.abort();
        requestRef.current = null;
      },
      [batchId],
    );
    useEffect(() => {
      const pop = () => {
        var _a, _b;
        if (
          playerRef.current &&
          !((_a = window.history.state) == null ? void 0 : _a.acOverlay)
        ) {
          playerRef.current = "";
          setPlayer("");
        }
        if (
          pdfRef.current &&
          !((_b = window.history.state) == null ? void 0 : _b.acNotes)
        ) {
          pdfRef.current = "";
          setPdf("");
        }
      };
      window.addEventListener("popstate", pop);
      return () => window.removeEventListener("popstate", pop);
    }, []);
    useEffect(() => {
      if (!player) return;
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }, [player]);
    const play = async (item) => {
      var _a;
      if (!item.available || playerRef.current || requestRef.current) return;
      const target =
        acBase() +
        "/ac/watch/" +
        encodeURIComponent(batchId) +
        "/" +
        item.index;
      setPlayError("");
      if (
        !((_a = window.ReactNativeWebView) == null ? void 0 : _a.postMessage)
      ) {
        window.history.pushState(
          { ...window.history.state, acOverlay: true },
          "",
          window.location.href,
        );
        playerRef.current = target;
        setPlayer(target);
        return;
      }
      const controller = new AbortController();
      requestRef.current = controller;
      setOpening(true);
      const timer = setTimeout(() => controller.abort(), 18e3);
      try {
        const media = await window.ApnaCollegePublic.playback(
          batchId,
          item.index,
        );
        if (controller.signal.aborted) return;
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            action: "play_stream",
            url: media.stream,
            template_url: target + "?in_app=true&hide_header=true",
            title: item.title,
            id: batchId + ":" + item.index,
            is_native_video: true,
            playlist: ((data == null ? void 0 : data.lectures) || [])
              .filter((x) => x.available)
              .map((x) => {
                var _a2;
                return {
                  id: batchId + ":" + x.index,
                  title: x.title,
                  url:
                    ((_a2 = media.playlist.find(
                      (peer) => peer.index === x.index,
                    )) == null
                      ? void 0
                      : _a2.url) || "",
                  attachments: [],
                };
              }),
          }),
        );
      } catch (e) {
        if (requestRef.current === controller)
          setPlayError(
            controller.signal.aborted
              ? "Video request timed out. Tap again."
              : e.message,
          );
      } finally {
        clearTimeout(timer);
        if (requestRef.current === controller) {
          requestRef.current = null;
          setOpening(false);
        }
      }
    };
    useEffect(() => {
      if (!window.ReactNativeWebView) return;
      const previous = window.appProcessItem;
      const handler = (id, action) => {
        if (action !== "watch") return;
        const item = ((data == null ? void 0 : data.lectures) || []).find(
          (x) => batchId + ":" + x.index === String(id),
        );
        if (item) play(item);
      };
      window.appProcessItem = handler;
      return () => {
        if (window.appProcessItem === handler) window.appProcessItem = previous;
      };
    }, [data, batchId]);
    const closePdf = () => {
      var _a;
      if ((_a = window.history.state) == null ? void 0 : _a.acNotes)
        window.history.back();
      else {
        pdfRef.current = "";
        setPdf("");
      }
    };
    const close = () => {
      var _a;
      if ((_a = window.history.state) == null ? void 0 : _a.acOverlay)
        window.history.back();
      else {
        playerRef.current = "";
        setPlayer("");
      }
    };
    return React.createElement(
      "main",
      {
        className: "fade-in min-h-screen bg-[#f7faff] px-3 pb-28 pt-3 sm:px-6",
      },
      React.createElement(
        "div",
        { className: "mx-auto max-w-6xl" },
        React.createElement(
          "button",
          {
            type: "button",
            onClick: () => window.history.back(),
            className:
              "mb-4 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-600",
          },
          React.createElement("i", { className: "fas fa-arrow-left mr-2" }),
          "Apna College batches",
        ),
        React.createElement(
          "h1",
          {
            className: "mb-4 break-words text-[26px] font-black text-slate-900",
          },
          (data == null ? void 0 : data.name) || "Apna College",
        ),
        React.createElement(
          "div",
          { className: "mb-4 flex flex-wrap gap-2" },
          ["lectures", "notes"].map((kind) => {
            var _a;
            return React.createElement(
              "button",
              {
                type: "button",
                key: kind,
                "aria-pressed": tab === kind,
                onClick: () => {
                  setTab(kind);
                  setQuery("");
                },
                className:
                  "rounded-full px-4 py-2.5 text-sm font-bold " +
                  (tab === kind
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-600"),
              },
              kind === "lectures" ? "Lectures" : "Generated notes",
              " (",
              ((_a = data == null ? void 0 : data[kind]) == null
                ? void 0
                : _a.length) || 0,
              ")",
            );
          }),
        ),
        React.createElement("input", {
          type: "search",
          value: query,
          onChange: (e) => setQuery(e.target.value),
          placeholder: "Search lectures and notes...",
          "aria-label": "Search Apna College resources",
          className:
            "mb-4 w-full rounded-xl border border-sky-100 px-4 py-3 text-sm",
        }),
        loading &&
          React.createElement(
            "p",
            { role: "status", className: "p-4 text-sm text-slate-500" },
            "Loading Apna College\u2026",
          ),
        error &&
          React.createElement(
            "div",
            {
              role: "alert",
              className: "rounded-xl bg-amber-50 p-4 text-sm text-amber-800",
            },
            error,
            React.createElement(
              "button",
              { type: "button", onClick: retry, className: "ml-3 underline" },
              "Retry",
            ),
          ),
        opening &&
          React.createElement(
            "p",
            { role: "status", className: "mb-3 text-sm text-sky-700" },
            "Opening video\u2026",
          ),
        playError &&
          React.createElement(
            "p",
            { role: "alert", className: "mb-3 text-sm text-rose-700" },
            playError,
          ),
        !loading &&
          !error &&
          !visible.length &&
          React.createElement(
            "p",
            { className: "p-4 text-sm text-slate-500" },
            "No matching ",
            tab,
            ".",
          ),
        React.createElement(
          "div",
          {
            className:
              tab === "lectures"
                ? "space-y-3"
                : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
          },
          visible.map((item) =>
            React.createElement(
              "button",
              {
                type: "button",
                key: item.index,
                disabled: !item.available,
                onClick: () => {
                  var _a;
                  if (tab === "lectures") play(item);
                  else {
                    if (pdfRef.current) return;
                    const title = item.title || "Study notes",
                      fileName = title + " (Generated).pdf";
                    const source =
                      acBase() +
                      "/api/studyxac/generated-note.pdf?" +
                      new URLSearchParams({
                        title,
                        batch:
                          (data == null ? void 0 : data.name) || "Apna College",
                      });
                    if (
                      (_a = window.ReactNativeWebView) == null
                        ? void 0
                        : _a.postMessage
                    ) {
                      window.ReactNativeWebView.postMessage(
                        JSON.stringify({
                          action: "open_pdf",
                          url: source,
                          fileName,
                          title: fileName,
                          is_pdf: true,
                        }),
                      );
                      return;
                    }
                    const encode = (value) =>
                      btoa(unescape(encodeURIComponent(value)))
                        .split("+")
                        .join("-")
                        .split("/")
                        .join("_")
                        .replace(/=+$/, "");
                    const viewer =
                      acBase() +
                      "/watch_pdf_ext?" +
                      new URLSearchParams({
                        url: encode(source),
                        name: encode(fileName),
                      });
                    window.history.pushState(
                      { ...window.history.state, acNotes: true },
                      "",
                      window.location.href,
                    );
                    pdfRef.current = viewer;
                    setPdf(viewer);
                  }
                },
                "aria-label":
                  "Open Apna College " +
                  (tab === "lectures" ? "lecture " : "note ") +
                  item.title,
                className:
                  "group flex w-full min-w-0 items-center gap-3 rounded-[20px] border border-sky-100 bg-white p-3 text-left shadow-sm transition hover:border-sky-300 hover:shadow-md active:scale-[.99] disabled:opacity-50 sm:gap-5 sm:p-4",
              },
              tab === "lectures"
                ? React.createElement(
                    "span",
                    {
                      className:
                        "relative flex h-[60px] w-[96px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-sky-100 to-indigo-100 text-sky-600 sm:h-[92px] sm:w-[148px] sm:rounded-2xl",
                    },
                    React.createElement("i", {
                      className:
                        "fas " +
                        (item.available ? "fa-play-circle" : "fa-lock") +
                        " text-2xl sm:text-3xl",
                    }),
                    React.createElement(
                      "span",
                      {
                        className:
                          "absolute bottom-1.5 left-2 rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] font-bold text-slate-600",
                      },
                      "LECTURE",
                    ),
                  )
                : React.createElement(
                    "span",
                    {
                      className:
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-lg text-sky-600",
                    },
                    React.createElement("i", { className: "fas fa-file-pdf" }),
                  ),
              React.createElement(
                "span",
                { className: "min-w-0 flex-1" },
                React.createElement(
                  "span",
                  {
                    className:
                      "block break-words text-[13px] font-extrabold leading-snug text-slate-900 sm:text-[15px]",
                  },
                  item.title,
                ),
                React.createElement(
                  "span",
                  {
                    className:
                      "mt-2 block text-[11px] font-medium text-slate-500 sm:text-xs",
                  },
                  !item.available
                    ? "Upstream resource unavailable"
                    : tab === "lectures"
                      ? "Tap anywhere to watch"
                      : "Open generated reference PDF",
                ),
              ),
              tab === "lectures" &&
                React.createElement(
                  "span",
                  {
                    className:
                      "hidden shrink-0 items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-xs font-bold text-white sm:inline-flex",
                  },
                  React.createElement("i", {
                    className:
                      "fas " + (item.available ? "fa-play" : "fa-lock"),
                  }),
                  item.available ? "Play Video" : "Unavailable",
                ),
              tab === "lectures" &&
                React.createElement(
                  "span",
                  {
                    className:
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sky-50 text-xs text-sky-600 sm:hidden",
                  },
                  React.createElement("i", {
                    className:
                      "fas " + (item.available ? "fa-play" : "fa-lock"),
                  }),
                ),
            ),
          ),
        ),
        matches.length > visibleLimit &&
          React.createElement(
            "button",
            {
              type: "button",
              onClick: () => setVisibleLimit((x) => x + 40),
              className:
                "mt-4 w-full rounded-xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700",
            },
            "Load more ",
            tab,
            " (",
            Math.min(visibleLimit, matches.length),
            " / ",
            matches.length,
            ")",
          ),
        pdf &&
          window.ReactDOM.createPortal(
            React.createElement(
              "div",
              {
                role: "dialog",
                "aria-modal": "true",
                "aria-label": "Apna College PDF reader",
                className: "fixed inset-0 z-[9999] flex flex-col bg-white",
              },
              React.createElement(
                "button",
                {
                  type: "button",
                  onClick: closePdf,
                  "aria-label": "Back to Apna College notes",
                  className:
                    "shrink-0 self-start rounded-lg px-4 py-3 text-sm font-bold text-sky-700",
                },
                "Back to notes \xB7 Generated reference PDF",
              ),
              React.createElement("iframe", {
                title: "RG Verse PDF reader",
                src: pdf,
                className: "min-h-0 w-full flex-1 border-0",
              }),
            ),
            document.body,
          ),
        player &&
          React.createElement(
            "div",
            {
              role: "dialog",
              "aria-modal": "true",
              "aria-label": "Apna College video player",
              className: "fixed inset-0 z-[9999] flex flex-col bg-black",
            },
            React.createElement(
              "button",
              {
                type: "button",
                onClick: close,
                className:
                  "shrink-0 self-start rounded-lg px-4 py-3 text-sm font-bold text-white",
              },
              React.createElement("i", { className: "fas fa-arrow-left mr-2" }),
              "Back to lectures",
            ),
            React.createElement("iframe", {
              title: "Apna College lecture",
              src: player,
              allow: "autoplay; fullscreen; picture-in-picture",
              allowFullScreen: true,
              className: "min-h-0 w-full flex-1 border-0",
            }),
          ),
      ),
    );
  };
})();
