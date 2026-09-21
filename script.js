(() => {
  "use strict";
  const q = (s, p = document) => p.querySelector(s),
    qa = (s, p = document) => [...p.querySelectorAll(s)];
  const header = q("#header"),
    bar = q("#progress"),
    menu = q("#menu"),
    links = q("#links"),
    consoleEl = q("#console");
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
  } else {
    qa(".reveal").forEach((e) => e.classList.add("shown"));
    consoleEl?.classList.add("running");
  }
  if (
    matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    consoleEl?.classList.add("running");
  const year = q("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
