(() => {
  const { useState, useEffect, useRef } = window.React;
  window.PwCatalogScreen = ({ onNavigate }) => {
    var _a;
    const { SERVER_URL, openExternalLink } = window;
    const seed = (() => {
      try {
        const value = sessionStorage.getItem("pw_catalog_search_seed") || "";
        sessionStorage.removeItem("pw_catalog_search_seed");
        return value.slice(0, 120);
      } catch (_) {
        return "";
      }
    })();
    const restore = (() => {
      try {
        const saved = JSON.parse(
          sessionStorage.getItem("pw_catalog_return_view") || "null",
        );
        sessionStorage.removeItem("pw_catalog_return_view");
        return saved && typeof saved === "object" ? saved : {};
      } catch (_) {
        return {};
      }
    })();
    const startingQuery = seed || String(restore.query || "").slice(0, 120);
    const [query, setQuery] = useState(startingQuery);
    const [debouncedQuery, setDebouncedQuery] = useState(startingQuery);
    const [category, setCategory] = useState(
      seed ? "ALL" : restore.category || "ALL",
    );
    const [page, setPage] = useState(1);
    const [batches, setBatches] = useState([]);
    const [categories, setCategories] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalAvailable, setTotalAvailable] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState(null);
    const [canManage, setCanManage] = useState(false);
    const [showManager, setShowManager] = useState(false);
    const [destination, setDestination] = useState("OTHERS");
    const [customCategory, setCustomCategory] = useState("");
    const [saving, setSaving] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const [homeCategory, setHomeCategory] = useState("OTHERS");
    const [homeFolder, setHomeFolder] = useState("");
    const [homeOptions, setHomeOptions] = useState([]);
    const [homeLinks, setHomeLinks] = useState([]);
    const [folderError, setFolderError] = useState("");
    const loadHomeFolders = async () => {
      try {
        const response = await fetch(base + "/api/admin/pw/home-folders", {
          credentials: "include",
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok || !data.success)
          throw Error(data.error || "Unable to load folders");
        setHomeOptions(data.categories || []);
        setHomeLinks(data.links || []);
        setFolderError("");
      } catch (error2) {
        setFolderError(error2.message || "Unable to load folders");
      }
    };
    const readEnrolled = () => {
      try {
        const saved = JSON.parse(
          localStorage.getItem("akki_pw_enrolled_v1") || "{}",
        );
        return saved && typeof saved === "object" && !Array.isArray(saved)
          ? saved
          : {};
      } catch (_) {
        return {};
      }
    };
    const favorites = window.usePwFavorites();
    const [favoritesOnly, setFavoritesOnly] = useState(false);
    const [enrolledOnly, setEnrolledOnly] = useState(false);
    const [enrolledList, setEnrolledList] = useState(readEnrolled);
    useEffect(() => {
      const update = () => setEnrolledList(readEnrolled());
      window.addEventListener("pw-enrollment-changed", update);
      return () => window.removeEventListener("pw-enrollment-changed", update);
    }, []);
    const requestId = useRef(0);
    const base = SERVER_URL.replace(/\/$/, "");
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedQuery(query.trim());
        setPage(1);
      }, 300);
      return () => clearTimeout(timer);
    }, [query]);
    useEffect(() => {
      const controller = new AbortController();
      const currentId = ++requestId.current;
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        q: debouncedQuery,
        category,
        page: String(page),
        limit: "24",
      });
      fetch(base + "/api/pw/batches?" + params.toString(), {
        signal: controller.signal,
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok || !data.success)
            throw new Error(data.error || "Catalogue is unavailable");
          return data;
        })
        .then((data) => {
          if (requestId.current !== currentId) return;
          setBatches(data.data || []);
          setCategories(data.categories || []);
          setTotal(Number(data.total || 0));
          setTotalAvailable(Number(data.total_available || 0));
        })
        .catch((err) => {
          if (controller.signal.aborted || requestId.current !== currentId)
            return;
          setError(err.message || "Failed to load batches");
          setBatches([]);
        })
        .finally(() => {
          if (!controller.signal.aborted && requestId.current === currentId)
            setLoading(false);
        });
      return () => controller.abort();
    }, [base, debouncedQuery, category, page, reloadKey]);
    useEffect(() => {
      fetch(base + "/api/admin/pw/status", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => setCanManage(!!(data && data.can_manage)))
        .catch(() => {});
    }, [base, reloadKey]);
    const toggleEnrollment = (item) => {
      const updated = readEnrolled();
      if (updated[item.id]) delete updated[item.id];
      else
        updated[item.id] = {
          name: item.name,
          image: item.image || "",
          savedAt: Date.now(),
        };
      try {
        localStorage.setItem("akki_pw_enrolled_v1", JSON.stringify(updated));
      } catch (_) {
        window.alert("Unable to save enrollment on this device.");
        return;
      }
      setEnrolledList({ ...updated });
      window.dispatchEvent(new Event("pw-enrollment-changed"));
    };
    const selectCategory = (cat) => {
      setCategory(cat);
      setPage(1);
    };
    const startMove = (item) => {
      setSelected(item);
      setDestination(item.category);
      setCustomCategory("");
      setShowManager(true);
      setHomeCategory("OTHERS");
      setHomeFolder("");
      loadHomeFolders();
    };
    const saveHomeFolder = async (action = "add", link = null) => {
      if (!selected || saving) return;
      const folder = (
        (link == null ? void 0 : link.folder) || homeFolder
      ).trim();
      if (!folder) return;
      setSaving(true);
      setFolderError("");
      try {
        const response = await fetch(base + "/api/admin/pw/home-folder", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selected.id,
            home_category:
              (link == null ? void 0 : link.home_category) || homeCategory,
            folder,
            action,
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.success)
          throw Error(data.error || "Unable to save folder");
        await loadHomeFolders();
        window.dispatchEvent(new Event("pw-folder-links-changed"));
      } catch (error2) {
        setFolderError(error2.message || "Unable to save folder");
      } finally {
        setSaving(false);
      }
    };
    const saveMove = async () => {
      if (!selected || saving) return;
      const target =
        destination === "CUSTOM"
          ? customCategory.trim().toUpperCase()
          : destination;
      if (!target) return;
      setSaving(true);
      try {
        const response = await fetch(base + "/api/admin/pw/move", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selected.id, category: target }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success)
          throw new Error(data.error || "Unable to move batch");
        setShowManager(false);
        setSelected(null);
        setReloadKey((value) => value + 1);
      } catch (err) {
        window.alert(err.message || "Unable to move batch");
      } finally {
        setSaving(false);
      }
    };
    const listCategories = ["ALL", ...categories.map((entry) => entry.name)];
    const moveOptions = [
      ...new Set([
        "AUTO",
        ...categories.map((c) => c.name),
        "IIT-JEE",
        "NEET",
        "BOARDS",
        "UPSC",
        "BANKING",
        "DEFENCE",
        "GATE",
        "SKILLS",
        "OTHERS",
        "CUSTOM",
      ]),
    ];
    const buttonClass =
      "rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm font-extrabold text-indigo-700 shadow-sm transition hover:bg-indigo-50 active:scale-95";
    return React.createElement(
      "div",
      {
        className:
          "fade-in min-h-screen bg-[#f5f7ff] px-3 py-3 pb-28 sm:px-6 sm:py-5 sm:pb-32",
      },
      React.createElement(
        "div",
        {
          className:
            "relative overflow-hidden rounded-[20px] bg-gradient-to-br from-indigo-950 via-indigo-800 to-violet-700 px-4 py-3 text-white shadow-[0_10px_25px_rgba(42,39,118,.15)] sm:rounded-[28px] sm:px-8 sm:py-6 sm:shadow-[0_16px_38px_rgba(42,39,118,.22)]",
        },
        React.createElement("div", {
          className:
            "pointer-events-none absolute -right-8 -top-12 h-28 w-28 rounded-full border-[18px] border-white/10 motion-safe:animate-pulse sm:-right-12 sm:-top-16 sm:h-52 sm:w-52 sm:border-[36px]",
          "aria-hidden": "true",
        }),
        React.createElement(
          "div",
          { className: "relative flex items-start gap-3" },
          React.createElement(
            "button",
            {
              type: "button",
              onClick: () => window.history.back(),
              "aria-label": "Back to batches",
              className:
                "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 transition hover:bg-white/25 sm:h-10 sm:w-10 sm:rounded-2xl",
            },
            React.createElement("i", { className: "fas fa-arrow-left" }),
          ),
          React.createElement(
            "div",
            { className: "min-w-0 flex-1" },
            React.createElement(
              "div",
              { className: "mb-1 flex flex-wrap items-center gap-2 sm:mb-2" },
              React.createElement(
                "span",
                {
                  className:
                    "rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.15em] text-cyan-100 sm:text-[10px] sm:tracking-[.2em]",
                },
                "PW Library",
              ),
              React.createElement(
                "span",
                {
                  className:
                    "hidden rounded-full bg-cyan-300/15 px-2.5 py-1 text-[10px] font-bold text-cyan-100 sm:inline-flex",
                },
                "Live catalogue",
              ),
            ),
            React.createElement(
              "h1",
              {
                className:
                  "text-[19px] font-black tracking-tight sm:text-[32px]",
              },
              "Explore PW Batches",
            ),
            React.createElement(
              "p",
              {
                className:
                  "mt-1.5 hidden max-w-md text-[12px] font-medium leading-relaxed text-indigo-100 sm:block",
              },
              "All batches currently available from the connected catalogue. Search by name, language or class.",
            ),
          ),
        ),
        React.createElement(
          "div",
          {
            className:
              "relative mt-2 flex flex-wrap items-center gap-2 sm:mt-5",
          },
          React.createElement(
            "button",
            {
              type: "button",
              onClick: () => setEnrolledOnly((value) => !value),
              "aria-pressed": enrolledOnly,
              className: `rounded-2xl border border-white/25 px-3 py-2 text-[12px] font-extrabold transition ${enrolledOnly ? "bg-white text-indigo-800" : "bg-white/15 text-white hover:bg-white/25"}`,
            },
            React.createElement("i", { className: "fas fa-bookmark mr-1.5" }),
            "Enrolled (",
            Object.keys(enrolledList).length,
            ")",
          ),
          React.createElement(
            "button",
            {
              type: "button",
              onClick: () => setFavoritesOnly((value) => !value),
              "aria-pressed": favoritesOnly,
              className: `rounded-2xl border border-white/25 px-3 py-2 text-[12px] font-extrabold ${favoritesOnly ? "bg-white text-indigo-800" : "bg-white/15 text-white"}`,
            },
            React.createElement("i", {
              "aria-hidden": "true",
              className: "fas fa-heart mr-1.5",
            }),
            "Favourites (",
            Object.keys(favorites).length,
            ")",
          ),
          React.createElement(
            "span",
            {
              className:
                "rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-[12px] font-bold",
            },
            React.createElement("i", {
              className: "fas fa-layer-group mr-2 text-cyan-200",
            }),
            totalAvailable.toLocaleString(),
            " batches available",
          ),
          React.createElement(
            "span",
            {
              className:
                "hidden rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-[12px] font-bold sm:inline-flex",
            },
            React.createElement("i", {
              className: "fas fa-filter mr-2 text-cyan-200",
            }),
            total.toLocaleString(),
            " results",
          ),
        ),
      ),
      favoritesOnly &&
        React.createElement(window.PwBatchResults, {
          favoritesOnly: true,
          onNavigate,
        }),
      enrolledOnly &&
        React.createElement(
          "section",
          {
            "aria-label": "Enrolled PW batches",
            className:
              "mt-4 rounded-[22px] border border-sky-100 bg-white p-4 shadow-sm",
          },
          React.createElement(
            "h2",
            { className: "mb-3 text-[16px] font-black text-slate-900" },
            "Your Enrolled Batches",
          ),
          React.createElement(
            "p",
            { className: "mb-4 text-[11px] font-semibold text-slate-500" },
            "Saved on this device. Enrollment does not unlock paid lectures.",
          ),
          React.createElement(
            "div",
            {
              className: "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3",
            },
            Object.entries(enrolledList)
              .filter(([id]) => /^[a-f0-9]{24}$/i.test(id))
              .map(([id, info]) =>
                React.createElement(
                  "button",
                  {
                    type: "button",
                    key: id,
                    "aria-label": `Open enrolled ${(info == null ? void 0 : info.name) || "PW Batch"}`,
                    onClick: () =>
                      onNavigate("pw_subjects", {
                        batch: id,
                        subject: null,
                        chapter: null,
                      }),
                    className:
                      "flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-left text-[12px] font-extrabold text-slate-800 hover:border-sky-300",
                  },
                  React.createElement("i", {
                    className: "fas fa-bookmark text-sky-600",
                  }),
                  React.createElement(
                    "span",
                    { className: "min-w-0 flex-1 truncate" },
                    (info == null ? void 0 : info.name) || "PW Batch",
                  ),
                  React.createElement("i", {
                    className: "fas fa-arrow-right text-sky-500",
                  }),
                ),
              ),
          ),
          !Object.keys(enrolledList).length &&
            React.createElement(
              "p",
              { className: "text-[12px] text-slate-500" },
              "Tap Enroll on a batch card below to save it here.",
            ),
        ),
      React.createElement(
        "div",
        {
          className:
            "sticky top-16 z-20 mt-5 rounded-[24px] border border-white bg-white/95 p-3 shadow-sm backdrop-blur-md",
        },
        React.createElement(
          "div",
          { className: "relative" },
          React.createElement("i", {
            className:
              "fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400",
          }),
          React.createElement("input", {
            "aria-label": "Search PW batches",
            type: "search",
            value: query,
            onChange: (e) => setQuery(e.target.value),
            placeholder: "Search every PW batch...",
            className:
              "h-12 w-full rounded-[16px] border border-indigo-100 bg-indigo-50/50 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100",
          }),
        ),
        React.createElement(
          "div",
          {
            className: "mt-3 flex gap-2 overflow-x-auto pb-1",
            "aria-label": "PW batch categories",
          },
          listCategories.map((cat) => {
            var _a2;
            return React.createElement(
              "button",
              {
                key: cat,
                type: "button",
                onClick: () => selectCategory(cat),
                "aria-pressed": category === cat,
                className: `shrink-0 rounded-full px-3.5 py-2 text-[11px] font-extrabold transition ${category === cat ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`,
              },
              cat === "ALL" ? "All Batches" : cat,
              cat !== "ALL" &&
                React.createElement(
                  "span",
                  { className: "ml-1 opacity-70" },
                  ((_a2 = categories.find((c) => c.name === cat)) == null
                    ? void 0
                    : _a2.count) || 0,
                ),
            );
          }),
        ),
      ),
      React.createElement(
        "div",
        { className: "mt-5 flex items-center justify-between gap-2" },
        React.createElement(
          "div",
          null,
          React.createElement(
            "h2",
            { className: "text-lg font-black text-slate-800" },
            category === "ALL" ? "All courses" : category,
          ),
          React.createElement(
            "p",
            { className: "text-[11px] font-semibold text-slate-500" },
            loading
              ? "Loading catalogue\u2026"
              : `Showing ${batches.length} of ${total.toLocaleString()} matching batches`,
          ),
        ),
        canManage &&
          React.createElement(
            "span",
            {
              className:
                "rounded-xl bg-indigo-100 px-3 py-2 text-[11px] font-black text-indigo-700",
            },
            React.createElement("i", { className: "fas fa-lock mr-1" }),
            "Admin mode",
          ),
      ),
      error &&
        React.createElement(
          "div",
          {
            role: "alert",
            className:
              "mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700",
          },
          error,
          React.createElement(
            "button",
            {
              type: "button",
              onClick: () => setReloadKey((n) => n + 1),
              className: "ml-3 underline",
            },
            "Retry",
          ),
        ),
      React.createElement(
        "div",
        {
          className:
            "mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        },
        loading && batches.length === 0
          ? Array.from({ length: 8 }, (_, i) =>
              React.createElement("div", {
                key: i,
                className:
                  "h-[260px] animate-pulse rounded-[24px] bg-white shadow-sm",
              }),
            )
          : batches.map((item) =>
              React.createElement(
                "article",
                {
                  key: item.id,
                  className:
                    "group relative overflow-hidden rounded-[24px] border border-white bg-white p-2.5 shadow-[0_8px_24px_rgba(60,67,121,.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(60,67,121,.14)]",
                },
                React.createElement(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      try {
                        sessionStorage.setItem(
                          "pw_catalog_return_view",
                          JSON.stringify({ query, category }),
                        );
                      } catch (_) {}
                      onNavigate("pw_subjects", {
                        batch: item.id,
                        subject: null,
                        chapter: null,
                      });
                    },
                    onPointerDown: () => window.prefetchPwSubjects(item.id),
                    onMouseEnter: () => window.prefetchPwSubjects(item.id),
                    onFocus: () => window.prefetchPwSubjects(item.id),
                    "aria-label": `Open ${item.name} batch`,
                    className: "block w-full text-left",
                  },
                  React.createElement(
                    "div",
                    {
                      className:
                        "relative aspect-[16/9] overflow-hidden rounded-[18px] bg-gradient-to-br from-indigo-100 to-violet-100",
                    },
                    item.image
                      ? React.createElement("img", {
                          src: item.image,
                          alt: item.name,
                          loading: "lazy",
                          decoding: "async",
                          className:
                            "h-full w-full object-cover transition duration-300 group-hover:scale-[1.035]",
                          onError: (e) =>
                            (e.currentTarget.style.display = "none"),
                        })
                      : React.createElement(
                          "div",
                          {
                            className:
                              "flex h-full items-center justify-center text-4xl text-indigo-400",
                          },
                          React.createElement("i", {
                            className: "fas fa-graduation-cap",
                          }),
                        ),
                    React.createElement(
                      "span",
                      {
                        className:
                          "absolute bottom-2 left-2 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] font-black text-white",
                      },
                      item.category,
                    ),
                  ),
                  React.createElement(
                    "div",
                    { className: "px-2 pb-1 pt-3" },
                    React.createElement(
                      "h3",
                      {
                        className:
                          "line-clamp-2 min-h-[40px] text-[14px] font-black leading-snug text-slate-800",
                      },
                      item.name,
                    ),
                    React.createElement(
                      "div",
                      {
                        className:
                          "mt-2 flex items-center gap-2 text-[11px] font-semibold text-slate-500",
                      },
                      React.createElement("i", {
                        className: "fas fa-language text-indigo-400",
                      }),
                      item.language || "Language not listed",
                    ),
                    React.createElement(
                      "div",
                      {
                        className:
                          "mt-3 flex items-center justify-between gap-1 border-t border-slate-100 pt-2 text-[11px] font-extrabold text-indigo-600",
                      },
                      React.createElement(
                        "span",
                        null,
                        item.class ? `Class ${item.class}` : "PW Batch",
                      ),
                      React.createElement(
                        "span",
                        null,
                        "View Subjects ",
                        React.createElement("i", {
                          className: "fas fa-chevron-right ml-1",
                        }),
                      ),
                    ),
                  ),
                ),
                React.createElement(
                  "button",
                  {
                    type: "button",
                    "aria-label": `${favorites[item.id] ? "Unsave" : "Save"} PW batch ${item.name}`,
                    "aria-pressed": !!favorites[item.id],
                    onClick: () => window.togglePwFavorite(item),
                    className: `absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full shadow-sm backdrop-blur-md ${favorites[item.id] ? "bg-white text-pink-500" : "bg-slate-900/60 text-white hover:bg-slate-900/80"}`,
                  },
                  React.createElement("i", {
                    "aria-hidden": "true",
                    className: `${favorites[item.id] ? "fas" : "far"} fa-heart`,
                  }),
                ),
                React.createElement(
                  "div",
                  {
                    className:
                      "mx-2 mb-1 mt-2 flex flex-wrap gap-2 border-t border-slate-100 pt-3",
                  },
                  React.createElement(
                    "button",
                    {
                      type: "button",
                      onClick: () => toggleEnrollment(item),
                      "aria-label": enrolledList[item.id]
                        ? `Remove ${item.name} from enrolled batches`
                        : `Enroll in ${item.name} batch`,
                      "aria-pressed": !!enrolledList[item.id],
                      className: `min-h-[44px] flex-1 rounded-xl px-3 py-2.5 text-[11px] font-black transition active:scale-[.98] ${enrolledList[item.id] ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "bg-sky-600 text-white hover:bg-sky-700"}`,
                    },
                    React.createElement("i", {
                      className: `fas ${enrolledList[item.id] ? "fa-check-circle" : "fa-bookmark"} mr-1.5`,
                    }),
                    enrolledList[item.id]
                      ? "Enrolled \u2713"
                      : "Enroll for Free",
                  ),
                  canManage &&
                    React.createElement(
                      "button",
                      {
                        type: "button",
                        onClick: () => startMove(item),
                        className:
                          "min-h-[44px] flex-1 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2.5 text-[11px] font-black text-indigo-700",
                      },
                      React.createElement("i", {
                        className: "fas fa-folder-plus mr-1.5",
                      }),
                      "Manage folders",
                    ),
                ),
              ),
            ),
      ),
      !loading &&
        !error &&
        batches.length === 0 &&
        React.createElement(
          "div",
          {
            className:
              "mt-5 rounded-[24px] border border-dashed border-indigo-200 bg-white p-10 text-center",
          },
          React.createElement("i", {
            className: "fas fa-search mb-3 text-3xl text-indigo-300",
          }),
          React.createElement(
            "p",
            { className: "font-bold text-slate-600" },
            "No batches match. Try a different search.",
          ),
        ),
      !error &&
        total > 24 &&
        React.createElement(
          "div",
          { className: "mt-7 flex items-center justify-center gap-4" },
          React.createElement(
            "button",
            {
              type: "button",
              disabled: page <= 1 || loading,
              onClick: () => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              },
              className: buttonClass + " disabled:opacity-40",
            },
            "Previous",
          ),
          React.createElement(
            "span",
            { className: "text-xs font-black text-slate-600" },
            "Page ",
            page,
            " / ",
            Math.max(1, Math.ceil(total / 24)),
          ),
          React.createElement(
            "button",
            {
              type: "button",
              disabled: page * 24 >= total || loading,
              onClick: () => {
                setPage((p) => p + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              },
              className: buttonClass + " disabled:opacity-40",
            },
            "Next",
          ),
        ),
      selected &&
        React.createElement(
          "div",
          {
            className:
              "fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm",
            onClick: () => {
              setSelected(null);
              setShowManager(false);
            },
          },
          React.createElement(
            "div",
            {
              role: "dialog",
              "aria-modal": "true",
              "aria-label": showManager ? "Move batch" : "Batch details",
              onClick: (e) => e.stopPropagation(),
              className:
                "max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[27px] bg-white p-5 shadow-2xl",
            },
            React.createElement(
              "div",
              { className: "flex items-start justify-between gap-3" },
              React.createElement(
                "div",
                { className: "min-w-0" },
                React.createElement(
                  "span",
                  {
                    className:
                      "text-[10px] font-black uppercase tracking-[.18em] text-indigo-500",
                  },
                  "PW Batch",
                ),
                React.createElement(
                  "h2",
                  { className: "mt-1 text-lg font-black text-slate-800" },
                  selected.name,
                ),
              ),
              React.createElement(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setSelected(null);
                    setShowManager(false);
                  },
                  "aria-label": "Close details",
                  className:
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600",
                },
                React.createElement("i", { className: "fas fa-times" }),
              ),
            ),
            showManager
              ? React.createElement(
                  "div",
                  { className: "mt-5 space-y-3" },
                  React.createElement(
                    "label",
                    {
                      htmlFor: "pw-category-select",
                      className: "block text-sm font-bold text-slate-700",
                    },
                    "PW catalogue category",
                  ),
                  React.createElement(
                    "select",
                    {
                      id: "pw-category-select",
                      value: destination,
                      onChange: (e) => setDestination(e.target.value),
                      className:
                        "w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold",
                    },
                    moveOptions.map((x) =>
                      React.createElement(
                        "option",
                        { key: x, value: x },
                        x === "AUTO"
                          ? "Automatic category"
                          : x === "CUSTOM"
                            ? "+ New custom category"
                            : x,
                      ),
                    ),
                  ),
                  destination === "CUSTOM" &&
                    React.createElement("input", {
                      "aria-label": "New category name",
                      maxLength: 36,
                      value: customCategory,
                      onChange: (e) => setCustomCategory(e.target.value),
                      placeholder: "Example: FOUNDATION",
                      className:
                        "w-full rounded-2xl border border-slate-200 p-3 text-sm font-bold uppercase",
                    }),
                  React.createElement(
                    "button",
                    {
                      type: "button",
                      disabled:
                        saving ||
                        (destination === "CUSTOM" && !customCategory.trim()),
                      onClick: saveMove,
                      className:
                        "w-full rounded-2xl bg-indigo-600 px-4 py-3.5 text-sm font-black text-white disabled:opacity-50",
                    },
                    saving ? "Saving\u2026" : "Save category",
                  ),
                  React.createElement(
                    "div",
                    { className: "border-t border-slate-100 pt-4" },
                    React.createElement(
                      "h3",
                      { className: "text-sm font-black text-slate-800" },
                      "Also add to a home folder",
                    ),
                    React.createElement(
                      "p",
                      { className: "mt-1 text-[11px] text-slate-500" },
                      "The batch stays in PW Batches. Both locations open the same PW subjects.",
                    ),
                    folderError &&
                      React.createElement(
                        "p",
                        {
                          role: "alert",
                          className: "mt-2 text-xs text-rose-600",
                        },
                        folderError,
                      ),
                    React.createElement(
                      "label",
                      {
                        className: "mt-3 block text-xs font-bold",
                        htmlFor: "pw-home-category",
                      },
                      "Home category",
                    ),
                    React.createElement(
                      "select",
                      {
                        id: "pw-home-category",
                        value: homeCategory,
                        onChange: (e) => {
                          setHomeCategory(e.target.value);
                          setHomeFolder("");
                        },
                        className:
                          "mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm",
                      },
                      ["OTHERS", "IIT-JEE", "NEET", "BOARDS", "KGS"].map(
                        (cat) =>
                          React.createElement(
                            "option",
                            { key: cat, value: cat },
                            cat,
                          ),
                      ),
                    ),
                    React.createElement(
                      "label",
                      {
                        className: "mt-3 block text-xs font-bold",
                        htmlFor: "pw-home-folder",
                      },
                      "Folder name \u2014 existing or new",
                    ),
                    React.createElement("input", {
                      id: "pw-home-folder",
                      "aria-label": "Home folder name",
                      list: "pw-home-folder-options",
                      maxLength: 80,
                      value: homeFolder,
                      onChange: (e) => setHomeFolder(e.target.value),
                      placeholder: "Example: CLASS 11",
                      className:
                        "mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm",
                    }),
                    React.createElement(
                      "datalist",
                      { id: "pw-home-folder-options" },
                      (
                        ((_a = homeOptions.find(
                          (x) => x.name === homeCategory,
                        )) == null
                          ? void 0
                          : _a.folders) || []
                      ).map((folder) =>
                        React.createElement("option", {
                          key: folder,
                          value: folder,
                        }),
                      ),
                    ),
                    React.createElement(
                      "button",
                      {
                        type: "button",
                        disabled: saving || !homeFolder.trim(),
                        onClick: () => saveHomeFolder(),
                        className:
                          "mt-3 w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-black text-white disabled:opacity-50",
                      },
                      saving ? "Saving\u2026" : "Add to home folder",
                    ),
                    homeLinks
                      .filter((link) => {
                        var _a2;
                        return (
                          ((_a2 = link.batch) == null ? void 0 : _a2.id) ===
                          selected.id
                        );
                      })
                      .map((link) =>
                        React.createElement(
                          "div",
                          {
                            key: link.home_category + link.folder,
                            className:
                              "mt-2 flex items-center justify-between gap-2 rounded-xl bg-sky-50 p-3 text-xs",
                          },
                          React.createElement(
                            "span",
                            { className: "min-w-0 break-words" },
                            link.home_category,
                            " / ",
                            link.folder,
                          ),
                          React.createElement(
                            "button",
                            {
                              type: "button",
                              disabled: saving,
                              "aria-label": `Remove from ${link.folder}`,
                              className: "shrink-0 font-bold text-rose-600",
                              onClick: () => saveHomeFolder("remove", link),
                            },
                            "Remove",
                          ),
                        ),
                      ),
                  ),
                )
              : React.createElement(
                  "div",
                  { className: "mt-4 space-y-3 text-sm text-slate-600" },
                  selected.image &&
                    React.createElement("img", {
                      src: selected.image,
                      alt: selected.name,
                      className: "aspect-video w-full rounded-2xl object-cover",
                    }),
                  React.createElement(
                    "div",
                    { className: "flex flex-wrap gap-2" },
                    [
                      selected.category,
                      selected.language,
                      selected.class ? `Class ${selected.class}` : null,
                      selected.status,
                    ]
                      .filter(Boolean)
                      .map((x) =>
                        React.createElement(
                          "span",
                          {
                            key: x,
                            className:
                              "rounded-full bg-indigo-50 px-3 py-1.5 text-[11px] font-extrabold text-indigo-700",
                          },
                          x,
                        ),
                      ),
                  ),
                  React.createElement(
                    "p",
                    {
                      className:
                        "rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800",
                    },
                    "This source currently provides the batch catalogue only. Subject, lecture and playback links are not verified; no private content is automatically unlocked.",
                  ),
                  canManage &&
                    React.createElement(
                      "button",
                      {
                        type: "button",
                        onClick: () => setShowManager(true),
                        className:
                          "w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-black text-white",
                      },
                      "Move batch to another category",
                    ),
                ),
          ),
        ),
    );
  };
  window.PwBatchScreen = ({ batchId, onNavigate }) => {
    const { SERVER_URL } = window;
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const base = SERVER_URL.replace(/\/$/, "");
    useEffect(() => {
      const controller = new AbortController();
      setDetails(null);
      setError("");
      setLoading(true);
      fetch(base + "/api/pw/batches/" + encodeURIComponent(batchId || ""), {
        signal: controller.signal,
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok || !data.success)
            throw new Error(data.error || "Batch is unavailable");
          return data;
        })
        .then((data) => {
          if (!controller.signal.aborted) setDetails(data);
        })
        .catch((err) => {
          if (!controller.signal.aborted)
            setError(err.message || "Could not load this batch");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
      return () => controller.abort();
    }, [batchId, base]);
    const item = details && details.data;
    return React.createElement(
      "div",
      {
        className: "fade-in min-h-screen bg-[#f5f7ff] px-4 pb-32 pt-5 sm:px-6",
      },
      React.createElement(
        "div",
        { className: "mb-5 flex items-center gap-3" },
        React.createElement(
          "button",
          {
            type: "button",
            onClick: () => window.history.back(),
            "aria-label": "Back to PW Batches",
            className:
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100 active:scale-95",
          },
          React.createElement("i", { className: "fas fa-arrow-left" }),
        ),
        React.createElement(
          "div",
          { className: "min-w-0" },
          React.createElement(
            "p",
            {
              className:
                "text-[10px] font-black uppercase tracking-[.15em] text-indigo-500",
            },
            "PW Library / Course",
          ),
          React.createElement(
            "h1",
            { className: "truncate text-[19px] font-black text-slate-800" },
            "Batch Overview",
          ),
        ),
      ),
      loading
        ? React.createElement(
            "div",
            { className: "animate-pulse space-y-4" },
            React.createElement("div", {
              className:
                "aspect-video w-full rounded-[26px] bg-indigo-100 sm:max-w-3xl",
            }),
            React.createElement("div", {
              className: "h-9 w-2/3 rounded-xl bg-white",
            }),
            React.createElement("div", {
              className: "h-28 rounded-[24px] bg-white",
            }),
          )
        : error
          ? React.createElement(
              "div",
              {
                role: "alert",
                className:
                  "rounded-[24px] border border-rose-200 bg-white p-6 text-center",
              },
              React.createElement("i", {
                className:
                  "fas fa-exclamation-triangle mb-2 text-2xl text-rose-500",
              }),
              React.createElement(
                "p",
                { className: "font-black text-slate-800" },
                "Couldn't open this batch",
              ),
              React.createElement(
                "p",
                { className: "mt-2 text-sm text-slate-500" },
                error,
              ),
              React.createElement(
                "button",
                {
                  type: "button",
                  onClick: () => window.history.back(),
                  className:
                    "mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white",
                },
                "Back to all batches",
              ),
            )
          : item
            ? React.createElement(
                "div",
                { className: "mx-auto max-w-4xl space-y-5" },
                React.createElement(
                  "div",
                  {
                    className:
                      "overflow-hidden rounded-[28px] border border-white bg-white p-3 shadow-[0_15px_45px_rgba(67,63,130,.10)] sm:p-5",
                  },
                  React.createElement(
                    "div",
                    {
                      className:
                        "relative aspect-video overflow-hidden rounded-[20px] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-400",
                    },
                    item.image
                      ? React.createElement("img", {
                          src: item.image,
                          alt: item.name,
                          loading: "eager",
                          className: "h-full w-full object-contain",
                          onError: (e) => {
                            e.currentTarget.style.display = "none";
                          },
                        })
                      : React.createElement(
                          "div",
                          {
                            className:
                              "flex h-full items-center justify-center text-6xl text-white/90",
                          },
                          React.createElement("i", {
                            className: "fas fa-graduation-cap",
                          }),
                        ),
                  ),
                  React.createElement(
                    "div",
                    { className: "px-2 pb-2 pt-5 sm:px-3" },
                    React.createElement(
                      "span",
                      {
                        className:
                          "rounded-full bg-indigo-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-700",
                      },
                      item.category || "PW",
                    ),
                    React.createElement(
                      "h2",
                      {
                        className:
                          "mt-3 text-[23px] font-black leading-tight text-slate-800 sm:text-[29px]",
                      },
                      item.name,
                    ),
                    React.createElement(
                      "div",
                      { className: "mt-4 flex flex-wrap gap-2" },
                      [
                        item.language,
                        item.class ? `Class ${item.class}` : null,
                        item.status,
                      ]
                        .filter(Boolean)
                        .map((label, i) =>
                          React.createElement(
                            "span",
                            {
                              key: i,
                              className:
                                "rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-extrabold text-slate-600",
                            },
                            label,
                          ),
                        ),
                    ),
                  ),
                ),
                details.has_local_content && details.local_batch
                  ? React.createElement(
                      "div",
                      {
                        className:
                          "rounded-[24px] border border-emerald-100 bg-white p-5 shadow-sm",
                      },
                      React.createElement(
                        "div",
                        { className: "mb-2 flex items-center gap-3" },
                        React.createElement(
                          "span",
                          {
                            className:
                              "flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600",
                          },
                          React.createElement("i", {
                            className: "fas fa-book-open",
                          }),
                        ),
                        React.createElement(
                          "div",
                          null,
                          React.createElement(
                            "h3",
                            { className: "font-black text-slate-800" },
                            "Study materials available",
                          ),
                          React.createElement(
                            "p",
                            {
                              className:
                                "text-[11px] font-semibold text-slate-500",
                            },
                            "Found in your Study X Pro course library",
                          ),
                        ),
                      ),
                      React.createElement(
                        "button",
                        {
                          type: "button",
                          onClick: () =>
                            onNavigate("subjects", {
                              batch: details.local_batch,
                              subject: null,
                              chapter: null,
                            }),
                          className:
                            "mt-4 flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-indigo-100 active:scale-95",
                        },
                        React.createElement(
                          "span",
                          null,
                          React.createElement("i", {
                            className: "fas fa-folder-open mr-2",
                          }),
                          "Open available subjects",
                        ),
                        React.createElement("i", {
                          className: "fas fa-arrow-right",
                        }),
                      ),
                      React.createElement(
                        "p",
                        {
                          className:
                            "mt-3 text-[11px] leading-relaxed text-slate-500",
                        },
                        "Existing premium restrictions and video access checks remain in effect.",
                      ),
                    )
                  : React.createElement(
                      "div",
                      {
                        className:
                          "rounded-[24px] border border-amber-100 bg-white p-5 shadow-sm",
                      },
                      React.createElement(
                        "div",
                        { className: "mb-3 flex items-center gap-3" },
                        React.createElement(
                          "span",
                          {
                            className:
                              "flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-xl text-amber-600",
                          },
                          React.createElement("i", {
                            className: "fas fa-folder-minus",
                          }),
                        ),
                        React.createElement(
                          "div",
                          null,
                          React.createElement(
                            "h3",
                            {
                              className: "text-base font-black text-slate-800",
                            },
                            "Lectures not connected yet",
                          ),
                          React.createElement(
                            "p",
                            {
                              className:
                                "mt-0.5 text-xs font-semibold text-slate-500",
                            },
                            "Batch information is available, but subjects are not",
                          ),
                        ),
                      ),
                      React.createElement(
                        "p",
                        {
                          className:
                            "text-[12px] leading-relaxed text-slate-600",
                        },
                        "The connected PW API currently provides batch names and thumbnails, not an accessible subjects/chapters list. Once authorized course content is connected, you can open lessons here.",
                      ),
                      React.createElement(
                        "button",
                        {
                          type: "button",
                          onClick: () => window.history.back(),
                          className:
                            "mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-3 text-xs font-extrabold text-indigo-700",
                        },
                        "Browse other batches",
                      ),
                    ),
              )
            : null,
    );
  };
  window.PwVideoScreen = ({ initialVideoId }) => {
    const { SERVER_URL } = window;
    const [inputId, setInputId] = useState(initialVideoId || "");
    const [videoId, setVideoId] = useState(
      /^[a-f0-9]{24}$/i.test(initialVideoId || "") ? initialVideoId : "",
    );
    const [video, setVideo] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [playError, setPlayError] = useState("");
    const sampleVideoId = "68556c4a808e6d2141082b79";
    const base = SERVER_URL.replace(/\/$/, "");
    useEffect(() => {
      if (!videoId) return;
      const abort = new AbortController();
      setBusy(true);
      setError("");
      setPlayError("");
      setVideo(null);
      fetch(base + "/api/pw/videos/" + encodeURIComponent(videoId), {
        signal: abort.signal,
      })
        .then(async (response) => {
          const body = await response.json().catch(() => ({}));
          if (!response.ok || !body.success)
            throw new Error(body.error || "Video could not be found");
          return body.data;
        })
        .then((info) => {
          if (!abort.signal.aborted) setVideo(info);
        })
        .catch((err) => {
          if (!abort.signal.aborted)
            setError(err.message || "Unable to open video");
        })
        .finally(() => {
          if (!abort.signal.aborted) setBusy(false);
        });
      return () => abort.abort();
    }, [videoId, base]);
    const openVideo = (id) => {
      const normalized = String(id || "")
        .trim()
        .toLowerCase();
      if (!/^[a-f0-9]{24}$/.test(normalized)) {
        setError("Enter a valid 24-character video ID.");
        setVideo(null);
        return;
      }
      setInputId(normalized);
      setError("");
      setPlayError("");
      setVideoId(normalized);
    };
    return React.createElement(
      "div",
      {
        className: "fade-in min-h-screen bg-[#f5f7ff] px-4 pb-32 pt-5 sm:px-6",
      },
      React.createElement(
        "div",
        { className: "mx-auto max-w-4xl" },
        React.createElement(
          "div",
          { className: "mb-5 flex items-center gap-3" },
          React.createElement(
            "button",
            {
              type: "button",
              onClick: () => window.history.back(),
              "aria-label": "Back from PW video",
              className:
                "flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100",
            },
            React.createElement("i", { className: "fas fa-arrow-left" }),
          ),
          React.createElement(
            "div",
            null,
            React.createElement(
              "p",
              {
                className:
                  "text-[10px] font-black uppercase tracking-[.15em] text-indigo-500",
              },
              "PW Library",
            ),
            React.createElement(
              "h1",
              { className: "text-[20px] font-black text-slate-800" },
              "Lecture Player",
            ),
          ),
        ),
        React.createElement(
          "div",
          {
            className:
              "rounded-[26px] border border-indigo-100 bg-white p-4 shadow-sm sm:p-6",
          },
          React.createElement(
            "label",
            {
              htmlFor: "pw-lecture-id",
              className: "block text-sm font-extrabold text-slate-800",
            },
            "Video ID",
          ),
          React.createElement(
            "p",
            { className: "mt-1.5 text-[12px] text-slate-500" },
            "Enter the lecture's own ID, not its batch ID.",
          ),
          React.createElement(
            "form",
            {
              className: "mt-4 flex flex-col gap-2 sm:flex-row",
              onSubmit: (e) => {
                e.preventDefault();
                openVideo(inputId);
              },
            },
            React.createElement("input", {
              id: "pw-lecture-id",
              "aria-label": "PW video ID",
              value: inputId,
              onChange: (e) => setInputId(e.target.value.trim()),
              placeholder: "24-character lecture ID",
              maxLength: 24,
              autoComplete: "off",
              className:
                "min-w-0 flex-1 rounded-2xl border border-indigo-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500",
            }),
            React.createElement(
              "button",
              {
                type: "submit",
                disabled: busy,
                className:
                  "rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black text-white disabled:opacity-50",
              },
              React.createElement("i", { className: "fas fa-play mr-2" }),
              busy ? "Loading\u2026" : "Open Video",
            ),
          ),
          React.createElement(
            "button",
            {
              type: "button",
              onClick: () => openVideo(sampleVideoId),
              className:
                "mt-3 text-[11px] font-bold text-indigo-600 underline underline-offset-2",
            },
            "Try the lecture ID you shared",
          ),
        ),
        busy &&
          React.createElement(
            "div",
            {
              role: "status",
              className:
                "mt-5 animate-pulse rounded-[24px] bg-white p-6 text-sm font-bold text-slate-500",
            },
            "Loading lecture details\u2026",
          ),
        error &&
          React.createElement(
            "div",
            {
              role: "alert",
              className:
                "mt-5 rounded-[20px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700",
            },
            error,
          ),
        video &&
          !busy &&
          React.createElement(
            "div",
            {
              className:
                "mt-5 overflow-hidden rounded-[26px] border border-white bg-white p-3 shadow-[0_15px_40px_rgba(60,67,121,.10)] sm:p-5",
            },
            React.createElement(
              "div",
              { className: "overflow-hidden rounded-[20px] bg-slate-950" },
              video.playable && video.videoUrl
                ? React.createElement(
                    "div",
                    {
                      className:
                        "relative flex aspect-video w-full flex-col items-center justify-center gap-4 overflow-hidden bg-slate-950 text-white",
                    },
                    video.image &&
                      React.createElement("img", {
                        src: video.image,
                        alt: video.name,
                        className:
                          "absolute inset-0 h-full w-full object-contain opacity-60",
                      }),
                    React.createElement(
                      "button",
                      {
                        type: "button",
                        "aria-label": "Open in Study X Pro Player",
                        onClick: () =>
                          window.location.assign(
                            base + "/pw/watch/" + encodeURIComponent(video.id),
                          ),
                        className:
                          "relative z-10 flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg hover:bg-indigo-500",
                      },
                      React.createElement("i", { className: "fas fa-play" }),
                      "Open in Study X Pro Player",
                    ),
                    React.createElement(
                      "span",
                      {
                        className:
                          "relative z-10 text-[11px] font-semibold text-white/70",
                      },
                      "Existing Akki Study X stream template \xB7 Speed & source quality",
                    ),
                  )
                : React.createElement(
                    "div",
                    {
                      className:
                        "flex aspect-video items-center justify-center p-8 text-center text-sm font-semibold text-white/75",
                    },
                    video.drmProtected
                      ? "This lecture uses DRM and needs its authorized player."
                      : "No playable video URL is available for this lecture.",
                  ),
            ),
            playError &&
              React.createElement(
                "div",
                {
                  role: "alert",
                  className:
                    "mt-3 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800",
                },
                playError,
              ),
            React.createElement(
              "div",
              { className: "px-1 pb-2 pt-5" },
              React.createElement(
                "span",
                {
                  className:
                    "text-[10px] font-black uppercase tracking-widest text-indigo-500",
                },
                "PW Lecture",
              ),
              React.createElement(
                "h2",
                {
                  className:
                    "mt-2 text-xl font-black leading-snug text-slate-800",
                },
                video.name,
              ),
              React.createElement(
                "div",
                { className: "mt-4 flex flex-wrap gap-2" },
                [
                  video.duration ? `Duration: ${video.duration}` : "",
                  video.status,
                  ...(video.types || []),
                ]
                  .filter(Boolean)
                  .map((tag, i) =>
                    React.createElement(
                      "span",
                      {
                        key: i,
                        className:
                          "rounded-full bg-indigo-50 px-3 py-2 text-[11px] font-extrabold text-indigo-700",
                      },
                      tag,
                    ),
                  ),
              ),
              React.createElement(
                "p",
                { className: "mt-4 text-xs leading-relaxed text-slate-500" },
                "This is a single video-ID lookup. Batch subjects, chapters and other lecture IDs must be supplied separately. Only videos you are authorized to watch can play.",
              ),
            ),
          ),
      ),
    );
  };
})();
