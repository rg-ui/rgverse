(() => {
  const { useState, useEffect, useRef } = window.React;
  const pwBase = () =>
    String(window.SERVER_URL || window.location.origin).replace(/\/$/, "");
  const pwEndpoint = (batch, subject, chapter) => {
    let path =
      "/api/studyxpw/batches/" + encodeURIComponent(batch) + "/subjects";
    if (subject) path += "/" + encodeURIComponent(subject) + "/chapters";
    if (chapter) path += "/" + encodeURIComponent(chapter) + "/contents";
    return pwBase() + path;
  };
  const pwCss = {
    page: "fade-in min-h-screen bg-white px-3 pb-28 pt-3 sm:px-6 sm:pb-32 sm:pt-6",
    max: "mx-auto max-w-6xl",
    card: "group flex w-full min-w-0 items-center gap-2.5 rounded-[17px] border border-sky-100 bg-white p-3 text-left sm:gap-3.5 sm:rounded-[20px] sm:p-4 shadow-[0_2px_8px_rgba(8,96,143,.06)] transition hover:-translate-y-[2px] hover:border-sky-300 hover:shadow-[0_10px_30px_rgba(8,96,143,.12)] active:scale-[.99]",
    input:
      "w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-[13px] font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100",
  };
  const PwBreadcrumb = ({ current, backLabel = "Back", onBack }) =>
    React.createElement(
      "div",
      {
        className:
          "mb-4 flex flex-wrap items-center gap-2 text-[11px] sm:mb-6 sm:text-[12px] font-semibold text-slate-500",
      },
      React.createElement(
        "button",
        {
          type: "button",
          onClick: onBack || (() => window.history.back()),
          "aria-label": "Back in PW courses",
          className:
            "inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sky-700 hover:bg-sky-50",
        },
        React.createElement("i", {
          className: "fas fa-chevron-left text-[10px]",
        }),
        backLabel,
      ),
      React.createElement("i", {
        className: "fas fa-chevron-right text-[9px] text-slate-300",
      }),
      React.createElement(
        "span",
        { className: "max-w-full truncate font-extrabold text-slate-900" },
        current,
      ),
    );
  const PwFetch = (url) => {
    const initial = window.PwCourseData.read(url);
    const [state, setState] = useState({
      url,
      data: initial ?? null,
      loading: initial === void 0,
      error: "",
    });
    useEffect(() => {
      let active = true;
      const cached = window.PwCourseData.read(url);
      setState({
        url,
        data: cached ?? null,
        loading: cached === void 0,
        error: "",
      });
      window.PwCourseData.load(url)
        .then((data) => {
          if (active) setState({ url, data, loading: false, error: "" });
        })
        .catch((error) => {
          if (active)
            setState({
              url,
              data: null,
              loading: false,
              error: error.message || "Unable to load",
            });
        });
      return () => {
        active = false;
      };
    }, [url]);
    return state.url === url
      ? state
      : { data: initial ?? null, loading: initial === void 0, error: "" };
  };
  const PwStatus = ({ loading, error, empty, label }) => {
    if (loading)
      return React.createElement(
        "div",
        {
          role: "status",
          className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
        },
        [0, 1, 2, 3, 4, 5].map((i) =>
          React.createElement("div", {
            key: i,
            className: "h-[94px] animate-pulse rounded-[20px] bg-sky-50",
          }),
        ),
      );
    if (error)
      return React.createElement(
        "div",
        {
          role: "alert",
          className:
            "rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-800",
        },
        React.createElement("i", {
          className: "fas fa-exclamation-triangle mr-2",
        }),
        " ",
        error,
        React.createElement(
          "p",
          { className: "mt-2 text-xs font-medium" },
          "Some content may require an authorized upstream session. Please retry later.",
        ),
      );
    if (empty)
      return React.createElement(
        "div",
        {
          className:
            "rounded-2xl border border-dashed border-sky-200 bg-sky-50 p-10 text-center text-[13px] font-semibold text-slate-500",
        },
        "No ",
        label.toLowerCase(),
        " available for this selection.",
      );
    return null;
  };
  window.PwSubjectsScreen = ({ batchId, onNavigate }) => {
    const { data, loading, error } = PwFetch(pwEndpoint(batchId));
    const [query, setQuery] = useState("");
    const subjects = Array.isArray(data == null ? void 0 : data.subjects)
      ? data.subjects
      : [];
    const visible = subjects.filter(
      (x) =>
        x.name.toLowerCase().includes(query.toLowerCase()) ||
        (x.teacher || "").toLowerCase().includes(query.toLowerCase()),
    );
    return React.createElement(
      "main",
      {
        className:
          "fade-in min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50/50 px-3 pt-4 pb-28 sm:px-6 sm:pt-6 sm:pb-32",
      },
      React.createElement(
        "div",
        { className: pwCss.max },
        React.createElement(
          "div",
          {
            className:
              "mb-5 flex min-w-0 items-center gap-3 rounded-[24px] border border-white bg-white/90 p-4 shadow-[0_8px_24px_rgba(8,96,143,.07)] sm:mb-6 sm:p-5",
          },
          React.createElement(
            "button",
            {
              type: "button",
              onClick: () => window.history.back(),
              "aria-label": "Back to PW batches",
              className:
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sky-100 bg-sky-50 text-sky-700 transition hover:bg-sky-100 active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500",
            },
            React.createElement("i", {
              "aria-hidden": "true",
              className: "fas fa-arrow-left text-sm",
            }),
          ),
          React.createElement(
            "div",
            { className: "min-w-0" },
            React.createElement(
              "p",
              {
                className:
                  "text-[10px] font-extrabold uppercase tracking-wider text-sky-600",
              },
              "PW Batch Subjects",
            ),
            React.createElement(
              "h1",
              {
                className:
                  "break-words text-[20px] font-black leading-tight text-slate-950 sm:text-[29px]",
              },
              (data == null ? void 0 : data.name) || "Batch Subjects",
            ),
          ),
        ),
        React.createElement(
          "div",
          {
            className:
              "mb-4 flex flex-col gap-3 border-b border-sky-100 pb-3 sm:mb-6 sm:flex-row sm:pb-4 sm:items-center sm:justify-between",
          },
          React.createElement(
            "div",
            {
              className:
                "flex items-center gap-2 text-[14px] font-black text-slate-800",
            },
            React.createElement(
              "span",
              {
                className:
                  "flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-600",
              },
              React.createElement("i", { className: "fas fa-book-open" }),
            ),
            "Subjects Available (",
            subjects.length,
            ")",
          ),
          React.createElement("input", {
            "aria-label": "Search PW subjects",
            type: "search",
            value: query,
            onChange: (e) => setQuery(e.target.value),
            placeholder: "Filter subjects...",
            className: pwCss.input + " sm:max-w-[275px]",
          }),
        ),
        React.createElement(PwStatus, {
          loading,
          error,
          empty: !subjects.length,
          label: "Subjects",
        }),
        React.createElement(
          "div",
          {
            className:
              "grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3",
          },
          visible.map((item) =>
            React.createElement(
              "button",
              {
                type: "button",
                key: item.id,
                className:
                  "group relative flex min-h-[92px] w-full min-w-0 items-center gap-2.5 overflow-hidden rounded-[20px] border border-sky-100/80 bg-white p-3 text-left shadow-[0_6px_20px_rgba(8,96,143,.07)] transition duration-200 hover:border-sky-300 hover:shadow-md active:scale-[.99] focus-visible:ring-2 focus-visible:ring-sky-500 motion-reduce:transition-none sm:min-h-[116px] sm:gap-4 sm:rounded-[24px] sm:p-5",
                "aria-label": `Open subject ${item.name}`,
                onPointerDown: () =>
                  window.PwCourseData.prefetch(pwEndpoint(batchId, item.id)),
                onMouseEnter: () =>
                  window.PwCourseData.prefetch(pwEndpoint(batchId, item.id)),
                onFocus: () =>
                  window.PwCourseData.prefetch(pwEndpoint(batchId, item.id)),
                onClick: () =>
                  onNavigate("pw_chapters", {
                    batch: batchId,
                    subject: item.id,
                    chapter: null,
                  }),
              },
              React.createElement("span", {
                "aria-hidden": "true",
                className:
                  "absolute inset-y-4 left-0 w-1 rounded-r-full bg-gradient-to-b from-sky-400 to-indigo-500",
              }),
              React.createElement(
                "span",
                {
                  className:
                    "relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[15px] border border-sky-100 bg-gradient-to-br from-sky-50 to-indigo-50 text-sky-700 shadow-sm sm:h-16 sm:w-16 sm:rounded-[18px]",
                },
                React.createElement("i", {
                  "aria-hidden": "true",
                  className: "fas fa-atom text-xl",
                }),
                item.image &&
                  React.createElement("img", {
                    src: item.image,
                    alt: "",
                    loading: "lazy",
                    decoding: "async",
                    className:
                      "absolute inset-0 h-full w-full object-contain p-1.5",
                    onError: (e) => (e.currentTarget.style.display = "none"),
                  }),
              ),
              React.createElement(
                "span",
                { className: "min-w-0 flex-1" },
                React.createElement(
                  "span",
                  {
                    className:
                      "block break-words text-[14px] font-extrabold leading-snug tracking-tight text-slate-900 sm:text-[16px]",
                    title: item.name,
                  },
                  item.name,
                ),
                React.createElement(
                  "span",
                  {
                    className:
                      "mt-1.5 block break-words text-[11px] font-medium text-slate-500",
                  },
                  item.teacher
                    ? React.createElement(
                        React.Fragment,
                        null,
                        React.createElement("i", {
                          className: "far fa-user mr-1.5 text-slate-400",
                        }),
                        item.teacher,
                      )
                    : item.lectureCount != null
                      ? `${item.lectureCount} lectures`
                      : "Tap to view chapters",
                ),
              ),
              React.createElement(
                "span",
                {
                  className:
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 sm:h-9 sm:w-9 text-sky-600 transition group-hover:bg-sky-600 group-hover:text-white",
                },
                React.createElement("i", {
                  className: "fas fa-arrow-right text-[11px]",
                }),
              ),
            ),
          ),
        ),
        !loading &&
          !error &&
          subjects.length > 0 &&
          !visible.length &&
          React.createElement(
            "p",
            { className: "mt-5 text-center text-sm text-slate-500" },
            "No matching subjects.",
          ),
      ),
    );
  };
  window.PwChaptersScreen = ({ batchId, subjectId, onNavigate }) => {
    const { data, loading, error } = PwFetch(pwEndpoint(batchId, subjectId));
    const [query, setQuery] = useState("");
    const chapters = Array.isArray(data) ? data : [];
    const visible = chapters.filter((x) =>
      x.name.toLowerCase().includes(query.toLowerCase()),
    );
    return React.createElement(
      "main",
      { className: pwCss.page },
      React.createElement(
        "div",
        { className: pwCss.max },
        React.createElement(PwBreadcrumb, {
          current: "Chapters",
          backLabel: "Subjects",
        }),
        React.createElement(
          "div",
          { className: "mb-6 flex flex-wrap items-end justify-between gap-3" },
          React.createElement(
            "div",
            null,
            React.createElement(
              "p",
              {
                className:
                  "text-[11px] font-extrabold uppercase tracking-wider text-sky-600",
              },
              "Explore the course",
            ),
            React.createElement(
              "h1",
              { className: "mt-1 text-[26px] font-black text-slate-950" },
              "Chapters (",
              chapters.length,
              ")",
            ),
            React.createElement(
              "p",
              { className: "mt-1 text-[12px] text-slate-500" },
              "Lectures, Notes, DPPs and Tests are organized chapter-wise.",
            ),
          ),
          React.createElement("input", {
            type: "search",
            "aria-label": "Search PW chapters",
            value: query,
            onChange: (e) => setQuery(e.target.value),
            placeholder: "Filter chapters...",
            className: pwCss.input + " sm:max-w-[265px]",
          }),
        ),
        React.createElement(PwStatus, {
          loading,
          error,
          empty: !chapters.length,
          label: "Chapters",
        }),
        React.createElement(
          "div",
          { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" },
          visible.map((item, index) =>
            React.createElement(
              "button",
              {
                type: "button",
                key: item.id,
                className: pwCss.card,
                "aria-label": `Open chapter ${item.name}`,
                onClick: () => {
                  try {
                    sessionStorage.setItem("pw_chapter_label", item.name);
                  } catch (_) {}
                  onNavigate("pw_contents", {
                    batch: batchId,
                    subject: subjectId,
                    chapter: item.id,
                  });
                },
              },
              React.createElement(
                "span",
                {
                  className:
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-[17px] font-black text-sky-700",
                },
                String(index + 1).padStart(2, "0"),
              ),
              React.createElement(
                "span",
                { className: "min-w-0 flex-1" },
                React.createElement(
                  "span",
                  {
                    className:
                      "block text-[13px] font-extrabold leading-snug text-slate-900",
                  },
                  item.name,
                ),
                React.createElement(
                  "span",
                  {
                    className:
                      "mt-1.5 block text-[11px] font-semibold text-slate-500",
                  },
                  item.lectureVideos || item.videos || 0,
                  " videos \xB7 ",
                  item.notes || 0,
                  " notes",
                ),
              ),
              React.createElement(
                "span",
                {
                  className:
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600",
                },
                React.createElement("i", {
                  className: "fas fa-arrow-right text-[11px]",
                }),
              ),
            ),
          ),
        ),
        !loading &&
          !error &&
          chapters.length > 0 &&
          !visible.length &&
          React.createElement(
            "p",
            { className: "mt-4 text-center text-sm text-slate-500" },
            "No matching chapters.",
          ),
      ),
    );
  };
  window.PwContentsScreen = ({ batchId, subjectId, chapterId }) => {
    var _a;
    const [tab, setTab] = useState("Videos"),
      [page, setPage] = useState(1),
      [query, setQuery] = useState("");
    const [records, setRecords] = useState([]),
      [busy, setBusy] = useState(true),
      [error, setError] = useState(""),
      [hasMore, setHasMore] = useState(false);
    const [pdf, setPdf] = useState(null);
    const [activePlayer, setActivePlayer] = useState("");
    const playerRef = useRef("");
    const nativeRequestRef = useRef(null);
    const [openingNative, setOpeningNative] = useState(false);
    const [playError, setPlayError] = useState("");
    useEffect(() => {
      setOpeningNative(false);
      setPlayError("");
      return () => {
        const controller = nativeRequestRef.current;
        nativeRequestRef.current = null;
        controller == null ? void 0 : controller.abort();
      };
    }, [batchId, subjectId, chapterId]);
    useEffect(() => {
      const onPop = () => {
        var _a2;
        if (
          playerRef.current &&
          !((_a2 = window.history.state) == null ? void 0 : _a2.pwOverlay)
        ) {
          window.__studyxpwPlayerOverlayOpen = false;
          playerRef.current = "";
          setActivePlayer("");
        }
      };
      window.addEventListener("popstate", onPop);
      return () => {
        window.removeEventListener("popstate", onPop);
        window.__studyxpwPlayerOverlayOpen = false;
      };
    }, []);
    useEffect(() => {
      if (!activePlayer) return;
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }, [activePlayer]);
    const closePlayer = () => {
      var _a2;
      if ((_a2 = window.history.state) == null ? void 0 : _a2.pwOverlay)
        window.history.back();
      else {
        window.__studyxpwPlayerOverlayOpen = false;
        playerRef.current = "";
        setActivePlayer("");
      }
    };
    const [chapterName] = useState(() => {
      try {
        return sessionStorage.getItem("pw_chapter_label") || "Chapter Content";
      } catch (_) {
        return "Chapter Content";
      }
    });
    const url = pwEndpoint(batchId, subjectId, chapterId);
    useEffect(() => {
      const abort = new AbortController();
      setBusy(true);
      setError("");
      if (page === 1) setRecords([]);
      fetch(
        url + "?" + new URLSearchParams({ type: tab, page: String(page) }),
        { signal: abort.signal },
      )
        .then(async (res) => {
          const json = await res.json().catch(() => ({}));
          if (!res.ok || !json.success)
            throw Error(json.error || "Upstream materials unavailable");
          return json;
        })
        .then((result) => {
          if (abort.signal.aborted) return;
          const items = Array.isArray(result.data) ? result.data : [];
          setRecords((previous) =>
            page === 1
              ? items
              : [
                  ...previous,
                  ...items.filter((x) => !previous.some((y) => y.id === x.id)),
                ],
          );
          setHasMore(items.length >= 20);
        })
        .catch((e) => {
          if (!abort.signal.aborted)
            setError(e.message || "Unable to load this chapter");
        })
        .finally(() => {
          if (!abort.signal.aborted) setBusy(false);
        });
      return () => abort.abort();
    }, [url, tab, page]);
    const tabs = [
      ["Videos", "Lectures"],
      ["notes", "Notes"],
      ["DppNotes", "DPPs"],
      ["Test", "Tests"],
    ];
    const visible = records.filter((x) =>
      x.title.toLowerCase().includes(query.toLowerCase()),
    );
    const play = async (item) => {
      var _a2;
      if (
        item.isLocked ||
        !item.videoId ||
        playerRef.current ||
        nativeRequestRef.current
      )
        return;
      setPlayError("");
      if (
        (_a2 = window.ReactNativeWebView) == null ? void 0 : _a2.postMessage
      ) {
        const controller = new AbortController();
        nativeRequestRef.current = controller;
        setOpeningNative(true);
        const timer = setTimeout(() => controller.abort(), 18e3);
        try {
          const response = await fetch(
            pwBase() + "/api/pw/videos/" + encodeURIComponent(item.videoId),
            { signal: controller.signal, cache: "no-store" },
          );
          const result = await response.json();
          const media = result.data;
          if (
            !response.ok ||
            !result.success ||
            (media == null ? void 0 : media.playable) !== true ||
            media.drmProtected === true ||
            !/^https:\/\//i.test(String(media.videoUrl || ""))
          )
            throw Error(
              result.error || "This video has no authorized playable stream.",
            );
          if (controller.signal.aborted) return;
          const templateArgs = new URLSearchParams({
            batch: batchId,
            subject: subjectId,
            chapter: chapterId,
            in_app: "true",
            hide_header: "true",
          });
          const templateUrl =
            pwBase() +
            "/pw/watch/" +
            encodeURIComponent(item.videoId) +
            "?" +
            templateArgs;
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              action: "play_stream",
              url: media.videoUrl,
              template_url: templateUrl,
              title: item.title || media.title || "PW Lecture",
              id: item.videoId,
              is_native_video: true,
              playlist: records
                .filter((x) => !x.isLocked && x.videoId)
                .map((x) => ({
                  id: x.videoId,
                  title: x.title,
                  url: x.videoId === item.videoId ? media.videoUrl : "",
                  attachments: [],
                })),
            }),
          );
        } catch (error2) {
          if (!controller.signal.aborted)
            setPlayError(error2.message || "Unable to open PW video.");
          else if (nativeRequestRef.current === controller)
            setPlayError(
              "Video request timed out. Please tap the lecture again.",
            );
        } finally {
          clearTimeout(timer);
          if (nativeRequestRef.current === controller) {
            nativeRequestRef.current = null;
            setOpeningNative(false);
          }
        }
        return;
      }
      const args = new URLSearchParams({
        batch: batchId,
        subject: subjectId,
        chapter: chapterId,
      });
      const target =
        pwBase() + "/pw/watch/" + encodeURIComponent(item.videoId) + "?" + args;
      window.history.pushState(
        { ...window.history.state, pwOverlay: true },
        "",
        window.location.href,
      );
      window.__studyxpwPlayerOverlayOpen = true;
      playerRef.current = target;
      setActivePlayer(target);
    };
    useEffect(() => {
      if (!window.ReactNativeWebView) return;
      const previous = window.appProcessItem;
      const handler = (id, action) => {
        if (action !== "watch") return;
        const item = records.find((x) => String(x.videoId) === String(id));
        if (item && !item.isLocked) play(item);
      };
      window.appProcessItem = handler;
      return () => {
        if (window.appProcessItem === handler) window.appProcessItem = previous;
      };
    }, [records, batchId, subjectId, chapterId]);
    return React.createElement(
      "main",
      { className: pwCss.page },
      React.createElement(
        "div",
        { className: pwCss.max },
        React.createElement(PwBreadcrumb, {
          current: chapterName,
          backLabel: "Chapters",
        }),
        React.createElement(
          "h1",
          {
            className:
              "mb-5 text-[26px] font-black tracking-tight text-slate-950 sm:text-[32px]",
          },
          chapterName,
        ),
        React.createElement(
          "div",
          {
            className: "mb-7 flex flex-wrap gap-2",
            "aria-label": "PW chapter resources",
          },
          tabs.map(([key, label]) =>
            React.createElement(
              "button",
              {
                type: "button",
                key,
                "aria-pressed": tab === key,
                onClick: () => {
                  setTab(key);
                  setPage(1);
                  setQuery("");
                },
                className: `rounded-full px-4 py-2.5 text-[12px] font-extrabold transition ${tab === key ? "bg-sky-600 text-white shadow-sm shadow-sky-200" : "border border-sky-100 bg-white text-slate-600 hover:text-sky-600"}`,
              },
              label,
            ),
          ),
        ),
        React.createElement(
          "div",
          { className: "mb-4 flex justify-end" },
          React.createElement("input", {
            type: "search",
            value: query,
            "aria-label": "Search PW chapter content",
            onChange: (e) => setQuery(e.target.value),
            placeholder: "Search lectures and materials...",
            className: pwCss.input + " sm:max-w-[290px]",
          }),
        ),
        openingNative &&
          React.createElement(
            "p",
            {
              role: "status",
              className:
                "mb-3 rounded-xl bg-sky-50 p-3 text-sm font-semibold text-sky-700",
            },
            "Opening PW video\u2026",
          ),
        playError &&
          React.createElement(
            "p",
            {
              role: "alert",
              className: "mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700",
            },
            playError,
          ),
        React.createElement(PwStatus, {
          loading: busy && page === 1,
          error,
          empty: !busy && !error && !records.length,
          label:
            ((_a = tabs.find((x) => x[0] === tab)) == null ? void 0 : _a[1]) ||
            "Lessons",
        }),
        React.createElement(
          "div",
          {
            className: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3",
            "aria-label": "PW lecture list",
          },
          visible.map((item) => {
            const canPlay = !item.isLocked && !!item.videoId;
            const hasAttachments =
              !item.isLocked &&
              Array.isArray(item.attachments) &&
              item.attachments.length > 0;
            if (tab !== "Videos" && (tab !== "Test" || !item.isVideoLecture)) {
              return React.createElement(
                "article",
                {
                  key: item.id,
                  className:
                    "min-w-0 rounded-[18px] border border-sky-100 bg-white p-4 shadow-[0_4px_16px_rgba(20,65,110,.055)] sm:p-5",
                },
                React.createElement(
                  "div",
                  { className: "flex items-start gap-3" },
                  React.createElement(
                    "span",
                    {
                      className:
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-[19px] text-sky-600",
                    },
                    React.createElement("i", {
                      className: `fas ${tab === "Test" ? "fa-clipboard-check" : "fa-file-pdf"}`,
                    }),
                  ),
                  React.createElement(
                    "div",
                    { className: "min-w-0 flex-1" },
                    React.createElement(
                      "h2",
                      {
                        className:
                          "break-words text-[13px] font-extrabold leading-snug text-slate-900 sm:text-[14px]",
                      },
                      item.title,
                    ),
                    React.createElement(
                      "p",
                      {
                        className:
                          "mt-1.5 text-[11px] font-medium text-slate-500",
                      },
                      tab === "Test"
                        ? "Practice / test information"
                        : tab === "DppNotes"
                          ? "Daily practice material"
                          : "Class notes",
                      item.date ? " \xB7 " + item.date.split("T")[0] : "",
                    ),
                    tab === "Test" &&
                      (item.totalQuestions != null ||
                        item.totalMarks != null) &&
                      React.createElement(
                        "p",
                        {
                          className:
                            "mt-2 text-[11px] font-semibold text-slate-600",
                        },
                        item.totalQuestions != null
                          ? `${item.totalQuestions} questions`
                          : "",
                        item.totalMarks != null
                          ? ` \xB7 ${item.totalMarks} marks`
                          : "",
                      ),
                    item.isLocked &&
                      React.createElement(
                        "p",
                        {
                          className:
                            "mt-3 text-[11px] font-semibold text-amber-700",
                        },
                        "Requires authorized access",
                      ),
                    !item.isLocked &&
                      !hasAttachments &&
                      item.unavailableAttachmentCount > 0 &&
                      React.createElement(
                        "p",
                        {
                          className:
                            "mt-2 rounded-xl bg-amber-50 px-3 py-2.5 text-[11px] font-semibold leading-relaxed text-amber-700",
                        },
                        React.createElement("i", {
                          className: "fas fa-info-circle mr-1.5",
                        }),
                        "PDF listed, but the upstream API did not provide its file URL yet.",
                      ),
                    !item.isLocked &&
                      !hasAttachments &&
                      !item.videoId &&
                      !(item.unavailableAttachmentCount > 0) &&
                      React.createElement(
                        "p",
                        { className: "mt-2 text-[11px] text-slate-500" },
                        "No accessible document or test link published yet.",
                      ),
                  ),
                ),
                hasAttachments &&
                  React.createElement(
                    "div",
                    {
                      className:
                        "mt-3 flex flex-wrap gap-2 border-t border-sky-50 pt-3",
                    },
                    item.attachments.map((file, index) =>
                      React.createElement(
                        "button",
                        {
                          type: "button",
                          key: index,
                          onClick: () => setPdf(file),
                          className:
                            "min-h-[44px] rounded-xl bg-sky-600 px-4 py-2 text-[11px] font-extrabold text-white",
                        },
                        React.createElement("i", {
                          className: "fas fa-file-pdf mr-2",
                        }),
                        "Open ",
                        tab === "DppNotes"
                          ? "DPP"
                          : tab === "Test"
                            ? "Paper"
                            : "Notes",
                        " PDF",
                      ),
                    ),
                  ),
              );
            }
            return React.createElement(
              "article",
              {
                key: item.id,
                className:
                  "overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,.055)] transition-all duration-200 hover:shadow-[0_14px_36px_rgba(40,56,110,.11)]",
              },
              canPlay
                ? React.createElement(
                    "button",
                    {
                      type: "button",
                      onClick: () => play(item),
                      "aria-label": `Play lecture ${item.title}`,
                      className:
                        "group block w-full cursor-pointer text-left outline-none focus-visible:ring-4 focus-visible:ring-indigo-300",
                    },
                    React.createElement(
                      "div",
                      {
                        className:
                          "relative aspect-video w-full overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-600",
                      },
                      item.thumbnail
                        ? React.createElement("img", {
                            src: item.thumbnail,
                            alt: "",
                            loading: "lazy",
                            decoding: "async",
                            onError: (e) => {
                              e.currentTarget.style.display = "none";
                            },
                            className:
                              "absolute inset-0 h-full w-full object-cover opacity-85 transition duration-300 group-hover:scale-[1.04]",
                          })
                        : React.createElement("i", {
                            "aria-hidden": "true",
                            className:
                              "fas fa-play-circle absolute -bottom-6 -right-5 text-[125px] text-white/15",
                          }),
                      React.createElement("div", {
                        className:
                          "absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-slate-950/15",
                      }),
                      React.createElement(
                        "span",
                        {
                          className:
                            "absolute left-3 top-3 rounded-lg border border-white/20 bg-white/20 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md",
                        },
                        "Lecture",
                      ),
                      React.createElement(
                        "span",
                        {
                          className:
                            "absolute inset-0 flex items-center justify-center",
                        },
                        React.createElement(
                          "span",
                          {
                            className:
                              "flex h-16 w-16 items-center justify-center rounded-full border border-white/60 bg-white/20 text-xl text-white shadow-xl backdrop-blur-md transition group-hover:scale-110 group-hover:bg-white/30",
                          },
                          React.createElement("i", {
                            className: "fas fa-play ml-1",
                            "aria-hidden": "true",
                          }),
                        ),
                      ),
                      item.duration &&
                        React.createElement(
                          "span",
                          {
                            className:
                              "absolute bottom-3 right-3 rounded-lg bg-slate-950/75 px-2.5 py-1.5 text-[11px] font-bold text-white",
                          },
                          React.createElement("i", {
                            className: "far fa-clock mr-1.5",
                          }),
                          item.duration,
                        ),
                    ),
                    React.createElement(
                      "div",
                      { className: "px-4 pb-4 pt-4" },
                      React.createElement(
                        "h2",
                        {
                          className:
                            "line-clamp-3 text-[14px] font-extrabold leading-snug text-slate-800 sm:text-[15px]",
                        },
                        item.title,
                      ),
                      React.createElement(
                        "div",
                        {
                          className:
                            "mt-2 flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-500",
                        },
                        React.createElement(
                          "span",
                          null,
                          React.createElement("i", {
                            className:
                              "fas fa-play-circle mr-1.5 text-indigo-500",
                          }),
                          "Tap anywhere to watch",
                        ),
                        item.date &&
                          React.createElement(
                            "span",
                            { className: "truncate" },
                            item.date.split("T")[0],
                          ),
                      ),
                    ),
                  )
                : React.createElement(
                    "div",
                    { className: "text-left" },
                    React.createElement(
                      "div",
                      {
                        className:
                          "relative aspect-video overflow-hidden bg-gradient-to-br from-slate-200 to-slate-100",
                      },
                      item.thumbnail &&
                        React.createElement("img", {
                          src: item.thumbnail,
                          alt: "",
                          loading: "lazy",
                          decoding: "async",
                          className:
                            "absolute inset-0 h-full w-full object-cover opacity-65",
                          onError: (e) => {
                            e.currentTarget.style.display = "none";
                          },
                        }),
                      React.createElement(
                        "span",
                        {
                          className:
                            "absolute inset-0 flex items-center justify-center text-[30px] text-slate-500",
                        },
                        React.createElement("i", {
                          className: `fas ${item.isLocked ? "fa-lock" : "fa-file-alt"}`,
                        }),
                      ),
                      React.createElement(
                        "span",
                        {
                          className:
                            "absolute left-3 top-3 rounded-lg bg-white/90 px-3 py-1.5 text-[10px] font-black text-slate-700",
                        },
                        item.isLocked
                          ? "Locked"
                          : tab === "Videos"
                            ? "Video unavailable"
                            : "Resource",
                      ),
                    ),
                    React.createElement(
                      "div",
                      { className: "px-4 pb-4 pt-4" },
                      React.createElement(
                        "h2",
                        {
                          className:
                            "line-clamp-3 text-[14px] font-extrabold leading-snug text-slate-800",
                        },
                        item.title,
                      ),
                      React.createElement(
                        "p",
                        {
                          className:
                            "mt-2 text-[11px] font-semibold text-slate-500",
                        },
                        item.isLocked
                          ? "This lesson requires authorized access"
                          : hasAttachments
                            ? "Open an available document below"
                            : "No playable video URL available",
                      ),
                    ),
                  ),
              hasAttachments &&
                React.createElement(
                  "div",
                  {
                    className:
                      "flex flex-wrap gap-2 border-t border-slate-100 px-4 pb-4 pt-3",
                  },
                  item.attachments.map((file, index) =>
                    React.createElement(
                      "button",
                      {
                        type: "button",
                        key: index,
                        onClick: () => setPdf(file),
                        className:
                          "min-h-[44px] rounded-xl border border-sky-100 bg-sky-50 px-4 py-2 text-[11px] font-extrabold text-sky-700 hover:bg-sky-100",
                      },
                      React.createElement("i", {
                        className: "far fa-file-pdf mr-2",
                      }),
                      file.name || "View PDF",
                    ),
                  ),
                ),
            );
          }),
        ),
        !busy &&
          !error &&
          hasMore &&
          React.createElement(
            "button",
            {
              type: "button",
              onClick: () => setPage((x) => x + 1),
              className:
                "mx-auto mt-6 block rounded-full bg-sky-600 px-6 py-3 text-[12px] font-extrabold text-white",
            },
            "Load more",
          ),
        activePlayer &&
          window.ReactDOM.createPortal(
            React.createElement(
              "div",
              {
                role: "dialog",
                "aria-modal": "true",
                "aria-label": "PW stream player",
                className:
                  "fixed inset-0 z-[9999] flex h-[100dvh] w-screen flex-col bg-slate-950",
                style: { height: "100dvh" },
              },
              React.createElement(
                "header",
                {
                  className:
                    "flex min-h-[52px] shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-slate-950 px-3 text-white",
                  style: { paddingTop: "env(safe-area-inset-top)" },
                },
                React.createElement(
                  "button",
                  {
                    type: "button",
                    "aria-label": "Back to PW lectures",
                    onClick: closePlayer,
                    className:
                      "flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-[12px] font-extrabold text-white hover:bg-white/10",
                  },
                  React.createElement("i", { className: "fas fa-arrow-left" }),
                  " Back to lectures",
                ),
                React.createElement(
                  "span",
                  {
                    className:
                      "max-w-[40%] truncate text-[11px] font-extrabold text-slate-300",
                  },
                  ((window.APP_CONFIG && window.APP_CONFIG.appName) || "RG VERSE"),
                ),
              ),
              React.createElement("iframe", {
                title: "RG Verse PW stream player",
                src: activePlayer,
                allowFullScreen: true,
                allow: "autoplay; fullscreen; picture-in-picture",
                className: "min-h-0 w-full flex-1 border-0 bg-slate-950",
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
                "aria-label": "PW PDF preview",
                className:
                  "fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-3",
              },
              React.createElement(
                "div",
                {
                  className:
                    "flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white p-3 shadow-2xl",
                },
                React.createElement(
                  "div",
                  { className: "mb-3 flex items-center justify-between gap-2" },
                  React.createElement(
                    "h3",
                    { className: "truncate text-sm font-black text-slate-900" },
                    pdf.name,
                  ),
                  React.createElement(
                    "button",
                    {
                      "aria-label": "Close PDF preview",
                      type: "button",
                      onClick: () => setPdf(null),
                      className:
                        "rounded-xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-700",
                    },
                    "Close",
                  ),
                ),
                React.createElement("iframe", {
                  title: pdf.name,
                  src: pdf.url,
                  className:
                    "min-h-0 w-full flex-1 rounded-xl border border-slate-100",
                }),
              ),
            ),
            document.body,
          ),
      ),
    );
  };
})();
