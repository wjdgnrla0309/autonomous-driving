(() => {
  "use strict";
  const q = (s, p = document) => p.querySelector(s),
    qa = (s, p = document) => [...p.querySelectorAll(s)];
  const header = q("#header"),
    bar = q("#progress"),
    menu = q("#menu"),
    links = q("#links"),
    consoleEl = q("#console"),
    decisionPanels = q("#decision-panels"),
    sensorStage = q("#sensor-stage"),
    vlaLive = q("#vla-live"),
    comparisonPlayground = q("#comparison-playground"),
    comparisonReplay = q("#comparison-replay");
  const update = () => {
    const y = scrollY,
      max =
        document.documentElement.scrollHeight - innerHeight;
    if (bar)
      bar.style.width = `${max ? Math.min((y / max) * 100, 100) : 0}%`;
    header?.classList.toggle("scrolled", y > 20);
  };
  let tick = false;
  addEventListener(
    "scroll",
    () => {
      if (!tick) {
        requestAnimationFrame(() => {
          update();
          tick = false;
        });
        tick = true;
      }
    },
    { passive: true },
  );
  update();
  const close = () => {
    menu?.setAttribute("aria-expanded", "false");
    links?.classList.remove("open");
    document.body.classList.remove("nav-open");
  };
  menu?.addEventListener("click", () => {
    const open =
      menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    links?.classList.toggle("open", open);
    document.body.classList.toggle("nav-open", open);
  });
  links?.addEventListener("click", (e) => {
    if (e.target.closest("a")) close();
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
  if ("IntersectionObserver" in window) {
    const reveal = new IntersectionObserver(
      (es, o) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("shown");
            o.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -7%" },
    );
    qa(".reveal").forEach((e) => reveal.observe(e));
    const nav = new IntersectionObserver(
      (es) => {
        const v = es
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio,
          )[0];
        if (v)
          qa("#links a").forEach((a) => {
            const on =
              a.dataset.nav === v.target.dataset.section;
            a.classList.toggle("active", on);
            on
              ? a.setAttribute("aria-current", "page")
              : a.removeAttribute("aria-current");
          });
      },
      {
        threshold: [0.2, 0.45],
        rootMargin: "-18% 0px -50%",
      },
    );
    qa("section[data-section]").forEach((s) =>
      nav.observe(s),
    );
    if (consoleEl)
      new IntersectionObserver(
        (es, o) => {
          if (es.some((e) => e.isIntersecting)) {
            consoleEl.classList.add("running");
            o.disconnect();
          }
        },
        { threshold: 0.25 },
      ).observe(consoleEl);
    if (
      decisionPanels &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      let comparisonVisible = false,
        comparisonTimer;
      const replayComparison = () => {
        decisionPanels.classList.remove("playing");
        void decisionPanels.offsetWidth;
        decisionPanels.classList.add("playing");
        clearTimeout(comparisonTimer);
        if (comparisonVisible)
          comparisonTimer = setTimeout(replayComparison, 8200);
      };
      new IntersectionObserver(
        (es) => {
          comparisonVisible = es[0].isIntersecting;
          if (comparisonVisible) replayComparison();
          else clearTimeout(comparisonTimer);
        },
        { threshold: 0.35 },
      ).observe(decisionPanels);
    }
    [
      sensorStage,
      vlaLive,
    ].forEach((element) => {
      if (!element) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;
      new IntersectionObserver(
        (entries) =>
          element.classList.toggle("playing", entries[0].isIntersecting),
        { threshold: 0.3 },
      ).observe(element);
    });
    if (
      vlaLive &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const messages = [
        "앞에 장애물이 있음",
        "접근 차량 확인",
        "지금 우회하면 위험",
        "기다린 후 우회",
      ];
      const copy = q(".reason-copy", vlaLive);
      let messageIndex = 0,
        messageTimer;
      new IntersectionObserver(
        (entries) => {
          clearInterval(messageTimer);
          if (entries[0].isIntersecting && copy)
            messageTimer = setInterval(() => {
              messageIndex = (messageIndex + 1) % messages.length;
              copy.textContent = messages[messageIndex];
            }, 1450);
        },
        { threshold: 0.3 },
      ).observe(vlaLive);
    }
    if (
      comparisonPlayground &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const steps = [[1, 0], [2, 1800], [3, 3700], [4, 5700], [5, 7700], [6, 9400]];
      let timers = [], hasPlayed = false;
      const playComparison = () => {
        timers.forEach(clearTimeout);
        comparisonPlayground.dataset.step = "0";
        requestAnimationFrame(() =>
          requestAnimationFrame(() =>
            steps.forEach(([step, delay]) =>
              timers.push(setTimeout(() => {
                comparisonPlayground.dataset.step = String(step);
              }, delay)),
            ),
          ),
        );
      };
      comparisonReplay?.addEventListener("click", playComparison);
      new IntersectionObserver((entries, observer) => {
        if (entries[0].isIntersecting && !hasPlayed) {
          hasPlayed = true;
          playComparison();
          observer.unobserve(comparisonPlayground);
        }
      }, { threshold: 0.3 }).observe(comparisonPlayground);
    }
  } else {
    qa(".reveal").forEach((e) => e.classList.add("shown"));
    consoleEl?.classList.add("running");
    decisionPanels?.classList.add("playing");
    sensorStage?.classList.add("playing");
    vlaLive?.classList.add("playing");
    if (comparisonPlayground) comparisonPlayground.dataset.step = "6";
  }
  if (
    matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    consoleEl?.classList.add("running");
    decisionPanels?.classList.add("playing", "reduced");
    sensorStage?.classList.add("playing", "reduced");
    vlaLive?.classList.add("playing", "reduced");
    if (comparisonPlayground) comparisonPlayground.dataset.step = "6";
  }
  const year = q("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
