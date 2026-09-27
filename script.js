(() => {
  "use strict";

  const q = (s, p = document) => p.querySelector(s);
  const qa = (s, p = document) => [...p.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  const header = q("#header");
  const progress = q("#progress");
  const menu = q("#menu");
  const links = q("#links");
  const consoleEl = q("#console");
  const sensorStage = q("#sensor-stage");
  const vlaLive = q("#vla-live");

  const updateScroll = () => {
    const max =
      document.documentElement.scrollHeight -
      innerHeight;

    if (progress) {
      progress.style.width =
        `${
          max
            ? Math.min(
                (scrollY / max) * 100,
                100
              )
            : 0
        }%`;
    }

    header?.classList.toggle(
      "scrolled",
      scrollY > 20
    );
  };

  let scrollTick = false;

  addEventListener(
    "scroll",
    () => {
      if (scrollTick) return;

      scrollTick = true;

      requestAnimationFrame(() => {
        updateScroll();
        scrollTick = false;
      });
    },
    {
      passive: true
    }
  );

  updateScroll();

  const closeMenu = () => {
    menu?.setAttribute(
      "aria-expanded",
      "false"
    );

    links?.classList.remove("open");

    document.body.classList.remove(
      "nav-open"
    );
  };

  menu?.addEventListener(
    "click",
    () => {
      const open =
        menu.getAttribute(
          "aria-expanded"
        ) !== "true";

      menu.setAttribute(
        "aria-expanded",
        String(open)
      );

      links?.classList.toggle(
        "open",
        open
      );

      document.body.classList.toggle(
        "nav-open",
        open
      );
    }
  );

  links?.addEventListener(
    "click",
    e =>
      e.target.closest("a") &&
      closeMenu()
  );

  addEventListener(
    "keydown",
    e =>
      e.key === "Escape" &&
      closeMenu()
  );

  if (
    "IntersectionObserver" in window
  ) {
    const reveal =
      new IntersectionObserver(
        (entries, observer) => {
          entries.forEach(entry => {
            if (
              !entry.isIntersecting
            ) {
              return;
            }

            entry.target.classList.add(
              "shown"
            );

            observer.unobserve(
              entry.target
            );
          });
        },
        {
          threshold: 0.12,
          rootMargin:
            "0px 0px -7%"
        }
      );

    qa(".reveal").forEach(el =>
      reveal.observe(el)
    );

    const nav =
      new IntersectionObserver(
        entries => {
          const active =
            entries
              .filter(
                e =>
                  e.isIntersecting
              )
              .sort(
                (a, b) =>
                  b.intersectionRatio -
                  a.intersectionRatio
              )[0];

          if (!active) return;

          qa("#links a").forEach(
            a => {
              const on =
                a.dataset.nav ===
                active.target.dataset
                  .section;

              a.classList.toggle(
                "active",
                on
              );

              on
                ? a.setAttribute(
                    "aria-current",
                    "page"
                  )
                : a.removeAttribute(
                    "aria-current"
                  );
            }
          );
        },
        {
          threshold: [
            0.2,
            0.45
          ],
          rootMargin:
            "-18% 0px -50%"
        }
      );

    qa(
      "section[data-section]"
    ).forEach(s =>
      nav.observe(s)
    );

    if (consoleEl) {
      new IntersectionObserver(
        (entries, observer) => {
          if (
            !entries[0]
              .isIntersecting
          ) {
            return;
          }

          consoleEl.classList.add(
            "running"
          );

          observer.disconnect();
        },
        {
          threshold: 0.25
        }
      ).observe(consoleEl);
    }

    [
      sensorStage,
      vlaLive
    ].forEach(el => {
      if (
        !el ||
        reduced.matches
      ) {
        return;
      }

      new IntersectionObserver(
        entries => {
          el.classList.toggle(
            "playing",
            entries[0]
              .isIntersecting
          );
        },
        {
          threshold: 0.3
        }
      ).observe(el);
    });
  } else {
    qa(".reveal").forEach(
      el =>
        el.classList.add(
          "shown"
        )
    );

    consoleEl?.classList.add(
      "running"
    );

    sensorStage?.classList.add(
      "playing"
    );

    vlaLive?.classList.add(
      "playing"
    );
  }

  if (
    vlaLive &&
    !reduced.matches &&
    "IntersectionObserver" in
      window
  ) {
    const copy = q(
      ".reason-copy",
      vlaLive
    );

    const messages = [
      "앞에 장애물이 있음",
      "반대 차량 접근 확인",
      "통과 가능한 공간 분석",
      "안전한 행동 결정"
    ];

    let index = 0;
    let timer = 0;

    new IntersectionObserver(
      entries => {
        clearInterval(timer);

        if (
          !entries[0]
            .isIntersecting ||
          !copy
        ) {
          return;
        }

        index = 0;

        copy.textContent =
          messages[0];

        timer = setInterval(
          () => {
            index =
              (index + 1) %
              messages.length;

            copy.textContent =
              messages[index];
          },
          1450
        );
      },
      {
        threshold: 0.3
      }
    ).observe(vlaLive);
  }

  const comparison = q(
    "#comparison-unified"
  );

  if (comparison) {
    if (
      !q(
        "#unified-runtime-style"
      )
    ) {
      const style =
        document.createElement(
          "style"
        );

      style.id =
        "unified-runtime-style";

      style.textContent = `

        #comparison-unified .v2-ego {
          will-change: transform;
        }

        #comparison-unified .v2-trajectory,
        #comparison-unified .v2-trajectory path {
          pointer-events: none;
        }

        #comparison-unified .v2-trajectory path {
          fill: none;
          vector-effect: non-scaling-stroke;
          stroke-linecap: round;
          stroke-linejoin: round;
          will-change: stroke-dashoffset;
        }

        #comparison-unified .reason-node {
          display: block;
        }

        #comparison-unified .reason-arrow {
          display: block;
          text-align: center;
          opacity: .5;
          padding: 4px 0;
          line-height: 1;
        }

        #comparison-unified .stage-control {
          width: min(
            720px,
            calc(100% - 24px)
          );

          margin: 18px auto 0;
          padding: 12px;

          display: grid;

          grid-template-columns:
            100px
            minmax(0, 1fr)
            100px;

          gap: 10px;

          align-items: center;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              .12
            );

          border-radius: 16px;

          background:
            rgba(
              8,
              13,
              23,
              .84
            );

          box-shadow:
            0 14px 40px
            rgba(
              0,
              0,
              0,
              .18
            );

          backdrop-filter:
            blur(12px);
        }

        #comparison-unified
        .stage-control button,
        #comparison-unified
        .stage-replay {
          border:
            1px solid
            rgba(
              255,
              255,
              255,
              .14
            );

          border-radius: 11px;

          background:
            rgba(
              255,
              255,
              255,
              .065
            );

          color: inherit;

          font: inherit;

          font-weight: 700;

          cursor: pointer;
        }

        #comparison-unified
        .stage-control button {
          min-height: 44px;
          padding: 0 14px;
        }

        #comparison-unified
        .stage-control
        button:disabled {
          opacity: .35;
          cursor: default;
        }

        #comparison-unified
        .stage-readout {
          text-align: center;
          min-width: 0;

          display: grid;

          gap: 2px;
        }

        #comparison-unified
        .stage-count {
          font-size: 11px;

          letter-spacing:
            .12em;

          opacity: .58;
        }

        #comparison-unified
        .stage-name {
          font-size: 14px;
          font-weight: 800;

          overflow: hidden;

          text-overflow:
            ellipsis;

          white-space: nowrap;
        }

        #comparison-unified
        .stage-actions {
          display: flex;

          justify-content:
            center;

          margin:
            8px auto 0;
        }

        #comparison-unified
        .stage-replay {
          min-height: 38px;

          padding:
            0 14px;

          border-radius:
            999px;

          background:
            transparent;

          font-size: 12px;

          opacity: .8;
        }

        @media
        (max-width: 640px) {

          #comparison-unified
          .stage-control {
            grid-template-columns:
              76px
              minmax(0, 1fr)
              76px;

            gap: 7px;
            padding: 9px;
          }

          #comparison-unified
          .stage-control button {
            padding:
              0 8px;

            font-size:
              12px;
          }

          #comparison-unified
          .stage-name {
            font-size:
              12px;
          }
        }

      `;

      document.head.append(
        style
      );
    }

    const phase =
      q(
        "#unified-phase",
        comparison
      ) ||
      q("#unified-phase");

    const title =
      q(
        "#unified-title",
        comparison
      ) ||
      q("#unified-title");

    const subtitle =
      q(
        "#unified-subtitle",
        comparison
      ) ||
      q(
        "#unified-subtitle"
      );

    const caption =
      q(
        "#unified-caption",
        comparison
      ) ||
      q(
        "#unified-caption"
      );

    const reasoning = q(
      ".unified-reasoning",
      comparison
    );

    const stepItems = qa(
      ".unified-steps li",
      comparison
    );

    qa(
      ".unified-system",
      comparison
    ).forEach(
      b =>
        b.hidden = true
    );

    [
      q("#unified-next"),
      q("#unified-previous"),
      q("#unified-replay")
    ].forEach(el => {
      if (el) {
        el.hidden = true;
      }
    });

    const roads = qa(
      ".v2-road",
      comparison
    );

    const road =
      roads[0] || null;

    roads
      .slice(1)
      .forEach(r => {
        r.hidden = true;

        r.setAttribute(
          "aria-hidden",
          "true"
        );
      });

    const ego =
      road
        ? q(
            ".v2-ego",
            road
          )
        : null;

    const path =
      road
        ? q(
            ".v2-trajectory path",
            road
          )
        : null;

    const svg =
      path?.closest("svg") ||
      null;

    const PATH_D =
      "M240 482 " +
      "C240 450 238 425 232 400 " +
      "C195 365 145 335 118 305 " +
      "C108 270 108 235 116 205 " +
      "C126 170 148 145 175 130 " +
      "C198 116 222 105 240 94 " +
      "C240 58 240 18 240 -20";

    if (path) {
      path.setAttribute(
        "d",
        PATH_D
      );

      path.setAttribute(
        "vector-effect",
        "non-scaling-stroke"
      );
    }

    if (svg) {
      svg.setAttribute(
        "viewBox",
        "0 0 320 560"
      );

      svg.setAttribute(
        "preserveAspectRatio",
        "none"
      );
    }

    qa(
      ".v2-road-label",
      comparison
    ).forEach(
      el =>
        el.textContent =
          "같은 도로 상황"
    );

    qa(
      ".v2-ego",
      comparison
    ).forEach(
      el =>
        el.textContent =
          "내 차"
    );

    qa(
      ".v2-blocked",
      comparison
    ).forEach(
      el =>
        el.textContent =
          "장애물"
    );

    qa(
      ".v2-oncoming",
      comparison
    ).forEach(
      el =>
        el.textContent =
          "반대 차량"
    );

    qa(
      ".v2-detection-blocked",
      comparison
    ).forEach(
      el =>
        el.textContent =
          "장애물 감지"
    );

    qa(
      ".v2-detection-oncoming",
      comparison
    ).forEach(
      el =>
        el.textContent =
          "반대 차량 감지"
    );

    if (
      road &&
      !q(
        ".v2-prediction",
        road
      )
    ) {
      const el =
        document.createElement(
          "span"
        );

      el.className =
        "v2-prediction";

      el.textContent =
        "예상 이동 경로";

      road.append(el);
    }

    if (
      road &&
      !q(
        ".v2-candidates",
        road
      )
    ) {
      const el =
        document.createElement(
          "div"
        );

      el.className =
        "v2-candidates";

      el.innerHTML =
        "<i></i><i></i><i></i>";

      el.setAttribute(
        "aria-hidden",
        "true"
      );

      road.append(el);
    }

    const C = [
      "인식",
      "예측",
      "계획",
      "제어"
    ];

    const A = [
      "장면 이해",
      "인과 추론",
      "행동 결정",
      "궤적 출력"
    ];

    const S = (
      name,
      mode,
      ph,
      ti,
      sub,
      cap,
      steps = [],
      active = -1,
      reason = [],
      drive = false
    ) => ({
      name,
      mode,
      ph,
      ti,
      sub,
      cap,
      steps,
      active,
      reason,
      drive
    });

    const stages = [
      S(
        "상황 소개",
        "intro",
        "SAME ROAD SCENARIO",
        "같은 주행 상황",
        "같은 도로 · 같은 차량 · 같은 장애물",
        "두 시스템은 같은 주행 결과를 선택할 수 있습니다. 차이는 판단 과정입니다."
      ),

      S(
        "기존 자율주행",
        "modular",
        "CONVENTIONAL AUTONOMY",
        "기존 자율주행",
        "Perception → Prediction → Planning → Control",
        "먼저 기존 모듈형 자율주행 시스템의 판단 과정을 확인합니다.",
        C
      ),

      S(
        "인식",
        "modular",
        "PERCEPTION",
        "주변 환경을 인식",
        "Perception",
        "센서와 인식 모델을 통해 객체와 도로 구조를 감지합니다.",
        C,
        0,
        [
          "장애물 감지",
          "반대 차량 감지",
          "차선 경계 감지"
        ]
      ),

      S(
        "예측",
        "modular",
        "PREDICTION",
        "주변 차량의 움직임을 예측",
        "Prediction",
        "반대 차량이 앞으로 어떻게 이동할지 예측합니다.",
        C,
        1,
        [
          "반대 차량 진행 방향",
          "예상 위치 계산",
          "시간 간격 예측"
        ]
      ),

      S(
        "계획",
        "modular",
        "PLANNING",
        "가능한 경로를 계산",
        "Planning",
        "충돌 위험과 도로 제약조건을 고려해 후보 경로를 비교합니다.",
        C,
        2,
        [
          "후보 경로 비교",
          "충돌 위험 계산",
          "안전 여유 확인",
          "주행 경로 선택"
        ]
      ),

      S(
        "기존 방식 주행",
        "modular",
        "CONTROL",
        "선택한 궤적을 실행",
        "Slow → Pass → Return",
        "궤적을 먼저 생성한 뒤 차량이 천천히 그 경로를 따라 이동합니다.",
        C,
        3,
        [
          "선택된 궤적 실행"
        ],
        true
      ),

      S(
        "장면 초기화",
        "reset",
        "SAME SCENE",
        "같은 상황으로 되돌립니다",
        "도로와 차량 조건은 그대로",
        "이제 같은 상황을 NVIDIA Alpamayo의 판단 과정으로 다시 확인합니다."
      ),

      S(
        "Alpamayo 소개",
        "reasoning",
        "NVIDIA ALPAMAYO",
        "같은 상황, 다른 판단 과정",
        "Understand → Reason → Decide → Act",
        "이번에는 장면 이해와 인과적 추론 과정에 주목하세요.",
        A
      ),

      S(
        "장면 이해",
        "reasoning",
        "SCENE UNDERSTANDING",
        "장면 전체를 이해",
        "Scene Understanding",
        "개별 객체뿐 아니라 도로 공간과 객체 사이의 관계를 함께 해석합니다.",
        A,
        0,
        [
          "진행 차로 일부가 막힘",
          "반대 차량이 접근 중",
          "통과 가능한 공간 존재"
        ]
      ),

      S(
        "인과 추론",
        "reasoning",
        "CAUSAL REASONING",
        "상황의 관계를 추론",
        "Causal Reasoning",
        "왜 해당 행동이 가능한지 상황의 관계를 연결해 판단합니다.",
        A,
        1,
        [
          "장애물이 진행 차로를 일부 차단",
          "반대 차량과 통과 여유 확인",
          "감속하면 안전 여유 증가",
          "통제된 우회 통과 가능"
        ]
      ),

      S(
        "행동 결정",
        "reasoning",
        "ACTION DECISION",
        "행동 결정",
        "Reduce speed and pass",
        "추론 결과를 바탕으로 감속 후 통과하는 행동을 선택합니다.",
        A,
        2,
        [
          "ACTION",
          "감속 후 안전하게 통과"
        ]
      ),

      S(
        "Alpamayo 주행",
        "reasoning",
        "TRAJECTORY OUTPUT",
        "주행 궤적 생성",
        "Slow → Pass → Return",
        "최종 이동 경로는 기존 시스템과 동일할 수 있습니다.",
        A,
        3,
        [
          "통과 궤적 생성",
          "선택된 궤적 실행"
        ],
        true
      ),

      S(
        "결론",
        "final",
        "SAME ACTION",
        "Same Action",
        "Different Decision Process",
        "같은 주행 결과를 만들 수 있지만, 그 결정을 만드는 구조가 다릅니다.",
        [],
        -1,
        [
          "Conventional · Detect → Predict → Plan → Act",
          "Alpamayo · Understand → Reason → Decide → Act"
        ]
      )
    ];

    const hold = [
      1800,
      1600,
      1900,
      1900,
      2200,
      8200,
      1500,
      1700,
      2200,
      2800,
      2100,
      8200,
      6000
    ];

    q(
      ".stage-runtime",
      comparison
    )?.remove();

    const controls =
      document.createElement(
        "div"
      );

    controls.className =
      "stage-runtime";

    controls.innerHTML = `

      <div
        class="stage-control"
        role="group"
        aria-label="애니메이션 단계 이동"
      >

        <button
          type="button"
          class="stage-prev"
        >
          ← 이전
        </button>

        <div
          class="stage-readout"
          aria-live="polite"
        >

          <span
            class="stage-count"
          ></span>

          <strong
            class="stage-name"
          ></strong>

        </div>

        <button
          type="button"
          class="stage-next"
        >
          다음 →
        </button>

      </div>

      <div
        class="stage-actions"
      >

        <button
          type="button"
          class="stage-replay"
        >
          ↻ 처음부터 자동 재생
        </button>

      </div>

    `;

   // ==========================================================
// 단계 이동 컨트롤 위치
// 제목/설명 바로 아래 + 애니메이션 바로 위
// ==========================================================

const titleArea =
  subtitle?.parentElement ||
  title?.parentElement;

if (titleArea) {
  titleArea.insertAdjacentElement(
    "afterend",
    controls
  );
} else if (road) {
  road.parentElement.insertBefore(
    controls,
    road
  );
} else {
  comparison.prepend(controls);
}

    const prev = q(
      ".stage-prev",
      controls
    );

    const next = q(
      ".stage-next",
      controls
    );

    const replay = q(
      ".stage-replay",
      controls
    );

    const count = q(
      ".stage-count",
      controls
    );

    const name = q(
      ".stage-name",
      controls
    );

    let stage = 0;

    let autoTimer = 0;
    let loopTimer = 0;
    let delayTimer = 0;
    let frame = 0;

    let visible = false;
    let played = false;
    let auto = false;

    const stopMotion = () => {
      cancelAnimationFrame(
        frame
      );

      clearTimeout(
        delayTimer
      );

      frame = 0;
      delayTimer = 0;
    };

    const stopAuto = () => {
      clearTimeout(
        autoTimer
      );

      clearTimeout(
        loopTimer
      );

      autoTimer = 0;
      loopTimer = 0;
    };

    const setReasoning =
      lines => {
        if (!reasoning) return;

        reasoning.replaceChildren();

        lines.forEach(
          (text, i) => {
            const node =
              document.createElement(
                "span"
              );

            node.className =
              "reason-node";

            node.textContent =
              text;

            reasoning.append(
              node
            );

            if (
              i <
              lines.length - 1
            ) {
              const arrow =
                document.createElement(
                  "span"
                );

              arrow.className =
                "reason-arrow";

              arrow.textContent =
                "↓";

              reasoning.append(
                arrow
              );
            }
          }
        );
      };

    const setSteps = (
      labels,
      active
    ) =>
      stepItems.forEach(
        (item, i) => {
          item.textContent =
            labels[i] || "";

          item.hidden =
            !labels[i];

          item.classList.toggle(
            "active",
            i === active
          );

          item.classList.toggle(
            "complete",
            active >= 0 &&
              i < active
          );
        }
      );

    const updateControls =
      () => {
        if (count) {
          count.textContent =
            `STEP ${
              stage + 1
            } / ${
              stages.length
            }`;
        }

        if (name) {
          name.textContent =
            stages[stage].name;
        }

        if (prev) {
          prev.disabled =
            stage === 0;
        }

        if (next) {
          next.disabled =
            stage ===
            stages.length - 1;
        }
      };

    const pathPointLocal =
      p => {
        if (
          !path ||
          !road
        ) {
          return null;
        }

        const len =
          path.getTotalLength();

        const pt =
          path.getPointAtLength(
            len * p
          );

        const matrix =
          path.getScreenCTM();

        if (!matrix) {
          return null;
        }

        let screen;

        if (
          typeof DOMPoint !==
          "undefined"
        ) {
          screen =
            new DOMPoint(
              pt.x,
              pt.y
            ).matrixTransform(
              matrix
            );
        } else {
          const sp =
            path.ownerSVGElement
              .createSVGPoint();

          sp.x = pt.x;
          sp.y = pt.y;

          screen =
            sp.matrixTransform(
              matrix
            );
        }

        const rr =
          road.getBoundingClientRect();

        return {
          x:
            screen.x -
            rr.left,

          y:
            screen.y -
            rr.top
        };
      };

    const naturalCarCenter =
      () => {
        if (
          !ego ||
          !road
        ) {
          return null;
        }

        ego.style.transition =
          "none";

        ego.style.transform =
          "none";

        void ego.offsetWidth;

        const er =
          ego.getBoundingClientRect();

        const rr =
          road.getBoundingClientRect();

        return {
          x:
            er.left -
            rr.left +
            er.width / 2,

          y:
            er.top -
            rr.top +
            er.height / 2
        };
      };

    const placeCar = (
      p,
      center
    ) => {
      if (!ego) return;

      const target =
        pathPointLocal(p);

      if (
        !target ||
        !center
      ) {
        return;
      }

      ego.style.transform =
        `translate3d(` +
        `${
          target.x -
          center.x
        }px,` +
        `${
          target.y -
          center.y
        }px,` +
        `0)`;
    };

    const resetCar = () => {
      stopMotion();

      if (
        !ego ||
        !path
      ) {
        return;
      }

      const center =
        naturalCarCenter();

      placeCar(
        0,
        center
      );

      const len =
        path.getTotalLength();

      path.style.transition =
        "none";

      path.style.strokeDasharray =
        `${len}`;

      path.style.strokeDashoffset =
        `${len}`;

      path.style.opacity =
        "0";
    };

    const drive = () => {
      if (
        !ego ||
        !path ||
        !road
      ) {
        return;
      }

      stopMotion();

      const center =
        naturalCarCenter();

      if (!center) return;

      placeCar(
        0,
        center
      );

      const len =
        path.getTotalLength();

      // ============================================
      // 속도 조절 핵심
      // ============================================

      const DRAW = 1200;

      const WAIT = 300;

      const MOVE = 6200;

      path.style.transition =
        "none";

      path.style.strokeDasharray =
        `${len}`;

      path.style.strokeDashoffset =
        `${len}`;

      path.style.opacity =
        "1";

      const drawStart =
        performance.now();

      const drawFrame =
        now => {
          const raw =
            Math.min(
              (
                now -
                drawStart
              ) /
                DRAW,
              1
            );

          const eased =
            1 -
            Math.pow(
              1 - raw,
              3
            );

          path.style.strokeDashoffset =
            `${
              len *
              (1 - eased)
            }`;

          if (raw < 1) {
            frame =
              requestAnimationFrame(
                drawFrame
              );

            return;
          }

          path.style.strokeDashoffset =
            "0";

          delayTimer =
            setTimeout(
              () => {
                const moveStart =
                  performance.now();

                const moveFrame =
                  now2 => {
                    const raw2 =
                      Math.min(
                        (
                          now2 -
                          moveStart
                        ) /
                          MOVE,
                        1
                      );

                    // 부드러운 가감속
                    const p =
                      -(
                        Math.cos(
                          Math.PI *
                            raw2
                        ) -
                        1
                      ) /
                      2;

                    placeCar(
                      p,
                      center
                    );

                    if (
                      raw2 < 1
                    ) {
                      frame =
                        requestAnimationFrame(
                          moveFrame
                        );
                    }
                  };

                frame =
                  requestAnimationFrame(
                    moveFrame
                  );
              },
              WAIT
            );
        };

      frame =
        requestAnimationFrame(
          drawFrame
        );
    };

    const staticDrive =
      () => {
        if (
          !ego ||
          !path
        ) {
          return;
        }

        const center =
          naturalCarCenter();

        const len =
          path.getTotalLength();

        path.style.strokeDasharray =
          `${len}`;

        path.style.strokeDashoffset =
          "0";

        path.style.opacity =
          "1";

        placeCar(
          1,
          center
        );
      };

    const applyStage =
      index => {
        stage =
          Math.max(
            0,
            Math.min(
              index,
              stages.length - 1
            )
          );

        const s =
          stages[stage];

        stopMotion();

        comparison.dataset.stage =
          String(stage);

        comparison.dataset.mode =
          s.mode;

        if (phase) {
          phase.textContent =
            s.ph;
        }

        if (title) {
          title.textContent =
            s.ti;
        }

        if (subtitle) {
          subtitle.textContent =
            s.sub;
        }

        if (caption) {
          caption.textContent =
            s.cap;
        }

        setSteps(
          s.steps,
          s.active
        );

        setReasoning(
          s.reason
        );

        updateControls();

        if (s.drive) {
          reduced.matches
            ? staticDrive()
            : drive();
        } else {
          resetCar();
        }
      };

    const schedule = () => {
      clearTimeout(
        autoTimer
      );

      if (
        !auto ||
        !visible
      ) {
        return;
      }

      autoTimer =
        setTimeout(
          () => {
            if (
              !auto ||
              !visible
            ) {
              return;
            }

            if (
              stage <
              stages.length - 1
            ) {
              applyStage(
                stage + 1
              );

              schedule();
            } else {
              loopTimer =
                setTimeout(
                  () => {
                    if (
                      !auto ||
                      !visible
                    ) {
                      return;
                    }

                    applyStage(0);

                    schedule();
                  },
                  1200
                );
            }
          },
          hold[stage] ||
            2000
        );
    };

    const startAuto =
      () => {
        stopAuto();

        stopMotion();

        auto = true;

        applyStage(0);

        schedule();
      };

    const manual =
      () => {
        auto = false;

        stopAuto();

        stopMotion();
      };

    prev?.addEventListener(
      "click",
      () => {
        manual();

        applyStage(
          stage - 1
        );
      }
    );

    next?.addEventListener(
      "click",
      () => {
        manual();

        applyStage(
          stage + 1
        );
      }
    );

    replay?.addEventListener(
      "click",
      () => {
        played = true;

        startAuto();
      }
    );

    comparison.addEventListener(
      "keydown",
      e => {
        if (
          e.key ===
          "ArrowLeft"
        ) {
          e.preventDefault();

          manual();

          applyStage(
            stage - 1
          );
        }

        if (
          e.key ===
          "ArrowRight"
        ) {
          e.preventDefault();

          manual();

          applyStage(
            stage + 1
          );
        }
      }
    );

    if (reduced.matches) {
      visible = true;

      applyStage(
        stages.length - 1
      );
    } else if (
      "IntersectionObserver" in
      window
    ) {
      new IntersectionObserver(
        entries => {
          visible =
            entries[0]
              .isIntersecting;

          if (
            visible &&
            !played
          ) {
            played = true;

            startAuto();
          } else if (
            !visible
          ) {
            stopAuto();

            stopMotion();
          }
        },
        {
          threshold: 0.3
        }
      ).observe(
        comparison
      );
    } else {
      visible = true;
      played = true;

      startAuto();
    }

    let resizeTimer = 0;

    addEventListener(
      "resize",
      () => {
        clearTimeout(
          resizeTimer
        );

        resizeTimer =
          setTimeout(
            () => {
              if (!visible) {
                return;
              }

              const wasAuto =
                auto;

              stopAuto();

              stopMotion();

              applyStage(
                stage
              );

              if (wasAuto) {
                auto = true;

                schedule();
              }
            },
            220
          );
      }
    );

    if (!reduced.matches) {
      applyStage(0);
    }
  }

  if (reduced.matches) {
    consoleEl?.classList.add(
      "running"
    );

    sensorStage?.classList.add(
      "playing",
      "reduced"
    );

    vlaLive?.classList.add(
      "playing",
      "reduced"
    );
  }

  const year = q("#year");

  if (year) {
    year.textContent =
      new Date().getFullYear();
  }
})();