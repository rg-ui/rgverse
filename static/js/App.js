(() => {
  const { useState, useEffect } = window.React;
  const WhatsAppPopup = ({ onClose, config }) => {
    window.dismissWaPopup = onClose;
    const finalHtml = (window.APP_CONFIG && window.APP_CONFIG.noticePopup && window.APP_CONFIG.noticePopup.html) || (config && config.wa_popup_html);
    if (!finalHtml && config && config.wa_popup_enabled === "off") return null;
    return React.createElement(
      "div",
      {
        className:
          "fixed inset-0 z-[999] flex justify-center items-center bg-slate-900/60 backdrop-blur-sm p-4",
        onClick: onClose,
      },
      React.createElement(
        "div",
        {
          className:
            "bg-white w-full max-w-[360px] rounded-[28px] p-6 relative shadow-2xl animate-fade-in-up",
          onClick: (e) => e.stopPropagation(),
        },
        React.createElement(
          "button",
          {
            onClick: onClose,
            className:
              "absolute top-4 right-4 w-8 h-8 bg-slate-100 rounded-full flex justify-center items-center text-slate-500 hover:bg-slate-200 transition-colors",
          },
          React.createElement("i", { className: "fas fa-times" }),
        ),
        finalHtml
          ? React.createElement("div", {
              dangerouslySetInnerHTML: { __html: finalHtml },
            })
          : React.createElement(
              React.Fragment,
              null,
              React.createElement(
                "div",
                { className: "flex items-center gap-3 mb-5 mt-2" },
                React.createElement(
                  "div",
                  { className: "text-4xl drop-shadow-md" },
                  "\u{1F4E2}",
                ),
                React.createElement(
                  "div",
                  { className: "leading-tight" },
                  React.createElement(
                    "div",
                    { className: "text-xl font-extrabold text-slate-800" },
                    (config && config.wa_popup_title1) ||
                      "Hello Future Topper!",
                  ),
                  React.createElement(
                    "div",
                    { className: "text-lg font-extrabold text-indigo-500" },
                    (config && config.wa_popup_title2) || "A Quick Update...",
                  ),
                ),
              ),
              React.createElement(
                "div",
                {
                  className:
                    "bg-amber-50 rounded-xl p-3 flex items-start gap-2 mb-4 border border-amber-100",
                },
                React.createElement("i", {
                  className: "fas fa-shield-check text-amber-500 mt-1 text-lg",
                }),
                React.createElement(
                  "div",
                  { className: "text-[13px] text-slate-600 leading-tight" },
                  React.createElement(
                    "b",
                    { className: "text-amber-600" },
                    "Reminder:",
                  ),
                  " This app is totally FREE.",
                  React.createElement("br", null),
                  "If someone charged you, ask for a refund!",
                ),
              ),
              React.createElement(
                "div",
                { className: "border border-slate-200 rounded-2xl p-4 mb-4" },
                React.createElement(
                  "div",
                  { className: "flex items-start gap-3 mb-3" },
                  React.createElement(
                    "div",
                    {
                      className:
                        "bg-green-100 text-green-500 w-8 h-8 rounded-full flex justify-center items-center shrink-0",
                    },
                    React.createElement("i", { className: "fas fa-check" }),
                  ),
                  React.createElement(
                    "div",
                    { className: "text-[13px] text-slate-700 leading-snug" },
                    "We face constant copyright strikes on Telegram. To make sure your preparation never stops, we've created an ",
                    React.createElement(
                      "span",
                      { className: "text-green-600 font-extrabold" },
                      "Official WhatsApp Community!",
                    ),
                  ),
                ),
                React.createElement(
                  "div",
                  { className: "flex items-start gap-3" },
                  React.createElement(
                    "div",
                    {
                      className:
                        "bg-indigo-100 text-indigo-500 w-8 h-8 rounded-full flex justify-center items-center shrink-0 text-xs",
                    },
                    React.createElement("i", { className: "fas fa-users" }),
                  ),
                  React.createElement(
                    "div",
                    { className: "text-[13px] text-slate-700 leading-snug" },
                    "Join us there for safe updates, daily materials, and official links.",
                  ),
                ),
              ),
              React.createElement(
                "div",
                {
                  className:
                    "bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-2xl p-4 mb-5 text-center relative mt-6",
                },
                React.createElement(
                  "div",
                  {
                    className:
                      "absolute -top-5 -right-3 w-12 h-12 bg-[#25D366] text-white rounded-full flex justify-center items-center text-3xl shadow-lg border-2 border-white",
                  },
                  React.createElement("i", { className: "fab fa-whatsapp" }),
                ),
                React.createElement(
                  "div",
                  {
                    className:
                      "text-[12px] font-extrabold text-slate-800 mb-0.5",
                  },
                  "JOIN OUR OFFICIAL",
                ),
                React.createElement(
                  "div",
                  {
                    className: "text-[14px] font-extrabold text-green-600 mb-4",
                  },
                  "WHATSAPP CHANNEL!",
                ),
                React.createElement(
                  "div",
                  { className: "flex justify-between mb-3 px-1" },
                  React.createElement(
                    "div",
                    { className: "flex flex-col items-center w-1/4" },
                    React.createElement(
                      "div",
                      {
                        className:
                          "w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex justify-center items-center mb-1",
                      },
                      React.createElement("i", {
                        className: "fas fa-book-open",
                      }),
                    ),
                    React.createElement(
                      "span",
                      {
                        className:
                          "text-[9px] font-bold text-slate-600 text-center leading-tight",
                      },
                      "Study",
                      React.createElement("br", null),
                      "Materials",
                    ),
                  ),
                  React.createElement(
                    "div",
                    { className: "flex flex-col items-center w-1/4" },
                    React.createElement(
                      "div",
                      {
                        className:
                          "w-9 h-9 rounded-full bg-green-100 text-green-600 flex justify-center items-center mb-1",
                      },
                      React.createElement("i", {
                        className: "fas fa-file-pdf",
                      }),
                    ),
                    React.createElement(
                      "span",
                      {
                        className:
                          "text-[9px] font-bold text-slate-600 text-center leading-tight",
                      },
                      "PDF",
                      React.createElement("br", null),
                      "Notes",
                    ),
                  ),
                  React.createElement(
                    "div",
                    { className: "flex flex-col items-center w-1/4" },
                    React.createElement(
                      "div",
                      {
                        className:
                          "w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex justify-center items-center mb-1",
                      },
                      React.createElement("i", { className: "fas fa-bell" }),
                    ),
                    React.createElement(
                      "span",
                      {
                        className:
                          "text-[9px] font-bold text-slate-600 text-center leading-tight",
                      },
                      "Instant",
                      React.createElement("br", null),
                      "Alerts",
                    ),
                  ),
                  React.createElement(
                    "div",
                    { className: "flex flex-col items-center w-1/4" },
                    React.createElement(
                      "div",
                      {
                        className:
                          "w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex justify-center items-center mb-1",
                      },
                      React.createElement("i", {
                        className: "fas fa-microphone",
                      }),
                    ),
                    React.createElement(
                      "span",
                      {
                        className:
                          "text-[9px] font-bold text-slate-600 text-center leading-tight",
                      },
                      "Live",
                      React.createElement("br", null),
                      "Updates",
                    ),
                  ),
                ),
                React.createElement(
                  "div",
                  {
                    className:
                      "inline-block bg-indigo-500 text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase shadow-sm",
                  },
                  "Exclusive to RG VERSE",
                ),
              ),
              React.createElement(
                "button",
                {
                  onClick: () => {
                    openExternalLink(
                      (config && config.wa_popup_link) ||
                        ((window.APP_CONFIG && window.APP_CONFIG.whatsappUrl) || "https://whatsapp.com/channel/RGVerseCommunity"),
                    );
                    onClose();
                  },
                  className:
                    "w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3.5 rounded-xl font-extrabold text-[15px] mb-2 flex justify-center items-center shadow-lg shadow-indigo-200 active:scale-95 transition-transform",
                },
                React.createElement("i", {
                  className: "fab fa-whatsapp text-xl mr-2",
                }),
                " JOIN NOW ",
                React.createElement("i", {
                  className:
                    "fas fa-chevron-right absolute right-8 text-sm opacity-80",
                }),
              ),
              React.createElement(
                "button",
                {
                  onClick: onClose,
                  className:
                    "w-full bg-white text-indigo-600 border-2 border-indigo-50 py-3 rounded-xl font-extrabold text-[14px] active:scale-95 transition-transform",
                },
                "Cancel",
              ),
            ),
      ),
      React.createElement("style", {
        dangerouslySetInnerHTML: {
          __html: `
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                .animate-fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `,
        },
      }),
    );
  };
  window.App = function App() {
    const {
      SERVER_URL,
      tg,
      openExternalLink: openExternalLink2,
      showAppAlert,
    } = window;
    const [isComponentsLoaded, setIsComponentsLoaded] = useState(false);
    useEffect(() => {
      const checkComponents = () => {
        const {
          HomeScreen,
          SubjectsScreen,
          ChaptersScreen,
          ContentScreen,
          SocialsScreen,
          ProfileScreen,
          PwCatalogScreen,
          PwBatchScreen,
          PwVideoScreen,
          PwSubjectsScreen,
          PwChaptersScreen,
          PwContentsScreen,
          ApnaCollegeBatchScreen,
          NextTopperScreen,
        } = window;
        if (
          HomeScreen &&
          SubjectsScreen &&
          ChaptersScreen &&
          ContentScreen &&
          SocialsScreen &&
          ProfileScreen &&
          PwCatalogScreen &&
          PwBatchScreen &&
          PwVideoScreen &&
          PwSubjectsScreen &&
          PwChaptersScreen &&
          PwContentsScreen &&
          ApnaCollegeBatchScreen &&
          NextTopperScreen
        ) {
          setIsComponentsLoaded(true);
        } else {
          setTimeout(checkComponents, 50);
        }
      };
      checkComponents();
    }, []);
    const urlParams = new URLSearchParams(window.location.search);
    const pushBatch = String(urlParams.get("batch") || "")
      .trim()
      .slice(0, 300);
    const savedState =
      JSON.parse(sessionStorage.getItem("akki_app_state")) || {};
    const [currentScreen, setCurrentScreen] = useState(() => {
      const sc = pushBatch ? "subjects" : savedState.screen || "home";
      return sc === "library" ? "home" : sc;
    });
    const [activeNav, setActiveNav] = useState(() => {
      const nv = pushBatch ? "batches" : savedState.nav || "batches";
      return nv === "library" ? "batches" : nv;
    });
    const [selectedBatch, setSelectedBatch] = useState(
      pushBatch || savedState.batch || null,
    );
    const [selectedSubject, setSelectedSubject] = useState(
      pushBatch ? null : savedState.subject || null,
    );
    const [selectedChapter, setSelectedChapter] = useState(
      pushBatch ? null : savedState.chapter || null,
    );
    const [activeCategory, setActiveCategory] = useState(
      pushBatch
        ? urlParams.get("category") || "OTHERS"
        : savedState.category || "OTHERS",
    );
    const [activeFolder, setActiveFolder] = useState(
      pushBatch ? urlParams.get("folder") || null : savedState.folder || null,
    );
    const [activeUniverse, setActiveUniverse] = useState(
      pushBatch
        ? urlParams.get("universe") === "KGS"
          ? "KGS"
          : "PW"
        : savedState.universe || "PW",
    );
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = window.React.useRef(null);
    useEffect(() => {
      var _a;
      if (!sidebarOpen) return;
      const previousFocus = document.activeElement;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      (_a = sidebarRef.current) == null ? void 0 : _a.focus();
      const onKeyDown = (event) => {
        var _a2;
        if (event.key === "Escape") {
          event.preventDefault();
          setSidebarOpen(false);
        }
        if (event.key !== "Tab") return;
        const targets = Array.from(
          ((_a2 = sidebarRef.current) == null
            ? void 0
            : _a2.querySelectorAll(
                'button:not([disabled]), a[href], [tabindex="0"]',
              )) || [],
        );
        if (!targets.length) {
          event.preventDefault();
          return;
        }
        const first = targets[0],
          last = targets[targets.length - 1];
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === sidebarRef.current)
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            document.activeElement === sidebarRef.current)
        ) {
          event.preventDefault();
          first.focus();
        }
      };
      document.addEventListener("keydown", onKeyDown);
      return () => {
        document.body.style.overflow = previousOverflow;
        document.removeEventListener("keydown", onKeyDown);
        if (previousFocus == null ? void 0 : previousFocus.isConnected)
          previousFocus.focus();
      };
    }, [sidebarOpen]);
    const [isShortFolderList, setIsShortFolderList] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState("Processing...");
    const [savedBatches, setSavedBatches] = useState(
      () => JSON.parse(localStorage.getItem("akki_saved_batches_v3")) || [],
    );
    const [virtualId, setVirtualId] = useState(null);
    const [batchMeta, setBatchMeta] = useState({});
    const [appConfig, setAppConfig] = useState(() =>
      window.APP_CONFIG && window.APP_CONFIG.noticePopup && window.APP_CONFIG.noticePopup.enabled
        ? {
            success: true,
            wa_popup_enabled: "on",
            wa_popup_html: window.APP_CONFIG.noticePopup.html,
          }
        : null
    );
    useEffect(() => {
      let alive = true,
        busy = false;
      const refreshConfig = async () => {
        if (busy || document.hidden) return;
        busy = true;
        try {
          const response = await fetch(`${SERVER_URL}/api/app_config`, {
            cache: "no-store",
          });
          if (!response.ok) throw new Error("Popup config unavailable");
          const data = await response.json();
          if (alive && data.success)
            setAppConfig((previous) =>
              JSON.stringify(previous) === JSON.stringify(data)
                ? previous
                : data,
            );
        } catch (e) {
          console.error("Config fetch error:", e);
        } finally {
          busy = false;
        }
      };
      refreshConfig();
      const timer = setInterval(refreshConfig, 3e4);
      document.addEventListener("visibilitychange", refreshConfig);
      return () => {
        alive = false;
        clearInterval(timer);
        document.removeEventListener("visibilitychange", refreshConfig);
      };
    }, []);
    const [isChrome, setIsChrome] = useState(false);
    const [isChromePremium, setIsChromePremium] = useState(
      localStorage.getItem("akki_chrome_premium_status") === "true",
    );
    const [displayName, setDisplayName] = useState(((window.APP_CONFIG && window.APP_CONFIG.defaultStudentName) || "RG Student"));
    const [displayUser, setDisplayUser] = useState("Free Access");
    const [isRestoringScroll, setIsRestoringScroll] = useState(false);
    const [showWaPopup, setShowWaPopup] = useState(false);
    const showBottomNav =
      (currentScreen === "home" && activeFolder === null) ||
      ["socials", "profile"].includes(currentScreen);
    const useInlineBottomNav = false;
    useEffect(() => {
      const handlePageShow = (event) => {
        if (event.persisted) {
          setIsVerifying(false);
        }
      };
      window.addEventListener("pageshow", handlePageShow);
      return () => window.removeEventListener("pageshow", handlePageShow);
    }, []);
    useEffect(() => {
      if (!appConfig || appConfig.wa_popup_enabled === "off") {
        setShowWaPopup(false);
        return;
      }
      const hasSeenPopup = sessionStorage.getItem("akki_wa_popup_seen");
      if (!hasSeenPopup) {
        const timer = setTimeout(() => setShowWaPopup(true), 3e3);
        return () => clearTimeout(timer);
      }
    }, [appConfig]);
    const closeWaPopup = () => {
      setShowWaPopup(false);
      sessionStorage.setItem("akki_wa_popup_seen", "true");
    };
    window.dismissWaPopup = closeWaPopup;
    const [botUsername, setBotUsername] = useState(() => {
      const urlBot = urlParams.get("bot");
      if (urlBot && urlBot !== "AkkiRobo_Bot") {
        localStorage.setItem("akki_bot_username", urlBot);
        return urlBot;
      }
      return localStorage.getItem("akki_bot_username") || "";
    });
    useEffect(() => {
      const timer = setTimeout(() => {
        const key = `scroll_${currentScreen}_${activeCategory}_${activeFolder}_${selectedBatch}_${selectedSubject}`;
        const savedScroll = sessionStorage.getItem(key);
        if (savedScroll !== null) {
          window.scrollTo({
            top: parseInt(savedScroll, 10),
            behavior: "instant",
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }, []);
    useEffect(() => {
      let timeoutId;
      const handleScroll = () => {
        if (isRestoringScroll) return;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const key = `scroll_${currentScreen}_${activeCategory}_${activeFolder}_${selectedBatch}_${selectedSubject}`;
          sessionStorage.setItem(key, window.scrollY);
        }, 100);
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", handleScroll);
        clearTimeout(timeoutId);
      };
    }, [
      currentScreen,
      activeCategory,
      activeFolder,
      selectedBatch,
      selectedSubject,
      isRestoringScroll,
    ]);
    useEffect(() => {
      const isRunningInMobileApp =
        navigator.userAgent.includes("AkkiStudyX_App");
      if (virtualId) {
        const isOneSignalStarted = sessionStorage.getItem(
          "akki_onesignal_started",
        );
        if (!isOneSignalStarted) {
          if (!isRunningInMobileApp && window.OneSignalDeferred) {
            window.OneSignalDeferred.push(function (OneSignal) {
              OneSignal.login(String(virtualId));
              OneSignal.User.addTag(
                "is_premium",
                isChromePremium ? "true" : "false",
              );
            });
          } else if (isRunningInMobileApp && window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({
                action: "onesignal_login",
                externalId: String(virtualId),
                isPremium: isChromePremium ? "true" : "false",
              }),
            );
          }
          sessionStorage.setItem("akki_onesignal_started", "true");
        }
      }
    }, [virtualId, isChromePremium]);
    useEffect(() => {
      const tgUser = tg && tg.initDataUnsafe && tg.initDataUnsafe.user;
      if (tgUser && tgUser.id) {
        setVirtualId(tgUser.id);
        setIsChrome(false);
        setDisplayName(tgUser.first_name);
        setDisplayUser(
          tgUser.username ? `@${tgUser.username}` : "Telegram User",
        );
        fetch(`${SERVER_URL}/api/check_premium?u=${tgUser.id}&_t=${Date.now()}`)
          .then((r) => r.json())
          .then((res) => {
            if (res.success && res.is_premium) {
              setIsChromePremium(true);
              setDisplayUser("VIP Access");
            }
          })
          .catch((e) => console.log(e));
      } else {
        setIsChrome(true);
        let finalId = localStorage.getItem("akki_virtual_id");
        if (!finalId) {
          finalId = Math.floor(Math.random() * 9e9) + 1e9;
          localStorage.setItem("akki_virtual_id", finalId);
        }
        setVirtualId(finalId);
        const savedName = localStorage.getItem("akki_chrome_name");
        if (savedName) setDisplayName(savedName);
        if (localStorage.getItem("akki_chrome_premium_status") === "true")
          setDisplayUser("VIP Access");
      }
    }, []);
    useEffect(() => {
      const expiry = localStorage.getItem("akki_premium_expiry");
      if (
        localStorage.getItem("akki_chrome_premium_status") === "true" &&
        expiry
      ) {
        const timeLeft = parseInt(expiry) - Date.now();
        const daysLeft = Math.ceil(timeLeft / (1e3 * 60 * 60 * 24));
        if (timeLeft <= 0) {
          localStorage.removeItem("akki_chrome_premium_status");
          localStorage.removeItem("akki_premium_uid");
          localStorage.removeItem("akki_premium_expiry");
          setIsChromePremium(false);
          setDisplayUser("Free Access");
          setDisplayName(((window.APP_CONFIG && window.APP_CONFIG.defaultStudentName) || "RG Student"));
          setTimeout(() => {
            showAppAlert(
              "\u26A0\uFE0F Your Premium Plan has expired! Free Access Enabled.",
              () => window.location.reload(),
            );
          }, 300);
        } else if (daysLeft <= 2 && !sessionStorage.getItem("akki_prem_warn")) {
          sessionStorage.setItem("akki_prem_warn", "true");
          setTimeout(
            () =>
              showAppAlert(
                `\u26A0\uFE0F ALERT: Premium Plan expires in ${daysLeft} days!`,
              ),
            500,
          );
        }
      }
    }, [isChromePremium]);
    useEffect(() => {
      const handlePopState = (event) => {
        var _a;
        if (
          window.__studyxpwPlayerOverlayOpen &&
          ((_a = event.state) == null ? void 0 : _a.screen) === "pw_contents"
        )
          return;
        if (event.state && event.state.screen) {
          setIsRestoringScroll(true);
          setCurrentScreen(event.state.screen);
          setActiveNav(event.state.nav || "batches");
          setSelectedBatch(event.state.batch || null);
          setSelectedSubject(event.state.subject || null);
          setSelectedChapter(event.state.chapter || null);
          setActiveCategory(event.state.category || "SAVED");
          setActiveFolder(event.state.folder || null);
          setTimeout(() => {
            const key = `scroll_${event.state.screen}_${event.state.category || "SAVED"}_${event.state.folder || "null"}_${event.state.batch || "null"}_${event.state.subject || "null"}`;
            const savedScroll = sessionStorage.getItem(key);
            if (savedScroll !== null) {
              window.scrollTo({
                top: parseInt(savedScroll, 10),
                behavior: "instant",
              });
            } else {
              window.scrollTo({ top: 0, behavior: "instant" });
            }
            if (event.state.universe) setActiveUniverse(event.state.universe);
            setIsRestoringScroll(false);
          }, 50);
        } else {
          setCurrentScreen("home");
          setActiveFolder(null);
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      };
      if (pushBatch) {
        window.history.replaceState(
          {
            screen: "home",
            nav: "batches",
            category: activeCategory,
            folder: null,
            batch: null,
            universe: activeUniverse,
          },
          "",
          window.location.pathname,
        );
        window.history.pushState(
          {
            screen: "subjects",
            nav: "batches",
            batch: pushBatch,
            subject: null,
            chapter: null,
            category: activeCategory,
            folder: activeFolder,
            universe: activeUniverse,
          },
          "",
          "?view=subjects",
        );
      } else {
        window.history.replaceState(
          {
            screen: currentScreen,
            nav: activeNav,
            batch: selectedBatch,
            subject: selectedSubject,
            chapter: selectedChapter,
            category: activeCategory,
            folder: activeFolder,
            universe: activeUniverse,
          },
          "",
          window.location.pathname,
        );
      }
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }, []);
    useEffect(() => {
      sessionStorage.setItem(
        "akki_app_state",
        JSON.stringify({
          screen: currentScreen,
          nav: activeNav,
          batch: selectedBatch,
          subject: selectedSubject,
          chapter: selectedChapter,
          category: activeCategory,
          folder: activeFolder,
          universe: activeUniverse,
        }),
      );
    }, [
      currentScreen,
      activeNav,
      selectedBatch,
      selectedSubject,
      selectedChapter,
      activeCategory,
      activeFolder,
      activeUniverse,
    ]);
    useEffect(() => {
      if (tg && tg.BackButton) {
        if (currentScreen !== "home" || activeFolder !== null)
          tg.BackButton.show();
        else tg.BackButton.hide();
        const handleTgBack = () => {
          if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred("medium");
          window.history.back();
        };
        tg.onEvent("backButtonClicked", handleTgBack);
        return () => tg.offEvent("backButtonClicked", handleTgBack);
      }
    }, [currentScreen, activeFolder]);
    if (!isComponentsLoaded) {
      return React.createElement(
        "div",
        {
          style: {
            minHeight: "100vh",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(145deg, #0b1020, #111a32 55%, #17122e)",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          },
        },
        React.createElement(
          "div",
          {
            style: {
              width: "min(88%, 420px)",
              padding: "56px 28px",
              borderRadius: "32px",
              textAlign: "center",
              background: "rgba(30, 41, 59, 0.92)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
            },
          },
          React.createElement(
            "div",
            {
              style: {
                width: "128px",
                height: "128px",
                margin: "0 auto 28px",
                borderRadius: "28px",
                overflow: "hidden",
                background: "#8b5cf6",
              },
            },
            React.createElement("img", {
              src: "/static/images/remote/OMvAm.jpg",
              alt: ((window.APP_CONFIG && window.APP_CONFIG.appFullName) || "RG Study Verse"),
              style: { width: "100%", height: "100%", objectFit: "cover" },
            }),
          ),
          React.createElement(
            "h2",
            {
              style: {
                margin: 0,
                color: "#ffffff",
                fontSize: "28px",
                fontWeight: "900",
                letterSpacing: "1px",
              },
            },
            ((window.APP_CONFIG && window.APP_CONFIG.appName) || "RG VERSE"),
          ),
          React.createElement(
            "p",
            {
              style: {
                margin: "12px 0 32px",
                color: "#b9c4d6",
                fontSize: "16px",
                fontWeight: "600",
              },
            },
            "Establishing secure connection...",
          ),
          React.createElement(
            "div",
            {
              style: {
                height: "8px",
                width: "100%",
                overflow: "hidden",
                borderRadius: "99px",
                background: "#475569",
              },
            },
            React.createElement("div", {
              style: {
                width: "68%",
                height: "100%",
                borderRadius: "99px",
                background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
              },
            }),
          ),
        ),
      );
    }
    const navigateTo = (screen, data = {}, replace = false) => {
      if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred("light");
      if (screen === "library") {
        screen = "home";
        data.nav = "batches";
      }
      setCurrentScreen(screen);
      let sNav = data.nav !== void 0 ? data.nav : activeNav;
      let sBatch = data.batch !== void 0 ? data.batch : selectedBatch;
      let sSubj = data.subject !== void 0 ? data.subject : selectedSubject;
      let sChapter = data.chapter !== void 0 ? data.chapter : selectedChapter;
      let sCat = data.category !== void 0 ? data.category : activeCategory;
      let sFold = data.folder !== void 0 ? data.folder : activeFolder;
      let sUniv = data.universe !== void 0 ? data.universe : activeUniverse;
      setActiveNav(sNav);
      setSelectedBatch(sBatch);
      setSelectedSubject(sSubj);
      setSelectedChapter(sChapter);
      setActiveCategory(sCat);
      setActiveFolder(sFold);
      setActiveUniverse(sUniv);
      const stateObj = {
        screen,
        nav: sNav,
        batch: sBatch,
        subject: sSubj,
        chapter: sChapter,
        category: sCat,
        folder: sFold,
        universe: sUniv,
        resume_action: data.resume_action || false,
        resume_file: data.resume_file || null,
      };
      if (replace) window.history.replaceState(stateObj, "", `?view=${screen}`);
      else {
        window.history.pushState(stateObj, "", `?view=${screen}`);
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    };
    const handleToggleSave = (batchTitle) => {
      const safeTitle = String(batchTitle);
      setSavedBatches((prev) => {
        const isAlreadySaved = prev.includes(safeTitle);
        let updated = isAlreadySaved
          ? prev.filter((b) => b !== safeTitle)
          : [...prev, safeTitle];
        localStorage.setItem("akki_saved_batches_v3", JSON.stringify(updated));
        if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred("light");
        return updated;
      });
    };
    const openNativeDownloads = () => {
      if (window.ReactNativeWebView)
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ action: "open_downloads" }),
        );
      else
        showAppAlert(
          ("Please use " + ((window.APP_CONFIG && window.APP_CONFIG.appName) || "RG VERSE") + " Mobile App to view offline downloads."),
        );
    };
    const renderScreen = () => {
      const currentState = window.history.state || {};
      const {
        HomeScreen,
        SubjectsScreen,
        ChaptersScreen,
        ContentScreen,
        SocialsScreen,
        ProfileScreen,
        PwCatalogScreen,
        PwBatchScreen,
        PwVideoScreen,
        PwSubjectsScreen,
        PwChaptersScreen,
        PwContentsScreen,
        ApnaCollegeBatchScreen,
        NextTopperScreen,
      } = window;
      switch (currentScreen) {
        case "home":
          return React.createElement(HomeScreen, {
            onNavigate: navigateTo,
            savedBatches,
            onToggleSave: handleToggleSave,
            botUsername,
            batchMeta,
            setBatchMeta,
            activeCategory,
            activeFolder,
            activeUniverse,
            onFolderCountChange: setIsShortFolderList,
          });
        case "ac_batch":
          return React.createElement(ApnaCollegeBatchScreen, {
            key: selectedBatch,
            batchId: selectedBatch,
          });
        case "nt_catalog":
          return React.createElement(NextTopperScreen, {
            batchId: null,
            folderId: null,
            onNavigate: navigateTo,
          });
        case "nt_course":
          return React.createElement(NextTopperScreen, {
            key: selectedBatch + "-" + selectedSubject,
            batchId: selectedBatch,
            folderId: selectedSubject || "0",
            onNavigate: navigateTo,
          });
        case "pw_catalog":
          return React.createElement(PwCatalogScreen, {
            onNavigate: navigateTo,
          });
        case "pw_subjects":
          return React.createElement(PwSubjectsScreen, {
            batchId: selectedBatch,
            onNavigate: navigateTo,
          });
        case "pw_chapters":
          return React.createElement(PwChaptersScreen, {
            batchId: selectedBatch,
            subjectId: selectedSubject,
            onNavigate: navigateTo,
          });
        case "pw_contents":
          return React.createElement(PwContentsScreen, {
            batchId: selectedBatch,
            subjectId: selectedSubject,
            chapterId: selectedChapter,
            onNavigate: navigateTo,
          });
        case "pw_batch":
          return React.createElement(PwBatchScreen, {
            batchId: selectedBatch,
            onNavigate: navigateTo,
          });
        case "pw_video":
          return React.createElement(PwVideoScreen, {
            initialVideoId: selectedBatch,
          });
        case "subjects":
          return React.createElement(SubjectsScreen, {
            batch: selectedBatch,
            onNavigate: navigateTo,
          });
        case "chapters":
          return React.createElement(ChaptersScreen, {
            batch: selectedBatch,
            subject: selectedSubject,
            onNavigate: navigateTo,
          });
        case "content":
          return React.createElement(ContentScreen, {
            batch: selectedBatch,
            subject: selectedSubject,
            chapter: selectedChapter,
            virtualId,
            botUsername,
            setBotUsername,
            isVerifying,
            setIsVerifying,
            setLoadingMsg,
            setIsChromePremium,
            setDisplayUser,
            setDisplayName,
            resumeAction: currentState.resume_action,
            resumeFile: currentState.resume_file,
          });
        case "socials":
          return React.createElement(SocialsScreen, { botUsername });
        case "profile":
          return React.createElement(ProfileScreen, {
            virtualId,
            isChrome,
            isPremium: isChromePremium,
            setPremium: setIsChromePremium,
            dName: displayName,
            setDName: setDisplayName,
            dUser: displayUser,
            setDUser: setDisplayUser,
          });
        default:
          return React.createElement(HomeScreen, {
            onNavigate: navigateTo,
            savedBatches,
            onToggleSave: handleToggleSave,
            botUsername,
            batchMeta,
            setBatchMeta,
            activeCategory,
            activeFolder,
            activeUniverse,
            onFolderCountChange: setIsShortFolderList,
          });
      }
    };
    return React.createElement(
      "div",
      {
        className: "w-full md:max-w-7xl mx-auto relative min-h-screen md:pl-24",
      },
      showWaPopup &&
        React.createElement(WhatsAppPopup, {
          onClose: closeWaPopup,
          config: appConfig,
        }),
      sidebarOpen &&
        React.createElement("div", {
          className: "study-menu-backdrop",
          onClick: () => setSidebarOpen(false),
          "aria-hidden": "true",
        }),
      React.createElement(
        "div",
        {
          ref: sidebarRef,
          role: "dialog",
          "aria-label": "RG Verse menu",
          "aria-modal": sidebarOpen ? "true" : void 0,
          "aria-hidden": !sidebarOpen,
          inert: sidebarOpen ? void 0 : "",
          tabIndex: -1,
          onTouchStart: (e) => {
            e.currentTarget.dataset.startX = e.touches[0].clientX;
            e.currentTarget.dataset.startY = e.touches[0].clientY;
          },
          onTouchEnd: (e) => {
            const startX = Number(e.currentTarget.dataset.startX || 0);
            const endX = e.changedTouches[0].clientX;
            const distanceY = Math.abs(
              Number(e.currentTarget.dataset.startY || 0) -
                e.changedTouches[0].clientY,
            );
            if (startX - endX > 55 && startX - endX > distanceY)
              setSidebarOpen(false);
          },
          className: `study-sidebar fixed top-0 left-0 h-full w-[86%] max-w-[360px] z-[70] transform overflow-y-auto rounded-r-[28px] bg-gradient-to-b from-[#6d4dff] via-[#8b5cf6] to-[#ec4899] shadow-2xl transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`,
        },
        React.createElement(
          "div",
          {
            className: "px-5 pb-8 pt-6",
            style: {
              paddingTop: "calc(1.5rem + env(safe-area-inset-top, 0px))",
            },
          },
          React.createElement(
            "div",
            { className: "mb-6 flex items-center justify-between" },
            React.createElement(
              "h2",
              {
                className:
                  "text-[11px] font-black uppercase tracking-[0.28em] text-white/70",
              },
              ((window.APP_CONFIG && window.APP_CONFIG.appName) || "RG VERSE"),
            ),
            React.createElement(
              "button",
              {
                type: "button",
                onClick: () => setSidebarOpen(false),
                className:
                  "sr-only focus:not-sr-only focus:rounded-lg focus:p-2 focus:bg-white focus:text-indigo-700",
              },
              "Close menu",
            ),
          ),
          React.createElement(
            "div",
            {
              className:
                "mb-6 rounded-[28px] border border-white/35 bg-white/15 p-5 shadow-xl backdrop-blur-md",
            },
            React.createElement(
              "div",
              { className: "flex items-center gap-4" },
              React.createElement(
                "div",
                {
                  className:
                    "flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/70 bg-white p-1 shadow-lg",
                },
                React.createElement("img", {
                  src: "/static/brand-logo.webp",
                  alt: ((window.APP_CONFIG && window.APP_CONFIG.appFullName) || "RG Study Verse"),
                  className: "h-full w-full rounded-full object-contain",
                }),
              ),
              React.createElement(
                "div",
                { className: "min-w-0" },
                React.createElement(
                  "h2",
                  {
                    className:
                      "text-[18px] sm:text-[23px] font-black tracking-tight break-words",
                    style: {
                      fontFamily: "'Trebuchet MS', sans-serif",
                      background:
                        "linear-gradient(90deg, #fde68a, #ffffff, #f9a8d4, #c4b5fd)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      textShadow: "0 2px 14px rgba(255,255,255,0.22)",
                    },
                  },
                  ((window.APP_CONFIG && window.APP_CONFIG.appName) || "RG VERSE"),
                ),
                React.createElement(
                  "p",
                  { className: "mt-1 text-[12px] font-semibold text-white/75" },
                  "Your Study Companion",
                ),
              ),
            ),
            React.createElement(
              "div",
              {
                className:
                  "mt-5 flex items-center justify-between rounded-2xl border border-white/25 bg-black/10 px-4 py-3",
              },
              React.createElement(
                "div",
                null,
                React.createElement(
                  "p",
                  {
                    className:
                      "text-[10px] font-black uppercase tracking-widest text-white/60",
                  },
                  "Account",
                ),
                React.createElement(
                  "p",
                  { className: "mt-0.5 text-sm font-extrabold text-white" },
                  displayUser,
                ),
              ),
              isChromePremium &&
                React.createElement(
                  "span",
                  {
                    className:
                      "rounded-full bg-amber-300 px-3 py-1 text-[10px] font-black uppercase text-amber-900",
                  },
                  "VIP",
                ),
            ),
          ),
          React.createElement(
            "div",
            { className: "space-y-4" },
            React.createElement(
              "button",
              {
                onClick: () => {
                  openExternalLink2(((window.APP_CONFIG && window.APP_CONFIG.contactUrl) || "https://t.me/RGVerseBot"));
                  setSidebarOpen(false);
                },
                className:
                  "flex w-full items-center gap-4 rounded-[22px] bg-gradient-to-r from-[#f59e0b] to-[#facc15] p-4 text-left text-amber-950 shadow-lg active:scale-[0.98]",
              },
              React.createElement(
                "div",
                {
                  className:
                    "flex h-12 w-12 items-center justify-center rounded-2xl bg-white/35 text-xl",
                },
                React.createElement("i", { className: "fas fa-crown" }),
              ),
              React.createElement(
                "div",
                { className: "flex-1" },
                React.createElement(
                  "h3",
                  { className: "font-extrabold" },
                  "My VIP Plan",
                ),
                React.createElement(
                  "p",
                  { className: "text-xs font-semibold text-amber-900/75" },
                  "Upgrade your access",
                ),
              ),
              React.createElement("i", {
                className: "fas fa-chevron-right text-amber-900/70",
              }),
            ),
            React.createElement(
              "button",
              {
                onClick: () => {
                  openExternalLink2(((window.APP_CONFIG && window.APP_CONFIG.contactUrl) || "https://t.me/RGVerseBot"));
                  setSidebarOpen(false);
                },
                className:
                  "flex w-full items-center gap-4 rounded-[22px] bg-gradient-to-r from-[#2563eb] to-[#4338ca] p-4 text-left text-white shadow-lg active:scale-[0.98]",
              },
              React.createElement(
                "div",
                {
                  className:
                    "flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-xl",
                },
                React.createElement("i", { className: "fas fa-robot" }),
              ),
              React.createElement(
                "div",
                { className: "flex-1" },
                React.createElement(
                  "h3",
                  { className: "font-extrabold" },
                  ((window.APP_CONFIG && window.APP_CONFIG.appName) || "RG VERSE"),
                ),
                React.createElement(
                  "p",
                  { className: "text-xs text-white/75" },
                  "Help & Support",
                ),
              ),
              React.createElement("i", {
                className: "fas fa-chevron-right text-white/70",
              }),
            ),
            React.createElement(
              "button",
              {
                onClick: () => {
                  openNativeDownloads();
                  setSidebarOpen(false);
                },
                className:
                  "flex w-full items-center gap-4 rounded-[22px] bg-gradient-to-r from-[#14b8a6] to-[#22c55e] p-4 text-left text-white shadow-lg active:scale-[0.98]",
              },
              React.createElement(
                "div",
                {
                  className:
                    "flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-xl",
                },
                React.createElement("i", { className: "fas fa-download" }),
              ),
              React.createElement(
                "div",
                { className: "flex-1" },
                React.createElement(
                  "h3",
                  { className: "font-extrabold" },
                  "My Downloads",
                ),
                React.createElement(
                  "p",
                  { className: "text-xs text-white/75" },
                  "Offline content",
                ),
              ),
              React.createElement("i", {
                className: "fas fa-chevron-right text-white/70",
              }),
            ),
            React.createElement(
              "button",
              {
                onClick: () => {
                  setSidebarOpen(false);
                  navigateTo("socials", {
                    nav: "practice",
                    folder: null,
                    subject: null,
                    batch: null,
                  });
                },
                className:
                  "flex w-full items-center gap-4 rounded-[22px] bg-gradient-to-r from-[#d946ef] to-[#f43f5e] p-4 text-left text-white shadow-lg active:scale-[0.98]",
              },
              React.createElement(
                "div",
                {
                  className:
                    "flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-xl",
                },
                React.createElement("i", { className: "fas fa-users" }),
              ),
              React.createElement(
                "div",
                { className: "flex-1" },
                React.createElement(
                  "h3",
                  { className: "font-extrabold" },
                  "Social Community",
                ),
                React.createElement(
                  "p",
                  { className: "text-xs text-white/75" },
                  "Connect with us",
                ),
              ),
              React.createElement("i", {
                className: "fas fa-chevron-right text-white/70",
              }),
            ),
            React.createElement(
              "button",
              {
                onClick: () => {
                  setSidebarOpen(false);
                  navigateTo("home", {
                    nav: "batches",
                    category: "SAVED",
                    folder: null,
                    subject: null,
                    batch: null,
                  });
                },
                className:
                  "flex w-full items-center gap-4 rounded-[22px] bg-gradient-to-r from-[#f59e0b] to-[#f97316] p-4 text-left text-white shadow-lg active:scale-[0.98]",
              },
              React.createElement(
                "div",
                {
                  className:
                    "flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-xl",
                },
                React.createElement("i", { className: "fas fa-heart" }),
              ),
              React.createElement(
                "div",
                { className: "flex-1" },
                React.createElement(
                  "h3",
                  { className: "font-extrabold" },
                  "Favourite Batches",
                ),
                React.createElement(
                  "p",
                  { className: "text-xs text-white/75" },
                  "Your saved batches",
                ),
              ),
              React.createElement("i", {
                className: "fas fa-chevron-right text-white/70",
              }),
            ),
            React.createElement(
              "button",
              {
                onClick: () => {
                  openExternalLink2(((window.APP_CONFIG && window.APP_CONFIG.contactUrl) || "https://t.me/RGVerseBot"));
                  setSidebarOpen(false);
                },
                className:
                  "flex w-full items-center gap-4 rounded-[22px] bg-gradient-to-r from-[#fb7185] to-[#f97316] p-4 text-left text-white shadow-lg active:scale-[0.98]",
              },
              React.createElement(
                "div",
                {
                  className:
                    "flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-xl",
                },
                React.createElement("i", { className: "fas fa-comments" }),
              ),
              React.createElement(
                "div",
                { className: "flex-1" },
                React.createElement(
                  "h3",
                  { className: "font-extrabold" },
                  "Contact Us",
                ),
                React.createElement(
                  "p",
                  { className: "text-xs text-white/75" },
                  "Get in touch",
                ),
              ),
              React.createElement("i", {
                className: "fas fa-chevron-right text-white/70",
              }),
            ),
          ),
          React.createElement(
            "p",
            {
              className: "mt-7 text-center text-[11px] font-bold text-white/70",
            },
            "Made with \u2764\uFE0F in India",
          ),
        ),
      ),
      React.createElement(
        "div",
        { className: "study-header sticky top-0 z-40" },
        React.createElement(
          "div",
          { className: "flex items-center space-x-3 min-w-0 flex-1" },
          (currentScreen === "home" && activeFolder === null) ||
            ["socials", "profile"].includes(currentScreen)
            ? React.createElement(
                "div",
                {
                  className:
                    "study-brand-circle w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md relative overflow-hidden shrink-0 border-[2px] border-slate-200",
                },
                React.createElement("img", {
                  src: "/static/brand-logo.webp",
                  alt: ((window.APP_CONFIG && window.APP_CONFIG.appFullName) || "RG Study Verse"),
                  className: "w-full h-full object-contain",
                }),
              )
            : React.createElement(
                "button",
                {
                  onClick: () => {
                    if (tg && tg.HapticFeedback)
                      tg.HapticFeedback.impactOccurred("light");
                    window.history.back();
                  },
                  className:
                    "w-11 h-11 shrink-0 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-700 active:scale-90 transition-transform",
                },
                React.createElement("i", { className: "fas fa-arrow-left" }),
              ),
          React.createElement(
            "div",
            { className: "min-w-0 pr-2 overflow-hidden flex-1" },
            React.createElement(
              "h1",
              {
                className:
                  "font-black text-[17px] truncate uppercase leading-tight mb-[1px]",
                style: {
                  background:
                    "linear-gradient(90deg, #172554, #4338ca, #7e22ce)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "0.02em",
                },
              },
              ["home", "socials", "profile"].includes(currentScreen)
                ? ((window.APP_CONFIG && window.APP_CONFIG.appName) || "RG VERSE")
                : currentScreen.startsWith("pw_")
                  ? "PW BATCHES"
                  : currentScreen.startsWith("nt_")
                    ? "NEXT TOPPER"
                    : currentScreen.startsWith("ac_")
                      ? "APNA COLLEGE"
                      : String(selectedBatch || "CONTENT"),
            ),
            React.createElement(
              "p",
              {
                className:
                  "text-[10px] text-indigo-600 font-bold uppercase tracking-widest truncate leading-none",
              },
              "Premium Edition",
            ),
          ),
        ),
        currentScreen === "home" &&
          activeFolder === null &&
          React.createElement(
            "button",
            {
              type: "button",
              onClick: () =>
                openExternalLink2(
                  ((window.APP_CONFIG && window.APP_CONFIG.telegramChannelUrl) || "#"),
                ),
              "aria-label": "Explore RG Verse",
              className: "study-explore",
            },
            React.createElement("i", { className: "fas fa-globe text-[12px]" }),
            React.createElement("span", null, "Explore"),
          ),
        React.createElement(
          "button",
          {
            "aria-label": "Open menu",
            onClick: () => setSidebarOpen(true),
            className: "study-menu",
          },
          React.createElement("i", { className: "fas fa-bars" }),
        ),
      ),
      React.createElement(
        "div",
        {
          className: `relative ${showBottomNav && !useInlineBottomNav ? "pb-24 md:pb-6" : "pb-0"}`,
        },
        renderScreen(),
      ),
      showBottomNav &&
        React.createElement(
          "div",
          {
            className:
              "floating-nav glass-panel flex md:flex-col justify-between md:justify-center items-center md:gap-5 z-50 md:fixed md:left-0 md:top-0 md:bottom-0 md:h-screen md:w-24 md:transform-none md:rounded-none md:rounded-r-3xl md:border-r md:border-white/50",
          },
          React.createElement(
            "button",
            {
              onClick: () => {
                navigateTo("home", {
                  nav: "batches",
                  folder: null,
                  subject: null,
                  batch: null,
                });
              },
              className: `flex flex-col items-center justify-center p-2 w-16 relative md:w-20 md:min-h-[64px] ${activeNav === "batches" ? "text-indigo-600" : "text-slate-400"}`,
            },
            React.createElement("i", {
              className: "fas fa-layer-group text-xl mb-1",
            }),
            React.createElement(
              "span",
              { className: "text-[9px] md:text-[10px] font-bold" },
              "Batches",
            ),
          ),
          React.createElement(
            "button",
            {
              onClick: () => {
                navigateTo("socials", {
                  nav: "practice",
                  folder: null,
                  subject: null,
                  batch: null,
                });
              },
              className: `flex flex-col items-center justify-center p-2 w-16 relative md:w-20 md:min-h-[64px] ${activeNav === "practice" ? "text-indigo-600" : "text-slate-400"}`,
            },
            React.createElement("i", {
              className: "fas fa-users text-xl mb-1",
            }),
            React.createElement(
              "span",
              { className: "text-[9px] md:text-[10px] font-bold" },
              "Socials",
            ),
          ),
          activeUniverse === "PW"
            ? React.createElement(
                "div",
                {
                  className:
                    "relative w-16 flex justify-center shrink-0 md:h-[76px] md:w-20",
                },
                React.createElement(
                  "button",
                  {
                    onClick: () => {
                      navigateTo("home", {
                        nav: "batches",
                        category: "KGS",
                        folder: null,
                        subject: null,
                        batch: null,
                        universe: "KGS",
                      });
                    },
                    className:
                      "absolute bottom-1 flex flex-col items-center justify-end active:scale-90 transition-transform w-20 md:relative md:bottom-auto md:h-[76px] md:justify-center",
                  },
                  React.createElement(
                    "div",
                    {
                      className:
                        "bg-white w-[50px] h-[50px] rounded-full flex items-center justify-center shadow-md border-[3px] border-white z-10 relative overflow-hidden",
                    },
                    React.createElement("img", {
                      src: "https://graph.facebook.com/livekgs/picture?width=800&height=800",
                      alt: "KGS",
                      className: "w-full h-full object-cover",
                    }),
                  ),
                  React.createElement(
                    "span",
                    {
                      className:
                        "text-[8px] font-black text-slate-700 bg-white/95 px-2 py-[3px] rounded-full shadow-sm border border-slate-200 leading-none -mt-2 relative z-20",
                    },
                    "KGS MODE",
                  ),
                ),
              )
            : React.createElement(
                "div",
                {
                  className:
                    "relative w-16 flex justify-center shrink-0 md:h-[76px] md:w-20",
                },
                React.createElement(
                  "button",
                  {
                    onClick: () => {
                      navigateTo("home", {
                        nav: "batches",
                        category: "OTHERS",
                        folder: null,
                        subject: null,
                        batch: null,
                        universe: "PW",
                      });
                    },
                    className:
                      "absolute bottom-1 flex flex-col items-center justify-end active:scale-90 transition-transform w-20 md:relative md:bottom-auto md:h-[76px] md:justify-center",
                  },
                  React.createElement(
                    "div",
                    {
                      className:
                        "bg-white w-[50px] h-[50px] rounded-[16px] flex items-center justify-center shadow-md border-[3px] border-white z-10 relative overflow-hidden p-1",
                    },
                    React.createElement("img", {
                      src: "https://www.google.com/s2/favicons?domain=pw.live&sz=256",
                      alt: "PW",
                      className: "w-full h-full object-contain",
                    }),
                  ),
                  React.createElement(
                    "span",
                    {
                      className:
                        "text-[8px] font-black text-slate-700 bg-white/95 px-2 py-[3px] rounded-full shadow-sm border border-slate-200 leading-none -mt-2 relative z-20",
                    },
                    "PW MODE",
                  ),
                ),
              ),
          React.createElement(
            "button",
            {
              onClick: openNativeDownloads,
              className:
                "flex flex-col items-center justify-center p-2 w-16 relative md:w-20 md:min-h-[64px] text-slate-400 active:scale-95 transition-transform",
            },
            React.createElement("i", {
              className: "fas fa-cloud-download-alt text-xl mb-1",
            }),
            React.createElement(
              "span",
              { className: "text-[9px] md:text-[10px] font-bold" },
              "Offline",
            ),
          ),
          React.createElement(
            "button",
            {
              onClick: () => {
                navigateTo("profile", {
                  nav: "profile",
                  folder: null,
                  subject: null,
                  batch: null,
                });
              },
              className: `flex flex-col items-center justify-center p-2 w-16 relative md:w-20 md:min-h-[64px] ${activeNav === "profile" ? "text-indigo-600" : "text-slate-400"}`,
            },
            React.createElement("i", {
              className: "fas fa-user-circle text-xl mb-1",
            }),
            React.createElement(
              "span",
              { className: "text-[9px] md:text-[10px] font-bold" },
              "Profile",
            ),
          ),
        ),
      isVerifying &&
        React.createElement(
          "div",
          {
            className:
              "fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center",
          },
          React.createElement(
            "div",
            {
              className:
                "bg-white text-slate-800 px-6 py-4 rounded-[20px] flex items-center gap-3 shadow-2xl animate-pulse",
            },
            React.createElement("i", {
              className: "fas fa-circle-notch fa-spin text-xl text-indigo-600",
            }),
            React.createElement("span", { className: "font-bold" }, loadingMsg),
          ),
        ),
    );
  };
  const root = window.ReactDOM.createRoot(document.getElementById("root"));
  root.render(React.createElement(window.App, null));
})();
