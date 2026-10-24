(() => {
  const { useState, useEffect, useRef, useMemo, Component } = window.React;
  const sxIsDocument = (file = {}) => {
    const name = String(file.file_name || file.title || "").toLowerCase();
    const url = String(file.url || "");
    if (/\.pdf(?:$|[?#])/i.test(name) || /\.pdf(?:$|[?#])/i.test(url))
      return true;
    if (
      file.file_type === "video" ||
      /\.(mp4|mkv|webm|mov)(?:$|[?#\s])/i.test(name + " " + url)
    )
      return false;
    return (
      file.file_type === "document" ||
      file.file_type === "pdf" ||
      file.is_pdf === true ||
      /\b(notes?|dpp(?!\s*(solution|sol))|worksheet|assignment)\b/i.test(name)
    );
  };
  const sxDocumentLink = (res) => {
    const raw = res.download_link || res.watch_link;
    if (!raw) throw new Error("Document link missing");
    const url = new URL(raw, SERVER_URL.replace(/\/$/, "") + "/");
    if (!/^https?:$/.test(url.protocol))
      throw new Error("Invalid document URL");
    if (url.pathname.startsWith("/watch/"))
      url.pathname = url.pathname.replace("/watch/", "/dl/");
    return url.href;
  };
  const sxWebDocumentLink = (res, title) => {
    const watch = new URL(
      res.watch_link || sxDocumentLink(res),
      SERVER_URL.replace(/\/$/, "") + "/",
    );
    if (watch.pathname === "/watch_pdf_ext") return watch.href;
    const source = sxDocumentLink(res);
    const viewer = new URL("/pdf/view", SERVER_URL);
    viewer.searchParams.set("src", source);
    viewer.searchParams.set("name", title || "Study document");
    return viewer.href;
  };
  const saveTutorialLink = (res) => {
    if (res && res.tutorial_link) {
      localStorage.setItem("akki_tutorial_link", res.tutorial_link);
    }
  };
  class ErrorBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, errorMsg: "" };
    }
    static getDerivedStateFromError(error) {
      return { hasError: true, errorMsg: error.toString() };
    }
    render() {
      if (this.state.hasError)
        return React.createElement(
          "div",
          {
            className:
              "flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] px-6 text-center",
          },
          React.createElement("i", {
            className: "fas fa-bug text-rose-500 text-5xl mb-4",
          }),
          React.createElement(
            "h2",
            { className: "text-xl font-bold text-slate-800 mb-2" },
            "System Error!",
          ),
          React.createElement(
            "p",
            {
              className:
                "text-xs text-rose-500 bg-rose-50 p-4 rounded-lg w-full overflow-auto text-left",
            },
            this.state.errorMsg,
          ),
          React.createElement(
            "button",
            {
              onClick: () => window.history.back(),
              className:
                "mt-6 bg-slate-800 text-white px-6 py-2 rounded-xl font-bold",
            },
            "Go Back",
          ),
        );
      return this.props.children;
    }
  }
  const SkeletonLoader = () =>
    React.createElement(
      "div",
      { className: "px-4 space-y-4 mt-4 w-full" },
      [1, 2, 3, 4, 5].map((i) =>
        React.createElement(
          "div",
          {
            key: i,
            className:
              "bg-white rounded-[1.25rem] border border-slate-100 shadow-sm p-4 pt-5 pb-4 animate-pulse relative overflow-hidden",
          },
          React.createElement("div", {
            className: "absolute top-0 left-0 w-full h-1.5 bg-slate-200",
          }),
          React.createElement(
            "div",
            { className: "flex items-start gap-4 mb-4" },
            React.createElement("div", {
              className: "w-14 h-14 bg-slate-200 rounded-[14px] shrink-0",
            }),
            React.createElement(
              "div",
              { className: "flex-1 space-y-3 py-1.5" },
              React.createElement(
                "div",
                { className: "flex justify-between" },
                React.createElement("div", {
                  className: "h-2.5 bg-slate-200 rounded-full w-20",
                }),
                React.createElement("div", {
                  className: "h-3 w-3 bg-slate-200 rounded-full",
                }),
              ),
              React.createElement("div", {
                className: "h-3.5 bg-slate-200 rounded-full w-3/4",
              }),
              React.createElement("div", {
                className: "h-2.5 bg-slate-200 rounded-full w-1/3",
              }),
            ),
          ),
          React.createElement(
            "div",
            { className: "flex items-center gap-2.5" },
            React.createElement("div", {
              className:
                "w-[44px] h-[44px] bg-slate-200 rounded-[14px] shrink-0",
            }),
            React.createElement("div", {
              className:
                "w-[44px] h-[44px] bg-slate-200 rounded-[14px] shrink-0",
            }),
            React.createElement("div", {
              className: "flex-1 h-[44px] bg-slate-200 rounded-[14px]",
            }),
            React.createElement("div", {
              className: "flex-1 h-[44px] bg-slate-200 rounded-[14px]",
            }),
          ),
        ),
      ),
    );
  const getTabIcon = (id) => {
    if (id === "lectures") return "fa-play-circle";
    if (id === "notes") return "fa-file-pdf";
    if (id === "dpp") return "fa-clipboard-list";
    if (id === "dpp-sol") return "fa-video";
    return "fa-layer-group";
  };
  const useVideoPins = (batch, subject) => {
    const storageKey = `akki_video_pins_${String(batch)}_${String(subject)}`;
    const [pinnedVideos, setPinnedVideos] = useState(() => {
      try {
        return JSON.parse(localStorage.getItem(storageKey) || "[]");
      } catch (e) {
        return [];
      }
    });
    const cardRefs = useRef({});
    useEffect(() => {
      localStorage.setItem(storageKey, JSON.stringify(pinnedVideos));
    }, [storageKey, pinnedVideos]);
    const getId = (file) =>
      String(
        (file == null ? void 0 : file.unique_id) ||
          (file == null ? void 0 : file.message_id) ||
          (file == null ? void 0 : file.file_name) ||
          "",
      );
    const isPinned = (file) =>
      pinnedVideos.some((item) => item.id === getId(file));
    const togglePin = (file, title) => {
      const id = getId(file);
      if (!id) return;
      setPinnedVideos((previous) =>
        previous.some((item) => item.id === id)
          ? previous.filter((item) => item.id !== id)
          : [
              ...previous,
              { id, title: String(title || file.file_name || "Pinned video") },
            ],
      );
    };
    const scrollToPin = (pin) => {
      const element = cardRefs.current[pin.id];
      if (element)
        element.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    const setCardRef = (file, element) => {
      const id = getId(file);
      if (id && element) cardRefs.current[id] = element;
    };
    return { pinnedVideos, isPinned, togglePin, scrollToPin, setCardRef };
  };
  const PinnedVideosMenu = ({ pins, onOpen, onUnpin }) => {
    const [isOpen, setIsOpen] = useState(false);
    if (!pins.length) return null;
    return React.createElement(
      "div",
      { className: "relative shrink-0" },
      React.createElement(
        "button",
        {
          onClick: () => setIsOpen(!isOpen),
          className:
            "flex h-11 w-12 items-center justify-center rounded-[18px] border border-slate-100 bg-white text-[#7d858b] shadow-sm active:scale-95",
          title: "Pinned videos",
        },
        React.createElement(
          "svg",
          {
            viewBox: "0 0 48 32",
            className: "h-6 w-9",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "3.2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            "aria-hidden": "true",
          },
          React.createElement("path", {
            d: "M10 5l10 2 5 5-4 4 1 8-5 3-6-8-5-1 4-4-3-5 3-4z",
          }),
          React.createElement("path", { d: "M28 9h13M28 16h13M28 23h13" }),
        ),
      ),
      isOpen &&
        React.createElement(
          "div",
          {
            className:
              "absolute right-0 top-11 z-[80] w-[min(19rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-[0_18px_40px_rgba(120,53,15,0.22)]",
          },
          React.createElement(
            "div",
            {
              className:
                "flex items-center justify-between border-b border-amber-100 bg-amber-50 px-3 py-2.5",
            },
            React.createElement(
              "p",
              {
                className:
                  "text-[10px] font-black uppercase tracking-widest text-amber-700",
              },
              React.createElement("i", {
                className: "fas fa-thumbtack mr-1.5",
              }),
              "Pinned videos",
            ),
            React.createElement(
              "button",
              { onClick: () => setIsOpen(false), className: "text-slate-400" },
              React.createElement("i", { className: "fas fa-times" }),
            ),
          ),
          React.createElement(
            "div",
            { className: "max-h-64 overflow-y-auto p-2" },
            pins.map((pin) =>
              React.createElement(
                "div",
                {
                  key: pin.id,
                  className:
                    "mb-1 flex items-center rounded-xl bg-slate-50 last:mb-0",
                },
                React.createElement(
                  "button",
                  {
                    onClick: () => {
                      onOpen(pin);
                      setIsOpen(false);
                    },
                    className:
                      "min-w-0 flex-1 px-3 py-3 text-left active:scale-[0.98]",
                  },
                  React.createElement(
                    "p",
                    {
                      className:
                        "truncate text-[12px] font-extrabold text-slate-700",
                    },
                    React.createElement("i", {
                      className: "fas fa-play-circle mr-1.5 text-amber-500",
                    }),
                    pin.title,
                  ),
                ),
                React.createElement(
                  "button",
                  {
                    onClick: () => onUnpin(pin),
                    className:
                      "mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-rose-400 shadow-sm active:scale-95",
                    title: "Unpin",
                  },
                  React.createElement("i", { className: "fas fa-thumbtack" }),
                ),
              ),
            ),
          ),
        ),
    );
  };
  const PinnedVideosBar = ({ pins, onOpen, onUnpin }) => {
    if (!pins.length) return null;
    return React.createElement(
      "div",
      {
        className:
          "mx-4 mt-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-2 shadow-sm",
      },
      React.createElement(
        "div",
        { className: "mb-1.5 flex items-center justify-between gap-2 px-1" },
        React.createElement(
          "div",
          { className: "flex items-center gap-2" },
          React.createElement(
            "div",
            {
              className:
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-400 text-white shadow-sm",
            },
            React.createElement("i", { className: "fas fa-thumbtack text-xs" }),
          ),
          React.createElement(
            "p",
            {
              className:
                "text-[9px] font-black uppercase tracking-widest text-amber-600",
            },
            "Pinned videos (",
            pins.length,
            ")",
          ),
        ),
        React.createElement(PinnedVideosMenu, { pins, onOpen, onUnpin }),
      ),
      React.createElement(
        "div",
        { className: "flex gap-2 overflow-x-auto pb-1 no-scrollbar" },
        pins.map((pin) =>
          React.createElement(
            "div",
            {
              key: pin.id,
              className:
                "flex min-w-[210px] max-w-[260px] items-center rounded-xl border border-amber-100 bg-white/90 shadow-sm",
            },
            React.createElement(
              "button",
              {
                onClick: () => onOpen(pin),
                className:
                  "min-w-0 flex-1 px-3 py-2.5 text-left active:scale-[0.98]",
              },
              React.createElement(
                "p",
                {
                  className:
                    "truncate text-[11px] font-extrabold text-slate-700",
                },
                React.createElement("i", {
                  className: "fas fa-play-circle mr-1.5 text-amber-500",
                }),
                pin.title,
              ),
            ),
            React.createElement(
              "button",
              {
                onClick: () => onUnpin(pin),
                className:
                  "mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 active:scale-95",
                title: "Unpin",
              },
              React.createElement("i", { className: "fas fa-times" }),
            ),
          ),
        ),
      ),
    );
  };
  const KgsView = ({
    batch,
    subject,
    chapter,
    virtualId,
    botUsername,
    setBotUsername,
    isVerifying,
    setIsVerifying,
    setLoadingMsg,
  }) => {
    const {
      SERVER_URL: SERVER_URL2,
      DataManager,
      openExternalLink,
      showAppAlert,
    } = window;
    const stateTabKey = `kgs_tab_${batch}_${subject}`;
    const [activeTab, setActiveTab] = useState(
      () => sessionStorage.getItem(stateTabKey) || "lectures",
    );
    const [filterStatus, setFilterStatus] = useState("all");
    const apiUrl = `${SERVER_URL2}/api/files?batch=${encodeURIComponent(batch)}&subject=${encodeURIComponent(subject)}${chapter ? `&chapter=${encodeURIComponent(chapter)}` : ""}`;
    const [serverData, setServerData] = useState(() => {
      const cachedRes = DataManager.getCache(apiUrl);
      return cachedRes && cachedRes.success && Array.isArray(cachedRes.data)
        ? DataManager.processFiles(cachedRes.data)
        : [];
    });
    const [isLoading, setIsLoading] = useState(() => !serverData.length);
    const [appPromo, setAppPromo] = useState(false);
    const [downloadingStatus, setDownloadingStatus] = useState({});
    const [telegramStatus, setTelegramStatus] = useState({});
    const [tokenModal, setTokenModal] = useState({
      show: false,
      file: null,
      action: null,
    });
    const [tokenInput, setTokenInput] = useState("");
    const [tokenError, setTokenError] = useState("");
    const [fetchTrigger, setFetchTrigger] = useState(0);
    const [tutorialLink, setTutorialLink] = useState(
      () => localStorage.getItem("akki_tutorial_link") || "",
    );
    const [isUnverified, setIsUnverified] = useState(false);
    const [lockedStats, setLockedStats] = useState(null);
    useEffect(() => {
      if (tokenModal.show) {
        setTutorialLink(localStorage.getItem("akki_tutorial_link") || "");
      }
    }, [tokenModal.show]);
    const touchStateRef = useRef({ startX: 0, startY: 0 });
    const [xp, setXp] = useState(() =>
      parseInt(localStorage.getItem("akki_xp") || "30"),
    );
    const [watchedMap, setWatchedMap] = useState(() =>
      JSON.parse(localStorage.getItem("akki_watched") || "{}"),
    );
    const videoPins = useVideoPins(batch, subject);
    const handleGetToken = async () => {
      if (!virtualId) {
        setTokenError("Device ID not ready.");
        return;
      }
      if (typeof setLoadingMsg === "function")
        setLoadingMsg("Generating Link...");
      if (typeof setIsVerifying === "function") setIsVerifying(true);
      try {
        const params = new URLSearchParams({
          u: String(virtualId),
          bot: String(botUsername || ""),
          _t: String(Date.now()),
        });
        const res = await fetch(
          `${SERVER_URL2}/api/get_token_link?${params}`,
        ).then((r) => r.json());
        saveTutorialLink(res);
        if (res.success) {
          openExternalLink(res.short_url);
          setTokenError("Link opened! Complete it.");
        } else {
          setTokenError(res.error || "Failed to generate link.");
        }
      } catch (e) {
        setTokenError("Network error.");
      }
      if (typeof setIsVerifying === "function") setIsVerifying(false);
    };
    const handleSubmitToken = async () => {
      const cleanToken = tokenInput.trim().toUpperCase();
      if (!cleanToken) {
        setTokenError("Please enter a token!");
        return;
      }
      if (typeof setLoadingMsg === "function")
        setLoadingMsg("Verifying Token...");
      if (typeof setIsVerifying === "function") setIsVerifying(true);
      try {
        const params = new URLSearchParams({
          u: String(virtualId),
          t: cleanToken,
          _t: String(Date.now()),
        });
        const res = await fetch(
          `${SERVER_URL2}/api/verify_token_input?${params}`,
        ).then((r) => r.json());
        if (res.success) {
          const retryAction = tokenModal.action;
          const retryFile = tokenModal.file;
          localStorage.setItem("akki_verified_token", cleanToken);
          setIsUnverified(false);
          setLockedStats(null);
          setTokenModal({ show: false, file: null, action: null });
          setTokenInput("");
          setTokenError("");
          if (typeof setIsVerifying === "function") setIsVerifying(false);
          setTimeout(() => {
            showAppAlert("\u2705 Verified Successfully!", () => {
              if (retryAction === "telegram_retry") {
                handleTelegramClick(retryFile);
              } else if (retryAction === "subject_load") {
                setFetchTrigger((prev) => prev + 1);
              } else {
                handleActionClick(retryAction, retryFile);
              }
            });
          }, 300);
        } else {
          setTokenError(res.error || "Invalid Token!");
          if (typeof setIsVerifying === "function") setIsVerifying(false);
        }
      } catch (e) {
        setTokenError("Network error.");
        if (typeof setIsVerifying === "function") setIsVerifying(false);
      }
    };
    useEffect(() => {
      let isMounted = true;
      setIsLoading(true);
      const storedToken = localStorage.getItem("akki_verified_token") || "";
      const activeId = localStorage.getItem("akki_premium_uid") || virtualId;
      DataManager.fetch(
        `${apiUrl}&u=${activeId}&t=${storedToken}&device_id=${virtualId}&_t=${Date.now()}`,
      )
        .then((res) => {
          saveTutorialLink(res);
          if ((res == null ? void 0 : res.success) && isMounted) {
            const needsVerification =
              (res == null ? void 0 : res.needs_verification) === true;
            setIsUnverified(needsVerification);
            setServerData(DataManager.processFiles(res.data));
          }
          if (isMounted) setIsLoading(false);
        })
        .catch(() => {
          if (isMounted) setIsLoading(false);
        });
      return () => {
        isMounted = false;
      };
    }, [apiUrl, fetchTrigger, virtualId]);
    useEffect(() => {
      sessionStorage.setItem(stateTabKey, activeTab);
    }, [activeTab]);
    useEffect(() => {
      if (!isLoading) {
        const savedPosition = sessionStorage.getItem("contentScrollPosition");
        if (savedPosition) {
          setTimeout(() => {
            window.scrollTo({
              top: parseInt(savedPosition, 10),
              behavior: "auto",
            });
            sessionStorage.removeItem("contentScrollPosition");
          }, 150);
        }
      }
    }, [isLoading]);
    const { groupedLectures, standaloneNotes, stats } = useMemo(() => {
      const nameMap = {};
      let vCount = 0;
      let nCount = 0;
      serverData.forEach((item, index) => {
        const cleanName = String(item.file_name).trim();
        const isVideo =
          item.file_type === "video" || /\.(mp4|m3u8|mpd)$/i.test(cleanName);
        const preserveUploadOrder = item.upload_sequence === true;
        const origIndex = preserveUploadOrder
          ? index
          : item.txt_index !== void 0
            ? item.txt_index
            : index;
        if (!nameMap[cleanName])
          nameMap[cleanName] = {
            name: cleanName,
            video: null,
            pdf: null,
            originalIndex: origIndex,
            preserveUploadOrder,
          };
        if (isVideo && !nameMap[cleanName].video) {
          nameMap[cleanName].video = item;
          vCount++;
        } else if (!isVideo && !nameMap[cleanName].pdf) {
          nameMap[cleanName].pdf = item;
          nCount++;
        }
      });
      const allGroups = Object.values(nameMap)
        .filter((g) => g.video)
        .sort((a, b) => {
          if (a.preserveUploadOrder || b.preserveUploadOrder)
            return a.originalIndex - b.originalIndex;
          return b.originalIndex - a.originalIndex;
        });
      const allNotes = Object.values(nameMap)
        .filter((g) => !g.video && g.pdf)
        .map((g) => g.pdf)
        .sort((a, b) => {
          if (a.upload_sequence || b.upload_sequence)
            return serverData.indexOf(a) - serverData.indexOf(b);
          return (b.txt_index || -1) - (a.txt_index || -1);
        });
      return {
        groupedLectures: allGroups,
        standaloneNotes: allNotes,
        stats: { v: vCount, n: nCount },
      };
    }, [serverData]);
    const availableTabs = useMemo(() => {
      const tabs = [];
      if (groupedLectures.length > 0)
        tabs.push({ id: "lectures", label: "Lectures" });
      if (standaloneNotes.length > 0)
        tabs.push({ id: "notes", label: "Study Material" });
      return tabs;
    }, [groupedLectures, standaloneNotes]);
    const displayLectures = useMemo(() => {
      return groupedLectures.filter((group) => {
        var _a;
        const isWatched =
          watchedMap[(_a = group.video) == null ? void 0 : _a.unique_id] ===
          true;
        if (filterStatus === "all") return true;
        return filterStatus === "pending" ? !isWatched : isWatched;
      });
    }, [groupedLectures, filterStatus, watchedMap]);
    const handleTelegramClick = async (file) => {
      var _a, _b;
      if (!file) return;
      setTelegramStatus((prev) => ({ ...prev, [file.unique_id]: true }));
      try {
        const storedToken = localStorage.getItem("akki_verified_token") || "";
        const activeId = localStorage.getItem("akki_premium_uid") || virtualId;
        const params = new URLSearchParams({
          u: String(activeId),
          device_id: String(virtualId),
          c: String(file.channel_id ?? "0"),
          m: String(file.message_id ?? "0"),
          uid: String(file.unique_id ?? ""),
          t: storedToken,
          bot: String(botUsername || ""),
          _t: String(Date.now()),
        });
        const res = await fetch(
          `${SERVER_URL2}/api/generate_link?${params}`,
        ).then((r) => r.json());
        saveTutorialLink(res);
        if (res.active_bot && res.active_bot !== botUsername) {
          if (typeof setBotUsername === "function")
            setBotUsername(res.active_bot);
          localStorage.setItem("akki_bot_username", res.active_bot);
        }
        if (res.needs_verification) {
          if (typeof setIsVerifying === "function") setIsVerifying(false);
          setTokenModal({ show: true, file, action: "telegram_retry" });
          return;
        }
        if (!res.tg_link) {
          showAppAlert(
            "\u26A0\uFE0F Yeh direct server link hai, Telegram par available nahi hai.",
          );
        } else {
          if (
            ((_a = window.tg) == null ? void 0 : _a.openTelegramLink) &&
            res.tg_link.includes("t.me")
          ) {
            window.tg.openTelegramLink(res.tg_link);
            setTimeout(() => {
              if (window.tg.close) window.tg.close();
            }, 800);
          } else {
            openExternalLink(res.tg_link);
          }
        }
      } catch (e) {
        let targetBot =
          localStorage.getItem("akki_bot_username") ||
          botUsername ||
          ((window.APP_CONFIG && window.APP_CONFIG.fallbackBot) || "RGVerseBot");
        let fbLink = `https://t.me/${targetBot.replace("@", "")}?start=${file.unique_id}`;
        if ((_b = window.tg) == null ? void 0 : _b.openTelegramLink) {
          window.tg.openTelegramLink(fbLink);
          setTimeout(() => {
            if (window.tg.close) window.tg.close();
          }, 800);
        } else {
          openExternalLink(fbLink);
        }
      } finally {
        setTelegramStatus((prev) => ({ ...prev, [file.unique_id]: false }));
      }
    };
    useEffect(() => {
      window.fetchAndShowAttachment = async (uniqueId) => {
        try {
          let targetFile = serverData.find(
            (f) => String(f.unique_id) === String(uniqueId),
          );
          if (!targetFile) {
            for (let g of groupedLectures) {
              if (g.pdf && String(g.pdf.unique_id) === String(uniqueId)) {
                targetFile = g.pdf;
                break;
              }
              if (g.video && String(g.video.unique_id) === String(uniqueId)) {
                targetFile = g.video;
                break;
              }
            }
          }
          if (!targetFile) throw new Error("File not found");
          const storedToken = localStorage.getItem("akki_verified_token") || "";
          const activeId =
            localStorage.getItem("akki_premium_uid") || virtualId;
          const params = new URLSearchParams({
            u: String(activeId),
            device_id: String(virtualId),
            c: String(targetFile.channel_id ?? "0"),
            m: String(targetFile.message_id ?? "0"),
            uid: String(targetFile.unique_id ?? ""),
            t: storedToken,
            bot: String(botUsername || ""),
            _t: String(Date.now()),
          });
          const res = await fetch(
            `${SERVER_URL2}/api/generate_link?${params}`,
          ).then((r) => r.json());
          if (res.success) {
            const fullUrl = sxDocumentLink(res);
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  action: "open_split_pdf",
                  url: fullUrl,
                  is_pdf: true,
                }),
              );
            }
          } else {
            if (window.ReactNativeWebView)
              window.ReactNativeWebView.postMessage(
                JSON.stringify({ action: "stop_loaders" }),
              );
            showAppAlert(res.error || "Failed to load attachment");
          }
        } catch (e) {
          if (window.ReactNativeWebView)
            window.ReactNativeWebView.postMessage(
              JSON.stringify({ action: "stop_loaders" }),
            );
          showAppAlert("Failed to load attachment");
        }
      };
    }, [serverData, groupedLectures, virtualId, botUsername]);
    const mediaActionRef = useRef(false);
    const handleActionClick = async (actionType, file, displayTitle = null) => {
      var _a;
      if (!file || mediaActionRef.current) return;
      sessionStorage.setItem("contentScrollPosition", window.scrollY);
      if (actionType === "download") {
        if (!window.ReactNativeWebView) {
          setAppPromo(true);
          return;
        }
        setDownloadingStatus((prev) => ({ ...prev, [file.unique_id]: true }));
        setTimeout(
          () =>
            setDownloadingStatus((prev) => ({
              ...prev,
              [file.unique_id]: false,
            })),
          3500,
        );
      }
      mediaActionRef.current = true;
      if (typeof setLoadingMsg === "function")
        setLoadingMsg(
          actionType === "download"
            ? "Generating Secure Link..."
            : "Opening Media...",
        );
      if (typeof setIsVerifying === "function") setIsVerifying(true);
      try {
        if (!virtualId) {
          if (typeof setIsVerifying === "function") setIsVerifying(false);
          showAppAlert("Identifying device... Please try again.");
          return;
        }
        const storedToken = localStorage.getItem("akki_verified_token") || "";
        const activeId = localStorage.getItem("akki_premium_uid") || virtualId;
        const params = new URLSearchParams({
          u: String(activeId),
          device_id: String(virtualId),
          c: String(file.channel_id ?? "0"),
          m: String(file.message_id ?? "0"),
          uid: String(file.unique_id ?? ""),
          t: storedToken,
          bot: String(botUsername || ""),
          _t: String(Date.now()),
        });
        const res = await fetch(
          `${SERVER_URL2}/api/generate_link?${params}`,
        ).then((r) => r.json());
        saveTutorialLink(res);
        if (res.active_bot && res.active_bot !== botUsername) {
          if (typeof setBotUsername === "function")
            setBotUsername(res.active_bot);
          localStorage.setItem("akki_bot_username", res.active_bot);
        }
        if (res.needs_verification) {
          if (typeof setIsVerifying === "function") setIsVerifying(false);
          setTokenModal({ show: true, file, action: actionType });
          return;
        }
        if (res.success) {
          if (actionType === "split_pdf") {
            if (typeof setIsVerifying === "function") setIsVerifying(false);
            const fullUrl = sxDocumentLink(res);
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  action: "open_split_pdf",
                  url: fullUrl,
                  is_pdf: true,
                }),
              );
            }
            return;
          }
          if (
            actionType === "watch" &&
            file.unique_id &&
            (file.file_type === "video" ||
              ((_a = file.url) == null ? void 0 : _a.includes("youtube")))
          ) {
            const newWatchedMap = { ...watchedMap, [file.unique_id]: true };
            setWatchedMap(newWatchedMap);
            localStorage.setItem("akki_watched", JSON.stringify(newWatchedMap));
            const newXp = xp + 30;
            setXp(newXp);
            localStorage.setItem("akki_xp", newXp.toString());
          }
          localStorage.setItem(
            "akki_last_watched",
            JSON.stringify({
              file_name: file.file_name,
              channel_id: file.channel_id,
              message_id: file.message_id,
              subject,
              batch,
            }),
          );
          if (actionType === "download") {
            if (typeof setIsVerifying === "function") setIsVerifying(false);
            const dlLink = res.download_link || res.watch_link;
            const fullUrl = String(dlLink).startsWith("http")
              ? dlLink
              : window.location.origin + dlLink;
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  action: "download_video",
                  url: encodeURI(fullUrl),
                  fileName: file.file_name || "File",
                  is_pdf: sxIsDocument(file),
                }),
              );
            }
            return;
          }
          if (typeof setIsVerifying === "function") setIsVerifying(false);
          if (actionType === "watch" && sxIsDocument(file)) {
            const url = sxDocumentLink(res);
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  action: "open_pdf",
                  url,
                  fileName: file.file_name,
                  is_pdf: true,
                }),
              );
            } else
              window.location.href = sxWebDocumentLink(res, file.file_name);
            return;
          }
          (() => {
            let watchUrl = res.watch_link || res.download_link;
            let directVideoUrl = res.download_link || res.watch_link;
            const fullWatchUrl = String(watchUrl).startsWith("http")
              ? watchUrl
              : window.location.origin + watchUrl;
            const fullDirectUrl = String(directVideoUrl).startsWith("http")
              ? directVideoUrl
              : window.location.origin + directVideoUrl;
            const fileNameLower = String(file.file_name || "").toLowerCase();
            const urlToCheck = String(
              fullWatchUrl + " " + fullDirectUrl + " " + (file.url || ""),
            ).toLowerCase();
            const isExternalFallback =
              file.external_fallback === true && Boolean(file.url);
            const isRawPdf =
              file.file_type === "document" ||
              fileNameLower.endsWith(".pdf") ||
              urlToCheck.includes(".pdf");
            const isYouTube =
              urlToCheck.includes("youtube.com") ||
              urlToCheck.includes("youtu.be");
            const isM3U8 =
              urlToCheck.includes(".m3u8") || fileNameLower.includes(".m3u8");
            const hasVideoExt =
              fileNameLower.endsWith(".mp4") ||
              fileNameLower.endsWith(".mkv") ||
              urlToCheck.includes(".mp4") ||
              urlToCheck.includes(".mkv");
            const isNativeVideo =
              (file.file_type === "video" || hasVideoExt) &&
              !isRawPdf &&
              !isYouTube &&
              !isM3U8 &&
              !isExternalFallback;
            if (
              window.ReactNativeWebView &&
              actionType === "watch" &&
              !isRawPdf
            ) {
              const playlistData = groupedLectures
                .filter((g) => g.video)
                .map((group) => {
                  let itemUrl =
                    group.video.download_link ||
                    group.video.watch_link ||
                    group.video.url ||
                    "";
                  if (itemUrl && !itemUrl.startsWith("http"))
                    itemUrl = window.location.origin + itemUrl;
                  let atts = [];
                  if (group.pdf) {
                    atts.push({
                      title: "Class Notes",
                      id: group.pdf.unique_id,
                      isVideo: false,
                      isExplicitPdf: true,
                    });
                  }
                  return {
                    title: group.name,
                    id: group.video.unique_id,
                    url: encodeURI(itemUrl),
                    attachments: atts,
                  };
                });
              let targetUrl = isNativeVideo ? fullDirectUrl : fullWatchUrl;
              if (!isNativeVideo && !isYouTube) {
                targetUrl +=
                  (targetUrl.includes("?") ? "&" : "?") +
                  "in_app=true&hide_header=true";
              }
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  action: "play_stream",
                  url: encodeURI(targetUrl),
                  template_url: encodeURI(
                    fullWatchUrl +
                      (fullWatchUrl.includes("?") ? "&" : "?") +
                      "in_app=true&hide_header=true",
                  ),
                  title: displayTitle || file.file_name || "Live Stream",
                  id: file.unique_id,
                  is_native_video: isNativeVideo,
                  is_youtube: isYouTube,
                  playlist: playlistData,
                }),
              );
              return;
            }
            const isBackendViewer =
              String(fullWatchUrl).includes("/watch/") ||
              String(fullWatchUrl).includes("gview") ||
              String(fullWatchUrl).includes("watch_ext");
            let finalWebUrl = fullWatchUrl;
            if (isRawPdf && !isBackendViewer) {
              finalWebUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fullWatchUrl)}`;
            }
            if (window.ReactNativeWebView) {
              finalWebUrl +=
                (finalWebUrl.includes("?") ? "&" : "?") +
                "in_app=true&hide_header=true";
            }
            window.location.href = finalWebUrl;
          })();
          return;
        }
        if (typeof setIsVerifying === "function") setIsVerifying(false);
        showAppAlert(res.error || "Failed to generate media link.");
        if (window.ReactNativeWebView)
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ action: "stop_loaders" }),
          );
      } catch (e) {
        if (typeof setIsVerifying === "function") setIsVerifying(false);
        showAppAlert("Network error, try again.");
        if (window.ReactNativeWebView)
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ action: "stop_loaders" }),
          );
      } finally {
        mediaActionRef.current = false;
      }
    };
    window.appProcessItem = (unique_id, action) => {
      let targetFile = serverData.find(
        (f) => String(f.unique_id) === String(unique_id),
      );
      if (!targetFile) {
        for (let g of groupedLectures) {
          if (g.video && String(g.video.unique_id) === String(unique_id)) {
            targetFile = g.video;
            break;
          }
          if (g.pdf && String(g.pdf.unique_id) === String(unique_id)) {
            targetFile = g.pdf;
            break;
          }
        }
      }
      if (targetFile) {
        const groupMatch = groupedLectures.find(
          (g) =>
            (g.video && g.video.unique_id === targetFile.unique_id) ||
            (g.pdf && g.pdf.unique_id === targetFile.unique_id),
        );
        handleActionClick(
          action,
          targetFile,
          groupMatch ? groupMatch.name : targetFile.file_name,
        );
      } else {
        if (window.ReactNativeWebView)
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ action: "stop_loaders" }),
          );
      }
    };
    const onTouchStart = (e) => {
      touchStateRef.current.startX = e.changedTouches[0].clientX;
      touchStateRef.current.startY = e.changedTouches[0].clientY;
    };
    const onTouchEnd = (e) => {
      var _a, _b;
      const diffX = touchStateRef.current.startX - e.changedTouches[0].clientX;
      const diffY = touchStateRef.current.startY - e.changedTouches[0].clientY;
      if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY)) {
        const currentIndex = availableTabs.findIndex((t) => t.id === activeTab);
        if (currentIndex === -1) return;
        if (diffX > 0 && currentIndex < availableTabs.length - 1) {
          setActiveTab(availableTabs[currentIndex + 1].id);
          if ((_a = window.tg) == null ? void 0 : _a.HapticFeedback)
            window.tg.HapticFeedback.selectionChanged();
        } else if (diffX < 0 && currentIndex > 0) {
          setActiveTab(availableTabs[currentIndex - 1].id);
          if ((_b = window.tg) == null ? void 0 : _b.HapticFeedback)
            window.tg.HapticFeedback.selectionChanged();
        }
      }
    };
    return React.createElement(
      "div",
      {
        className: "fade-in bg-[#f8fafc] min-h-screen relative pb-8",
        onTouchStart,
        onTouchEnd,
      },
      React.createElement(
        "div",
        {
          className:
            "sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm",
        },
        React.createElement(
          "div",
          { className: "flex items-center min-w-0 flex-1" },
          React.createElement(
            "button",
            {
              onClick: () => window.history.back(),
              className: "mr-3 text-slate-800 text-lg",
            },
            React.createElement("i", { className: "fas fa-chevron-left" }),
          ),
          React.createElement(
            "div",
            { className: "flex-1 min-w-0 pr-2" },
            React.createElement(
              "h2",
              {
                className: "font-extrabold text-[16px] text-slate-800 truncate",
              },
              " ",
              String(subject).trim() === "General Subject"
                ? "All Contents"
                : subject,
              " ",
            ),
            React.createElement(
              "p",
              {
                className:
                  "text-[10px] text-emerald-500 font-bold truncate mt-0.5 opacity-90",
              },
              stats.v,
              " Lectures \u2022 ",
              stats.n,
              " PDFs",
            ),
          ),
        ),
        React.createElement(
          "div",
          {
            className:
              "flex items-center bg-slate-100 rounded-full px-3 py-1 shrink-0 border border-slate-200",
          },
          React.createElement(
            "span",
            {
              className: "text-slate-400 font-black text-[10px] mr-1 uppercase",
            },
            "XP",
          ),
          React.createElement(
            "span",
            { className: "font-black text-slate-700 text-[13px]" },
            xp,
          ),
        ),
      ),
      activeTab === "lectures" &&
        React.createElement(PinnedVideosBar, {
          pins: videoPins.pinnedVideos,
          onOpen: videoPins.scrollToPin,
          onUnpin: (pin) =>
            videoPins.togglePin({ unique_id: pin.id }, pin.title),
        }),
      appPromo &&
        React.createElement(
          "div",
          {
            className:
              "fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-5 animate-fade-in",
            onClick: () => setAppPromo(false),
          },
          React.createElement(
            "div",
            {
              className:
                "bg-white rounded-[30px] p-8 text-center shadow-2xl w-full max-w-sm slide-up relative mt-10",
              onClick: (e) => e.stopPropagation(),
            },
            React.createElement(
              "div",
              {
                className:
                  "absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center text-5xl shadow-xl border-4 border-white",
              },
              React.createElement("i", { className: "fas fa-mobile-alt" }),
            ),
            React.createElement(
              "h3",
              {
                className:
                  "font-black text-[22px] text-slate-800 mt-8 mb-2 leading-tight",
              },
              ("Available in " + ((window.APP_CONFIG && window.APP_CONFIG.appName) || "RG VERSE") + " App Only!"),
            ),
            React.createElement(
              "p",
              {
                className:
                  "text-[13px] font-bold text-slate-500 mb-6 px-1 leading-relaxed",
              },
              "Offline background downloads & ad-free streaming are exclusive to our Mobile App. Download it now! \u{1F680}",
            ),
            React.createElement(
              "button",
              {
                onClick: () => {
                  openExternalLink((window.APP_CONFIG && window.APP_CONFIG.telegramChannelUrl) || "https://t.me/RGVerseOfficial");
                  setAppPromo(false);
                },
                className:
                  "w-full bg-slate-800 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-transform mb-3",
              },
              React.createElement("i", { className: "fas fa-download mr-2" }),
              " DOWNLOAD APP NOW",
            ),
            React.createElement(
              "button",
              {
                onClick: () => setAppPromo(false),
                className:
                  "w-full bg-slate-50 text-slate-500 font-bold py-3.5 rounded-2xl active:bg-slate-100 transition-colors",
              },
              "Maybe Later",
            ),
          ),
        ),
      isLoading
        ? React.createElement(SkeletonLoader, null)
        : React.createElement(
            React.Fragment,
            null,
            availableTabs.length > 0 &&
              React.createElement(
                "div",
                {
                  className:
                    "sticky z-30 pt-4 pb-2 bg-white/90 backdrop-blur-md px-4 border-b border-slate-50",
                  style: { top: "calc(55px + env(safe-area-inset-top, 0px))" },
                },
                React.createElement(
                  "div",
                  {
                    className:
                      "flex overflow-x-auto no-scrollbar gap-2.5 pb-1 px-1",
                  },
                  availableTabs.map((tab) =>
                    React.createElement(
                      "button",
                      {
                        key: tab.id,
                        onClick: () => setActiveTab(tab.id),
                        className: `shrink-0 py-2 px-4 text-[13px] font-extrabold rounded-xl border transition-all flex items-center gap-2
                                        ${activeTab === tab.id ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-white text-slate-500 hover:bg-slate-50"}`,
                      },
                      React.createElement("i", {
                        className: `fas ${getTabIcon(tab.id)}`,
                      }),
                      " ",
                      tab.label,
                    ),
                  ),
                ),
              ),
            activeTab === "lectures" &&
              React.createElement(
                "div",
                {
                  className:
                    "px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar items-center",
                },
                React.createElement(
                  "button",
                  {
                    onClick: () => setFilterStatus("all"),
                    className: `shrink-0 px-4 py-2 rounded-xl border text-[12px] font-bold transition-all flex items-center gap-1.5 ${filterStatus === "all" ? "bg-slate-800 border-slate-800 text-white shadow-md" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`,
                  },
                  React.createElement("i", { className: "fas fa-layer-group" }),
                  " All",
                ),
                React.createElement(
                  "button",
                  {
                    onClick: () => setFilterStatus("pending"),
                    className: `shrink-0 px-4 py-2 rounded-xl border text-[12px] font-bold transition-all flex items-center gap-1.5 ${filterStatus === "pending" ? "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-200" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`,
                  },
                  React.createElement("i", { className: "fas fa-clock" }),
                  " Pending",
                ),
                React.createElement(
                  "button",
                  {
                    onClick: () =>
                      openExternalLink(
                        `https://t.me/${botUsername ? botUsername.replace("@", "") : ((window.APP_CONFIG && window.APP_CONFIG.telegramBotName) || "RGVerseBot")}`,
                      ),
                    className:
                      "shrink-0 px-4 py-2 rounded-xl border-none text-[12px] font-bold transition-all flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-200 active:scale-95",
                  },
                  React.createElement("i", { className: "fas fa-ban" }),
                  " Remove Ads",
                ),
                React.createElement(
                  "button",
                  {
                    onClick: () => setFilterStatus("completed"),
                    className: `shrink-0 px-4 py-2 rounded-xl border text-[12px] font-bold transition-all flex items-center gap-1.5 ${filterStatus === "completed" ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`,
                  },
                  React.createElement("i", {
                    className: "fas fa-check-circle",
                  }),
                  " Completed",
                ),
              ),
            React.createElement(
              "div",
              {
                className: `space-y-4 ${activeTab === "lectures" ? "mt-2" : "mt-4"} px-4`,
              },
              activeTab === "lectures" &&
                displayLectures.map((group, idx) => {
                  var _a, _b, _c, _d, _e, _f, _g, _h;
                  return React.createElement(
                    "div",
                    {
                      key: idx,
                      ref: (element) =>
                        videoPins.setCardRef(group.video, element),
                      className:
                        "bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden transition-all duration-300 mb-4",
                    },
                    React.createElement(
                      "div",
                      {
                        className:
                          "relative w-full aspect-[16/9] flex flex-col justify-between p-4 overflow-hidden bg-slate-900",
                      },
                      ((_a = group.video) == null ? void 0 : _a.thumb_url)
                        ? React.createElement(
                            React.Fragment,
                            null,
                            React.createElement("div", {
                              className:
                                "absolute inset-0 bg-gradient-to-br from-[#4f46e5] via-[#9333ea] to-[#e11d48]",
                            }),
                            React.createElement("img", {
                              src: String(group.video.thumb_url).replace(/https?:\/\/[^/]+\/api\/thumb\//, "/api/thumb/"),
                              loading: "lazy",
                              decoding: "async",
                              className:
                                "absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity duration-300",
                              alt: "",
                              onError: (e) => {
                                e.currentTarget.style.display = "none";
                              },
                            }),
                            React.createElement("div", {
                              className:
                                "absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/60 to-transparent",
                            }),
                          )
                        : React.createElement(
                            React.Fragment,
                            null,
                            React.createElement("div", {
                              className:
                                "absolute inset-0 bg-gradient-to-br from-[#4f46e5] via-[#9333ea] to-[#e11d48]",
                            }),
                            React.createElement("div", {
                              className:
                                "absolute top-[-20%] right-[-10%] w-64 h-64 bg-cyan-400/40 rounded-full blur-3xl",
                            }),
                            React.createElement("div", {
                              className:
                                "absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-rose-400/40 rounded-full blur-3xl",
                            }),
                            React.createElement("i", {
                              className:
                                "fas fa-play-circle absolute -bottom-8 -right-6 text-white/20 text-[140px] rotate-[-10deg]",
                            }),
                          ),
                      React.createElement(
                        "div",
                        {
                          className:
                            "absolute top-0 left-0 w-full h-1 bg-white/10 z-20",
                        },
                        React.createElement("div", {
                          className: "h-full bg-emerald-400",
                          style: {
                            width: watchedMap[
                              (_b = group.video) == null ? void 0 : _b.unique_id
                            ]
                              ? "100%"
                              : "0%",
                          },
                        }),
                      ),
                      React.createElement(
                        "div",
                        {
                          className:
                            "relative z-10 flex justify-between items-start",
                        },
                        React.createElement(
                          "div",
                          { className: "flex gap-2" },
                          React.createElement(
                            "span",
                            {
                              className:
                                "bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg",
                            },
                            "Lecture",
                          ),
                          watchedMap[
                            (_c = group.video) == null ? void 0 : _c.unique_id
                          ] &&
                            React.createElement(
                              "span",
                              {
                                className:
                                  "bg-emerald-500 text-white text-[10px] font-black px-2 py-1.5 rounded-lg shadow-lg",
                              },
                              React.createElement("i", {
                                className: "fas fa-check",
                              }),
                            ),
                        ),
                        group.pdf &&
                          React.createElement(
                            "button",
                            {
                              onClick: () =>
                                handleActionClick("watch", group.pdf),
                              className:
                                "bg-rose-500/90 hover:bg-rose-600 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg shadow-lg flex items-center transition-all",
                            },
                            React.createElement("i", {
                              className: "fas fa-file-pdf mr-1.5",
                            }),
                            " Class Notes",
                          ),
                      ),
                      React.createElement(
                        "div",
                        {
                          className:
                            "absolute inset-0 flex items-center justify-center z-20 pointer-events-none",
                        },
                        React.createElement(
                          "button",
                          {
                            onClick: () =>
                              handleActionClick(
                                "watch",
                                group.video,
                                group.name,
                              ),
                            className:
                              "w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 pointer-events-auto",
                          },
                          React.createElement("i", {
                            className:
                              "fas fa-play text-white text-2xl ml-1 drop-shadow-lg",
                          }),
                        ),
                      ),
                    ),
                    React.createElement(
                      "div",
                      { className: "p-4 bg-white flex flex-col gap-3" },
                      React.createElement(
                        "div",
                        { className: "mb-1" },
                        React.createElement(
                          "h3",
                          {
                            className:
                              "font-extrabold text-[16px] leading-snug text-slate-800 break-words line-clamp-2",
                          },
                          group.name,
                        ),
                        React.createElement(
                          "p",
                          {
                            className:
                              "text-slate-500 text-[11px] font-bold mt-1.5 uppercase tracking-wide flex items-center",
                          },
                          React.createElement("i", {
                            className: "fas fa-clock mr-1.5 text-indigo-400",
                          }),
                          "Ready to Stream",
                        ),
                      ),
                      React.createElement(
                        "div",
                        { className: "flex items-center gap-2 sm:gap-3" },
                        React.createElement(
                          "button",
                          {
                            onClick: () =>
                              handleActionClick(
                                "watch",
                                group.video,
                                group.name,
                              ),
                            className:
                              "min-w-0 flex-1 h-[48px] bg-[#6366f1] hover:bg-[#4f46e5] text-white font-extrabold text-[13px] rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-95 transition-all whitespace-nowrap",
                          },
                          React.createElement("i", {
                            className: "fas fa-play mr-2",
                          }),
                          " WATCH VIDEO",
                        ),
                        React.createElement(
                          "button",
                          {
                            disabled:
                              downloadingStatus[
                                (_d = group.video) == null
                                  ? void 0
                                  : _d.unique_id
                              ],
                            onClick: () =>
                              handleActionClick("download", group.video),
                            className: `w-[44px] h-[48px] shrink-0 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl transition-all duration-300 shadow-sm ${downloadingStatus[(_e = group.video) == null ? void 0 : _e.unique_id] ? "text-slate-400 opacity-50" : "text-slate-600 hover:bg-slate-100 active:scale-95"}`,
                          },
                          downloadingStatus[
                            (_f = group.video) == null ? void 0 : _f.unique_id
                          ]
                            ? React.createElement("i", {
                                className: "fas fa-spinner fa-spin text-[18px]",
                              })
                            : React.createElement("i", {
                                className: "fas fa-download text-[18px]",
                              }),
                        ),
                        React.createElement(
                          "button",
                          {
                            onClick: () => handleTelegramClick(group.video),
                            className: `w-[44px] h-[48px] shrink-0 flex items-center justify-center bg-[#f0f9ff] border border-[#bae6fd] rounded-2xl shadow-sm transition-all ${telegramStatus[(_g = group.video) == null ? void 0 : _g.unique_id] ? "text-slate-400 opacity-50" : "text-[#0ea5e9] hover:bg-[#e0f2fe] active:scale-95"}`,
                          },
                          telegramStatus[
                            (_h = group.video) == null ? void 0 : _h.unique_id
                          ]
                            ? React.createElement("i", {
                                className: "fas fa-spinner fa-spin text-[18px]",
                              })
                            : React.createElement("i", {
                                className: "fab fa-telegram-plane text-[20px]",
                              }),
                        ),
                        React.createElement(
                          "button",
                          {
                            onClick: () =>
                              videoPins.togglePin(group.video, group.name),
                            className: `w-[44px] h-[48px] shrink-0 flex items-center justify-center rounded-2xl border shadow-sm active:scale-95 transition-all ${videoPins.isPinned(group.video) ? "bg-amber-400 border-amber-400 text-white" : "bg-gradient-to-b from-amber-50 to-yellow-100 border-amber-200 text-amber-500 hover:from-amber-100 hover:to-yellow-200"}`,
                          },
                          React.createElement("i", {
                            className: "fas fa-thumbtack text-[18px]",
                          }),
                        ),
                      ),
                    ),
                  );
                }),
              activeTab === "notes" &&
                standaloneNotes.map((pdf, idx) =>
                  React.createElement(
                    "div",
                    {
                      key: idx,
                      className:
                        "bg-white rounded-[1.25rem] border-2 border-transparent hover:border-pink-200 shadow-md relative overflow-hidden transition-all duration-300",
                    },
                    React.createElement(
                      "div",
                      { className: "p-4" },
                      React.createElement(
                        "div",
                        { className: "flex items-start gap-4 mb-4" },
                        React.createElement(
                          "div",
                          {
                            className:
                              "w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-500 rounded-[14px] shrink-0 overflow-hidden flex items-center justify-center relative shadow-lg",
                          },
                          React.createElement("i", {
                            className: "fas fa-file-pdf text-white text-2xl",
                          }),
                        ),
                        React.createElement(
                          "div",
                          { className: "flex-1" },
                          React.createElement(
                            "h3",
                            {
                              className:
                                "font-extrabold text-[15px] leading-snug text-slate-800 break-words pr-2",
                            },
                            pdf.file_name,
                          ),
                        ),
                      ),
                      React.createElement(
                        "div",
                        { className: "flex items-center gap-2.5" },
                        React.createElement(
                          "button",
                          {
                            disabled: downloadingStatus[pdf.unique_id],
                            onClick: () => handleActionClick("download", pdf),
                            className: `w-[44px] h-[44px] shrink-0 flex items-center justify-center bg-slate-50 border rounded-[14px] transition-all duration-300 ${downloadingStatus[pdf.unique_id] ? "text-slate-400 opacity-50" : "text-pink-500 active:scale-95"}`,
                          },
                          downloadingStatus[pdf.unique_id]
                            ? React.createElement("i", {
                                className: "fas fa-spinner fa-spin text-[16px]",
                              })
                            : React.createElement("i", {
                                className: "fas fa-download text-[16px]",
                              }),
                        ),
                        React.createElement(
                          "button",
                          {
                            onClick: () => handleTelegramClick(pdf),
                            className: `w-[44px] h-[44px] shrink-0 flex items-center justify-center bg-sky-50 border border-sky-200 rounded-[14px] shadow-sm transition-all ${telegramStatus[pdf.unique_id] ? "text-slate-400 opacity-50" : "text-sky-500 hover:bg-sky-100 active:scale-95"}`,
                          },
                          telegramStatus[pdf.unique_id]
                            ? React.createElement("i", {
                                className: "fas fa-spinner fa-spin text-[16px]",
                              })
                            : React.createElement("i", {
                                className: "fab fa-telegram-plane text-[18px]",
                              }),
                        ),
                        React.createElement(
                          "button",
                          {
                            onClick: () => handleActionClick("watch", pdf),
                            className:
                              "flex-1 h-[44px] bg-gradient-to-r from-rose-400 to-pink-600 text-white font-extrabold text-[12px] rounded-[14px] flex items-center justify-center shadow-md",
                          },
                          "Read Document",
                        ),
                      ),
                    ),
                  ),
                ),
              ((activeTab === "lectures" && displayLectures.length === 0) ||
                (activeTab === "notes" && standaloneNotes.length === 0)) &&
                (isUnverified
                  ? React.createElement(
                      "div",
                      {
                        className:
                          "text-center py-16 px-6 bg-white rounded-3xl border border-slate-100 shadow-sm mt-4 flex flex-col items-center justify-center",
                      },
                      React.createElement(
                        "div",
                        {
                          className:
                            "w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4",
                        },
                        React.createElement("i", {
                          className:
                            "fas fa-lock text-rose-500 text-2xl animate-pulse",
                        }),
                      ),
                      React.createElement(
                        "h3",
                        { className: "text-lg font-bold text-slate-800 mb-1" },
                        "Access Locked",
                      ),
                      React.createElement(
                        "p",
                        {
                          className:
                            "text-xs text-slate-500 max-w-xs mb-5 font-semibold",
                        },
                        "Daily token verification required to view the content of this subject.",
                      ),
                      lockedStats &&
                        React.createElement(
                          "div",
                          {
                            className:
                              "w-full max-w-xs bg-slate-50/50 border border-slate-100 rounded-2xl p-4 mb-6",
                          },
                          React.createElement(
                            "p",
                            {
                              className:
                                "text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 text-center",
                            },
                            "Locked Content Summary",
                          ),
                          React.createElement(
                            "div",
                            { className: "grid grid-cols-2 gap-2" },
                            lockedStats.lectures > 0 &&
                              React.createElement(
                                "div",
                                {
                                  className:
                                    "bg-white border border-slate-100 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-sm",
                                },
                                React.createElement(
                                  "span",
                                  { className: "text-base" },
                                  "\u{1F3A5}",
                                ),
                                React.createElement(
                                  "span",
                                  {
                                    className:
                                      "text-[13px] font-black text-slate-800 mt-1",
                                  },
                                  lockedStats.lectures,
                                  " Lectures",
                                ),
                              ),
                            lockedStats.notes > 0 &&
                              React.createElement(
                                "div",
                                {
                                  className:
                                    "bg-white border border-slate-100 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-sm",
                                },
                                React.createElement(
                                  "span",
                                  { className: "text-base" },
                                  "\u{1F4DD}",
                                ),
                                React.createElement(
                                  "span",
                                  {
                                    className:
                                      "text-[13px] font-black text-slate-800 mt-1",
                                  },
                                  lockedStats.notes,
                                  " PDF Notes",
                                ),
                              ),
                            lockedStats.dpp > 0 &&
                              React.createElement(
                                "div",
                                {
                                  className:
                                    "bg-white border border-slate-100 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-sm",
                                },
                                React.createElement(
                                  "span",
                                  { className: "text-base" },
                                  "\u{1F4C4}",
                                ),
                                React.createElement(
                                  "span",
                                  {
                                    className:
                                      "text-[13px] font-black text-slate-800 mt-1",
                                  },
                                  lockedStats.dpp,
                                  " DPP PDFs",
                                ),
                              ),
                            lockedStats.dpp_sol > 0 &&
                              React.createElement(
                                "div",
                                {
                                  className:
                                    "bg-white border border-slate-100 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-sm",
                                },
                                React.createElement(
                                  "span",
                                  { className: "text-base" },
                                  "\u{1F3AC}",
                                ),
                                React.createElement(
                                  "span",
                                  {
                                    className:
                                      "text-[13px] font-black text-slate-800 mt-1",
                                  },
                                  lockedStats.dpp_sol,
                                  " DPP Videos",
                                ),
                              ),
                            lockedStats.study_material > 0 &&
                              React.createElement(
                                "div",
                                {
                                  className:
                                    "bg-white border border-slate-100 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-sm col-span-2",
                                },
                                React.createElement(
                                  "span",
                                  { className: "text-base" },
                                  "\u{1F4DA}",
                                ),
                                React.createElement(
                                  "span",
                                  {
                                    className:
                                      "text-[13px] font-black text-slate-800 mt-1",
                                  },
                                  lockedStats.study_material,
                                  " Study Material",
                                ),
                              ),
                          ),
                        ),
                      React.createElement(
                        "button",
                        {
                          onClick: () =>
                            setTokenModal({
                              show: true,
                              file: null,
                              action: "subject_load",
                            }),
                          className:
                            "w-full max-w-xs bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-sm",
                        },
                        React.createElement("i", {
                          className: "fas fa-unlock-alt",
                        }),
                        " Unlock Batch Content",
                      ),
                    )
                  : React.createElement(
                      "div",
                      {
                        className:
                          "text-center py-20 text-slate-400 font-bold uppercase text-xs tracking-widest bg-white rounded-3xl border border-dashed border-slate-200 mt-4",
                      },
                      React.createElement("i", {
                        className:
                          "fas fa-box-open text-4xl mb-3 opacity-20 block",
                      }),
                      "No Content Found",
                    )),
            ),
          ),
      React.createElement(TokenModal, {
        show: tokenModal.show,
        tokenInput,
        setTokenInput,
        tokenError,
        handleGetToken,
        handleSubmitToken,
        onClose: () => setTokenModal({ show: false, file: null, action: null }),
        tutorialLink,
      }),
    );
  };
  const PwView = ({
    batch,
    subject,
    chapter,
    virtualId,
    botUsername,
    setBotUsername,
    isVerifying,
    setIsVerifying,
    setLoadingMsg,
    setIsChromePremium,
    setDisplayUser,
    setDisplayName,
  }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
    const {
      SERVER_URL: SERVER_URL2,
      DataManager,
      openExternalLink,
      showAppAlert,
    } = window;
    const stateTabKey = `pw_tab_${batch}_${subject}`;
    const [activeTab, setActiveTab] = useState(
      () => sessionStorage.getItem(stateTabKey) || "lectures",
    );
    const [filterStatus, setFilterStatus] = useState("all");
    const apiUrl = `${SERVER_URL2}/api/files?batch=${encodeURIComponent(batch)}&subject=${encodeURIComponent(subject)}${chapter ? `&chapter=${encodeURIComponent(chapter)}` : ""}`;
    const [serverData, setServerData] = useState(() => {
      const cachedRes = DataManager.getCache(apiUrl);
      return cachedRes && cachedRes.success && Array.isArray(cachedRes.data)
        ? DataManager.processFiles(cachedRes.data)
        : [];
    });
    const [isLoading, setIsLoading] = useState(() => !serverData.length);
    const [attachmentModal, setAttachmentModal] = useState(null);
    const [tokenModal, setTokenModal] = useState({
      show: false,
      file: null,
      action: null,
    });
    const [appPromo, setAppPromo] = useState(false);
    const [downloadingStatus, setDownloadingStatus] = useState({});
    const [telegramStatus, setTelegramStatus] = useState({});
    const [tokenInput, setTokenInput] = useState("");
    const [tokenError, setTokenError] = useState("");
    const touchStateRef = useRef({ startX: 0, startY: 0 });
    const [xp, setXp] = useState(() =>
      parseInt(localStorage.getItem("akki_xp") || "30"),
    );
    const [watchedMap, setWatchedMap] = useState(() =>
      JSON.parse(localStorage.getItem("akki_watched") || "{}"),
    );
    const videoPins = useVideoPins(batch, subject);
    const tabsContainerRef = useRef(null);
    const [fetchTrigger, setFetchTrigger] = useState(0);
    const [tutorialLink, setTutorialLink] = useState(
      () => localStorage.getItem("akki_tutorial_link") || "",
    );
    const [isUnverified, setIsUnverified] = useState(false);
    const [lockedStats, setLockedStats] = useState(null);
    useEffect(() => {
      if (tokenModal.show) {
        setTutorialLink(localStorage.getItem("akki_tutorial_link") || "");
      }
    }, [tokenModal.show]);
    const handleGetToken = async () => {
      if (!virtualId) {
        setTokenError("Device ID not ready.");
        return;
      }
      if (typeof setLoadingMsg === "function")
        setLoadingMsg("Generating Link...");
      if (typeof setIsVerifying === "function") setIsVerifying(true);
      try {
        const params = new URLSearchParams({
          u: String(virtualId),
          bot: String(botUsername || ""),
          _t: String(Date.now()),
        });
        const res = await fetch(
          `${SERVER_URL2}/api/get_token_link?${params}`,
        ).then((r) => r.json());
        saveTutorialLink(res);
        if (res.success) {
          openExternalLink(res.short_url);
          setTokenError("Link opened! Complete it.");
        } else {
          setTokenError(res.error || "Failed to generate link.");
        }
      } catch (e) {
        setTokenError("Network error.");
      }
      if (typeof setIsVerifying === "function") setIsVerifying(false);
    };
    const handleSubmitToken = async () => {
      const cleanToken = tokenInput.trim().toUpperCase();
      if (!cleanToken) {
        setTokenError("Please enter a token!");
        return;
      }
      if (typeof setLoadingMsg === "function")
        setLoadingMsg("Verifying Token...");
      if (typeof setIsVerifying === "function") setIsVerifying(true);
      try {
        const params = new URLSearchParams({
          u: String(virtualId),
          t: cleanToken,
          _t: String(Date.now()),
        });
        const res = await fetch(
          `${SERVER_URL2}/api/verify_token_input?${params}`,
        ).then((r) => r.json());
        if (res.success) {
          const retryAction = tokenModal.action;
          const retryFile = tokenModal.file;
          localStorage.setItem("akki_verified_token", cleanToken);
          setIsUnverified(false);
          setLockedStats(null);
          setTokenModal({ show: false, file: null, action: null });
          setTokenInput("");
          setTokenError("");
          if (typeof setIsVerifying === "function") setIsVerifying(false);
          setTimeout(() => {
            showAppAlert("\u2705 Verified Successfully!", () => {
              if (retryAction === "telegram_retry") {
                handleTelegramClick(retryFile);
              } else if (retryAction === "subject_load") {
                setFetchTrigger((prev) => prev + 1);
              } else {
                handleActionClick(retryAction, retryFile);
              }
            });
          }, 300);
        } else {
          setTokenError(res.error || "Invalid Token!");
          if (typeof setIsVerifying === "function") setIsVerifying(false);
        }
      } catch (e) {
        setTokenError("Network error.");
        if (typeof setIsVerifying === "function") setIsVerifying(false);
      }
    };
    const getFileCategory = (item) => {
      var _a2;
      const fileType = String(
        (item == null ? void 0 : item.file_type) || "",
      ).toLowerCase();
      const fileName = String(
        (item == null ? void 0 : item.file_name) || "",
      ).toLowerCase();
      const isVideo =
        fileType === "video" ||
        /\.(mp4|mkv|webm|m3u8|mpd)$/i.test(fileName) ||
        ((_a2 = item == null ? void 0 : item.url) == null
          ? void 0
          : _a2.includes("youtube"));
      const cleanName = fileName.replace(
        /\b(no\s*dpp|dpp\s*not\s*provided)\b/g,
        "",
      );
      const hasDpp = /\b(dpp|dha|assignment|test|sheet)\b/.test(cleanName);
      const hasSol = /\b(sol|solution|discussion)\b/.test(cleanName);
      const isShortNote =
        /\b(short notes?|mind maps?|pyq|syllabus|pyqs)\b/i.test(cleanName);
      if (isShortNote && !hasSol && !isVideo) return "study_material";
      if (hasDpp && hasSol) return "dpp-sol";
      if (hasDpp && !hasSol && !isVideo) return "dpp";
      if (isVideo) return "lectures";
      return "notes";
    };
    const getMatchKey = (name) => {
      return String(name || "")
        .toLowerCase()
        .replace(/\.(pdf|mp4|mkv|webm|m3u8|mpd)$/i, "")
        .replace(
          /\b(class\s*notes?|notes?|dpp|dha|assignment|worksheet|test|solution|sol|pdf|video|lecture)\b/gi,
          " ",
        )
        .replace(/[\[\]\(\)_~:|\-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    };
    useEffect(() => {
      let isMounted = true;
      setIsLoading(true);
      const storedToken = localStorage.getItem("akki_verified_token") || "";
      const activeId = localStorage.getItem("akki_premium_uid") || virtualId;
      DataManager.fetch(
        `${apiUrl}&u=${activeId}&t=${storedToken}&device_id=${virtualId}&_t=${Date.now()}`,
      )
        .then((res) => {
          saveTutorialLink(res);
          if ((res == null ? void 0 : res.success) && isMounted) {
            const needsVerification =
              (res == null ? void 0 : res.needs_verification) === true;
            setIsUnverified(needsVerification);
            setServerData(DataManager.processFiles(res.data));
          }
          if (isMounted) setIsLoading(false);
        })
        .catch(() => {
          if (isMounted) setIsLoading(false);
        });
      return () => {
        isMounted = false;
      };
    }, [apiUrl, fetchTrigger, virtualId]);
    useEffect(() => {
      sessionStorage.setItem(stateTabKey, activeTab);
    }, [activeTab]);
    useEffect(() => {
      if (!isLoading) {
        const savedPosition = sessionStorage.getItem("contentScrollPosition");
        if (savedPosition) {
          setTimeout(() => {
            window.scrollTo({
              top: parseInt(savedPosition, 10),
              behavior: "auto",
            });
            sessionStorage.removeItem("contentScrollPosition");
          }, 150);
        }
      }
    }, [isLoading]);
    const handleTelegramClick = async (file) => {
      var _a2, _b2;
      if (!file || file.is_dummy) return;
      setTelegramStatus((prev) => ({ ...prev, [file.unique_id]: true }));
      try {
        const storedToken = localStorage.getItem("akki_verified_token") || "";
        const activeId = localStorage.getItem("akki_premium_uid") || virtualId;
        const params = new URLSearchParams({
          u: String(activeId),
          device_id: String(virtualId),
          c: String(file.channel_id ?? ""),
          m: String(file.message_id ?? ""),
          uid: String(file.unique_id ?? ""),
          t: storedToken,
          bot: String(botUsername || ""),
          _t: String(Date.now()),
        });
        const res = await fetch(
          `${SERVER_URL2}/api/generate_link?${params}`,
        ).then((r) => r.json());
        saveTutorialLink(res);
        if (res.active_bot && res.active_bot !== botUsername) {
          if (typeof setBotUsername === "function")
            setBotUsername(res.active_bot);
          localStorage.setItem("akki_bot_username", res.active_bot);
        }
        if (res.needs_verification) {
          if (typeof setIsVerifying === "function") setIsVerifying(false);
          setTokenModal({ show: true, file, action: "telegram_retry" });
          return;
        }
        if (!res.tg_link) {
          showAppAlert(
            "\u26A0\uFE0F Yeh direct server link hai, Telegram par available nahi hai.",
          );
        } else {
          if (
            ((_a2 = window.tg) == null ? void 0 : _a2.openTelegramLink) &&
            res.tg_link.includes("t.me")
          ) {
            window.tg.openTelegramLink(res.tg_link);
            setTimeout(() => {
              if (window.tg.close) window.tg.close();
            }, 800);
          } else {
            openExternalLink(res.tg_link);
          }
        }
      } catch (e) {
        let targetBot =
          localStorage.getItem("akki_bot_username") ||
          botUsername ||
          ((window.APP_CONFIG && window.APP_CONFIG.fallbackBot) || "RGVerseBot");
        let fbLink = `https://t.me/${targetBot.replace("@", "")}?start=${file.unique_id}`;
        if ((_b2 = window.tg) == null ? void 0 : _b2.openTelegramLink) {
          window.tg.openTelegramLink(fbLink);
          setTimeout(() => {
            if (window.tg.close) window.tg.close();
          }, 800);
        } else {
          openExternalLink(fbLink);
        }
      } finally {
        setTelegramStatus((prev) => ({ ...prev, [file.unique_id]: false }));
      }
    };
    useEffect(() => {
      window.fetchAndShowAttachment = async (uniqueId) => {
        try {
          let targetFile = serverData.find(
            (f) => String(f.unique_id) === String(uniqueId),
          );
          if (!targetFile) throw new Error("Attachment info not found");
          const storedToken = localStorage.getItem("akki_verified_token") || "";
          const activeId =
            localStorage.getItem("akki_premium_uid") || virtualId;
          const params = new URLSearchParams({
            u: String(activeId),
            device_id: String(virtualId),
            c: String(targetFile.channel_id ?? ""),
            m: String(targetFile.message_id ?? ""),
            uid: String(targetFile.unique_id ?? ""),
            t: storedToken,
            bot: String(botUsername || ""),
            _t: String(Date.now()),
          });
          const res = await fetch(
            `${SERVER_URL2}/api/generate_link?${params}`,
          ).then((r) => r.json());
          if (res.success) {
            const fullUrl = sxDocumentLink(res);
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  action: "open_split_pdf",
                  url: fullUrl,
                  is_pdf: true,
                }),
              );
            }
          } else {
            if (window.ReactNativeWebView)
              window.ReactNativeWebView.postMessage(
                JSON.stringify({ action: "stop_loaders" }),
              );
            showAppAlert(res.error || "Failed to load attachment");
          }
        } catch (e) {
          if (window.ReactNativeWebView)
            window.ReactNativeWebView.postMessage(
              JSON.stringify({ action: "stop_loaders" }),
            );
          showAppAlert("Network error");
        }
      };
    }, [serverData, virtualId, botUsername]);
    const { categorizedData, availableTabs, headerStats } = useMemo(() => {
      const categories = {
        lectures: [],
        notes: [],
        dpp: [],
        "dpp-sol": [],
        study_material: [],
      };
      const lectureMap = {};
      const uniqueData = serverData.filter(
        (v, i, a) =>
          a.findIndex(
            (t) =>
              t.file_name === v.file_name &&
              getFileCategory(t) === getFileCategory(v),
          ) === i,
      );
      uniqueData.forEach((item) => {
        const cat = getFileCategory(item);
        if (cat === "lectures") {
          const key = getMatchKey(item.file_name);
          item.attached = { notes: [], dpp: [], dppSol: [] };
          lectureMap[key] = item;
          categories.lectures.push(item);
        }
      });
      uniqueData.forEach((item) => {
        const cat = getFileCategory(item);
        if (cat === "lectures") return;
        categories[cat].push(item);
        const key = getMatchKey(item.file_name);
        const parentLec = lectureMap[key];
        if (parentLec) {
          if (cat === "notes") parentLec.attached.notes.push(item);
          else if (cat === "dpp") parentLec.attached.dpp.push(item);
          else if (cat === "dpp-sol") parentLec.attached.dppSol.push(item);
        }
      });
      Object.keys(categories).forEach((key) => {
        categories[key].sort((a, b) => {
          if (a.upload_sequence || b.upload_sequence) {
            return serverData.indexOf(a) - serverData.indexOf(b);
          }
          const idxA =
            a.txt_index !== void 0 && a.txt_index !== null
              ? Number(a.txt_index)
              : -1;
          const idxB =
            b.txt_index !== void 0 && b.txt_index !== null
              ? Number(b.txt_index)
              : -1;
          if (idxA !== -1 && idxB !== -1 && idxA !== idxB) return idxB - idxA;
          return String(b.file_name).localeCompare(
            String(a.file_name),
            void 0,
            { numeric: true, sensitivity: "base" },
          );
        });
      });
      const statsObj = {
        l: categories.lectures.length,
        d: categories.dpp.length,
        ds: categories["dpp-sol"].length,
        n: categories.notes.length,
        sm: categories.study_material.length,
      };
      const desiredOrder = [
        { id: "lectures", label: "Lectures" },
        { id: "notes", label: "Notes" },
        { id: "dpp", label: "DPP PDFs" },
        { id: "dpp-sol", label: "DPP Videos" },
        { id: "study_material", label: "Study Material" },
      ];
      const tabs = desiredOrder.filter((tab) => {
        if (tab.id === "lectures") return categories.lectures.length > 0;
        if (tab.id === "notes") return categories.notes.length > 0;
        if (tab.id === "dpp") return categories.dpp.length > 0;
        if (tab.id === "dpp-sol") return categories["dpp-sol"].length > 0;
        if (tab.id === "study_material")
          return categories.study_material.length > 0;
        return false;
      });
      return {
        categorizedData: categories,
        availableTabs: tabs,
        headerStats: statsObj,
      };
    }, [serverData]);
    useEffect(() => {
      if (
        availableTabs.length &&
        !availableTabs.find((t) => t.id === activeTab)
      )
        setActiveTab(availableTabs[0].id);
    }, [availableTabs]);
    const mediaActionRef = useRef(false);
    const handleActionClick = async (actionType, file, displayTitle = null) => {
      var _a2;
      if (!file || mediaActionRef.current) return;
      sessionStorage.setItem("contentScrollPosition", window.scrollY);
      if (actionType === "download") {
        if (!window.ReactNativeWebView) {
          setAppPromo(true);
          return;
        }
        setDownloadingStatus((prev) => ({ ...prev, [file.unique_id]: true }));
        setTimeout(
          () =>
            setDownloadingStatus((prev) => ({
              ...prev,
              [file.unique_id]: false,
            })),
          3500,
        );
      }
      mediaActionRef.current = true;
      if (typeof setLoadingMsg === "function")
        setLoadingMsg(
          actionType === "download"
            ? "Generating Secure Link..."
            : "Checking Access...",
        );
      if (typeof setIsVerifying === "function") setIsVerifying(true);
      try {
        if (!virtualId) {
          if (typeof setIsVerifying === "function") setIsVerifying(false);
          showAppAlert("Identifying device... Please try again.");
          return;
        }
        const storedToken = localStorage.getItem("akki_verified_token") || "";
        const activeId = localStorage.getItem("akki_premium_uid") || virtualId;
        const params = new URLSearchParams({
          u: String(activeId),
          device_id: String(virtualId),
          c: String(file.channel_id ?? ""),
          m: String(file.message_id ?? ""),
          uid: String(file.unique_id ?? ""),
          t: storedToken,
          bot: String(botUsername || ""),
          _t: String(Date.now()),
        });
        const res = await fetch(
          `${SERVER_URL2}/api/generate_link?${params}`,
        ).then((r) => r.json());
        saveTutorialLink(res);
        if (res.active_bot && res.active_bot !== botUsername) {
          if (typeof setBotUsername === "function")
            setBotUsername(res.active_bot);
          localStorage.setItem("akki_bot_username", res.active_bot);
        }
        if (res.needs_verification) {
          if (typeof setIsVerifying === "function") setIsVerifying(false);
          if (localStorage.getItem("akki_chrome_premium_status") === "true") {
            localStorage.removeItem("akki_chrome_premium_status");
            localStorage.removeItem("akki_premium_uid");
            localStorage.removeItem("akki_premium_expiry");
            if (typeof setIsChromePremium === "function")
              setIsChromePremium(false);
            if (typeof setDisplayUser === "function")
              setDisplayUser("Free Access");
            if (typeof setDisplayName === "function")
              setDisplayName((window.APP_CONFIG && window.APP_CONFIG.defaultStudentName) || "RG Student");
            setTimeout(
              () =>
                showAppAlert("\u26A0\uFE0F Aapka VIP Plan expire ho gaya hai!"),
              300,
            );
            return;
          }
          setTokenModal({ show: true, file, action: actionType });
          return;
        }
        if (res.success) {
          if (actionType === "split_pdf") {
            if (typeof setIsVerifying === "function") setIsVerifying(false);
            const fullUrl = sxDocumentLink(res);
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  action: "open_split_pdf",
                  url: fullUrl,
                  is_pdf: true,
                }),
              );
            }
            return;
          }
          if (
            actionType === "watch" &&
            file.unique_id &&
            (file.file_type === "video" ||
              ((_a2 = file.url) == null ? void 0 : _a2.includes("youtube")))
          ) {
            const newWatchedMap = { ...watchedMap, [file.unique_id]: true };
            setWatchedMap(newWatchedMap);
            localStorage.setItem("akki_watched", JSON.stringify(newWatchedMap));
            const newXp = xp + 30;
            setXp(newXp);
            localStorage.setItem("akki_xp", newXp.toString());
          }
          localStorage.setItem(
            "akki_last_watched",
            JSON.stringify({
              file_name: file.file_name,
              channel_id: file.channel_id,
              message_id: file.message_id,
              subject,
              batch,
            }),
          );
          if (actionType === "download") {
            if (typeof setIsVerifying === "function") setIsVerifying(false);
            const fullUrl = String(res.download_link || "").startsWith("http")
              ? res.download_link
              : window.location.origin + res.download_link;
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  action: "download_video",
                  url: encodeURI(fullUrl),
                  fileName: file.file_name || "File",
                  is_pdf: sxIsDocument(file),
                }),
              );
            }
            return;
          }
          if (typeof setIsVerifying === "function") setIsVerifying(false);
          if (actionType === "watch" && sxIsDocument(file)) {
            const url = sxDocumentLink(res);
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  action: "open_pdf",
                  url,
                  fileName: file.file_name,
                  is_pdf: true,
                }),
              );
            } else
              window.location.href = sxWebDocumentLink(res, file.file_name);
            return;
          }
          (() => {
            let watchUrl = res.watch_link || res.download_link;
            let directVideoUrl = res.download_link || res.watch_link;
            const fullWatchUrl = String(watchUrl).startsWith("http")
              ? watchUrl
              : window.location.origin + watchUrl;
            const fullDirectUrl = String(directVideoUrl).startsWith("http")
              ? directVideoUrl
              : window.location.origin + directVideoUrl;
            const fileNameLower = String(file.file_name || "").toLowerCase();
            const urlToCheck = String(
              fullWatchUrl + " " + fullDirectUrl + " " + (file.url || ""),
            ).toLowerCase();
            const isRawPdf =
              fileNameLower.endsWith(".pdf") || urlToCheck.includes(".pdf");
            const isYouTube =
              urlToCheck.includes("youtube.com") ||
              urlToCheck.includes("youtu.be");
            const isM3U8 =
              urlToCheck.includes(".m3u8") || fileNameLower.includes(".m3u8");
            const hasVideoExt =
              fileNameLower.endsWith(".mp4") ||
              fileNameLower.endsWith(".mkv") ||
              urlToCheck.includes(".mp4") ||
              urlToCheck.includes(".mkv");
            const isNativeVideo =
              (file.file_type === "video" || hasVideoExt) &&
              !isRawPdf &&
              !isYouTube &&
              !isM3U8;
            if (
              window.ReactNativeWebView &&
              actionType === "watch" &&
              !isRawPdf
            ) {
              const playlistData = (categorizedData.lectures || []).map(
                (lec) => {
                  let itemUrl =
                    lec.download_link ||
                    lec.watch_link ||
                    lec.url ||
                    lec.file_url ||
                    "";
                  if (itemUrl && !itemUrl.startsWith("http")) {
                    itemUrl = window.location.origin + itemUrl;
                  }
                  let atts = [];
                  ["notes", "dpp", "dppSol"].forEach((key) => {
                    var _a3;
                    (
                      ((_a3 = lec.attached) == null ? void 0 : _a3[key]) || []
                    ).forEach((att) => {
                      const isVid = key === "dppSol";
                      atts.push({
                        title: att.file_name || "Attachment",
                        id: att.unique_id,
                        isVideo: isVid,
                        isExplicitPdf: !isVid,
                      });
                    });
                  });
                  return {
                    title: lec.file_name,
                    url: encodeURI(itemUrl),
                    id: lec.unique_id,
                    attachments: atts,
                  };
                },
              );
              let targetUrl = isNativeVideo ? fullDirectUrl : fullWatchUrl;
              if (!isNativeVideo && !isYouTube) {
                targetUrl +=
                  (targetUrl.includes("?") ? "&" : "?") +
                  "in_app=true&hide_header=true";
              }
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  action: "play_stream",
                  url: encodeURI(targetUrl),
                  template_url: encodeURI(
                    fullWatchUrl +
                      (fullWatchUrl.includes("?") ? "&" : "?") +
                      "in_app=true&hide_header=true",
                  ),
                  title: displayTitle || file.file_name,
                  id: file.unique_id,
                  is_native_video: isNativeVideo,
                  is_youtube: isYouTube,
                  playlist: playlistData,
                }),
              );
              return;
            }
            let finalWebUrl = fullWatchUrl;
            if (isRawPdf) {
              finalWebUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fullWatchUrl)}`;
            }
            if (window.ReactNativeWebView) {
              finalWebUrl +=
                (finalWebUrl.includes("?") ? "&" : "?") +
                "in_app=true&hide_header=true";
            }
            window.location.href = finalWebUrl;
          })();
          return;
        }
        if (typeof setIsVerifying === "function") setIsVerifying(false);
        showAppAlert(res.error || "Something went wrong.");
        if (window.ReactNativeWebView)
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ action: "stop_loaders" }),
          );
      } catch (e) {
        if (typeof setIsVerifying === "function") setIsVerifying(false);
        showAppAlert("Network error, try again.");
        if (window.ReactNativeWebView)
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ action: "stop_loaders" }),
          );
      } finally {
        mediaActionRef.current = false;
      }
    };
    window.appProcessItem = (unique_id, action) => {
      let targetFile = serverData.find(
        (f) => String(f.unique_id) === String(unique_id),
      );
      if (!targetFile) {
        for (let lec of categorizedData.lectures || []) {
          if (String(lec.unique_id) === String(unique_id)) {
            targetFile = lec;
            break;
          }
          ["notes", "dpp", "dppSol"].forEach((key) => {
            var _a2;
            (((_a2 = lec.attached) == null ? void 0 : _a2[key]) || []).forEach(
              (att) => {
                if (String(att.unique_id) === String(unique_id))
                  targetFile = att;
              },
            );
          });
          if (targetFile) break;
        }
      }
      if (targetFile) {
        const lectureMatch = (categorizedData.lectures || []).find(
          (lec) =>
            String(lec.unique_id) === String(targetFile.unique_id) ||
            ["notes", "dpp", "dppSol"].some((k) => {
              var _a2;
              return (
                ((_a2 = lec.attached) == null ? void 0 : _a2[k]) || []
              ).some(
                (a) => String(a.unique_id) === String(targetFile.unique_id),
              );
            }),
        );
        handleActionClick(
          action,
          targetFile,
          lectureMatch ? lectureMatch.file_name : targetFile.file_name,
        );
      } else {
        if (window.ReactNativeWebView)
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ action: "stop_loaders" }),
          );
      }
    };
    const displayFiles = useMemo(() => {
      let files = categorizedData[activeTab] || [];
      if (activeTab === "lectures") {
        files = files.filter((f) => {
          const isWatched = watchedMap[f.unique_id] === true;
          if (filterStatus === "all") return true;
          return filterStatus === "pending" ? !isWatched : isWatched;
        });
      }
      return files;
    }, [categorizedData, activeTab, filterStatus, watchedMap]);
    const onTouchStart = (e) => {
      touchStateRef.current.startX = e.changedTouches[0].clientX;
      touchStateRef.current.startY = e.changedTouches[0].clientY;
    };
    const onTouchEnd = (e) => {
      var _a2, _b2;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = touchStateRef.current.startX - endX;
      const diffY = touchStateRef.current.startY - endY;
      if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY)) {
        const currentIndex = availableTabs.findIndex((t) => t.id === activeTab);
        if (currentIndex === -1) return;
        if (diffX > 0 && currentIndex < availableTabs.length - 1) {
          setActiveTab(availableTabs[currentIndex + 1].id);
          if ((_a2 = window.tg) == null ? void 0 : _a2.HapticFeedback)
            window.tg.HapticFeedback.selectionChanged();
        } else if (diffX < 0 && currentIndex > 0) {
          setActiveTab(availableTabs[currentIndex - 1].id);
          if ((_b2 = window.tg) == null ? void 0 : _b2.HapticFeedback)
            window.tg.HapticFeedback.selectionChanged();
        }
      }
    };
    const statsArray = [];
    if (headerStats.l > 0) statsArray.push(`${headerStats.l} Lectures`);
    if (headerStats.d > 0) statsArray.push(`${headerStats.d} DPPs`);
    if (headerStats.ds > 0) statsArray.push(`${headerStats.ds} DPP Sols`);
    if (headerStats.n > 0) statsArray.push(`${headerStats.n} Notes`);
    if (headerStats.sm > 0) statsArray.push(`${headerStats.sm} Study Mat`);
    return React.createElement(
      "div",
      {
        className: "fade-in bg-slate-50 min-h-screen relative pb-8",
        onTouchStart,
        onTouchEnd,
      },
      React.createElement(
        "div",
        {
          className:
            "sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm",
        },
        React.createElement(
          "div",
          { className: "flex items-center min-w-0 flex-1" },
          React.createElement(
            "button",
            {
              onClick: () => window.history.back(),
              className: "mr-3 text-slate-800 text-lg",
            },
            React.createElement("i", { className: "fas fa-chevron-left" }),
          ),
          React.createElement(
            "div",
            { className: "flex-1 min-w-0 pr-2" },
            React.createElement(
              "h2",
              {
                className: "font-extrabold text-[16px] text-slate-800 truncate",
              },
              " ",
              String(subject).trim() === "General Subject"
                ? "All Contents"
                : subject,
              " ",
            ),
            statsArray.length > 0 &&
              React.createElement(
                "p",
                {
                  className:
                    "text-[10px] text-emerald-500 font-bold truncate mt-0.5 opacity-90",
                },
                statsArray.join(" \u2022 "),
              ),
          ),
        ),
        React.createElement(
          "div",
          {
            className:
              "flex items-center bg-indigo-50 rounded-full px-3 py-1 shrink-0 border border-indigo-100",
          },
          React.createElement(
            "span",
            {
              className:
                "text-indigo-400 font-black text-[10px] mr-1 uppercase",
            },
            "XP",
          ),
          React.createElement(
            "span",
            { className: "font-black text-indigo-700 text-[13px]" },
            xp,
          ),
        ),
      ),
      activeTab === "lectures" &&
        React.createElement(PinnedVideosBar, {
          pins: videoPins.pinnedVideos,
          onOpen: videoPins.scrollToPin,
          onUnpin: (pin) =>
            videoPins.togglePin({ unique_id: pin.id }, pin.title),
        }),
      appPromo &&
        React.createElement(
          "div",
          {
            className:
              "fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-5 animate-fade-in",
            onClick: () => setAppPromo(false),
          },
          React.createElement(
            "div",
            {
              className:
                "bg-white rounded-[30px] p-8 text-center shadow-2xl w-full max-w-sm slide-up relative mt-10",
              onClick: (e) => e.stopPropagation(),
            },
            React.createElement(
              "div",
              {
                className:
                  "absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center text-5xl shadow-xl border-4 border-white",
              },
              React.createElement("i", { className: "fas fa-mobile-alt" }),
            ),
            React.createElement(
              "h3",
              {
                className:
                  "font-black text-[22px] text-slate-800 mt-8 mb-2 leading-tight",
              },
              ("Available in " + ((window.APP_CONFIG && window.APP_CONFIG.appName) || "RG VERSE") + " App Only!"),
            ),
            React.createElement(
              "p",
              {
                className:
                  "text-[13px] font-bold text-slate-500 mb-6 px-1 leading-relaxed",
              },
              "Offline background downloads & ad-free streaming are exclusive to our Mobile App. Download it now! \u{1F680}",
            ),
            React.createElement(
              "button",
              {
                onClick: () => {
                  openExternalLink((window.APP_CONFIG && window.APP_CONFIG.telegramChannelUrl) || "https://t.me/RGVerseOfficial");
                  setAppPromo(false);
                },
                className:
                  "w-full bg-slate-800 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-transform mb-3",
              },
              React.createElement("i", { className: "fas fa-download mr-2" }),
              " DOWNLOAD APP NOW",
            ),
            React.createElement(
              "button",
              {
                onClick: () => setAppPromo(false),
                className:
                  "w-full bg-slate-50 text-slate-500 font-bold py-3.5 rounded-2xl active:bg-slate-100 transition-colors",
              },
              "Maybe Later",
            ),
          ),
        ),
      isLoading
        ? React.createElement(SkeletonLoader, null)
        : React.createElement(
            React.Fragment,
            null,
            availableTabs.length > 0 &&
              React.createElement(
                "div",
                {
                  className:
                    "sticky z-30 pt-4 pb-2 bg-slate-50/90 backdrop-blur-md px-4 border-b border-slate-100",
                  style: { top: "calc(55px + env(safe-area-inset-top, 0px))" },
                },
                React.createElement(
                  "div",
                  {
                    ref: tabsContainerRef,
                    className:
                      "flex overflow-x-auto no-scrollbar gap-2.5 pb-1 px-1",
                  },
                  availableTabs.map((tab) =>
                    React.createElement(
                      "button",
                      {
                        key: tab.id,
                        onClick: () => setActiveTab(tab.id),
                        className: `shrink-0 py-2.5 px-4 text-[13px] font-extrabold rounded-xl border transition-all flex items-center gap-2
                                        ${activeTab === tab.id ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-indigo-200 border-transparent" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"}`,
                      },
                      React.createElement("i", {
                        className: `fas ${getTabIcon(tab.id)} ${activeTab === tab.id ? "text-cyan-100" : "text-slate-400"}`,
                      }),
                      " ",
                      tab.label,
                    ),
                  ),
                ),
              ),
            activeTab === "lectures" &&
              React.createElement(
                "div",
                {
                  className:
                    "px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar items-center",
                },
                React.createElement(
                  "button",
                  {
                    onClick: () => setFilterStatus("all"),
                    className: `shrink-0 px-4 py-2 rounded-xl border text-[12px] font-bold transition-all flex items-center gap-1.5 ${filterStatus === "all" ? "bg-slate-800 border-slate-800 text-white shadow-md" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"}`,
                  },
                  React.createElement("i", { className: "fas fa-layer-group" }),
                  " All",
                ),
                React.createElement(
                  "button",
                  {
                    onClick: () => setFilterStatus("pending"),
                    className: `shrink-0 px-4 py-2 rounded-xl border text-[12px] font-bold transition-all flex items-center gap-1.5 ${filterStatus === "pending" ? "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-200" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"}`,
                  },
                  React.createElement("i", { className: "fas fa-clock" }),
                  " Pending",
                ),
                React.createElement(
                  "button",
                  {
                    onClick: () =>
                      openExternalLink(
                        `https://t.me/${botUsername ? botUsername.replace("@", "") : ((window.APP_CONFIG && window.APP_CONFIG.telegramBotName) || "RGVerseBot")}`,
                      ),
                    className:
                      "shrink-0 px-4 py-2 rounded-xl border-none text-[12px] font-bold transition-all flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-200 active:scale-95",
                  },
                  React.createElement("i", { className: "fas fa-ban" }),
                  " Remove Ads",
                ),
                React.createElement(
                  "button",
                  {
                    onClick: () => setFilterStatus("completed"),
                    className: `shrink-0 px-4 py-2 rounded-xl border text-[12px] font-bold transition-all flex items-center gap-1.5 ${filterStatus === "completed" ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"}`,
                  },
                  React.createElement("i", {
                    className: "fas fa-check-circle",
                  }),
                  " Completed",
                ),
              ),
            React.createElement(
              "div",
              {
                className: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${activeTab === "lectures" ? "mt-2" : "mt-4"} px-4`,
              },
              displayFiles.map((file, i) => {
                const isWatched = watchedMap[file.unique_id] === true;
                const hasExternalFallback =
                  file.external_fallback === true && Boolean(file.url);
                const isDummy =
                  (file.is_dummy === true ||
                    (file.file_type === "video" &&
                      (!file.message_id || file.message_id == 0))) &&
                  !hasExternalFallback;
                return React.createElement(
                  "div",
                  {
                    key: i,
                    ref: (element) =>
                      file.file_type === "video" &&
                      videoPins.setCardRef(file, element),
                    className: `bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden transition-all duration-300 mb-0 flex flex-col h-full ${isDummy ? "opacity-70" : ""}`,
                  },
                  React.createElement(
                    "div",
                    {
                      className: `relative w-full ${file.file_type === "video" ? "aspect-[16/9]" : "hidden"} flex flex-col justify-between p-4 overflow-hidden bg-slate-900 shrink-0`,
                    },
                    file.thumb_url
                      ? React.createElement(
                          React.Fragment,
                          null,
                          React.createElement("div", {
                            className:
                              "absolute inset-0 bg-gradient-to-br from-[#4f46e5] via-[#9333ea] to-[#e11d48]",
                          }),
                          React.createElement("img", {
                            src: String(file.thumb_url).replace(/https?:\/\/[^/]+\/api\/thumb\//, "/api/thumb/"),
                            loading: "lazy",
                            decoding: "async",
                            className:
                              "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                            alt: "",
                            onError: (e) => {
                              e.currentTarget.style.display = "none";
                            },
                          }),
                          React.createElement("div", {
                            className:
                              "absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent",
                          }),
                        )
                      : React.createElement(
                          React.Fragment,
                          null,
                          React.createElement("div", {
                            className:
                              "absolute inset-0 bg-gradient-to-br from-[#4f46e5] via-[#9333ea] to-[#e11d48]",
                          }),
                          React.createElement("div", {
                            className:
                              "absolute top-[-20%] right-[-10%] w-64 h-64 bg-cyan-400/40 rounded-full blur-3xl",
                          }),
                          React.createElement("div", {
                            className:
                              "absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-rose-400/40 rounded-full blur-3xl",
                          }),
                          React.createElement("i", {
                            className:
                              "fas fa-play-circle absolute -bottom-8 -right-6 text-white/20 text-[140px] rotate-[-10deg]",
                          }),
                        ),
                    React.createElement(
                      "div",
                      {
                        className:
                          "absolute top-0 left-0 w-full h-1 bg-white/10 z-20",
                      },
                      React.createElement("div", {
                        className: "h-full bg-emerald-400",
                        style: { width: isWatched ? "100%" : "0%" },
                      }),
                    ),
                    React.createElement(
                      "div",
                      {
                        className:
                          "relative z-10 flex justify-end items-start gap-2",
                      },
                      isWatched &&
                        React.createElement(
                          "span",
                          {
                            className:
                              "bg-emerald-500 text-white text-[10px] font-black px-2 py-1.5 rounded-lg shadow-lg",
                          },
                          React.createElement("i", {
                            className: "fas fa-check",
                          }),
                        ),
                      !isDummy &&
                        React.createElement(
                          "button",
                          {
                            onClick: () => setAttachmentModal(file),
                            className:
                              "bg-indigo-500/90 hover:bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg shadow-lg flex items-center transition-all",
                          },
                          React.createElement("i", {
                            className: "fas fa-paperclip mr-1.5",
                          }),
                          " Resources",
                        ),
                    ),
                    React.createElement(
                      "div",
                      {
                        className:
                          "absolute inset-0 flex items-center justify-center z-20 pointer-events-none",
                      },
                      React.createElement(
                        "button",
                        {
                          onClick: () =>
                            !isDummy && handleActionClick("watch", file),
                          className: `w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center shadow-2xl transition-all pointer-events-auto ${!isDummy ? "hover:scale-110 active:scale-95" : "opacity-50 cursor-not-allowed"}`,
                        },
                        React.createElement("i", {
                          className:
                            "fas fa-play text-white text-2xl ml-1 drop-shadow-lg",
                        }),
                      ),
                    ),
                  ),
                  file.file_type !== "video" &&
                    React.createElement(
                      "div",
                      {
                        className:
                          "p-4 pt-5 pb-4 bg-white border-b border-slate-100",
                      },
                      React.createElement(
                        "div",
                        { className: "flex items-start gap-4 mb-4" },
                        React.createElement(
                          "div",
                          {
                            className: `w-14 h-14 bg-gradient-to-br from-cyan-50 to-indigo-50 rounded-[14px] shrink-0 overflow-hidden flex items-center justify-center border border-cyan-100 relative`,
                          },
                          React.createElement("i", {
                            className: "fas fa-file-pdf text-cyan-400 text-2xl",
                          }),
                        ),
                        React.createElement(
                          "div",
                          { className: "flex-1 min-w-0" },
                          React.createElement(
                            "div",
                            {
                              className:
                                "flex justify-between items-start mb-1.5",
                            },
                            React.createElement(
                              "span",
                              {
                                className:
                                  "text-[10px] text-slate-400 font-medium tracking-wide uppercase",
                              },
                              "Document \u2022 2026",
                            ),
                            isWatched
                              ? React.createElement("i", {
                                  className:
                                    "fas fa-check-circle text-[16px] text-emerald-500",
                                })
                              : React.createElement("div", {
                                  className:
                                    "w-4 h-4 rounded-full border-2 border-slate-300",
                                }),
                          ),
                          React.createElement(
                            "h3",
                            {
                              className:
                                "font-extrabold text-[15px] leading-snug text-slate-800 break-words mb-1.5 pr-2",
                            },
                            String(file.file_name),
                          ),
                        ),
                      ),
                    ),
                  React.createElement(
                    "div",
                    { className: "p-4 bg-white flex flex-col gap-3" },
                    file.file_type === "video" &&
                      React.createElement(
                        "div",
                        { className: "mb-1" },
                        React.createElement(
                          "h3",
                          {
                            className:
                              "font-extrabold text-[16px] leading-snug text-slate-800 break-words line-clamp-2",
                          },
                          String(file.file_name),
                        ),
                        React.createElement(
                          "p",
                          {
                            className:
                              "text-slate-500 text-[11px] font-bold mt-1.5 uppercase tracking-wide flex items-center",
                          },
                          React.createElement("i", {
                            className: "fas fa-clock mr-1.5 text-indigo-400",
                          }),
                          isDummy ? "Waiting to Stream" : "Ready to Stream",
                          file.quality ? ` \u2022 ${file.quality}` : "",
                        ),
                      ),
                    React.createElement(
                      "div",
                      { className: "flex items-center gap-2 sm:gap-3" },
                      file.file_type === "video"
                        ? React.createElement(
                            "button",
                            {
                              onClick: () =>
                                !isDummy && handleActionClick("watch", file),
                              className: `min-w-0 flex-1 h-[48px] bg-[#6366f1] hover:bg-[#4f46e5] text-white font-extrabold text-[13px] rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-all whitespace-nowrap ${!isDummy ? "active:scale-95" : "cursor-not-allowed opacity-60"}`,
                            },
                            React.createElement("i", {
                              className: "fas fa-play mr-2",
                            }),
                            " WATCH VIDEO",
                          )
                        : React.createElement(
                            "button",
                            {
                              onClick: () =>
                                !isDummy && handleActionClick("watch", file),
                              className: `flex-1 h-[48px] bg-gradient-to-r from-rose-500 to-pink-600 text-white font-extrabold text-[13px] rounded-2xl flex items-center justify-center shadow-lg transition-all ${!isDummy ? "active:scale-95" : "cursor-not-allowed opacity-60"}`,
                            },
                            React.createElement("i", {
                              className: "fas fa-file-pdf mr-2",
                            }),
                            " READ DOCUMENT",
                          ),
                      React.createElement(
                        "button",
                        {
                          disabled: downloadingStatus[file.unique_id],
                          onClick: () =>
                            !isDummy && handleActionClick("download", file),
                          className: `w-[44px] h-[48px] shrink-0 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl transition-all duration-300 shadow-sm ${!isDummy && !downloadingStatus[file.unique_id] ? "text-slate-600 hover:bg-slate-100 active:scale-95" : "text-slate-400 opacity-50 cursor-not-allowed"}`,
                        },
                        downloadingStatus[file.unique_id]
                          ? React.createElement("i", {
                              className: "fas fa-spinner fa-spin text-[18px]",
                            })
                          : isDummy
                            ? React.createElement("i", {
                                className: "fas fa-lock opacity-50 text-[18px]",
                              })
                            : React.createElement("i", {
                                className: "fas fa-download text-[18px]",
                              }),
                      ),
                      React.createElement(
                        "button",
                        {
                          onClick: () => !isDummy && handleTelegramClick(file),
                          className: `w-[44px] h-[48px] shrink-0 flex items-center justify-center bg-[#f0f9ff] border border-[#bae6fd] rounded-2xl shadow-sm transition-all ${!isDummy && !telegramStatus[file.unique_id] ? "text-[#0ea5e9] hover:bg-[#e0f2fe] active:scale-95" : "text-slate-400 opacity-50 cursor-not-allowed"}`,
                        },
                        telegramStatus[file.unique_id]
                          ? React.createElement("i", {
                              className: "fas fa-spinner fa-spin text-[18px]",
                            })
                          : isDummy
                            ? React.createElement("i", {
                                className: "fas fa-lock opacity-50 text-[18px]",
                              })
                            : React.createElement("i", {
                                className: "fab fa-telegram-plane text-[20px]",
                              }),
                      ),
                      file.file_type === "video" &&
                        React.createElement(
                          "button",
                          {
                            onClick: () =>
                              !isDummy &&
                              videoPins.togglePin(file, file.file_name),
                            className: `w-[44px] h-[48px] shrink-0 flex items-center justify-center rounded-2xl border shadow-sm active:scale-95 transition-all ${videoPins.isPinned(file) ? "bg-amber-400 border-amber-400 text-white" : "bg-gradient-to-b from-amber-50 to-yellow-100 border-amber-200 text-amber-500 hover:from-amber-100 hover:to-yellow-200"}`,
                          },
                          React.createElement("i", {
                            className: "fas fa-thumbtack text-[18px]",
                          }),
                        ),
                    ),
                  ),
                );
              }),
              displayFiles.length === 0 &&
                (isUnverified
                  ? React.createElement(
                      "div",
                      {
                        className:
                          "text-center py-16 px-6 bg-white rounded-3xl border border-slate-100 shadow-sm mt-4 flex flex-col items-center justify-center",
                      },
                      React.createElement(
                        "div",
                        {
                          className:
                            "w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4",
                        },
                        React.createElement("i", {
                          className:
                            "fas fa-lock text-rose-500 text-2xl animate-pulse",
                        }),
                      ),
                      React.createElement(
                        "h3",
                        { className: "text-lg font-bold text-slate-800 mb-1" },
                        "Access Locked",
                      ),
                      React.createElement(
                        "p",
                        {
                          className:
                            "text-xs text-slate-500 max-w-xs mb-5 font-semibold",
                        },
                        "Daily token verification required to view the content of this subject.",
                      ),
                      lockedStats &&
                        React.createElement(
                          "div",
                          {
                            className:
                              "w-full max-w-xs bg-slate-50/50 border border-slate-100 rounded-2xl p-4 mb-6",
                          },
                          React.createElement(
                            "p",
                            {
                              className:
                                "text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 text-center",
                            },
                            "Locked Content Summary",
                          ),
                          React.createElement(
                            "div",
                            { className: "grid grid-cols-2 gap-2" },
                            lockedStats.lectures > 0 &&
                              React.createElement(
                                "div",
                                {
                                  className:
                                    "bg-white border border-slate-100 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-sm",
                                },
                                React.createElement(
                                  "span",
                                  { className: "text-base" },
                                  "\u{1F3A5}",
                                ),
                                React.createElement(
                                  "span",
                                  {
                                    className:
                                      "text-[13px] font-black text-slate-800 mt-1",
                                  },
                                  lockedStats.lectures,
                                  " Lectures",
                                ),
                              ),
                            lockedStats.notes > 0 &&
                              React.createElement(
                                "div",
                                {
                                  className:
                                    "bg-white border border-slate-100 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-sm",
                                },
                                React.createElement(
                                  "span",
                                  { className: "text-base" },
                                  "\u{1F4DD}",
                                ),
                                React.createElement(
                                  "span",
                                  {
                                    className:
                                      "text-[13px] font-black text-slate-800 mt-1",
                                  },
                                  lockedStats.notes,
                                  " PDF Notes",
                                ),
                              ),
                            lockedStats.dpp > 0 &&
                              React.createElement(
                                "div",
                                {
                                  className:
                                    "bg-white border border-slate-100 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-sm",
                                },
                                React.createElement(
                                  "span",
                                  { className: "text-base" },
                                  "\u{1F4C4}",
                                ),
                                React.createElement(
                                  "span",
                                  {
                                    className:
                                      "text-[13px] font-black text-slate-800 mt-1",
                                  },
                                  lockedStats.dpp,
                                  " DPP PDFs",
                                ),
                              ),
                            lockedStats.dpp_sol > 0 &&
                              React.createElement(
                                "div",
                                {
                                  className:
                                    "bg-white border border-slate-100 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-sm",
                                },
                                React.createElement(
                                  "span",
                                  { className: "text-base" },
                                  "\u{1F3AC}",
                                ),
                                React.createElement(
                                  "span",
                                  {
                                    className:
                                      "text-[13px] font-black text-slate-800 mt-1",
                                  },
                                  lockedStats.dpp_sol,
                                  " DPP Videos",
                                ),
                              ),
                            lockedStats.study_material > 0 &&
                              React.createElement(
                                "div",
                                {
                                  className:
                                    "bg-white border border-slate-100 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-sm col-span-2",
                                },
                                React.createElement(
                                  "span",
                                  { className: "text-base" },
                                  "\u{1F4DA}",
                                ),
                                React.createElement(
                                  "span",
                                  {
                                    className:
                                      "text-[13px] font-black text-slate-800 mt-1",
                                  },
                                  lockedStats.study_material,
                                  " Study Material",
                                ),
                              ),
                          ),
                        ),
                      React.createElement(
                        "button",
                        {
                          onClick: () =>
                            setTokenModal({
                              show: true,
                              file: null,
                              action: "subject_load",
                            }),
                          className:
                            "w-full max-w-xs bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-sm",
                        },
                        React.createElement("i", {
                          className: "fas fa-unlock-alt",
                        }),
                        " Unlock Batch Content",
                      ),
                    )
                  : React.createElement(
                      "div",
                      {
                        className:
                          "text-center py-20 text-slate-400 font-bold uppercase text-xs tracking-widest bg-slate-50 rounded-3xl border border-dashed border-slate-200 mt-4",
                      },
                      React.createElement("i", {
                        className:
                          "fas fa-box-open text-4xl mb-3 opacity-20 block",
                      }),
                      "No Content Found",
                    )),
            ),
          ),
      attachmentModal &&
        React.createElement(
          "div",
          {
            className:
              "fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[99999] flex items-end justify-center animate-fade-in",
            onClick: () => setAttachmentModal(null),
          },
          React.createElement(
            "div",
            {
              className:
                "bg-[#f8fafc] w-full rounded-t-[30px] slide-up pb-8 relative flex flex-col max-h-[85vh] shadow-2xl",
              onClick: (e) => e.stopPropagation(),
            },
            React.createElement(
              "div",
              {
                className:
                  "absolute -top-12 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg text-slate-500 text-lg cursor-pointer hover:bg-slate-50 transition-colors",
                onClick: () => setAttachmentModal(null),
              },
              React.createElement("i", { className: "fas fa-times" }),
            ),
            React.createElement(
              "div",
              {
                className:
                  "pt-6 pb-4 px-6 text-center border-b border-slate-200 bg-white rounded-t-[30px] shrink-0",
              },
              React.createElement(
                "h3",
                { className: "font-black text-[#1e293b] text-[18px]" },
                "Attachments",
              ),
            ),
            React.createElement(
              "div",
              { className: "px-5 py-5 overflow-y-auto space-y-6" },
              ((_b =
                (_a = attachmentModal.attached) == null ? void 0 : _a.notes) ==
              null
                ? void 0
                : _b.length) > 0 &&
                React.createElement(
                  "div",
                  null,
                  React.createElement(
                    "div",
                    {
                      className: "flex justify-between items-center mb-3 px-1",
                    },
                    React.createElement(
                      "h4",
                      {
                        className: "font-extrabold text-slate-800 text-[15px]",
                      },
                      "Class Notes",
                    ),
                    React.createElement("i", {
                      className: "fas fa-chevron-up text-slate-400 text-xs",
                    }),
                  ),
                  attachmentModal.attached.notes.map((att, idx) =>
                    React.createElement(
                      "div",
                      {
                        key: idx,
                        onClick: () => {
                          setAttachmentModal(null);
                          handleActionClick("watch", att);
                        },
                        className:
                          "border border-indigo-100 rounded-2xl p-3.5 mb-3 flex items-center gap-4 bg-white shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer",
                      },
                      React.createElement(
                        "div",
                        {
                          className:
                            "w-10 h-10 rounded-[12px] bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0",
                        },
                        React.createElement("i", {
                          className: "fas fa-file-pdf text-lg",
                        }),
                      ),
                      React.createElement(
                        "p",
                        {
                          className:
                            "font-bold text-slate-700 text-[13px] flex-1 leading-snug",
                        },
                        att.file_name,
                      ),
                    ),
                  ),
                ),
              ((_d =
                (_c = attachmentModal.attached) == null ? void 0 : _c.dpp) ==
              null
                ? void 0
                : _d.length) > 0 &&
                React.createElement(
                  "div",
                  null,
                  React.createElement(
                    "div",
                    {
                      className: "flex justify-between items-center mb-3 px-1",
                    },
                    React.createElement(
                      "h4",
                      {
                        className: "font-extrabold text-slate-800 text-[15px]",
                      },
                      "DPP PDF",
                    ),
                    React.createElement("i", {
                      className: "fas fa-chevron-up text-slate-400 text-xs",
                    }),
                  ),
                  attachmentModal.attached.dpp.map((att, idx) =>
                    React.createElement(
                      "div",
                      {
                        key: idx,
                        onClick: () => {
                          setAttachmentModal(null);
                          handleActionClick("watch", att);
                        },
                        className:
                          "border border-fuchsia-100 rounded-2xl p-3.5 mb-3 flex items-center gap-4 bg-white shadow-sm hover:shadow-md hover:border-fuchsia-300 transition-all cursor-pointer",
                      },
                      React.createElement(
                        "div",
                        {
                          className:
                            "w-10 h-10 rounded-[12px] bg-fuchsia-50 text-fuchsia-500 flex items-center justify-center shrink-0",
                        },
                        React.createElement("i", {
                          className: "fas fa-clipboard-list text-lg",
                        }),
                      ),
                      React.createElement(
                        "p",
                        {
                          className:
                            "font-bold text-slate-700 text-[13px] flex-1 leading-snug",
                        },
                        att.file_name,
                      ),
                    ),
                  ),
                ),
              ((_f =
                (_e = attachmentModal.attached) == null ? void 0 : _e.dppSol) ==
              null
                ? void 0
                : _f.length) > 0 &&
                React.createElement(
                  "div",
                  null,
                  React.createElement(
                    "div",
                    {
                      className: "flex justify-between items-center mb-3 px-1",
                    },
                    React.createElement(
                      "h4",
                      {
                        className: "font-extrabold text-slate-800 text-[15px]",
                      },
                      "DPP Video",
                    ),
                    React.createElement("i", {
                      className: "fas fa-chevron-up text-slate-400 text-xs",
                    }),
                  ),
                  attachmentModal.attached.dppSol.map((att, idx) =>
                    React.createElement(
                      "div",
                      {
                        key: idx,
                        onClick: () => {
                          setAttachmentModal(null);
                          handleActionClick("watch", att);
                        },
                        className:
                          "border border-cyan-100 rounded-2xl p-3.5 mb-3 flex items-center gap-4 bg-white shadow-sm hover:shadow-md hover:border-cyan-300 transition-all cursor-pointer",
                      },
                      React.createElement(
                        "div",
                        {
                          className:
                            "w-16 h-10 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0 relative overflow-hidden border border-cyan-100",
                        },
                        React.createElement("i", {
                          className: "fas fa-video text-cyan-500 text-xl",
                        }),
                        React.createElement(
                          "div",
                          {
                            className:
                              "absolute -bottom-1 -right-1 bg-cyan-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[7px] border border-white z-20",
                          },
                          React.createElement("i", {
                            className: "fas fa-play ml-0.5",
                          }),
                        ),
                      ),
                      React.createElement(
                        "div",
                        { className: "flex-1 min-w-0" },
                        React.createElement(
                          "p",
                          {
                            className:
                              "font-bold text-slate-800 text-[13px] truncate mb-1",
                          },
                          att.file_name,
                        ),
                        React.createElement(
                          "p",
                          { className: "text-slate-400 text-[10px]" },
                          React.createElement("i", {
                            className: "far fa-clock mr-1",
                          }),
                          " Solution",
                        ),
                      ),
                    ),
                  ),
                ),
              !((_h =
                (_g = attachmentModal.attached) == null ? void 0 : _g.notes) ==
              null
                ? void 0
                : _h.length) &&
                !((_j =
                  (_i = attachmentModal.attached) == null ? void 0 : _i.dpp) ==
                null
                  ? void 0
                  : _j.length) &&
                !((_l =
                  (_k = attachmentModal.attached) == null
                    ? void 0
                    : _k.dppSol) == null
                  ? void 0
                  : _l.length) &&
                React.createElement(
                  "div",
                  {
                    className:
                      "text-center py-6 text-slate-400 font-bold text-xs",
                  },
                  "No attachments found for this lecture.",
                ),
            ),
          ),
        ),
      React.createElement(TokenModal, {
        show: tokenModal.show,
        tokenInput,
        setTokenInput,
        tokenError,
        handleGetToken,
        handleSubmitToken,
        onClose: () => setTokenModal({ show: false, file: null, action: null }),
        tutorialLink,
      }),
    );
  };
  const TokenModal = ({
    show,
    tokenInput,
    setTokenInput,
    tokenError,
    handleGetToken,
    handleSubmitToken,
    onClose,
    tutorialLink,
  }) => {
    if (!show) return null;
    return React.createElement(
      "div",
      {
        className:
          "fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in",
        onClick: onClose,
      },
      React.createElement(
        "div",
        {
          className:
            "bg-white rounded-[24px] p-6 w-full max-w-sm shadow-2xl relative",
          onClick: (e) => e.stopPropagation(),
        },
        React.createElement(
          "div",
          {
            className:
              "absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors",
            onClick: onClose,
          },
          React.createElement("i", { className: "fas fa-times text-xl" }),
        ),
        React.createElement(
          "div",
          { className: "text-center mb-6 mt-2" },
          React.createElement(
            "div",
            {
              className:
                "w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm shadow-amber-200",
            },
            React.createElement("i", {
              className: "fas fa-key text-amber-500 text-2xl",
            }),
          ),
          React.createElement(
            "h3",
            { className: "text-[18px] font-black text-slate-800" },
            "Token Required",
          ),
          React.createElement(
            "p",
            { className: "text-[12px] text-slate-500 mt-1 font-bold" },
            "Free access needs daily token verification.",
          ),
        ),
        tokenError &&
          React.createElement(
            "div",
            {
              className:
                "bg-rose-50 border border-rose-100 rounded-xl p-3 mb-4 flex items-center gap-2",
            },
            React.createElement("i", {
              className: "fas fa-exclamation-circle text-rose-500",
            }),
            React.createElement(
              "p",
              { className: "text-rose-600 text-[11px] font-bold flex-1" },
              tokenError,
            ),
          ),
        React.createElement(
          "div",
          { className: "space-y-4" },
          React.createElement(
            "button",
            {
              onClick: handleGetToken,
              className:
                "w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm",
            },
            React.createElement("i", {
              className: "fas fa-link text-[12px] opacity-80",
            }),
            " 1. GET VERIFICATION LINK",
          ),
          React.createElement(
            "div",
            { className: "relative my-2" },
            React.createElement(
              "div",
              { className: "absolute inset-0 flex items-center" },
              React.createElement("div", {
                className: "w-full border-t border-slate-100",
              }),
            ),
            React.createElement(
              "div",
              { className: "relative flex justify-center" },
              React.createElement(
                "span",
                {
                  className:
                    "bg-white px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest",
                },
                "ENTER VERIFIED TOKEN",
              ),
            ),
          ),
          React.createElement("input", {
            type: "text",
            placeholder: "e.g. RG-XXXXXX",
            value: tokenInput,
            onChange: (e) => setTokenInput(e.target.value.toUpperCase()),
            className:
              "w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-center font-black text-slate-700 tracking-wider focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:font-bold placeholder:text-slate-300 placeholder:tracking-normal uppercase",
          }),
          React.createElement(
            "button",
            {
              onClick: handleSubmitToken,
              className:
                "w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-black py-4 rounded-xl shadow-lg shadow-rose-500/20 active:scale-95 transition-all text-sm",
            },
            React.createElement("i", { className: "fas fa-unlock-alt mr-1.5" }),
            " 2. VERIFY & WATCH CONTENT",
          ),
          tutorialLink &&
            React.createElement(
              "button",
              {
                onClick: () => window.open(tutorialLink, "_blank"),
                className:
                  "w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3.5 rounded-xl border border-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs",
              },
              React.createElement("i", {
                className: "fas fa-play-circle text-rose-500 text-sm",
              }),
              " How to Verify? (Watch Tutorial)",
            ),
        ),
        React.createElement(
          "p",
          {
            className: "text-center mt-5 text-[10px] font-bold text-slate-400",
          },
          React.createElement("i", { className: "fas fa-info-circle mr-1" }),
          "Token is valid for 24 hours.",
        ),
      ),
    );
  };
  const PLATFORM_CONFIG = {
    useKgsEngine: ["kgs", "khan", "upsc", "careerwill", "allen"],
  };
  const MainRouter = (props) => {
    const isKgsEngine = useMemo(() => {
      const sub = String(props.subject || "").toLowerCase();
      const bat = String(props.batch || props.batch_name || "").toLowerCase();
      return PLATFORM_CONFIG.useKgsEngine.some((keyword) =>
        `${sub} ${bat}`.includes(keyword),
      );
    }, [props.subject, props.batch, props.batch_name]);
    return isKgsEngine
      ? React.createElement(KgsView, { ...props })
      : React.createElement(PwView, { ...props });
  };
  window.ContentScreen = (props) =>
    React.createElement(
      ErrorBoundary,
      null,
      React.createElement(MainRouter, { ...props }),
    );
})();
