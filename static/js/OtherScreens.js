(() => {
  const { useState, useEffect } = window.React;
  window.SubjectsScreen = ({ batch, onNavigate }) => {
    const { SERVER_URL, DataManager } = window;
    const encodedBatch = encodeURIComponent(String(batch).trim());
    const apiUrl = `${SERVER_URL}/api/subjects?batch=${encodedBatch}`;
    const cachedData = DataManager.getCache(apiUrl);
    const [subjects, setSubjects] = useState(
      cachedData && Array.isArray(cachedData.data) ? cachedData.data : [],
    );
    const [isLoading, setIsLoading] = useState(!cachedData);
    const [query, setQuery] = useState("");
    const visibleSubjects = subjects.filter((item) => {
      const name =
        typeof item === "object" ? String(item.name || "") : String(item || "");
      const label = name.trim() === "General Subject" ? "All Classes" : name;
      return label
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase());
    });
    useEffect(() => {
      let isMounted = true;
      if (!cachedData) setIsLoading(true);
      DataManager.fetch(`${apiUrl}&_t=${Date.now()}`)
        .then((res) => {
          if (res && res.success && isMounted) {
            setSubjects(res.data);
          }
          if (isMounted) setIsLoading(false);
        })
        .catch(() => {
          if (isMounted) setIsLoading(false);
        });
      return () => {
        isMounted = false;
      };
    }, [batch]);
    const getSubjectStyle = (subjectName) => {
      const sub = String(subjectName).toLowerCase();
      if (sub.includes("notice"))
        return {
          image: "/static/images/remote/Hpa6l.jpg",
          color: "from-white to-white",
          border: "border border-slate-100",
        };
      if (
        sub.includes("organic") ||
        sub.includes("\u0911\u0930\u094D\u0917\u0947\u0928\u093F\u0915")
      )
        return {
          image: "/static/images/remote/1j1MZ.jpg",
          color: "from-white to-white",
          border: "border border-slate-100",
        };
      if (
        sub.includes("physical") ||
        sub.includes("\u092B\u093F\u091C\u093F\u0915\u0932")
      )
        return {
          image: "/static/images/remote/Qt84w.jpg",
          color: "from-white to-white",
          border: "border border-slate-100",
        };
      if (
        sub.includes("chem") ||
        sub.includes("\u0930\u0938\u093E\u092F\u0928")
      )
        return {
          image: "/static/images/remote/reg94.jpg",
          color: "from-white to-white",
          border: "border border-slate-100",
        };
      if (sub.includes("phy") || sub.includes("\u092D\u094C\u0924\u093F\u0915"))
        return {
          image: "/static/images/remote/jGQob.jpg",
          color: "from-white to-white",
          border: "border border-slate-100",
        };
      if (sub.includes("math") || sub.includes("\u0917\u0923\u093F\u0924"))
        return {
          image: "/static/images/remote/On9pl.jpg",
          color: "from-white to-white",
          border: "border border-slate-100",
        };
      if (
        sub.includes("bio") ||
        sub.includes("zoo") ||
        sub.includes("bot") ||
        sub.includes("\u091C\u0940\u0935") ||
        sub.includes("\u0935\u0928\u0938\u094D\u092A\u0924\u093F")
      )
        return {
          image: "/static/images/remote/dVqaW.jpg",
          color: "from-white to-white",
          border: "border border-slate-100",
        };
      if (
        sub.includes("eng") ||
        sub.includes("\u0905\u0902\u0917\u094D\u0930\u0947\u091C\u0940")
      )
        return {
          icon: "fa-book-open-reader",
          color: "from-indigo-500 to-purple-600",
        };
      if (
        sub.includes("soc") ||
        sub.includes("hist") ||
        sub.includes("geo") ||
        sub.includes("pol") ||
        sub.includes("sst") ||
        sub.includes("\u0907\u0924\u093F\u0939\u093E\u0938") ||
        sub.includes("\u092D\u0942\u0917\u094B\u0932") ||
        sub.includes("\u0928\u093E\u0917\u0930\u093F\u0915") ||
        sub.includes("\u0938\u093E\u092E\u093E\u091C\u093F\u0915")
      )
        return {
          icon: "fa-globe-americas",
          color: "from-amber-500 to-orange-500",
        };
      if (
        sub.includes("hin") ||
        sub.includes("san") ||
        sub.includes("\u0939\u093F\u0902\u0926\u0940") ||
        sub.includes("\u0938\u0902\u0938\u094D\u0915\u0943\u0924") ||
        sub.includes("\u0935\u094D\u092F\u093E\u0915\u0930\u0923") ||
        sub.includes("\u0938\u093E\u0939\u093F\u0924\u094D\u092F")
      )
        return { icon: "fa-language", color: "from-fuchsia-500 to-pink-500" };
      if (
        sub.includes("comp") ||
        sub.includes("it") ||
        sub.includes("\u0915\u0902\u092A\u094D\u092F\u0942\u091F\u0930")
      )
        return {
          image: "/static/images/remote/ewRJo.jpg",
          color: "from-white to-white",
          border: "border border-slate-100",
        };
      if (
        sub.includes("acc") ||
        sub.includes("eco") ||
        sub.includes("comm") ||
        sub.includes("bus") ||
        sub.includes(
          "\u0905\u0930\u094D\u0925\u0936\u093E\u0938\u094D\u0924\u094D\u0930",
        ) ||
        sub.includes("\u0935\u093E\u0923\u093F\u091C\u094D\u092F") ||
        sub.includes("\u0932\u0947\u0916\u093E")
      )
        return {
          icon: "fa-chart-pie",
          color: "from-violet-500 to-fuchsia-500",
        };
      const defaultGradients = [
        "from-indigo-500 to-purple-600",
        "from-emerald-500 to-teal-500",
        "from-rose-500 to-pink-600",
        "from-amber-500 to-orange-500",
        "from-blue-500 to-cyan-500",
      ];
      const randomGradient =
        defaultGradients[Math.abs(sub.length) % defaultGradients.length];
      return { icon: "fa-book", color: randomGradient };
    };
    const prefetchChapters = (sub) => {
      const encodedSubject = encodeURIComponent(String(sub).trim());
      DataManager.fetch(
        `${SERVER_URL}/api/chapters?batch=${encodedBatch}&subject=${encodedSubject}`,
      );
    };
    const openSubject = (sub) => {
      const safeSubject = String(sub).trim();
      const chaptersUrl = `${SERVER_URL}/api/chapters?batch=${encodedBatch}&subject=${encodeURIComponent(safeSubject)}`;
      const cached = DataManager.getCache(chaptersUrl);
      if (
        (cached == null ? void 0 : cached.success) &&
        Array.isArray(cached.data) &&
        cached.data.length === 0
      ) {
        onNavigate("content", {
          subject: safeSubject,
          batch: String(batch),
          chapter: null,
        });
      } else {
        onNavigate("chapters", {
          subject: safeSubject,
          batch: String(batch),
          chapter: null,
        });
      }
    };
    const SkeletonSubject = () =>
      React.createElement(
        "div",
        {
          className:
            "flex h-[104px] items-center gap-3 rounded-[24px] bg-sky-50 p-4 animate-pulse motion-reduce:animate-none",
        },
        React.createElement("div", {
          className: "h-11 w-11 shrink-0 rounded-[14px] bg-sky-100",
        }),
        React.createElement(
          "div",
          { className: "flex-1 space-y-2" },
          React.createElement("div", {
            className: "h-3 w-3/4 rounded bg-sky-100",
          }),
          React.createElement("div", {
            className: "h-2.5 w-1/2 rounded bg-sky-100",
          }),
        ),
      );
    return React.createElement(
      "main",
      {
        className:
          "fade-in min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50/50 px-3 pt-4 sm:px-6 sm:pt-6",
        style: {
          paddingBottom: "calc(8rem + env(safe-area-inset-bottom, 0px))",
        },
      },
      React.createElement(
        "div",
        { className: "mx-auto max-w-6xl" },
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
              "aria-label": "Back to batches",
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
              "Batch Subjects",
            ),
            React.createElement(
              "h1",
              {
                className:
                  "break-words text-[20px] font-black leading-tight text-slate-950 sm:text-[29px]",
              },
              String(batch || "Subjects"),
            ),
          ),
        ),
        React.createElement(
          "div",
          {
            className:
              "mb-4 flex flex-col gap-3 border-b border-sky-100 pb-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between",
          },
          React.createElement(
            "h2",
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
              React.createElement("i", {
                "aria-hidden": "true",
                className: "fas fa-book-open",
              }),
            ),
            "Subjects Available (",
            subjects.length,
            ")",
          ),
          React.createElement("input", {
            type: "search",
            "aria-label": "Search subjects",
            value: query,
            onChange: (e) => setQuery(e.target.value),
            placeholder: "Filter subjects...",
            className:
              "w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-[13px] font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 sm:max-w-[275px]",
          }),
        ),
        isLoading
          ? React.createElement(
              "div",
              {
                role: "status",
                "aria-label": "Loading subjects",
                className:
                  "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3",
              },
              React.createElement(SkeletonSubject, null),
              React.createElement(SkeletonSubject, null),
              React.createElement(SkeletonSubject, null),
              React.createElement(SkeletonSubject, null),
            )
          : subjects.length > 0
            ? React.createElement(
                React.Fragment,
                null,
                React.createElement(
                  "div",
                  {
                    className:
                      "grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3",
                  },
                  visibleSubjects.map((item, i) => {
                    const sub =
                      typeof item === "object"
                        ? String(item.name || "")
                        : String(item || "");
                    const customThumb =
                      typeof item === "object"
                        ? String(item.thumb_url || "")
                        : "";
                    const styleData = getSubjectStyle(sub);
                    const image = customThumb || styleData.image;
                    const label =
                      sub.trim() === "General Subject" ? "All Classes" : sub;
                    return React.createElement(
                      "button",
                      {
                        type: "button",
                        key: sub + i,
                        "aria-label": `Open subject ${label}`,
                        onClick: () => openSubject(sub),
                        onTouchStart: () => prefetchChapters(sub),
                        onMouseEnter: () => prefetchChapters(sub),
                        className:
                          "group relative flex min-h-[104px] w-full min-w-0 items-center gap-3 overflow-hidden rounded-[24px] border border-sky-100/80 bg-white p-4 text-left shadow-[0_6px_20px_rgba(8,96,143,.07)] transition duration-200 hover:border-sky-300 hover:shadow-[0_10px_28px_rgba(8,96,143,.12)] active:scale-[.99] focus-visible:ring-2 focus-visible:ring-sky-500 motion-reduce:transition-none motion-reduce:transform-none sm:min-h-[116px] sm:gap-4 sm:p-5",
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
                            "relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-sky-100 bg-gradient-to-br from-sky-50 to-indigo-50 text-sky-700 shadow-sm sm:h-16 sm:w-16",
                        },
                        React.createElement("i", {
                          "aria-hidden": "true",
                          className: `fas ${styleData.icon || "fa-book-open"} text-xl`,
                        }),
                        image &&
                          React.createElement("img", {
                            src: image,
                            alt: "",
                            loading: "lazy",
                            decoding: "async",
                            className: `absolute inset-0 h-full w-full ${customThumb ? "object-cover" : "object-contain p-1.5"}`,
                            onError: (e) => {
                              e.currentTarget.style.display = "none";
                            },
                          }),
                      ),
                      React.createElement(
                        "span",
                        { className: "min-w-0 flex-1" },
                        React.createElement(
                          "span",
                          {
                            className:
                              "block break-words text-[15px] font-extrabold leading-snug tracking-tight text-slate-900 sm:text-[16px]",
                          },
                          label,
                        ),
                        React.createElement(
                          "span",
                          {
                            className:
                              "mt-1.5 block text-[11px] font-medium leading-relaxed text-slate-500 sm:text-[12px]",
                          },
                          "Tap to explore classes",
                        ),
                      ),
                      React.createElement(
                        "span",
                        {
                          className:
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sky-100 bg-sky-50 text-sky-600 transition group-hover:bg-sky-600 group-hover:text-white sm:h-10 sm:w-10",
                        },
                        React.createElement("i", {
                          "aria-hidden": "true",
                          className: "fas fa-arrow-right text-[11px]",
                        }),
                      ),
                    );
                  }),
                ),
                !visibleSubjects.length &&
                  React.createElement(
                    "p",
                    {
                      role: "status",
                      className: "mt-5 text-center text-sm text-slate-500",
                    },
                    "No matching subjects.",
                  ),
              )
            : React.createElement(
                "div",
                {
                  className:
                    "rounded-2xl border border-dashed border-sky-200 bg-sky-50 p-10 text-center text-[13px] font-semibold text-slate-500",
                },
                "No subjects available for this batch.",
              ),
      ),
    );
  };
  window.ChaptersScreen = ({ batch, subject, onNavigate }) => {
    const { SERVER_URL, DataManager } = window;
    const apiUrl = `${SERVER_URL}/api/chapters?batch=${encodeURIComponent(String(batch || "").trim())}&subject=${encodeURIComponent(String(subject || "").trim())}`;
    const cached = DataManager.getCache(apiUrl);
    const [chapters, setChapters] = useState(
      cached && Array.isArray(cached.data) ? cached.data : [],
    );
    const [isLoading, setIsLoading] = useState(!cached);
    const [unassignedCount, setUnassignedCount] = useState(
      cached && cached.unassigned_count ? cached.unassigned_count : 0,
    );
    const [error, setError] = useState("");
    const [retry, setRetry] = useState(0);
    useEffect(() => {
      let active = true;
      setError("");
      setIsLoading(true);
      DataManager.fetch(`${apiUrl}&_t=${Date.now()}`)
        .then((res) => {
          if (!active) return;
          if (
            !(res == null ? void 0 : res.success) ||
            !Array.isArray(res.data)
          ) {
            setError("Unable to load chapters. Please retry.");
            return;
          }
          if (res.data.length === 0) {
            onNavigate(
              "content",
              { batch: String(batch), subject: String(subject), chapter: null },
              true,
            );
            return;
          }
          setChapters(res.data);
          setUnassignedCount(res.unassigned_count || 0);
        })
        .catch(() => {
          if (active) setError("Unable to load chapters. Please retry.");
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
      return () => {
        active = false;
      };
    }, [apiUrl, retry]);
    return React.createElement(
      "div",
      {
        className: "fade-in min-h-screen bg-[#fafbff] p-5",
        style: {
          paddingBottom: "calc(8rem + env(safe-area-inset-bottom, 0px))",
        },
      },
      React.createElement(
        "div",
        { className: "mb-5 border-b-2 border-indigo-500/70 pb-3" },
        React.createElement(
          "div",
          {
            className:
              "text-[10px] font-black uppercase tracking-[0.15em] text-indigo-500",
          },
          batch,
        ),
        React.createElement(
          "h2",
          { className: "mt-1 text-[22px] font-black text-slate-800" },
          subject,
        ),
        React.createElement(
          "p",
          { className: "mt-1 text-xs font-semibold text-slate-500" },
          "Course chapters",
        ),
      ),
      error
        ? React.createElement(
            "div",
            {
              role: "alert",
              className: "rounded-2xl bg-rose-50 p-4 text-sm text-rose-700",
            },
            error,
            React.createElement(
              "button",
              {
                type: "button",
                className: "ml-3 underline",
                onClick: () => setRetry((x) => x + 1),
              },
              "Retry",
            ),
          )
        : isLoading
          ? React.createElement(
              "div",
              { className: "space-y-3" },
              [1, 2, 3].map((i) =>
                React.createElement("div", {
                  key: i,
                  className: "h-20 animate-pulse rounded-[18px] bg-white/70",
                }),
              ),
            )
          : chapters.length
            ? React.createElement(
                "div",
                { className: "space-y-3 sm:space-y-4" },
                React.createElement(
                  "button",
                  {
                    onClick: () =>
                      onNavigate("content", {
                        batch: String(batch),
                        subject: String(subject),
                        chapter: "__unassigned__",
                      }),
                    className:
                      "flex min-h-[102px] w-full items-center rounded-[18px] border border-indigo-200 bg-gradient-to-br from-indigo-600 to-violet-700 px-5 py-4 text-left shadow-[0_8px_18px_rgba(79,70,229,0.16)] active:scale-[0.98] sm:min-h-[112px]",
                  },
                  React.createElement(
                    "span",
                    { className: "min-w-0 flex-1" },
                    React.createElement(
                      "span",
                      {
                        className:
                          "inline-flex rounded-md bg-white/15 px-2.5 py-1 text-[10px] font-black tracking-wide text-white",
                      },
                      "ALL CLASSES",
                    ),
                    React.createElement(
                      "span",
                      {
                        className:
                          "mt-2 block text-[19px] font-black text-white sm:text-[21px]",
                      },
                      "Ungrouped Classes",
                    ),
                    React.createElement(
                      "span",
                      {
                        className:
                          "mt-1.5 block text-[13px] font-medium text-white/85",
                      },
                      unassignedCount,
                      " items not added to a chapter",
                    ),
                  ),
                  React.createElement(
                    "span",
                    { className: "ml-3 text-xl text-white/90" },
                    React.createElement("i", {
                      className: "fas fa-chevron-right",
                    }),
                  ),
                ),
                chapters.map((item, i) =>
                  React.createElement(
                    "button",
                    {
                      key: `${item.name}-${i}`,
                      onClick: () =>
                        onNavigate("content", {
                          batch: String(batch),
                          subject: String(subject),
                          chapter: item.name,
                        }),
                      className:
                        "flex min-h-[118px] w-full items-center rounded-[18px] border border-slate-300 bg-white px-5 py-4 text-left shadow-sm transition-all hover:border-indigo-400 active:scale-[0.98] sm:min-h-[130px]",
                    },
                    React.createElement(
                      "span",
                      { className: "min-w-0 flex-1" },
                      React.createElement(
                        "span",
                        {
                          className:
                            "inline-flex rounded-md bg-indigo-50 px-2.5 py-1 text-[10px] font-black tracking-wide text-slate-700",
                        },
                        "CH \u2013 ",
                        String(i + 1).padStart(2, "0"),
                      ),
                      React.createElement(
                        "span",
                        {
                          className:
                            "mt-3 block break-words text-[19px] font-black leading-tight text-slate-800 sm:text-[21px]",
                        },
                        item.name,
                      ),
                      React.createElement(
                        "span",
                        {
                          className:
                            "mt-2 block text-[14px] font-medium text-slate-700",
                        },
                        "Lectures: ",
                        item.lectures || 0,
                        item.dpp > 0 &&
                          React.createElement(
                            React.Fragment,
                            null,
                            React.createElement(
                              "span",
                              { className: "mx-2 text-slate-300" },
                              "|",
                            ),
                            " DPP & Notes: ",
                            item.dpp,
                          ),
                      ),
                    ),
                    React.createElement(
                      "span",
                      { className: "ml-3 text-lg text-slate-500" },
                      React.createElement("i", {
                        className: "fas fa-chevron-right",
                      }),
                    ),
                  ),
                ),
              )
            : React.createElement(
                "div",
                {
                  className:
                    "rounded-[18px] border border-dashed border-slate-200 bg-white/65 p-8 text-center text-sm font-bold text-slate-500",
                },
                "No chapters yet. Admin will add them from the bot.",
              ),
    );
  };
  window.SocialsScreen = ({ botUsername }) => {
    const { openExternalLink } = window;
    const posterLink = (window.APP_CONFIG && window.APP_CONFIG.telegramChannelUrl) || "https://t.me/RGVerseOfficial";
    const list = [
      {
        name: "Next Topper",
        desc: "App & Web",
        image: "/static/images/remote/I0EmT.jpg",
        link: "https://nt-akkistudyx.vercel.app/",
      },
      {
        name: "PW",
        desc: "App & Web",
        image: "/static/images/remote/6kl7K.jpg",
        link: "https://akkistudyxpro-44094a367971.herokuapp.com/app",
      },
      {
        name: "YouTube",
        desc: "Video Lectures",
        image: "/static/images/remote/s5B6h.jpg",
        link: "https://www.youtube.com/@RGVerse",
      },
      {
        name: "WhatsApp",
        desc: "Official Channel",
        image: "/static/images/remote/9eIrB.jpg",
        link: "https://whatsapp.com/channel/0029Vb679UN9MF8swZIMLd40",
      },
      {
        name: "Telegram",
        desc: "Free Materials",
        image: "/static/images/remote/m9k6R.jpg",
        link: "https://t.me/RGVerseOfficial",
      },
      {
        name: "Instagram",
        desc: "Updates & Reels",
        image: "/static/images/remote/CpqFL.jpg",
        link: "https://www.instagram.com/rgverse_official",
      },
      {
        name: "AnimeSpeaks",
        desc: "Watch Animes",
        image: "/static/images/remote/bfpie.jpg",
        link: "https://t.me/RGVerseOfficial",
      },
    ];
    return React.createElement(
      "div",
      {
        className: "fade-in min-h-screen p-5",
        style: { paddingBottom: "2rem" },
      },
      React.createElement(
        "div",
        {
          className:
            "mb-5 flex items-center rounded-[22px] border border-white/70 bg-white/35 px-4 py-3 shadow-sm backdrop-blur-md",
        },
        React.createElement(
          "div",
          {
            className:
              "mr-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md",
          },
          React.createElement("i", { className: "fas fa-users text-sm" }),
        ),
        React.createElement(
          "div",
          null,
          React.createElement(
            "h2",
            {
              className:
                "text-[17px] font-black uppercase tracking-wide text-slate-800",
            },
            "Our Socials",
          ),
          React.createElement(
            "p",
            {
              className:
                "text-[10px] font-bold uppercase tracking-widest text-slate-600",
            },
            ("Join the " + ((window.APP_CONFIG && window.APP_CONFIG.appFullName) || "RG Verse") + " community"),
          ),
        ),
      ),
      React.createElement(
        "div",
        {
          onClick: () => openExternalLink(posterLink),
          className:
            "mb-5 cursor-pointer overflow-hidden rounded-[22px] border border-white/70 bg-white shadow-md active:scale-[0.98] transition-transform",
        },
        React.createElement("img", {
          src: ((window.APP_CONFIG && window.APP_CONFIG.brandLogo) || "/static/brand-logo.webp"),
          alt: ((window.APP_CONFIG && window.APP_CONFIG.appName) || "RG VERSE"),
          className: "h-[155px] w-full bg-slate-900 object-contain",
        }),
      ),
      React.createElement(
        "div",
        {
          className:
            "mx-auto grid w-full max-w-[440px] grid-cols-2 gap-3 sm:max-w-none sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4",
        },
        list.map((social, i) =>
          React.createElement(
            "div",
            {
              key: i,
              onClick: () => openExternalLink(social.link),
              className:
                "relative h-[190px] sm:h-[270px] cursor-pointer overflow-hidden rounded-[28px] border-2 border-white/80 bg-gradient-to-br from-[#b9d8ff] via-[#9ec9ff] to-[#79a4ed] p-2.5 shadow-[0_12px_26px_rgba(71,105,170,0.28)] active:scale-[0.97] transition-transform slide-up",
            },
            React.createElement("div", {
              className:
                "absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/20",
            }),
            React.createElement("div", {
              className:
                "absolute -bottom-8 -left-8 h-20 w-20 rounded-full bg-indigo-400/20",
            }),
            React.createElement(
              "div",
              {
                className:
                  "relative z-10 mx-auto h-[118px] w-[118px] sm:h-[190px] sm:w-[190px] overflow-hidden rounded-full p-[4px] shadow-[0_0_20px_rgba(236,72,153,0.55)]",
              },
              React.createElement("div", {
                className: "absolute animate-spin",
                style: {
                  inset: "-50%",
                  background:
                    "conic-gradient(#ff2d92, #a855f7, #22d3ee, #facc15, #fb7185, #ff2d92)",
                  animationDuration: "4s",
                },
              }),
              React.createElement(
                "div",
                {
                  className:
                    "relative h-full w-full overflow-hidden rounded-full bg-white p-[2px]",
                },
                React.createElement("img", {
                  src: social.image,
                  alt: social.name,
                  className: "h-full w-full rounded-full object-cover",
                }),
              ),
            ),
            React.createElement(
              "div",
              {
                className:
                  "absolute inset-x-3 bottom-3 z-10 rounded-xl bg-slate-900/70 px-2 py-2.5 text-center shadow-lg backdrop-blur-sm",
              },
              React.createElement(
                "h3",
                { className: "truncate text-[15px] font-extrabold text-white" },
                social.name,
              ),
              React.createElement(
                "p",
                {
                  className:
                    "mt-0.5 truncate text-[9px] font-bold uppercase tracking-wide text-white/75",
                },
                social.desc,
              ),
            ),
          ),
        ),
      ),
    );
  };
})();
