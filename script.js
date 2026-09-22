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
      // 비교 화면은 data-step 값을 바꾸며 여섯 단계의 장면을 순서대로 표시합니다.
      // [단계, 시작까지의 지연 시간(ms)]
      const steps = [
        [1, 0],    // 1. 정차 차량(BLOCKED)을 감지
        [2, 1800], // 2. 마주 오는 차량(ONCOMING)을 감지
        [3, 3700], // 3. 일반 시스템은 정지, Reasoning AI는 안전 간격을 기다림
        [4, 5700], // 4. Reasoning AI가 마주 오는 차량의 통과를 관찰
        [5, 7700], // 5. 안전 간격과 회피 경로를 표시
        [6, 9400], // 6. Reasoning AI 차량이 경로를 따라 회피 주행
      ];

      let timers = [];
      let hasPlayed = false;

      // 재생 버튼 클릭 또는 섹션 첫 진입 때 호출됩니다.
      const playComparison = () => {
        // 이전 재생 예약을 취소한 뒤 초기 장면으로 되돌립니다.
        timers.forEach(clearTimeout);
        comparisonPlayground.dataset.step = "0";

        // 브라우저가 초기 상태를 먼저 그린 다음, 각 단계를 예약합니다.
        requestAnimationFrame(() =>
          requestAnimationFrame(() =>
            steps.forEach(([step, delay]) => {
              timers.push(
                setTimeout(() => {
                  comparisonPlayground.dataset.step = String(step);
                }, delay),
              );
            }),
          ),
        );
      };

      // REPLAY 버튼을 누르면 처음부터 다시 재생합니다.
      comparisonReplay?.addEventListener("click", playComparison);

      // 화면에 처음 보일 때 한 번만 자동 재생합니다.
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
