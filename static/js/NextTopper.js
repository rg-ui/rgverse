(() => {
  const { useState, useEffect, useRef } = window.React;
  const ntBase = () =>
    String(window.SERVER_URL || window.location.origin).replace(/\/$/, "");
  const ntCourseUrl = (id, folder) =>
    ntBase() +
    "/api/nexttopper/courses/" +
    encodeURIComponent(id) +
    "/content?folder=" +
    encodeURIComponent(folder || "0");
  const ntClasses = {
    page: "fade-in min-h-screen bg-[#f7faff] px-3 pb-32 pt-4 sm:px-6 sm:pt-7",
    container: "mx-auto max-w-6xl",
    card: "group min-w-0 overflow-hidden rounded-[20px] border border-sky-100 bg-white shadow-[0_5px_22px_rgba(30,70,130,.08)] transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[.985]",
  };
  const ntIsPdf = (item) =>
    item.fileType === 1 || /\.pdf(?:\?|$)/i.test(item.fileUrl || "");
  const ntCountTotal = (value) => {
    const valid = (n) =>
      typeof n === "number" && Number.isSafeInteger(n) && n >= 0;
    if (valid(value)) return value;
    if (
      value &&
      typeof value === "object" &&
      valid(value.free) &&
      valid(value.paid)
    ) {
      const total = value.free + value.paid;
      return valid(total) ? total : null;
    }
    return null;
  };
  const NtFolderCounts = ({ counts = {} }) => {
    const videos = ntCountTotal(counts.videos) ?? ntCountTotal(counts.video);
    const pdfs =
      ntCountTotal(counts.pdf) ??
      ntCountTotal(typeof counts.notes === "number" ? counts.notes : null);
    const notes =
      typeof counts.notes === "object" ? ntCountTotal(counts.notes) : null;
    return React.createElement(
      React.Fragment,
      null,
      videos !== null &&
        React.createElement(
          "span",
          { className: "rounded-full bg-sky-50 px-2.5 py-1 text-sky-700" },
          videos,
          " videos",
        ),
      pdfs !== null &&
        React.createElement(
          "span",
          {
            className: "rounded-full bg-violet-50 px-2.5 py-1 text-violet-700",
          },
          pdfs,
          " PDFs",
        ),
      notes > 0 &&
        React.createElement(
          "span",
          {
            className: "rounded-full bg-violet-50 px-2.5 py-1 text-violet-700",
          },
          notes,
          " notes",
        ),
      videos === null &&
        pdfs === null &&
        !(notes > 0) &&
        React.createElement("span", null, "Explore contents"),
    );
  };
  const ntDuration = (sec) => {
    if (!Number.isFinite(Number(sec)) || !sec) return "";
    const n = Math.max(0, Math.floor(Number(sec)));
    return n >= 3600
      ? Math.floor(n / 3600) +
          ":" +
          String(Math.floor((n % 3600) / 60)).padStart(2, "0") +
          ":" +
          String(n % 60).padStart(2, "0")
      : Math.floor(n / 60) + ":" + String(n % 60).padStart(2, "0");
  };
  const ntUseApi = (url) => {
    const [state, setState] = useState({
      loading: true,
      error: "",
      data: null,
    });
    useEffect(() => {
      if (!url) {
        setState({ loading: false, error: "", data: null });
        return;
      }
      const controller = new AbortController();
      setState({ loading: true, error: "", data: null });
      fetch(url, { signal: controller.signal, cache: "no-store" })
        .then(async (response) => {
          const payload = await response.json().catch(() => ({}));
          if (!response.ok || !payload.success) {
            const error = Error(payload.error || "Course data unavailable");
            error.status = response.status;
            throw error;
          }
          return payload;
        })
        .then((payload) => {
          if (!controller.signal.aborted)
            setState({
              loading: false,
              error: "",
              data: payload.data,
              recovery: payload.recovery || null,
              backup: payload.backup || null,
              alignment: payload.alignment || null,
              status: 200,
            });
        })
        .catch((err) => {
          if (!controller.signal.aborted)
            setState({
              loading: false,
              error: err.message || "Failed to load",
              data: null,
              status: err.status || 0,
              recovery: null,
            });
        });
      return () => controller.abort();
    }, [url]);
    return state;
  };
  const NtLoader = ({ message = "Loading courses\u2026" }) =>
    React.createElement(
      "div",
      {
        role: "status",
        className: "grid grid-cols-2 gap-3 py-3 sm:grid-cols-3 lg:grid-cols-4",
      },
      [1, 2, 3, 4, 5, 6].map((i) =>
        React.createElement("div", {
          key: i,
          className: "h-48 animate-pulse rounded-[22px] bg-sky-100/70",
        }),
      ),
      React.createElement("span", { className: "sr-only" }, message),
    );
  const NtBack = () =>
    React.createElement(
      "button",
      {
        type: "button",
        "aria-label": "Back to previous NextTopper screen",
        onClick: () => window.history.back(),
        className:
          "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-white text-sky-600 shadow-sm",
      },
      React.createElement("i", { className: "fas fa-arrow-left" }),
    );
  const NtPoster = ({ src, name, icon = "fa-book-open" }) =>
    React.createElement(
      "span",
      {
        className:
          "relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-sky-600 to-indigo-700 text-white",
      },
      React.createElement("i", {
        className: `fas ${icon} text-3xl opacity-85`,
        "aria-hidden": "true",
      }),
      src &&
        React.createElement("img", {
          src,
          alt: name,
          loading: "lazy",
          decoding: "async",
          onError: (e) => {
            e.currentTarget.style.display = "none";
          },
          className: "absolute inset-0 h-full w-full object-cover",
        }),
    );
  const ntFavoritesKey = "akki_nexttopper_favorites_v1";
  const ntFavoriteItem = (item) => {
    if (
      !item ||
      !/^[0-9A-Za-z_-]{1,64}$/.test(String(item.id || "")) ||
      typeof item.name !== "string"
    )
      return null;
    let image = "";
    try {
      const url = new URL(item.image);
      if (
        url.protocol === "https:" &&
        !url.username &&
        !url.password &&
        url.href.length <= 3e3
      )
        image = url.href;
    } catch (_) {}
    return {
      id: String(item.id),
      name: item.name.slice(0, 180),
      image,
      source: "nexttopper",
      validity_days:
        Number.isSafeInteger(item.validity_days) && item.validity_days >= 0
          ? item.validity_days
          : null,
    };
  };
  window.readNtFavorites = () => {
    try {
      const raw = localStorage.getItem(ntFavoritesKey) || "[]";
      if (raw.length > 2e6) return [];
      const values = JSON.parse(raw);
      if (!Array.isArray(values)) return [];
      return Array.from(
        new Map(
          values
            .slice(-500)
            .map(ntFavoriteItem)
            .filter(Boolean)
            .map((item) => [item.id, item]),
        ).values(),
      );
    } catch (_) {
      return [];
    }
  };
  window.useNtFavorites = () => {
    const [items, setItems] = useState(window.readNtFavorites);
    useEffect(() => {
      const refresh = () => setItems(window.readNtFavorites());
      window.addEventListener("nexttopper-favorites-changed", refresh);
      window.addEventListener("storage", refresh);
      return () => {
        window.removeEventListener("nexttopper-favorites-changed", refresh);
        window.removeEventListener("storage", refresh);
      };
    }, []);
    return items;
  };
  const toggleNtFavorite = (value) => {
    var _a;
    const item = ntFavoriteItem(value);
    if (!item) return;
    const items = window.readNtFavorites();
    const next = items.some((row) => row.id === item.id)
      ? items.filter((row) => row.id !== item.id)
      : [...items.slice(-499), item];
    try {
      localStorage.setItem(ntFavoritesKey, JSON.stringify(next));
      window.dispatchEvent(new Event("nexttopper-favorites-changed"));
    } catch (_) {
      (_a = window.showAppAlert) == null
        ? void 0
        : _a.call(window, "Unable to save this batch on your device.");
    }
  };
  window.NextTopperCard = ({ item, isSaved, onNavigate }) =>
    React.createElement(
      "article",
      { className: "relative " + ntClasses.card + " rounded-[24px] p-2.5" },
      React.createElement(
        "button",
        {
          type: "button",
          "aria-label": `Open NextTopper batch ${item.name}`,
          onClick: () =>
            onNavigate("nt_course", {
              batch: item.id,
              subject: "0",
              chapter: null,
            }),
          className: "block w-full text-left",
        },
        React.createElement(
          "div",
          { className: "aspect-video w-full overflow-hidden rounded-[18px]" },
          React.createElement(NtPoster, {
            src: item.image,
            name: item.name,
            icon: "fa-graduation-cap",
          }),
        ),
        React.createElement(
          "div",
          { className: "px-2 pb-2 pt-4" },
          React.createElement(
            "h3",
            {
              className:
                "line-clamp-2 min-h-[44px] text-[16px] font-extrabold leading-snug tracking-tight text-slate-800",
            },
            item.name,
          ),
          React.createElement(
            "p",
            { className: "mt-2 text-[11px] font-medium text-slate-500" },
            item.validity_days
              ? item.validity_days + " Days Validity"
              : "Full Course Access",
          ),
          React.createElement(
            "div",
            {
              className:
                "mt-4 flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-[13px] font-bold text-white",
            },
            React.createElement("i", { className: "fas fa-book-open" }),
            React.createElement("span", null, "Let's study"),
            React.createElement("i", {
              className: "fas fa-arrow-right text-xs",
            }),
          ),
        ),
      ),
      React.createElement(
        "button",
        {
          type: "button",
          "aria-pressed": !!isSaved,
          "aria-label": `${isSaved ? "Unsave" : "Save"} NextTopper batch ${item.name}`,
          onClick: (event) => {
            event == null ? void 0 : event.stopPropagation();
            toggleNtFavorite(item);
          },
          className:
            "absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full border border-white/80 bg-white/90 text-lg text-rose-500 shadow-sm transition active:scale-95",
        },
        React.createElement("i", {
          "aria-hidden": "true",
          className: (isSaved ? "fas" : "far") + " fa-heart",
        }),
      ),
    );
  window.NextTopperScreen = ({ batchId, folderId, onNavigate }) => {
    var _a, _b;
    const favorites = window.useNtFavorites();
    const listing = !batchId;
    const catalogue = ntUseApi(
      !batchId ? ntBase() + "/api/nexttopper/batches" : null,
    );
    const course = ntUseApi(
      batchId
        ? ntBase() + "/api/nexttopper/courses/" + encodeURIComponent(batchId)
        : null,
    );
    const contents = ntUseApi(batchId ? ntCourseUrl(batchId, folderId) : null);
    const [search, setSearch] = useState("");
    const [busy, setBusy] = useState("");
    const [pdf, setPdf] = useState(null);
    const [openError, setOpenError] = useState("");
    const pdfRef = useRef(""),
      pdfRequest = useRef(null);
    const [player, setPlayer] = useState("");
    const [materialTab, setMaterialTab] = useState("lectures");
    useEffect(() => {
      setMaterialTab("lectures");
      setSearch("");
      setBusy("");
      setOpenError("");
      return () => {
        var _a2;
        (_a2 = pdfRequest.current) == null ? void 0 : _a2.abort();
        pdfRequest.current = null;
      };
    }, [batchId, folderId]);
    useEffect(() => {
      const rows = Array.isArray(contents.data) ? contents.data : [];
      if (rows.some((x) => x.type === "file"))
        setMaterialTab(
          rows.some((x) => x.type === "file" && !ntIsPdf(x))
            ? "lectures"
            : "notes",
        );
    }, [contents.data]);
    const playerRef = useRef("");
    const recoveredRef = useRef("");
    useEffect(() => {
      const target = contents.recovery;
      if (!batchId || !target) return;
      const key = target.course_id + "|" + target.folder_id;
      if (
        key === recoveredRef.current ||
        (String(batchId) === String(target.course_id) &&
          String(folderId || "0") === String(target.folder_id))
      )
        return;
      recoveredRef.current = key;
      onNavigate(
        "nt_course",
        { batch: target.course_id, subject: target.folder_id, chapter: null },
        true,
      );
    }, [contents.recovery, batchId, folderId, onNavigate]);
    useEffect(() => {
      const onPop = () => {
        var _a2, _b2;
        if (
          playerRef.current &&
          !((_a2 = window.history.state) == null ? void 0 : _a2.ntOverlay)
        ) {
          playerRef.current = "";
          setPlayer("");
        }
        if (
          pdfRef.current &&
          !((_b2 = window.history.state) == null ? void 0 : _b2.ntPdfOverlay)
        ) {
          pdfRef.current = "";
          setPdf(null);
        }
      };
      window.addEventListener("popstate", onPop);
      return () => window.removeEventListener("popstate", onPop);
    }, []);
    useEffect(() => {
      if (!player && !pdf) return;
      const last = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = last;
      };
    }, [player, pdf]);
    const closePdf = () => {
      var _a2;
      if ((_a2 = window.history.state) == null ? void 0 : _a2.ntPdfOverlay)
        window.history.back();
      else {
        pdfRef.current = "";
        setPdf(null);
      }
    };
    const closePlayer = () => {
      var _a2;
      if ((_a2 = window.history.state) == null ? void 0 : _a2.ntOverlay)
        window.history.back();
      else {
        playerRef.current = "";
        setPlayer("");
      }
    };
    const loadVideo = async (item) => {
      var _a2, _b2, _c, _d;
      if (busy || pdfRequest.current || !batchId) return;
      if (ntIsPdf(item)) {
        const controller = new AbortController();
        pdfRequest.current = controller;
        setBusy(item.id);
        setOpenError("");
        const timer = setTimeout(() => controller.abort(), 25e3);
        try {
          const target =
            ntBase() +
            "/api/nexttopper/courses/" +
            encodeURIComponent(batchId) +
            "/pdfs/" +
            encodeURIComponent(item.id) +
            "?" +
            new URLSearchParams({ folder: folderId || "0" });
          const response = await fetch(target, {
            signal: controller.signal,
            cache: "no-store",
          });
          const payload = await response.json().catch(() => ({}));
          if (!response.ok || !payload.success)
            throw Error(
              payload.error || "PDF link could not be resolved. Please retry.",
            );
          const address = (_a2 = payload.data) == null ? void 0 : _a2.url,
            fileName =
              ((_b2 = payload.data) == null ? void 0 : _b2.fileName) ||
              item.title + ".pdf";
          if (typeof address !== "string" || !/^https:\/\//i.test(address))
            throw Error("This PDF has no valid file link.");
          if (controller.signal.aborted) return;
          if (
            (_c = window.ReactNativeWebView) == null ? void 0 : _c.postMessage
          ) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({
                action: "open_pdf",
                url: address,
                fileName,
                title: fileName,
                is_pdf: true,
              }),
            );
          } else {
            const encode = (value) =>
              btoa(unescape(encodeURIComponent(value)))
                .replace(/\+/g, "-")
                .replace(/\//g, "_")
                .replace(/=+$/, "");
            const source =
              ntBase() +
              "/nexttopper/pdf/" +
              encodeURIComponent(batchId) +
              "/" +
              encodeURIComponent(item.id) +
              "?" +
              new URLSearchParams({ folder: folderId || "0" });
            const viewer =
              ntBase() +
              "/watch_pdf_ext?url=" +
              encode(source) +
              "&name=" +
              encode(fileName);
            window.history.pushState(
              { ...window.history.state, ntPdfOverlay: true },
              "",
              window.location.href,
            );
            pdfRef.current = viewer;
            setPdf({ title: item.title, url: viewer });
          }
        } catch (error2) {
          if (pdfRequest.current === controller)
            setOpenError(
              controller.signal.aborted
                ? "PDF request timed out. Please retry."
                : error2.message || "Could not open this PDF.",
            );
        } finally {
          clearTimeout(timer);
          if (pdfRequest.current === controller) {
            pdfRequest.current = null;
            setBusy("");
          }
        }
        return;
      }
      if (item.videoType === 1 && item.fileUrl) {
        window.open(item.fileUrl, "_blank", "noopener,noreferrer");
        return;
      }
      const query = new URLSearchParams();
      query.set("folder", String(folderId || "0"));
      if (item.vdcId) query.set("vdc", item.vdcId);
      const url =
        ntBase() +
        "/nexttopper/watch/" +
        encodeURIComponent(batchId) +
        "/" +
        encodeURIComponent(item.id) +
        (query.size ? "?" + query : "");
      setBusy(item.id);
      if ((_d = window.ReactNativeWebView) == null ? void 0 : _d.postMessage) {
        const appUrl =
          url + (query.size ? "&" : "?") + "in_app=true&hide_header=true";
        try {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              action: "play_stream",
              url: appUrl,
              template_url: appUrl,
              title: item.title || "NextTopper lecture",
              id: item.id,
              is_native_video: true,
            }),
          );
        } catch (e) {
          setOpenError("Could not open the app player. Please tap again.");
        }
        setBusy("");
        return;
      }
      window.history.pushState(
        { ...window.history.state, ntOverlay: true },
        "",
        window.location.href,
      );
      playerRef.current = url;
      setPlayer(url);
      setBusy("");
    };
    const data = listing
      ? Array.isArray(catalogue.data)
        ? catalogue.data
        : []
      : Array.isArray(contents.data)
        ? contents.data
        : [];
    const filtered = data.filter((item) =>
      String(item.name || item.title || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
    const folders = listing ? [] : filtered.filter((x) => x.type === "folder");
    const files = listing ? [] : filtered.filter((x) => x.type === "file");
    const lectures = files.filter((x) => !ntIsPdf(x));
    const notes = files.filter(ntIsPdf);
    const selectedTab = materialTab;
    const visibleFiles = selectedTab === "notes" ? notes : lectures;
    const tests = listing ? [] : filtered.filter((x) => x.type === "test");
    const pending = listing
      ? catalogue.loading
      : contents.loading || course.loading;
    const errorState = listing ? catalogue : contents.error ? contents : course;
    const error = errorState.error;
    const errorStatus = errorState.status;
    const openFolder = (id) =>
      onNavigate("nt_course", { batch: batchId, subject: id, chapter: null });
    const headerName = listing
      ? "NextTopper Batches"
      : ((_a = course.data) == null ? void 0 : _a.title) || "NextTopper Course";
    return React.createElement(
      "main",
      { className: ntClasses.page },
      React.createElement(
        "div",
        { className: ntClasses.container },
        React.createElement(
          "div",
          { className: "mb-5 flex items-center gap-3" },
          React.createElement(NtBack, null),
          React.createElement(
            "div",
            { className: "min-w-0 flex-1" },
            React.createElement(
              "p",
              {
                className:
                  "text-[10px] font-black uppercase tracking-[.15em] text-sky-600",
              },
              ((window.APP_CONFIG && window.APP_CONFIG.appName) || "RG VERSE") + " \xB7 NEXT TOPPERS",
            ),
            React.createElement(
              "h1",
              {
                className:
                  "truncate text-[22px] font-black tracking-tight text-slate-900 sm:text-[29px]",
              },
              headerName,
            ),
          ),
        ),
        listing
          ? React.createElement(
              "p",
              { className: "mb-5 text-[13px] font-medium text-slate-500" },
              "Choose your batch and start learning.",
            )
          : null,
        ((_b = listing ? catalogue.backup : contents.backup || course.backup) ==
        null
          ? void 0
          : _b.active) &&
          React.createElement(
            "p",
            {
              role: "status",
              className:
                "mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] font-semibold text-amber-800",
            },
            "Backup data \xB7 Last saved: ",
            (listing ? catalogue.backup : contents.backup || course.backup)
              .saved_at,
            ". Latest additions may be delayed; some media links may have expired.",
          ),
        contents.alignment &&
          React.createElement(
            "p",
            {
              className:
                "mb-4 rounded-xl bg-sky-50 px-4 py-3 text-[12px] font-medium text-sky-700",
            },
            "TXT backup \xB7 Saved subject/chapter layout \xB7 ",
            contents.alignment.matched,
            " matched materials",
            contents.alignment.unmatched > 0
              ? ` \xB7 ${contents.alignment.unmatched} under Unmatched TXT content`
              : "",
            ".",
          ),
        openError &&
          React.createElement(
            "p",
            {
              role: "alert",
              className:
                "mb-4 rounded-xl border border-rose-100 bg-rose-50 p-4 text-[13px] font-semibold text-rose-700",
            },
            openError,
          ),
        busy &&
          React.createElement(
            "p",
            {
              role: "status",
              className: "mb-3 text-[13px] font-semibold text-sky-700",
            },
            "Opening PDF\u2026",
          ),
        React.createElement(
          "div",
          {
            className:
              "mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center",
          },
          React.createElement(
            "h2",
            { className: "text-[15px] font-black text-slate-800" },
            React.createElement("i", {
              className: `fas ${listing ? "fa-graduation-cap" : "fa-folder-open"} mr-2 text-sky-600`,
            }),
            listing
              ? `Available Batches (${data.length})`
              : `Folders & Lessons (${data.length})`,
          ),
          React.createElement("input", {
            type: "search",
            "aria-label": listing
              ? "Search NextTopper batches"
              : "Search NextTopper course content",
            placeholder: listing
              ? "Search NextTopper batches\u2026"
              : "Search subjects, chapters or lectures\u2026",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            className:
              "w-full rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-sky-400 sm:max-w-[310px]",
          }),
        ),
        pending
          ? React.createElement(NtLoader, null)
          : error
            ? React.createElement(
                "div",
                {
                  role: "alert",
                  className:
                    "rounded-2xl border border-amber-200 bg-amber-50 p-5 text-[13px] font-semibold text-amber-800",
                },
                React.createElement("i", {
                  className: "fas fa-exclamation-triangle mr-2",
                }),
                error,
                React.createElement(
                  "p",
                  { className: "mt-2 text-[11px] font-medium" },
                  errorStatus === 403
                    ? "The source requires authorized access."
                    : errorStatus === 404
                      ? "This folder is not available in the current source. Open the batch again."
                      : "Please try again. The source could not be reached.",
                ),
                React.createElement(
                  "button",
                  {
                    type: "button",
                    onClick: () =>
                      onNavigate(
                        "nt_catalog",
                        { batch: null, subject: null, chapter: null },
                        true,
                      ),
                    className:
                      "mt-3 min-h-[44px] rounded-xl bg-white px-4 py-2 text-xs font-bold text-sky-700",
                  },
                  "Open NextTopper batches",
                ),
              )
            : listing
              ? React.createElement(
                  "div",
                  {
                    className:
                      "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                  },
                  filtered.map((batch) =>
                    React.createElement(window.NextTopperCard, {
                      key: batch.id,
                      item: batch,
                      isSaved: favorites.some((item) => item.id === batch.id),
                      onNavigate,
                    }),
                  ),
                )
              : React.createElement(
                  "div",
                  { className: "space-y-7" },
                  folders.length > 0 &&
                    React.createElement(
                      "section",
                      null,
                      React.createElement(
                        "h2",
                        {
                          className:
                            "mb-3 text-[14px] font-black text-slate-800",
                        },
                        React.createElement("i", {
                          className: "fas fa-folder mr-2 text-sky-600",
                        }),
                        "Subjects & Chapters",
                      ),
                      React.createElement(
                        "div",
                        {
                          className:
                            "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
                        },
                        folders.map((item, index) =>
                          React.createElement(
                            "button",
                            {
                              type: "button",
                              key: item.id,
                              className:
                                "group relative flex min-h-[142px] min-w-0 flex-col overflow-hidden rounded-[24px] border border-sky-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg active:scale-[.99]",
                              "aria-label": `Open NextTopper folder ${item.title}`,
                              onClick: () => openFolder(item.id),
                            },
                            React.createElement(
                              "span",
                              {
                                className:
                                  "mb-4 flex w-full items-center justify-between",
                              },
                              React.createElement(
                                "span",
                                {
                                  className:
                                    "grid h-12 w-12 place-items-center overflow-hidden rounded-2xl text-xl",
                                  style: {
                                    background: [
                                      "#e0f2fe",
                                      "#ede9fe",
                                      "#d1fae5",
                                      "#ffedd5",
                                    ][index % 4],
                                    color: [
                                      "#0284c7",
                                      "#7c3aed",
                                      "#059669",
                                      "#ea580c",
                                    ][index % 4],
                                  },
                                },
                                item.image
                                  ? React.createElement("img", {
                                      src: item.image,
                                      alt: "",
                                      className: "h-full w-full object-cover",
                                    })
                                  : React.createElement("i", {
                                      className: "fas fa-book-open",
                                    }),
                              ),
                              React.createElement(
                                "span",
                                {
                                  className:
                                    "grid h-8 w-8 place-items-center rounded-full bg-slate-50 text-slate-400 transition group-hover:bg-sky-100 group-hover:text-sky-600",
                                },
                                React.createElement("i", {
                                  className: "fas fa-arrow-right text-xs",
                                }),
                              ),
                            ),
                            React.createElement(
                              "span",
                              {
                                className:
                                  "block w-full break-words text-[17px] font-extrabold leading-snug tracking-tight text-slate-800",
                              },
                              item.title,
                            ),
                            React.createElement(
                              "span",
                              {
                                className:
                                  "mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500",
                              },
                              React.createElement(NtFolderCounts, {
                                counts: item.counts || {},
                              }),
                            ),
                          ),
                        ),
                      ),
                    ),
                  files.length > 0 &&
                    React.createElement(
                      "section",
                      null,
                      React.createElement(
                        "div",
                        {
                          role: "tablist",
                          "aria-label": "NextTopper materials",
                          className:
                            "mb-4 flex gap-2 rounded-2xl border border-sky-100 bg-white p-1.5",
                        },
                        [
                          [
                            "lectures",
                            "Lectures",
                            lectures.length,
                            "fa-play-circle",
                          ],
                          [
                            "notes",
                            "Notes & PDFs",
                            notes.length,
                            "fa-file-pdf",
                          ],
                        ].map(([key, label, count, icon]) =>
                          React.createElement(
                            "button",
                            {
                              type: "button",
                              key,
                              role: "tab",
                              "aria-selected": selectedTab === key,
                              onClick: () => setMaterialTab(key),
                              className:
                                "flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-[13px] font-bold transition " +
                                (selectedTab === key
                                  ? "bg-sky-600 text-white shadow-sm"
                                  : "text-slate-500 hover:bg-slate-50"),
                            },
                            React.createElement("i", {
                              className: "fas " + icon,
                            }),
                            label,
                            React.createElement(
                              "span",
                              {
                                className:
                                  "rounded-full bg-black/5 px-2 py-0.5 text-[10px]",
                              },
                              count,
                            ),
                          ),
                        ),
                      ),
                      React.createElement(
                        "div",
                        {
                          role: "tabpanel",
                          "aria-label":
                            selectedTab === "notes"
                              ? "Notes & PDFs"
                              : "Lectures",
                        },
                        React.createElement(
                          "div",
                          { className: "space-y-3" },
                          visibleFiles.map((item) =>
                            React.createElement(
                              "button",
                              {
                                type: "button",
                                key: item.id,
                                disabled: busy === item.id,
                                "aria-label": `Open NextTopper lesson ${item.title}`,
                                onClick: () => loadVideo(item),
                                className:
                                  ntClasses.card +
                                  " flex w-full items-center gap-3 p-3 text-left disabled:opacity-60 sm:gap-5 sm:p-4",
                              },
                              !ntIsPdf(item) &&
                                React.createElement(
                                  "span",
                                  {
                                    className:
                                      "relative block h-[60px] w-[96px] shrink-0 overflow-hidden rounded-xl sm:h-[92px] sm:w-[148px] sm:rounded-2xl",
                                  },
                                  React.createElement(NtPoster, {
                                    src: item.image,
                                    name: item.title,
                                    icon: "fa-play-circle",
                                  }),
                                ),
                              ntIsPdf(item) &&
                                React.createElement(
                                  "span",
                                  {
                                    className:
                                      "grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-50 text-xl text-violet-600",
                                  },
                                  React.createElement("i", {
                                    className: "fas fa-file-pdf",
                                  }),
                                ),
                              React.createElement(
                                "span",
                                { className: "min-w-0 flex-1" },
                                React.createElement(
                                  "span",
                                  {
                                    className:
                                      "block break-words text-[13px] font-extrabold leading-snug text-slate-800 sm:text-[15px]",
                                  },
                                  item.title,
                                ),
                                React.createElement(
                                  "span",
                                  {
                                    className:
                                      "mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-slate-500 sm:text-[12px]",
                                  },
                                  ntIsPdf(item)
                                    ? React.createElement(
                                        "span",
                                        null,
                                        "PDF document",
                                      )
                                    : React.createElement(
                                        React.Fragment,
                                        null,
                                        React.createElement(
                                          "span",
                                          null,
                                          ntDuration(item.duration) ||
                                            "Video lecture",
                                        ),
                                        React.createElement(
                                          "span",
                                          { className: "text-sky-600" },
                                          "Tap to play",
                                        ),
                                      ),
                                ),
                              ),
                              React.createElement(
                                "span",
                                {
                                  className:
                                    "hidden shrink-0 items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-xs font-bold text-white sm:inline-flex",
                                },
                                React.createElement("i", {
                                  className:
                                    "fas " +
                                    (ntIsPdf(item) ? "fa-file-pdf" : "fa-play"),
                                }),
                                ntIsPdf(item) ? "Open PDF" : "Play Video",
                              ),
                              React.createElement(
                                "span",
                                {
                                  className:
                                    "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sky-50 text-xs text-sky-600 sm:hidden",
                                },
                                React.createElement("i", {
                                  className:
                                    "fas " +
                                    (ntIsPdf(item)
                                      ? "fa-arrow-right"
                                      : "fa-play"),
                                }),
                              ),
                            ),
                          ),
                        ),
                        !visibleFiles.length &&
                          React.createElement(
                            "p",
                            {
                              className:
                                "rounded-2xl bg-white p-6 text-center text-sm text-slate-500",
                            },
                            "No ",
                            selectedTab === "notes" ? "notes" : "lectures",
                            " in this folder.",
                          ),
                      ),
                    ),
                  tests.length > 0 &&
                    React.createElement(
                      "section",
                      null,
                      React.createElement(
                        "h2",
                        {
                          className:
                            "mb-3 text-[14px] font-black text-slate-800",
                        },
                        React.createElement("i", {
                          className: "fas fa-clipboard-check mr-2 text-sky-600",
                        }),
                        "Tests",
                      ),
                      React.createElement(
                        "div",
                        { className: "grid grid-cols-1 gap-3 sm:grid-cols-2" },
                        tests.map((item) =>
                          React.createElement(
                            "a",
                            {
                              key: item.id,
                              href: item.dynamicLink || void 0,
                              target: "_blank",
                              rel: "noopener noreferrer",
                              className:
                                "flex items-center gap-3 rounded-xl border border-sky-100 bg-white p-4 text-sm font-bold text-slate-800",
                            },
                            React.createElement("i", {
                              className: "fas fa-file-alt text-sky-500",
                            }),
                            item.title,
                            !item.dynamicLink &&
                              React.createElement(
                                "small",
                                { className: "text-slate-500" },
                                "Link unavailable",
                              ),
                          ),
                        ),
                      ),
                    ),
                  !data.length &&
                    React.createElement(
                      "p",
                      {
                        className:
                          "rounded-2xl border border-dashed border-sky-200 bg-white p-8 text-center text-sm font-semibold text-slate-500",
                      },
                      "No materials found in this folder.",
                    ),
                ),
        player &&
          window.ReactDOM.createPortal(
            React.createElement(
              "div",
              {
                role: "dialog",
                "aria-modal": "true",
                "aria-label": "NextTopper stream player",
                className:
                  "fixed inset-0 z-[9999] flex h-[100dvh] w-screen flex-col bg-slate-950",
              },
              React.createElement(
                "header",
                {
                  className:
                    "flex h-[56px] shrink-0 items-center justify-between border-b border-white/10 bg-slate-950 px-3 text-white",
                  style: { paddingTop: "env(safe-area-inset-top)" },
                },
                React.createElement(
                  "button",
                  {
                    type: "button",
                    "aria-label": "Back to NextTopper lectures",
                    onClick: closePlayer,
                    className:
                      "min-h-[44px] rounded-xl px-3 text-sm font-black",
                  },
                  React.createElement("i", {
                    className: "fas fa-arrow-left mr-2",
                  }),
                  "Back to lectures",
                ),
                React.createElement(
                  "span",
                  { className: "text-[11px] font-extrabold" },
                  ((window.APP_CONFIG && window.APP_CONFIG.appName) || "RG VERSE"),
                ),
              ),
              React.createElement("iframe", {
                title: "NextTopper native stream player",
                src: player,
                allowFullScreen: true,
                allow: "autoplay; fullscreen; picture-in-picture",
                className: "min-h-0 w-full flex-1 border-0",
              }),
            ),
            document.body,
          ),
        pdf &&
          window.ReactDOM.createPortal(
            React.createElement(
              "div",
              {
                role: "dialog",
                "aria-modal": "true",
                "aria-label": "NextTopper PDF preview",
                className:
                  "fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/80 p-3",
              },
              React.createElement(
                "div",
                {
                  className:
                    "flex h-[90dvh] w-full max-w-5xl flex-col rounded-2xl bg-white p-3",
                },
                React.createElement(
                  "div",
                  { className: "mb-2 flex items-center justify-between gap-2" },
                  React.createElement(
                    "h3",
                    {
                      className:
                        "truncate text-[13px] font-black text-slate-900",
                    },
                    pdf.title,
                  ),
                  React.createElement(
                    "button",
                    {
                      type: "button",
                      onClick: closePdf,
                      "aria-label": "Close NextTopper PDF preview",
                      className:
                        "min-h-[44px] rounded-lg bg-slate-100 px-4 text-xs font-black",
                    },
                    "Close",
                  ),
                ),
                React.createElement("iframe", {
                  src: pdf.url,
                  title: pdf.title,
                  className:
                    "min-h-0 w-full flex-1 rounded-xl border border-sky-100",
                }),
              ),
            ),
            document.body,
          ),
      ),
    );
  };
})();
