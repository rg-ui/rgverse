(() => {
  const { useState } = window.React;
  window.ProfileScreen = ({
    virtualId,
    isChrome,
    isPremium,
    setPremium,
    dName,
    setDName,
    dUser,
    setDUser,
  }) => {
    const { SERVER_URL, showAppAlert } = window;
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const streak = parseInt(localStorage.getItem("akki_streak") || "0");
    const totalSecs = parseInt(
      localStorage.getItem("akki_watch_seconds") || "0",
    );
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const handleWebLogin = async () => {
      if (!code) return showAppAlert("Please enter a code");
      if (!code.includes("-")) {
        const adminUrl = new URL("/admin", SERVER_URL).href;
        if (window.location.origin !== new URL(SERVER_URL).origin) {
          window.location.assign(adminUrl);
          return;
        }
        const pwd = prompt(`Admin Access
Enter password for user: ${code.toLowerCase()}`);
        if (pwd === null) return;
        if (!pwd) {
          showAppAlert("Please enter the admin password.");
          return;
        }
        setLoading(true);
        try {
          const response = await fetch(`${SERVER_URL}/api/admin/verify_login`, {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: code.toLowerCase(),
              password: pwd,
            }),
          });
          const result = await response.json().catch(() => ({}));
          if (response.ok && result.success) {
            window.location.assign(adminUrl);
          } else if (response.status === 503) {
            showAppAlert(
              "Admin login is not configured on Heroku. Set ADMIN_USERNAME and ADMIN_PASSWORD in Settings > Config Vars.",
            );
          } else if (response.status === 401) {
            showAppAlert("\u274C Invalid Admin Credentials");
          } else if (response.status === 403) {
            showAppAlert("Admin login must be opened on the Heroku website.");
            window.location.assign(adminUrl);
          } else {
            showAppAlert(
              result.error || "Admin login failed. Please try again.",
            );
          }
        } catch (e) {
          showAppAlert("Admin server could not be reached. Please try again.");
        } finally {
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `${SERVER_URL}/api/web_login?device_id=${virtualId}&code=${code}`,
        ).then((r) => r.json());
        if (res.success) {
          localStorage.setItem("akki_chrome_premium_status", "true");
          localStorage.setItem("akki_premium_uid", res.user_id);
          localStorage.setItem("akki_premium_expiry", res.expiry_ts);
          if (res.first_name) {
            localStorage.setItem("akki_chrome_name", res.first_name);
            setDName(res.first_name);
          }
          setTimeout(() => {
            setDUser("VIP Access");
            setPremium(true);
            setCode("");
            setLoading(false);
            window.location.replace("/app?view=profile");
          }, 1500);
          setTimeout(() => {
            setDUser("VIP Access");
            setPremium(true);
            setCode("");
            setLoading(false);
            window.location.replace("/app?view=profile");
          }, 1500);
        } else {
          showAppAlert("\u274C " + res.error);
        }
      } catch (e) {
        showAppAlert("Network Error! Please try again.");
      }
      setLoading(false);
    };
    const handleConfirmLogout = () => {
      localStorage.removeItem("akki_chrome_premium_status");
      localStorage.removeItem("akki_premium_uid");
      localStorage.removeItem("akki_premium_expiry");
      localStorage.removeItem("akki_verified_token");
      setPremium(false);
      setDName((window.APP_CONFIG && window.APP_CONFIG.defaultStudentName) || "RG Student");
      setDUser("Free Access");
      setShowLogoutConfirm(false);
      window.location.replace("/app?view=profile");
    };
    const exp = localStorage.getItem("akki_premium_expiry");
    let daysLeftText = "";
    if (isPremium && exp) {
      const timeLeft = parseInt(exp) - Date.now();
      if (timeLeft > 0) {
        const d = Math.floor(timeLeft / (1e3 * 60 * 60 * 24));
        const h = Math.floor((timeLeft / (1e3 * 60 * 60)) % 24);
        const m = Math.floor((timeLeft / 1e3 / 60) % 60);
        if (d > 0) daysLeftText = `Expires in ${d}d ${h}h`;
        else if (h > 0) daysLeftText = `Expires in ${h}h ${m}m`;
        else daysLeftText = `Expires in ${m}m`;
      } else {
        daysLeftText = "Expired";
      }
    }
    return React.createElement(
      "div",
      {
        className: "fade-in min-h-screen p-5 text-center",
        style: {
          paddingBottom: "calc(8rem + env(safe-area-inset-bottom, 0px))",
          background: `
    radial-gradient(circle at 8% 10%, rgba(255,255,255,0.72), transparent 26%),
    radial-gradient(circle at 92% 14%, rgba(196,181,253,0.58), transparent 32%),
    radial-gradient(circle at 8% 86%, rgba(103,232,249,0.34), transparent 32%),
    radial-gradient(circle at 92% 82%, rgba(251,207,232,0.55), transparent 32%),
    linear-gradient(145deg, #b8d6ff 0%, #e9edff 48%, #f6ddec 100%)
`,
        },
      },
      React.createElement(
        "div",
        {
          className:
            "rounded-[30px] p-7 sm:p-8 shadow-[0_22px_55px_rgba(91,72,145,0.18)] border border-white/80 flex flex-col items-center relative overflow-hidden bg-white/72 backdrop-blur-xl",
        },
        React.createElement("div", {
          className:
            "absolute -top-10 -right-10 w-36 h-36 bg-violet-200/60 rounded-full blur-3xl",
        }),
        React.createElement("div", {
          className:
            "absolute -bottom-10 -left-10 w-36 h-36 bg-pink-200/55 rounded-full blur-3xl",
        }),
        React.createElement(
          "div",
          {
            className:
              "w-24 h-24 rounded-[28px] bg-[conic-gradient(from_180deg,#22d3ee,#8b5cf6,#ec4899,#facc15,#22d3ee)] shadow-[0_0_30px_rgba(168,85,247,0.75)] mb-4 overflow-hidden relative z-10 p-1.5 transition-transform duration-300 hover:scale-105",
          },
          React.createElement("img", {
            src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${dName}`,
            className: "w-full h-full object-cover rounded-[18px] bg-slate-100",
          }),
        ),
        React.createElement(
          "h2",
          {
            className: "text-2xl font-black relative z-10 leading-tight",
            style: {
              background: "linear-gradient(90deg, #172554, #4338ca, #a21caf)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 2px 18px rgba(255,255,255,0.18)",
            },
          },
          dName,
        ),
        React.createElement(
          "div",
          { className: "flex items-center gap-1 mt-1.5 mb-6 relative z-10" },
          React.createElement(
            "span",
            {
              className:
                "text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-md",
            },
            "ID: RG-PRO-",
            String(virtualId).substring(0, 6),
            "...",
          ),
        ),
        React.createElement(
          "div",
          { className: "flex w-full gap-3 relative z-10" },
          React.createElement(
            "div",
            {
              className:
                "flex-1 bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-100 rounded-[20px] p-4 shadow-sm",
            },
            React.createElement("i", {
              className:
                "fas fa-fire text-orange-500 text-2xl mb-2 drop-shadow-sm",
            }),
            React.createElement(
              "h3",
              { className: "text-xl font-black text-slate-800 leading-none" },
              streak,
            ),
            React.createElement(
              "p",
              {
                className:
                  "text-[9px] font-black text-orange-500 uppercase tracking-widest mt-1.5",
              },
              "Day Streak",
            ),
          ),
          React.createElement(
            "div",
            {
              className:
                "flex-1 rounded-[20px] border border-orange-300/35 bg-gradient-to-br from-orange-400/30 to-rose-500/25 p-4 shadow-[0_8px_22px_rgba(249,115,22,0.22)] backdrop-blur-md transition-transform active:scale-95",
            },
            React.createElement("i", {
              className:
                "fas fa-clock text-indigo-500 text-2xl mb-2 drop-shadow-sm",
            }),
            React.createElement(
              "h3",
              { className: "text-xl font-black text-slate-800 leading-none" },
              hours,
              "h ",
              mins,
              "m",
            ),
            React.createElement(
              "p",
              {
                className:
                  "text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1.5",
              },
              "Watch Time",
            ),
          ),
        ),
        isChrome &&
          !isPremium &&
          React.createElement(
            "div",
            {
              className:
                "mt-8 bg-white border border-slate-200 rounded-[20px] p-5 w-full slide-up shadow-sm relative z-10",
            },
            React.createElement(
              "h3",
              {
                className:
                  "font-extrabold text-slate-800 mb-1 flex items-center justify-center gap-2",
              },
              React.createElement("i", {
                className: "fas fa-laptop text-indigo-500",
              }),
              " Premium on Web",
            ),
            React.createElement(
              "p",
              {
                className:
                  "text-[11px] font-semibold text-slate-500 mb-5 leading-snug",
              },
              ("Send /weblogin to @" + ((window.APP_CONFIG && window.APP_CONFIG.telegramBotName) || "RGVerseBot") + " and enter the code below."),
              React.createElement("b", null, "/weblogin"),
              " to bot and enter the code below.",
            ),
            React.createElement("input", {
              type: "text",
              value: code,
              onChange: (e) => setCode(e.target.value.toUpperCase()),
              placeholder: "12345678-ABCD",
              className:
                "w-full bg-slate-50 border border-slate-200 py-3.5 rounded-xl text-center font-black tracking-widest mb-3 uppercase text-[15px] focus:ring-2 focus:ring-indigo-400 focus:outline-none focus:bg-white transition-all shadow-inner",
            }),
            React.createElement(
              "button",
              {
                id: "activate-btn",
                onClick: handleWebLogin,
                disabled: loading,
                className:
                  "w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold py-3.5 rounded-xl active:scale-[0.98] transition-transform shadow-[0_10px_20px_-10px_rgba(79,70,229,0.5)]",
              },
              loading
                ? React.createElement(
                    React.Fragment,
                    null,
                    React.createElement("i", {
                      className: "fas fa-circle-notch fa-spin mr-2",
                    }),
                    " Verifying...",
                  )
                : "Activate Premium",
            ),
          ),
        isPremium &&
          React.createElement(
            "div",
            {
              className:
                "mt-6 w-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 py-3.5 rounded-[16px] flex flex-col items-center justify-center gap-1 shadow-sm slide-up relative z-10",
            },
            React.createElement(
              "div",
              {
                className:
                  "flex items-center gap-2 font-extrabold text-amber-700 text-[13px]",
              },
              React.createElement("i", {
                className: "fas fa-crown text-amber-500 text-lg",
              }),
              " VIP Web Access Active",
            ),
            React.createElement(
              "span",
              {
                className:
                  "text-[9px] font-black text-amber-600/80 uppercase tracking-widest",
              },
              daysLeftText,
            ),
          ),
        isChrome &&
          isPremium &&
          React.createElement(
            "button",
            {
              onClick: () => setShowLogoutConfirm(true),
              className:
                "mt-4 w-full bg-white text-slate-500 font-extrabold py-3.5 rounded-[16px] active:scale-[0.98] border border-slate-200 transition-all hover:bg-slate-50 hover:text-rose-500 hover:border-rose-200 slide-up relative z-10 shadow-sm",
            },
            React.createElement("i", { className: "fas fa-sign-out-alt mr-2" }),
            " Reset Device / Logout",
          ),
      ),
      showLogoutConfirm &&
        React.createElement(
          "div",
          {
            className:
              "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-6 animate-fade-in",
            onClick: () => setShowLogoutConfirm(false),
          },
          React.createElement(
            "div",
            {
              className:
                "bg-white w-full max-w-sm rounded-[28px] p-6 text-center shadow-2xl slide-up relative overflow-hidden",
              onClick: (e) => e.stopPropagation(),
            },
            React.createElement(
              "div",
              {
                className:
                  "w-16 h-16 bg-rose-50 text-rose-500 rounded-[20px] flex items-center justify-center mx-auto mb-4 text-2xl border border-rose-100 shadow-sm",
              },
              React.createElement("i", { className: "fas fa-power-off" }),
            ),
            React.createElement(
              "h3",
              { className: "font-black text-[18px] text-slate-800 mb-2" },
              "Log Out?",
            ),
            React.createElement(
              "p",
              {
                className:
                  "text-[12px] font-semibold text-slate-500 mb-6 px-2 leading-relaxed",
              },
              "Are you sure you want to log out and reset this device to Free User mode?",
            ),
            React.createElement(
              "div",
              { className: "flex gap-3" },
              React.createElement(
                "button",
                {
                  onClick: () => setShowLogoutConfirm(false),
                  className:
                    "w-1/2 bg-slate-50 text-slate-600 border border-slate-200 font-extrabold py-3.5 rounded-xl active:scale-95 transition-transform hover:bg-slate-100",
                },
                "Cancel",
              ),
              React.createElement(
                "button",
                {
                  onClick: handleConfirmLogout,
                  className:
                    "w-1/2 bg-rose-500 text-white font-extrabold py-3.5 rounded-xl active:scale-95 transition-transform shadow-[0_8px_15px_-5px_rgba(244,63,94,0.5)]",
                },
                "Yes, Logout",
              ),
            ),
          ),
        ),
    );
  };
})();
