(() => {
  const { useState, useEffect, useRef, useMemo } = window.React;
  const processOfflineBatches = (res) => {
    if (!res || !res.success) return null;
    const metaMap = res.dynamic_menus || {};
    const priceMap = res.batch_prices || {};
    const batchOrder = res.batch_order || {};
    const getPriceData = (name) =>
      priceMap[
        String(name || "")
          .trim()
          .replace(/\s+/g, " ")
          .toLowerCase()
      ] || {};
    const getBatchPosition = (name) => {
      const value = Number(
        batchOrder[
          String(name || "")
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase()
        ],
      );
      return Number.isInteger(value) && value > 0
        ? value
        : Number.MAX_SAFE_INTEGER;
    };
    let newStructure = {};
    Object.entries(metaMap).forEach(([cat, batches]) => {
      let rawCat = String(cat).trim().toUpperCase();
      if (!rawCat) return;
      let checkCat = rawCat.replace(/[-\s_]/g, "");
      let upperCat = "OTHERS";
      if (checkCat.includes("IIT") || checkCat.includes("JEE"))
        upperCat = "IIT-JEE";
      else if (checkCat.includes("NEET") || checkCat.includes("MEDICAL"))
        upperCat = "NEET";
      else if (
        checkCat.includes("BOARD") ||
        checkCat.includes("CBSE") ||
        checkCat.includes("CA") ||
        checkCat.includes("COMMERCE")
      )
        upperCat = "BOARDS";
      else if (checkCat.includes("KGS") || checkCat.includes("KHAN"))
        upperCat = "KGS";
      if (!newStructure[upperCat]) newStructure[upperCat] = {};
      batches.forEach((b) => {
        const sub = String(b.subcategory || "PREMIUM BATCHES").toUpperCase();
        if (!newStructure[upperCat][sub]) newStructure[upperCat][sub] = [];
        let cleanTitle = String(b.text || b.title || "Unknown Batch")
          .replace(/_/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        const priceData = getPriceData(cleanTitle);
        newStructure[upperCat][sub].push({
          title: cleanTitle,
          position: getBatchPosition(cleanTitle),
          link: String(b.url || b.link || ""),
          image: String(b.image || ""),
          medium: String(b.medium || "Bilingual"),
          price: String(b.price || priceData.price || ""),
          original_price: String(
            b.original_price || priceData.original_price || "",
          ),
          offer: String(b.offer || priceData.offer || ""),
        });
      });
    });
    const addedBatchesStr = [];
    Object.values(newStructure).forEach((cat) => {
      Object.values(cat).forEach((subArr) => {
        subArr.forEach((item) => addedBatchesStr.push(item.title));
      });
    });
    if (res.data && Array.isArray(res.data)) {
      res.data.forEach((rawBatchTitle) => {
        const batchTitle = String(rawBatchTitle || "Unknown")
          .replace(/_/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        if (!addedBatchesStr.includes(batchTitle)) {
          const lowerCatTitle = batchTitle.toLowerCase();
          if (
            lowerCatTitle.endsWith(".mp4") ||
            lowerCatTitle.endsWith(".pdf") ||
            lowerCatTitle.endsWith(".mkv") ||
            batchTitle.includes("||") ||
            batchTitle.includes("?")
          )
            return;
          let cat = "OTHERS";
          let subcat = "PREMIUM BATCHES";
          let checkTitle = lowerCatTitle.replace(/[-\s_]/g, "");
          if (
            checkTitle.includes("neet") ||
            checkTitle.includes("medical") ||
            checkTitle.includes("yakeen") ||
            checkTitle.includes("lakshya neet") ||
            checkTitle.includes("arjuna neet")
          )
            cat = "NEET";
          else if (
            checkTitle.includes("jee") ||
            checkTitle.includes("iit") ||
            checkTitle.includes("arjuna jee") ||
            checkTitle.includes("lakshya jee") ||
            checkTitle.includes("prayas")
          )
            cat = "IIT-JEE";
          else if (
            checkTitle.includes("board") ||
            checkTitle.includes("10th") ||
            checkTitle.includes("12th") ||
            checkTitle.includes("udaan") ||
            checkTitle.includes("neev") ||
            checkTitle.includes("ca") ||
            checkTitle.includes("commerce")
          )
            cat = "BOARDS";
          else if (checkTitle.includes("kgs")) cat = "KGS";
          if (lowerCatTitle.includes("11th")) subcat = "CLASS 11";
          else if (lowerCatTitle.includes("12th")) subcat = "CLASS 12";
          else if (lowerCatTitle.includes("dropper")) subcat = "DROPPER";
          else if (lowerCatTitle.includes("9th")) subcat = "CLASS 9TH";
          else if (lowerCatTitle.includes("10th")) subcat = "CLASS 10TH";
          if (!newStructure[cat]) newStructure[cat] = {};
          if (!newStructure[cat][subcat]) newStructure[cat][subcat] = [];
          const priceData = getPriceData(batchTitle);
          newStructure[cat][subcat].push({
            title: batchTitle,
            position: getBatchPosition(batchTitle),
            link: "",
            image: "",
            medium: "Bilingual",
            price: String(priceData.price || ""),
            original_price: String(priceData.original_price || ""),
            offer: String(priceData.offer || ""),
          });
        }
      });
    }
    Object.keys(newStructure).forEach((cat) => {
      Object.keys(newStructure[cat]).forEach((subcat) => {
        newStructure[cat][subcat].sort((a, b) => {
          const positionA = Number(a.position) || Number.MAX_SAFE_INTEGER;
          const positionB = Number(b.position) || Number.MAX_SAFE_INTEGER;
          if (positionA !== positionB) return positionA - positionB;
          const titleA = String(a.title || "");
          const titleB = String(b.title || "");
          const matchA = titleA.match(/\b(20\d{2})\b/);
          const matchB = titleB.match(/\b(20\d{2})\b/);
          const yearA = matchA ? parseInt(matchA[1], 10) : 0;
          const yearB = matchB ? parseInt(matchB[1], 10) : 0;
          if (yearA !== yearB) return yearB - yearA;
          return titleA.localeCompare(titleB);
        });
      });
    });
    const orderedStructure = {};
    const priority = ["OTHERS", "IIT-JEE", "NEET", "BOARDS", "KGS"];
    priority.forEach((p) => {
      if (newStructure[p] && Object.keys(newStructure[p]).length > 0)
        orderedStructure[p] = newStructure[p];
    });
    if (newStructure["SAVED"] && Object.keys(newStructure["SAVED"]).length > 0)
      orderedStructure["SAVED"] = newStructure["SAVED"];
    return {
      structure: orderedStructure,
      meta: metaMap,
      folderOrder: res.folder_order || {},
      folderThumbnails: res.folder_thumbnails || {},
    };
  };
  window.HomeScreen = ({
    onNavigate,
    savedBatches,
    onToggleSave,
    botUsername,
    batchMeta,
    setBatchMeta,
    activeCategory,
    activeFolder,
    activeUniverse,
    onFolderCountChange,
  }) => {
    const { SERVER_URL, DataManager, openExternalLink, BatchCollectionCard } =
      window;
    const apiUrl = `${SERVER_URL}/api/batches`;
    const [localBatchStructure, setBatchStructure] = useState(() => {
      const cachedData = DataManager.getCache(apiUrl);
      if (cachedData) {
        const processed = processOfflineBatches(cachedData);
        if (processed) return processed.structure;
      }
      return { OTHERS: {}, "IIT-JEE": {}, NEET: {}, BOARDS: {}, KGS: {} };
    });
    const pwFavorites = window.usePwFavorites();
    const apnaFavorites = window.useApnaFavorites();
    const ntFavorites = window.useNtFavorites();
    const apnaCatalogue = window.useApnaCollegeData();
    const apnaBatches = Array.isArray(apnaCatalogue.data)
      ? apnaCatalogue.data
      : [];
    const [pwFolderLinks, setPwFolderLinks] = useState([]);
    const [pwFolderError, setPwFolderError] = useState("");
    const [pwFolderRetry, setPwFolderRetry] = useState(0);
    useEffect(() => {
      let active = true;
      let requestId = 0;
      const controller = new AbortController();
      const load = () => {
        const current = ++requestId;
        return fetch(SERVER_URL.replace(/\/$/, "") + "/api/pw/folder-links", {
          signal: controller.signal,
          cache: "no-store",
        })
          .then(async (r) => {
            const data = await r.json();
            if (!r.ok || !data.success)
              throw Error("Linked PW batches could not load.");
            return data;
          })
          .then((data) => {
            if (active && current === requestId) {
              setPwFolderLinks(data.data || []);
              setPwFolderError("");
            }
          })
          .catch(() => {
            if (active && !controller.signal.aborted && current === requestId)
              setPwFolderError("Linked PW batches could not load.");
          });
      };
      load();
      window.addEventListener("pw-folder-links-changed", load);
      return () => {
        active = false;
        controller.abort();
        window.removeEventListener("pw-folder-links-changed", load);
      };
    }, [SERVER_URL, pwFolderRetry]);
    const batchStructure = useMemo(() => {
      var _a;
      const structure = Object.fromEntries(
        Object.entries(localBatchStructure).map(([cat, folders]) => [
          cat,
          Object.fromEntries(
            Object.entries(folders).map(([folder, items]) => [
              folder,
              [...items],
            ]),
          ),
        ]),
      );
      for (const entry of pwFolderLinks) {
        if (
          !["OTHERS", "IIT-JEE", "NEET", "BOARDS", "KGS"].includes(
            entry.home_category,
          ) ||
          !entry.folder ||
          !((_a = entry.batch) == null ? void 0 : _a.id)
        )
          continue;
        const cat = entry.home_category,
          folder = entry.folder;
        if (!structure[cat]) structure[cat] = {};
        if (!structure[cat][folder]) structure[cat][folder] = [];
        if (
          !structure[cat][folder].some(
            (x) => x.source === "pw" && x.pwId === entry.batch.id,
          )
        )
          structure[cat][folder].push({
            ...entry.batch,
            title: entry.batch.name,
            medium: entry.batch.language,
            source: "pw",
            pwId: entry.batch.id,
          });
      }
      if (!structure.OTHERS) structure.OTHERS = {};
      if (!structure.OTHERS["APNA COLLEGE"])
        structure.OTHERS["APNA COLLEGE"] = [];
      for (const item of apnaBatches) {
        if (
          !structure.OTHERS["APNA COLLEGE"].some(
            (x) => x.source === "apna" && x.id === item.id,
          )
        )
          structure.OTHERS["APNA COLLEGE"].push({ ...item, title: item.name });
      }
      return structure;
    }, [localBatchStructure, pwFolderLinks, apnaCatalogue.data]);
    const renderBatchCard = (item, key) =>
      item.source === "apna"
        ? React.createElement(window.ApnaCollegeCard, {
            key: "apna-" + item.id,
            item,
            isSaved: apnaFavorites.some((x) => x.id === item.id),
            onNavigate,
          })
        : item.source === "pw"
          ? React.createElement(window.PwFavoriteCard, {
              key,
              item: { ...item, id: item.pwId },
              isSaved: !!pwFavorites[item.pwId],
              onNavigate,
            })
          : React.createElement(BatchCollectionCard, {
              key,
              item,
              isSaved: savedBatches.includes(String(item.title)),
              onToggleSave,
              onNavigate,
            });
    const [folderOrder, setFolderOrder] = useState(() => {
      const cachedData = DataManager.getCache(apiUrl);
      return cachedData && cachedData.folder_order
        ? cachedData.folder_order
        : {};
    });
    const [folderThumbnails, setFolderThumbnails] = useState(() => {
      const cachedData = DataManager.getCache(apiUrl);
      return cachedData && cachedData.folder_thumbnails
        ? cachedData.folder_thumbnails
        : {};
    });
    const [isLoading, setIsLoading] = useState(() => {
      return DataManager.getCache(apiUrl) ? false : true;
    });
    const [searchQuery, setSearchQuery] = useState("");
    const traivoMessages = (window.APP_CONFIG && window.APP_CONFIG.banner && window.APP_CONFIG.banner.messages) || [
      "Access Premium Batches & DPPs in One Place.",
      "PW, NextToppers, Apna College & More.",
      "Smart Video Streaming with Custom Speed.",
      "High-speed Notes & PDF Viewer.",
      "Empowering Every Student with RG Verse."
    ];
    const [traivoMessageIndex, setTraivoMessageIndex] = useState(0);
    const [traivoTypedText, setTraivoTypedText] = useState("");
    const bannerRef = useRef(null);
    const tabsRef = useRef(null);
    const touchStateRef = useRef({ startX: 0, startY: 0, endX: 0, endY: 0 });
    const onNavigateRef = useRef(onNavigate);
    onNavigateRef.current = onNavigate;
    useEffect(() => {
      const cachedData = DataManager.getCache(apiUrl);
      if (cachedData) {
        const processed = processOfflineBatches(cachedData);
        if (processed && processed.meta) setBatchMeta(processed.meta);
        if (processed && processed.folderOrder)
          setFolderOrder(processed.folderOrder);
        if (processed && processed.folderThumbnails)
          setFolderThumbnails(processed.folderThumbnails);
      }
    }, [setBatchMeta]);
    useEffect(() => {
      const fullText = traivoMessages[traivoMessageIndex];
      let cursor = 0;
      const typingTimer = setInterval(() => {
        cursor += 1;
        setTraivoTypedText(fullText.slice(0, cursor));
        if (cursor >= fullText.length) clearInterval(typingTimer);
      }, 38);
      const nextTimer = setTimeout(
        () => {
          setTraivoMessageIndex(
            (current) => (current + 1) % traivoMessages.length,
          );
          setTraivoTypedText("");
        },
        Math.max(3100, fullText.length * 38 + 1500),
      );
      return () => {
        clearInterval(typingTimer);
        clearTimeout(nextTimer);
      };
    }, [traivoMessageIndex]);
    useEffect(() => {
      let isMounted = true;
      const loadBatchesFromDB = async () => {
        try {
          const res = await DataManager.fetch(apiUrl);
          if (res.success && isMounted) {
            const processed = processOfflineBatches(res);
            if (processed) {
              setBatchMeta(processed.meta);
              setBatchStructure(processed.structure);
              setFolderOrder(processed.folderOrder || {});
              setFolderThumbnails(processed.folderThumbnails || {});
              let firstAvailableCat = "OTHERS";
              for (let c of Object.keys(processed.structure)) {
                if (
                  processed.structure[c] &&
                  Object.keys(processed.structure[c]).length > 0
                ) {
                  firstAvailableCat = c;
                  break;
                }
              }
              if (
                Object.keys(processed.structure).length > 0 &&
                activeCategory === "SAVED" &&
                isLoading &&
                savedBatches.length === 0 &&
                Object.keys(window.readPwFavorites()).length === 0 &&
                apnaFavorites.length === 0 &&
                window.readNtFavorites().length === 0
              ) {
                onNavigateRef.current(
                  "home",
                  { category: firstAvailableCat, folder: null },
                  true,
                );
              }
            }
          }
        } catch (e) {}
        if (isMounted) setIsLoading(false);
      };
      loadBatchesFromDB();
      return () => {
        isMounted = false;
      };
    }, [apiUrl]);
    useEffect(() => {
      if (searchQuery) return;
      const interval = setInterval(() => {
        if (bannerRef.current) {
          if (
            bannerRef.current.scrollLeft + bannerRef.current.clientWidth >=
            bannerRef.current.scrollWidth - 20
          )
            bannerRef.current.scrollTo({ left: 0, behavior: "smooth" });
          else
            bannerRef.current.scrollBy({
              left: bannerRef.current.clientWidth * 0.85,
              behavior: "smooth",
            });
        }
      }, 3e3);
      return () => clearInterval(interval);
    }, [searchQuery, isLoading]);
    useEffect(() => {
      if (tabsRef.current) {
        const activeElement = tabsRef.current.querySelector(".tab-active");
        if (activeElement) {
          const container = tabsRef.current;
          const scrollLeft =
            activeElement.offsetLeft -
            container.clientWidth / 2 +
            activeElement.clientWidth / 2;
          container.scrollTo({ left: scrollLeft, behavior: "smooth" });
        }
      }
    }, [activeCategory]);
    useEffect(() => {
      if (activeFolder !== null || searchQuery || !window.IntersectionObserver)
        return;
      const cards = Array.from(
        document.querySelectorAll('[data-folder-bubble="true"]'),
      );
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              entry.target.classList.remove("folder-bubble-visible");
              return;
            }
            entry.target.classList.remove("folder-bubble-visible");
            void entry.target.offsetWidth;
            requestAnimationFrame(() =>
              entry.target.classList.add("folder-bubble-visible"),
            );
          });
        },
        { threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
      );
      cards.forEach((card) => observer.observe(card));
      return () => observer.disconnect();
    }, [batchStructure, activeCategory, activeFolder, searchQuery]);
    useEffect(() => {
      const folderCount = batchStructure[activeCategory]
        ? Object.keys(batchStructure[activeCategory]).length
        : 0;
      const isShortFolderList =
        !isLoading &&
        !searchQuery &&
        activeFolder === null &&
        activeCategory !== "SAVED" &&
        folderCount > 0 &&
        folderCount <= 4;
      onFolderCountChange(isShortFolderList);
    }, [
      batchStructure,
      activeCategory,
      activeFolder,
      isLoading,
      searchQuery,
      onFolderCountChange,
    ]);
    const TABS_LIST = ["SAVED"];
    Object.keys(batchStructure).forEach((cat) => {
      if (batchStructure[cat] && Object.keys(batchStructure[cat]).length > 0) {
        if (activeUniverse === "PW" && cat !== "KGS") TABS_LIST.push(cat);
        if (activeUniverse === "KGS" && cat === "KGS") TABS_LIST.push(cat);
      }
    });
    const switchCategory = (cat) => {
      onNavigate("home", { category: cat, folder: null }, true);
      if (window.tg && window.tg.HapticFeedback)
        window.tg.HapticFeedback.selectionChanged();
    };
    const onTouchStart = (e) => {
      touchStateRef.current.startX = e.changedTouches[0].clientX;
      touchStateRef.current.startY = e.changedTouches[0].clientY;
    };
    const onTouchEnd = (e) => {
      if (activeFolder !== null) return;
      touchStateRef.current.endX = e.changedTouches[0].clientX;
      touchStateRef.current.endY = e.changedTouches[0].clientY;
      const diffX = touchStateRef.current.startX - touchStateRef.current.endX;
      const diffY = touchStateRef.current.startY - touchStateRef.current.endY;
      if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
        const currentIndex = TABS_LIST.indexOf(activeCategory);
        if (currentIndex === -1) return;
        if (diffX > 0 && currentIndex < TABS_LIST.length - 1) {
          switchCategory(TABS_LIST[currentIndex + 1]);
        } else if (diffX < 0 && currentIndex > 0) {
          switchCategory(TABS_LIST[currentIndex - 1]);
        }
      }
    };
    const getSearchResults = () => {
      let allItems = [];
      Object.values(batchStructure).forEach((cat) => {
        Object.values(cat).forEach((subArr) => allItems.push(...subArr));
      });
      return allItems.filter(
        (item) =>
          item.source !== "pw" &&
          String(item.title).toLowerCase().includes(searchQuery.toLowerCase()),
      );
    };
    const renderNextTopperFolderCard = () =>
      React.createElement(
        "button",
        {
          type: "button",
          key: "nexttopper-connected-folder",
          "data-folder-bubble": "true",
          onClick: () => onNavigate("nt_catalog"),
          "aria-label": "Open NextTopper folder",
          className:
            "collection-card folder-bubble-card p-4 flex w-full items-center cursor-pointer mb-0 text-left",
        },
        React.createElement(
          "span",
          {
            className:
              "w-[60px] h-[60px] shrink-0 overflow-hidden rounded-[18px] bg-gradient-to-br from-sky-500 to-blue-700 shadow-lg mr-4 flex items-center justify-center text-2xl text-white",
          },
          folderThumbnails["next topper"] ||
            folderThumbnails["nexttopper"] ||
            folderThumbnails["next toppers"]
            ? React.createElement("img", {
                src:
                  folderThumbnails["next topper"] ||
                  folderThumbnails["nexttopper"] ||
                  folderThumbnails["next toppers"],
                alt: "NextTopper",
                loading: "lazy",
                className: "h-full w-full object-cover",
                onError: (e) => {
                  e.currentTarget.style.display = "none";
                },
              })
            : React.createElement("i", { className: "fas fa-graduation-cap" }),
        ),
        React.createElement(
          "span",
          { className: "min-w-0 flex-grow pr-2" },
          React.createElement(
            "span",
            {
              className:
                "mb-1 block truncate text-lg font-extrabold leading-tight text-slate-800",
            },
            "NextTopper",
          ),
          React.createElement(
            "span",
            {
              className:
                "flex items-center text-xs font-semibold text-slate-500",
            },
            React.createElement("i", {
              className: "fas fa-book-open mr-1.5 opacity-70",
            }),
            " Browse NT Courses",
          ),
        ),
        React.createElement(
          "span",
          {
            className:
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-400 shadow-sm",
          },
          React.createElement("i", {
            className: "fas fa-chevron-right text-sm",
          }),
        ),
      );
    const renderPwFolderCard = () =>
      React.createElement(
        "button",
        {
          type: "button",
          key: "pw-external-catalogue",
          "data-folder-bubble": "true",
          onClick: () => onNavigate("pw_catalog"),
          "aria-label": "Open PW Batches folder",
          className:
            "collection-card folder-bubble-card p-4 flex w-full items-center cursor-pointer mb-0 text-left",
        },
        React.createElement(
          "span",
          {
            className:
              "w-[60px] h-[60px] rounded-[18px] bg-gradient-to-br from-indigo-600 to-fuchsia-600 flex items-center justify-center overflow-hidden text-white text-2xl shadow-lg shrink-0 mr-4",
          },
          folderThumbnails["pw batches"] || folderThumbnails["pw"]
            ? React.createElement("img", {
                src: folderThumbnails["pw batches"] || folderThumbnails["pw"],
                alt: "PW Batches",
                loading: "lazy",
                decoding: "async",
                onError: (e) => {
                  e.currentTarget.style.display = "none";
                },
                className: "h-full w-full object-cover",
              })
            : React.createElement("i", {
                className: "fas fa-folder-open",
                "aria-hidden": "true",
              }),
        ),
        React.createElement(
          "span",
          { className: "flex-grow pr-2 min-w-0" },
          React.createElement(
            "span",
            {
              className:
                "block font-extrabold text-slate-800 text-lg leading-tight mb-1 truncate",
            },
            "PW Batches",
          ),
          React.createElement(
            "span",
            {
              className:
                "flex items-center text-xs text-slate-500 font-semibold",
            },
            React.createElement("i", {
              className: "fas fa-book-open mr-1.5 opacity-70",
              "aria-hidden": "true",
            }),
            " Browse PW Courses",
          ),
        ),
        React.createElement(
          "span",
          {
            className:
              "w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 shrink-0",
          },
          React.createElement("i", {
            className: "fas fa-chevron-right text-sm",
            "aria-hidden": "true",
          }),
        ),
      );
    const renderFolders = () => {
      if (
        !batchStructure[activeCategory] ||
        Object.keys(batchStructure[activeCategory]).length === 0
      ) {
        if (!(activeUniverse === "PW" && activeCategory === "OTHERS")) {
          return React.createElement(
            "div",
            { className: "text-center text-slate-500 py-16" },
            React.createElement("i", {
              className: "fas fa-box-open text-4xl mb-3 opacity-40",
            }),
            React.createElement("br", null),
            "No folders found.",
          );
        }
      }
      const gradients = [
        "from-indigo-500 to-purple-600",
        "from-emerald-500 to-teal-500",
        "from-rose-500 to-pink-600",
        "from-amber-500 to-orange-500",
        "from-blue-500 to-cyan-500",
      ];
      const showPwFolder =
        activeUniverse === "PW" && activeCategory === "OTHERS";
      const sortedFolders = Object.keys(
        batchStructure[activeCategory] || {},
      ).sort((a, b) =>
        a.localeCompare(b, void 0, { numeric: true, sensitivity: "base" }),
      );
      if (showPwFolder && !sortedFolders.includes("PW BATCHES")) {
        const dhruv = sortedFolders.findIndex((name) =>
          /dhruv\s*rathee/i.test(name),
        );
        sortedFolders.splice(dhruv < 0 ? 0 : dhruv, 0, "PW BATCHES");
      }
      if (showPwFolder && !sortedFolders.includes("NEXT TOPPER")) {
        const pw = sortedFolders.indexOf("PW BATCHES");
        const dhruv = sortedFolders.findIndex((name) =>
          /dhruv\s*rathee/i.test(name),
        );
        sortedFolders.splice(
          pw >= 0 ? pw : dhruv >= 0 ? dhruv : 0,
          0,
          "NEXT TOPPER",
        );
      }
      const position = (name) => {
        const key = String(name).trim().replace(/\s+/g, " ").toLowerCase();
        const value = Number(
          folderOrder[key] ??
            (key === "next topper"
              ? (folderOrder.nexttopper ?? folderOrder["next toppers"])
              : void 0),
        );
        return Number.isInteger(value) && value > 0 ? value : null;
      };
      const placed = sortedFolders
        .filter((name) => position(name) !== null)
        .sort((a, b) => position(a) - position(b));
      const remaining = sortedFolders.filter((name) => position(name) === null);
      let lastSlot = -1;
      placed.forEach((name) => {
        const slot = Math.min(
          remaining.length,
          Math.max(position(name) - 1, lastSlot + 1),
        );
        remaining.splice(slot, 0, name);
        lastSlot = slot;
      });
      sortedFolders.splice(0, sortedFolders.length, ...remaining);
      return React.createElement(
        "div",
        {
          className:
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
        },
        sortedFolders.map((sub, i) => {
          if (showPwFolder && sub === "PW BATCHES") return renderPwFolderCard();
          if (showPwFolder && sub === "NEXT TOPPER")
            return renderNextTopperFolderCard();
          const count = batchStructure[activeCategory][sub].length;
          const iconGradient = gradients[i % gradients.length];
          const folderImages = {
            "APNA COLLEGE": "/static/images/remote/3bYYO.jpg",
            "BSC NURSING": "/static/images/remote/dvZrR.jpg",
            BANKING: "/static/images/remote/HMVE4.jpg",
            UPSC: "/static/images/remote/56DA7.jpg",
            "DHRUV RATHEE ACADEMY": "/static/images/remote/QdBbc.jpg",
            DEFENCE: "/static/images/remote/xa1lZ.jpg",
          };
          const folderImage =
            folderThumbnails[String(sub).trim().toLowerCase()] ||
            folderImages[String(sub).trim().toUpperCase()];
          return React.createElement(
            React.Fragment,
            { key: sub },
            React.createElement(
              "div",
              {
                "data-folder-bubble": "true",
                onClick: () => onNavigate("home", { folder: sub }),
                className:
                  "collection-card folder-bubble-card p-4 flex items-center cursor-pointer mb-0",
              },
              React.createElement(
                "div",
                {
                  className: `w-[60px] h-[60px] rounded-[18px] bg-gradient-to-br ${iconGradient} flex items-center justify-center text-white text-2xl shadow-lg shrink-0 mr-4`,
                },
                folderImage
                  ? React.createElement("img", {
                      src: folderImage,
                      alt: sub,
                      loading: "lazy",
                      decoding: "async",
                      className: "w-full h-full object-cover rounded-[18px]",
                    })
                  : React.createElement("i", {
                      className: "fas fa-folder-open",
                    }),
              ),
              React.createElement(
                "div",
                { className: "flex-grow pr-2 min-w-0" },
                React.createElement(
                  "h3",
                  {
                    className:
                      "font-extrabold text-slate-800 text-lg leading-tight mb-1 truncate",
                  },
                  String(sub),
                ),
                React.createElement(
                  "div",
                  {
                    className:
                      "flex items-center text-xs text-slate-500 font-semibold",
                  },
                  React.createElement("i", {
                    className: "fas fa-book-open mr-1.5 opacity-70",
                  }),
                  " ",
                  count,
                  " Courses",
                ),
              ),
              React.createElement(
                "div",
                {
                  className:
                    "w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 shrink-0",
                },
                React.createElement("i", {
                  className: "fas fa-chevron-right text-sm",
                }),
              ),
            ),
          );
        }),
      );
    };
    const getSavedItemDetails = (title) => {
      let foundItem = {
        title: String(title),
        link: "",
        image: "",
        medium: "Bilingual",
      };
      Object.values(batchStructure).forEach((catObj) => {
        Object.values(catObj).forEach((batchList) => {
          const item = batchList.find((b) => String(b.title) === String(title));
          if (item) {
            if (item.image) foundItem.image = item.image;
            if (item.link) foundItem.link = item.link;
            if (item.medium) foundItem.medium = item.medium;
          }
        });
      });
      return foundItem;
    };
    const SkeletonCard = () =>
      React.createElement(
        "div",
        {
          className:
            "bg-white rounded-[28px] p-2.5 border border-slate-100 animate-pulse w-full overflow-hidden",
        },
        React.createElement("div", {
          className: "h-4 bg-slate-200 rounded w-3/4 mx-2 mt-2 mb-3",
        }),
        React.createElement("div", {
          className: "rounded-[20px] mb-3 bg-slate-200 aspect-video w-full",
        }),
        React.createElement(
          "div",
          { className: "flex gap-2 px-1 pb-1" },
          React.createElement("div", {
            className: "w-2/5 h-10 bg-slate-200 rounded-[16px]",
          }),
          React.createElement("div", {
            className: "w-3/5 h-10 bg-slate-200 rounded-[16px]",
          }),
        ),
      );
    return React.createElement(
      "div",
      { className: "fade-in pb-4" },
      React.createElement(
        "style",
        null,
        `
                .folder-bubble-card {
                    transform: translate3d(0, 42px, 0) scale(0.90);
                    opacity: 0.35;
                    filter: saturate(0.88);
                    transition: transform 720ms cubic-bezier(.18, 1.42, .34, 1), opacity 420ms ease, filter 520ms ease, box-shadow 520ms ease;
                    will-change: transform, opacity;
                }
                .folder-bubble-card.folder-bubble-visible {
                    transform: translate3d(0, 0, 0) scale(1);
                    opacity: 1;
                    filter: saturate(1);
                    box-shadow: 0 18px 34px rgba(99, 102, 241, 0.22);
                }
                @media (prefers-reduced-motion: reduce) {
                    .folder-bubble-card { transition: none; transform: none; opacity: 1; filter: none; }
                    .traivo-home-card, .traivo-home-art, .traivo-live-dot { animation: none !important; transition: none !important; }
                }
                .traivo-home-card {
                    position: relative; isolation: isolate; overflow: hidden; min-height: 142px;
                    border: 1px solid rgba(103,232,249,.65); border-radius: 22px;
                    background: #062d4b; box-shadow: 0 14px 28px rgba(8,47,73,.22);
                    transition: transform .25s ease, box-shadow .25s ease; color: #fff;
                }
                .traivo-home-card:hover { transform: translateY(-2px); box-shadow: 0 18px 34px rgba(14,116,144,.3); }
                .traivo-home-art { position: absolute; inset: 0; z-index: -2; background: url('/static/images/traivoai-home-banner.webp') center center / cover no-repeat; animation: traivo-pan 15s ease-in-out infinite alternate; }
                .traivo-home-shade { position: absolute; inset: 0; z-index: -1; background: linear-gradient(90deg, rgba(3,31,55,.97) 0%, rgba(4,52,78,.92) 36%, rgba(5,70,94,.26) 67%, rgba(5,70,94,.05) 100%); }
                .traivo-home-content { position: relative; min-height: 142px; padding: 15px 17px; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; max-width: 74%; }
                .traivo-logo-row { display:flex; align-items:center; gap:6px; line-height:1; }
                .traivo-pin { width:22px; height:22px; display:grid; place-items:center; border-radius:9px 9px 9px 2px; transform: rotate(-45deg); background:linear-gradient(135deg,#2dd4bf,#0ea5e9); box-shadow:0 3px 12px rgba(45,212,191,.45); }
                .traivo-pin i { transform:rotate(45deg); font-size:11px; color:#fff; }
                .traivo-wordmark { font-size:18px; font-weight:900; letter-spacing:-.7px; color:#e7faff; }
                .traivo-wordmark span { color:#b794f4; }
                .traivo-live-dot { width:6px; height:6px; border-radius:50%; background:#67e8f9; box-shadow:0 0 0 0 rgba(103,232,249,.7); animation:traivo-pulse 1.8s infinite; }
                .traivo-kicker { margin-top:4px; font-size:7px; letter-spacing:1.3px; color:#a5f3fc; font-weight:900; }
                .traivo-title { margin-top:6px; font-size:17px; line-height:1.05; letter-spacing:-.65px; font-weight:900; text-shadow:0 2px 9px rgba(2,22,35,.55); }
                .traivo-title em { font-style:normal; color:#5eead4; }
                .traivo-typing { min-height:15px; margin-top:5px; display:flex; align-items:center; gap:5px; font-size:8.5px; line-height:1.3; font-weight:800; color:#e0f2fe; overflow:hidden; white-space:nowrap; max-width:100%; }
                .traivo-typing i { color:#f0abfc; font-size:8px; }
                .traivo-typing b { width:1px; height:10px; background:#67e8f9; animation:traivo-caret .7s step-end infinite; }
                .traivo-cta { display:inline-flex; align-items:center; gap:7px; margin-top:7px; padding:6px 10px; border-radius:999px; background:linear-gradient(90deg,#06b6d4,#6d28d9); box-shadow:0 5px 12px rgba(76,29,149,.42); font-size:9px; font-weight:900; }
                .traivo-cta i { font-size:9px; transition:transform .25s ease; }
                .traivo-home-card:hover .traivo-cta i { transform:translateX(3px); }
                @keyframes traivo-pan { from { transform:scale(1); background-position:51% center; } to { transform:scale(1.06); background-position:57% center; } }
                @keyframes traivo-pulse { 70% { box-shadow:0 0 0 6px rgba(103,232,249,0); } 100% { box-shadow:0 0 0 0 rgba(103,232,249,0); } }
                @keyframes traivo-caret { 50% { opacity:0; } }
                @media (min-width: 640px) { .traivo-home-card, .traivo-home-content { min-height:160px; } .traivo-home-content { padding:19px 22px; max-width:59%; } .traivo-wordmark { font-size:22px; } .traivo-title { font-size:23px; } .traivo-kicker { font-size:8px; } .traivo-typing { font-size:10px; } .traivo-cta { font-size:10px; padding:7px 13px; } }
                @media (max-width: 370px) { .traivo-home-card, .traivo-home-content { min-height:132px; } .traivo-home-content { padding:13px 14px; max-width:79%; } .traivo-title { font-size:15px; } .traivo-typing { font-size:7.5px; } .traivo-cta { margin-top:5px; padding:5px 8px; font-size:8px; } }
            `,
      ),
      React.createElement(
        "div",
        { className: "px-5 pt-4 pb-2 relative z-20" },
        React.createElement(
          "div",
          { className: "relative w-full shadow-sm rounded-full" },
          React.createElement(
            "div",
            {
              className:
                "absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none",
            },
            React.createElement("i", {
              className: "fas fa-search text-slate-400 text-lg",
            }),
          ),
          React.createElement("input", {
            type: "text",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className:
              "w-full bg-white border-none py-3.5 pl-12 pr-4 rounded-full shadow-sm font-semibold focus:ring-2 focus:ring-indigo-400",
            placeholder: "Search courses...",
          }),
        ),
      ),
      activeUniverse === "PW" &&
        searchQuery &&
        React.createElement(
          "div",
          { className: "px-5 pb-2" },
          React.createElement(
            "button",
            {
              type: "button",
              onClick: () => {
                try {
                  sessionStorage.setItem("pw_catalog_search_seed", searchQuery);
                } catch (_) {}
                onNavigate("pw_catalog");
              },
              className:
                "flex w-full items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-left text-[12px] font-extrabold text-indigo-700",
            },
            React.createElement(
              "span",
              { className: "min-w-0 truncate" },
              React.createElement("i", { className: "fas fa-search mr-2" }),
              "Search PW catalogue for \u201C",
              searchQuery,
              "\u201D",
            ),
            React.createElement("i", { className: "fas fa-arrow-right ml-3" }),
          ),
        ),
      !searchQuery &&
        activeFolder === null &&
        React.createElement(
          "div",
          { className: "px-5 pt-2 pb-1 slide-up" },
          React.createElement(
            "button",
            {
              type: "button",
              onClick: () => openExternalLink(((window.APP_CONFIG && window.APP_CONFIG.telegramChannelUrl) || "https://t.me/RGVerseOfficial")),
              className:
                "traivo-home-card w-full text-left cursor-pointer active:scale-[0.985]",
              "aria-label": ((window.APP_CONFIG && window.APP_CONFIG.banner && window.APP_CONFIG.banner.ctaText) || "Explore Batches"),
            },
            React.createElement("div", {
              className: "traivo-home-art",
              "aria-hidden": "true",
            }),
            React.createElement("div", {
              className: "traivo-home-shade",
              "aria-hidden": "true",
            }),
            React.createElement(
              "div",
              { className: "traivo-home-content" },
              React.createElement(
                "div",
                { className: "traivo-logo-row" },
                React.createElement(
                  "span",
                  { className: "traivo-pin" },
                  React.createElement("i", {
                    className: "fas fa-map-marker-alt",
                  }),
                ),
                React.createElement(
                  "span",
                  { className: "traivo-wordmark" },
                  ((window.APP_CONFIG && window.APP_CONFIG.appName) || "RG VERSE"),
                  React.createElement("span", {className: "text-cyan-400"}, " HUB"),
                ),
                React.createElement("span", { className: "traivo-live-dot" }),
              ),
              React.createElement(
                "div",
                { className: "traivo-kicker" },
                "PLAN \u2022 EXPLORE \u2022 EXPERIENCE",
              ),
              React.createElement(
                "div",
                { className: "traivo-title" },
                "Your Next ",
                React.createElement("em", null, "Adventure"),
                " Awaits!",
              ),
              React.createElement(
                "div",
                { className: "traivo-typing", "aria-live": "polite" },
                React.createElement("i", { className: "fas fa-sparkles" }),
                React.createElement("span", null, traivoTypedText),
                React.createElement("b", null),
              ),
              React.createElement(
                "div",
                { className: "traivo-cta" },
                React.createElement("span", null, ((window.APP_CONFIG && window.APP_CONFIG.banner && window.APP_CONFIG.banner.ctaText) || "Explore Batches")),
                React.createElement("i", { className: "fas fa-arrow-right" }),
              ),
            ),
          ),
        ),
      !searchQuery &&
        activeFolder === null &&
        React.createElement(
          "div",
          {
            ref: tabsRef,
            className: "sticky z-30 px-4 py-3",
            style: { top: "calc(72px + env(safe-area-inset-top, 0px))" },
          },
          React.createElement(
            "div",
            {
              className:
                "grid grid-cols-5 gap-1.5 rounded-[24px] border border-white/70 bg-white/80 p-2 shadow-sm backdrop-blur-md",
            },
            TABS_LIST.map((catName) => {
              const upperCat = String(catName).toUpperCase();
              let iconName = "fa-folder-open";
              let label = catName;
              if (upperCat === "SAVED") {
                iconName = "fa-heart";
                label = "Saved";
              } else if (upperCat.includes("IIT") || upperCat.includes("JEE")) {
                iconName = "fa-user-graduate";
                label = "IIT JEE";
              } else if (upperCat.includes("NEET")) {
                iconName = "fa-user-md";
                label = "NEET";
              } else if (upperCat.includes("BOARD")) {
                iconName = "fa-school";
                label = "Boards";
              } else if (upperCat.includes("KGS")) {
                iconName = "fa-globe-asia";
                label = "KGS";
              } else if (upperCat === "OTHERS") {
                iconName = "fa-list-alt";
                label = "Others";
              }
              const isActive = activeCategory === catName;
              return React.createElement(
                "button",
                {
                  key: catName,
                  onClick: () => switchCategory(catName),
                  className: `w-full min-w-0 rounded-[18px] px-1 py-3 text-center transition-all active:scale-95 ${isActive ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-[0_7px_16px_-6px_rgba(109,40,217,0.75)] tab-active" : "text-slate-500 hover:bg-slate-100"}`,
                },
                React.createElement("i", {
                  className: `fas ${iconName} mb-1.5 block text-[17px] ${isActive ? "text-white" : "text-slate-500"}`,
                }),
                React.createElement(
                  "span",
                  {
                    className:
                      "block truncate text-[10px] font-extrabold tracking-wide",
                  },
                  label,
                ),
              );
            }),
          ),
        ),
      React.createElement(
        "div",
        { className: "px-5 min-h-0 pb-6", onTouchStart, onTouchEnd },
        searchQuery.trim() &&
          React.createElement(window.PwBatchResults, {
            query: searchQuery,
            onNavigate,
          }),
        apnaCatalogue.error &&
          React.createElement(
            "div",
            {
              role: "alert",
              className:
                "mb-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800",
            },
            apnaCatalogue.error,
            React.createElement(
              "button",
              {
                type: "button",
                className: "ml-2 underline",
                onClick: apnaCatalogue.retry,
              },
              "Retry Apna College",
            ),
          ),
        apnaCatalogue.loading &&
          activeFolder === "APNA COLLEGE" &&
          React.createElement(
            "p",
            { role: "status", className: "mb-3 text-sm text-slate-500" },
            "Loading Apna College batches\u2026",
          ),
        pwFolderError &&
          !searchQuery.trim() &&
          activeCategory !== "SAVED" &&
          React.createElement(
            "div",
            {
              role: "alert",
              className: "mb-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-700",
            },
            pwFolderError,
            React.createElement(
              "button",
              {
                type: "button",
                className: "ml-2 underline",
                onClick: () => setPwFolderRetry((x) => x + 1),
              },
              "Retry linked batches",
            ),
          ),
        isLoading
          ? React.createElement(
              "div",
              {
                className:
                  "w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-2",
              },
              React.createElement(SkeletonCard, null),
              React.createElement(SkeletonCard, null),
              React.createElement(SkeletonCard, null),
              React.createElement(SkeletonCard, null),
            )
          : searchQuery
            ? React.createElement(
                "div",
                {
                  className:
                    "w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-2",
                },
                getSearchResults().length > 0
                  ? getSearchResults().map((item, idx) =>
                      renderBatchCard(item, idx),
                    )
                  : React.createElement(
                      "div",
                      {
                        className:
                          "text-center text-slate-500 py-16 bg-white/50 rounded-3xl col-span-full",
                      },
                      React.createElement("i", {
                        className: "fas fa-search text-4xl mb-3 opacity-40",
                      }),
                      React.createElement("br", null),
                      "No regular batches match.",
                    ),
              )
            : activeCategory === "SAVED"
              ? React.createElement(
                  "div",
                  {
                    "aria-label": "Saved batches",
                    className:
                      "w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-2",
                  },
                  savedBatches.map((title, idx) =>
                    React.createElement(BatchCollectionCard, {
                      key: "regular-" + idx,
                      item: getSavedItemDetails(title),
                      isSaved: true,
                      onToggleSave,
                      onNavigate,
                    }),
                  ),
                  Object.values(pwFavorites).map((item) =>
                    React.createElement(window.PwFavoriteCard, {
                      key: "pw-" + item.id,
                      item,
                      isSaved: true,
                      onNavigate,
                    }),
                  ),
                  apnaFavorites.map((item) =>
                    React.createElement(window.ApnaCollegeCard, {
                      key: "apna-" + item.id,
                      item,
                      isSaved: true,
                      onNavigate,
                    }),
                  ),
                  ntFavorites.map((item) =>
                    React.createElement(window.NextTopperCard, {
                      key: "nt-" + item.id,
                      item,
                      isSaved: true,
                      onNavigate,
                    }),
                  ),
                  !savedBatches.length &&
                    !Object.keys(pwFavorites).length &&
                    !apnaFavorites.length &&
                    !ntFavorites.length &&
                    React.createElement(
                      "div",
                      {
                        className:
                          "col-span-full rounded-3xl bg-white/50 py-16 text-center text-slate-500",
                      },
                      "No saved batches yet.",
                    ),
                )
              : activeFolder !== null
                ? React.createElement(
                    "div",
                    { className: "fade-in pt-2" },
                    React.createElement(
                      "div",
                      {
                        className:
                          "mb-4 flex min-w-0 items-center gap-3 rounded-[22px] border border-white bg-white p-3 shadow-sm",
                      },
                      React.createElement(
                        "button",
                        {
                          type: "button",
                          onClick: () => {
                            if (window.tg && window.tg.HapticFeedback)
                              window.tg.HapticFeedback.impactOccurred("light");
                            window.history.back();
                          },
                          "aria-label": "Back to folders",
                          className:
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-indigo-600 transition hover:bg-indigo-100 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500",
                        },
                        React.createElement("i", {
                          "aria-hidden": "true",
                          className: "fas fa-arrow-left text-sm",
                        }),
                      ),
                      React.createElement(
                        "div",
                        { className: "min-w-0 flex-1" },
                        React.createElement(
                          "p",
                          {
                            className:
                              "text-[10px] font-semibold text-slate-500",
                          },
                          "Batch Collection",
                        ),
                        React.createElement(
                          "h3",
                          {
                            className:
                              "text-[16px] font-black leading-snug text-slate-800 break-words sm:text-[18px]",
                          },
                          String(activeFolder),
                        ),
                      ),
                      React.createElement(
                        "span",
                        {
                          className:
                            "shrink-0 rounded-full bg-indigo-50 px-2.5 py-1.5 text-[11px] font-bold text-indigo-600",
                          "aria-label": "Number of batches",
                        },
                        batchStructure[activeCategory] &&
                          batchStructure[activeCategory][activeFolder]
                          ? batchStructure[activeCategory][activeFolder].length
                          : 0,
                      ),
                    ),
                    React.createElement(
                      "div",
                      {
                        className:
                          "w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5",
                      },
                      batchStructure[activeCategory] &&
                        batchStructure[activeCategory][activeFolder]
                        ? batchStructure[activeCategory][activeFolder].map(
                            (item, idx) => renderBatchCard(item, idx),
                          )
                        : React.createElement(
                            "div",
                            {
                              className:
                                "text-center text-slate-500 py-16 bg-white/50 rounded-3xl col-span-full",
                            },
                            "Empty Folder",
                          ),
                    ),
                  )
                : React.createElement(
                    "div",
                    { className: "w-full pt-2" },
                    renderFolders(),
                  ),
      ),
    );
  };
})();
