(() => {
  "use strict";

  const q = (selector, parent = document) => parent.querySelector(selector);
  const qa = (selector, parent = document) => [
    ...parent.querySelectorAll(selector)
  ];

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );


  /* =========================================================
     GLOBAL UI
  ========================================================== */

  const header = q("#header");
  const progress = q("#progress");
  const menu = q("#menu");
  const links = q("#links");
  const consoleEl = q("#console");


  const updateScrollUI = () => {
    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      0
    );

    if (progress) {
      const ratio =
        maxScroll > 0
          ? window.scrollY / maxScroll
          : 0;

      progress.style.width =
        `${
          Math.min(
            Math.max(ratio, 0),
            1
          ) * 100
        }%`;
    }

    header?.classList.toggle(
      "scrolled",
      window.scrollY > 20
    );
  };


  let scrollFrame = 0;


  window.addEventListener(
    "scroll",
    () => {
      if (scrollFrame) return;

      scrollFrame =
        requestAnimationFrame(() => {
          updateScrollUI();

          scrollFrame = 0;
        });
    },
    {
      passive: true
    }
  );


  updateScrollUI();


  /* =========================================================
     MOBILE MENU
  ========================================================== */

  const closeMenu = () => {
    menu?.setAttribute(
      "aria-expanded",
      "false"
    );

    links?.classList.remove(
      "open"
    );

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
    event => {
      if (
        event.target.closest("a")
      ) {
        closeMenu();
      }
    }
  );


  window.addEventListener(
    "keydown",
    event => {
      if (
        event.key === "Escape"
      ) {
        closeMenu();
      }
    }
  );


  /* =========================================================
     REVEAL ANIMATION
  ========================================================== */

  if (
    "IntersectionObserver" in window &&
    !reducedMotion.matches
  ) {
    const revealObserver =
      new IntersectionObserver(
        (
          entries,
          observer
        ) => {
          entries.forEach(
            entry => {
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
            }
          );
        },
        {
          threshold: 0.12,
          rootMargin:
            "0px 0px -7%"
        }
      );


    qa(".reveal").forEach(
      element =>
        revealObserver.observe(
          element
        )
    );
  } else {
    qa(".reveal").forEach(
      element =>
        element.classList.add(
          "shown"
        )
    );
  }


  /* =========================================================
     ACTIVE NAV
  ========================================================== */

  if (
    "IntersectionObserver" in window
  ) {
    const navObserver =
      new IntersectionObserver(
        entries => {
          const activeEntry =
            entries
              .filter(
                entry =>
                  entry.isIntersecting
              )
              .sort(
                (a, b) =>
                  b.intersectionRatio -
                  a.intersectionRatio
              )[0];


          if (!activeEntry) {
            return;
          }


          const sectionName =
            activeEntry.target.dataset
              .section;


          qa("#links a").forEach(
            anchor => {
              const active =
                anchor.dataset.nav ===
                sectionName;


              anchor.classList.toggle(
                "active",
                active
              );


              if (active) {
                anchor.setAttribute(
                  "aria-current",
                  "page"
                );
              } else {
                anchor.removeAttribute(
                  "aria-current"
                );
              }
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
    ).forEach(
      section =>
        navObserver.observe(
          section
        )
    );
  }


  /* =========================================================
     DEVELOPMENT LOOP
  ========================================================== */

  if (consoleEl) {
    if (
      reducedMotion.matches ||
      !(
        "IntersectionObserver" in
        window
      )
    ) {
      consoleEl.classList.add(
        "running"
      );
    } else {
      new IntersectionObserver(
        (
          entries,
          observer
        ) => {
          if (
            !entries[0]
              ?.isIntersecting
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
      ).observe(
        consoleEl
      );
    }
  }


  /* =========================================================
     UNIFIED COMPARISON
  ========================================================== */

  const comparison = q(
    "#comparison-unified"
  );


  if (comparison) {

    const phase = q(
      "#unified-phase",
      comparison
    );


    const title = q(
      "#unified-title",
      comparison
    );


    const subtitle = q(
      "#unified-subtitle",
      comparison
    );


    const caption = q(
      "#unified-caption",
      comparison
    );


    const reasoning = q(
      ".unified-reasoning",
      comparison
    );


    const stepItems = qa(
      ".unified-steps li",
      comparison
    );


    const unifiedHead = q(
      ".unified-head",
      comparison
    );


    const road = q(
      ".v2-road",
      comparison
    );


    const ego = q(
      ".v2-ego",
      comparison
    );


    const path = q(
      ".v2-trajectory path",
      comparison
    );


    const svg =
      path?.closest("svg") ??
      null;


    comparison.tabIndex = 0;


    comparison.setAttribute(
      "aria-label",
      "기존 자율주행과 NVIDIA Alpamayo의 판단 과정 비교"
    );


    /* =========================================================
       OLD HTML CONTROL HIDE
    ========================================================== */

    const legacyControls = q(
      ".unified-controls",
      comparison
    );


    if (legacyControls) {
      legacyControls.hidden = true;
    }


    [
      q(
        "#unified-next",
        comparison
      ),

      q(
        "#unified-previous",
        comparison
      ),

      q(
        "#unified-replay",
        comparison
      )

    ].forEach(
      element => {
        if (element) {
          element.hidden = true;
        }
      }
    );


    /* =========================================================
       ROAD TRAJECTORY
    ========================================================== */

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


    /* =========================================================
       ROAD TEXT
    ========================================================== */

    const setText = (
      selector,
      text
    ) => {
      const element = q(
        selector,
        comparison
      );


      if (element) {
        element.textContent =
          text;
      }
    };


    setText(
      ".v2-road-label",
      "같은 도로 상황"
    );


    setText(
      ".v2-ego",
      "내 차"
    );


    setText(
      ".v2-blocked",
      "장애물"
    );


    setText(
      ".v2-oncoming",
      "반대 차량"
    );


    setText(
      ".v2-detection-blocked",
      "장애물 감지"
    );


    setText(
      ".v2-detection-oncoming",
      "반대 차량 감지"
    );


    /* =========================================================
       PREDICTION LABEL
    ========================================================== */

    if (
      road &&
      !q(
        ".v2-prediction",
        road
      )
    ) {
      const prediction =
        document.createElement(
          "span"
        );


      prediction.className =
        "v2-prediction";


      prediction.textContent =
        "예상 이동 경로";


      road.append(
        prediction
      );
    }


    /* =========================================================
       CANDIDATE PATH
    ========================================================== */

    if (
      road &&
      !q(
        ".v2-candidates",
        road
      )
    ) {
      const candidates =
        document.createElement(
          "div"
        );


      candidates.className =
        "v2-candidates";


      candidates.setAttribute(
        "aria-hidden",
        "true"
      );


      candidates.innerHTML =
        "<i></i><i></i><i></i>";


      road.append(
        candidates
      );
    }


    const blockedDetection = q(
      ".v2-detection-blocked",
      comparison
    );


    const oncomingDetection = q(
      ".v2-detection-oncoming",
      comparison
    );


    const predictionLabel = q(
      ".v2-prediction",
      comparison
    );


    const candidatePaths = q(
      ".v2-candidates",
      comparison
    );


    /* =========================================================
       STEP LABELS
    ========================================================== */

    const conventionalSteps = [
      "인식",
      "예측",
      "계획",
      "제어"
    ];


    const reasoningSteps = [
      "장면 이해",
      "인과 추론",
      "행동 결정",
      "궤적 출력"
    ];


    /* =========================================================
       STAGE MAKER
    ========================================================== */

    const makeStage = (
      name,
      mode,
      phaseText,
      titleText,
      subtitleText,
      captionText,
      steps = [],
      active = -1,
      reason = [],
      drive = false
    ) => ({
      name,
      mode,
      phaseText,
      titleText,
      subtitleText,
      captionText,
      steps,
      active,
      reason,
      drive
    });


    /* =========================================================
       ANIMATION STAGES
    ========================================================== */

    const stages = [

      makeStage(
        "상황 소개",
        "intro",

        "SAME ROAD SCENARIO",

        "같은 주행 상황",

        "같은 도로 · 같은 차량 · 같은 장애물",

        "두 시스템은 동일하거나 유사한 주행 행동을 선택할 수 있습니다. 차이는 행동에 도달하는 판단 과정입니다."
      ),


      makeStage(
        "기존 자율주행",
        "modular",

        "CONVENTIONAL AUTONOMY",

        "기존 자율주행",

        "Perception → Prediction → Planning → Control",

        "먼저 전형적인 모듈형 자율주행 시스템의 처리 흐름을 확인합니다.",

        conventionalSteps
      ),


      makeStage(
        "인식",
        "modular",

        "PERCEPTION",

        "주변 환경을 인식",

        "Perception",

        "센서 입력과 인식 모델을 이용해 차량, 장애물, 차선과 도로 구조를 파악합니다.",

        conventionalSteps,

        0,

        [
          "장애물 감지",
          "반대 차량 감지",
          "차선 경계 감지"
        ]
      ),


      makeStage(
        "예측",
        "modular",

        "PREDICTION",

        "주변 차량의 움직임을 예측",

        "Prediction",

        "감지한 객체가 앞으로 어떻게 움직일지 예측하고 시간에 따른 위치 변화를 계산합니다.",

        conventionalSteps,

        1,

        [
          "반대 차량 진행 방향",
          "예상 위치 계산",
          "시간 간격 예측"
        ]
      ),


      makeStage(
        "계획",
        "modular",

        "PLANNING",

        "가능한 경로를 비교",

        "Planning",

        "도로 제약, 예측 결과와 충돌 가능성을 고려해 여러 후보 궤적을 평가합니다.",

        conventionalSteps,

        2,

        [
          "후보 궤적 생성",
          "충돌 위험 평가",
          "안전 여유 확인",
          "주행 궤적 선택"
        ]
      ),


      makeStage(
        "기존 시스템 주행",
        "modular",

        "CONTROL",

        "선택한 궤적을 실행",

        "Slow → Pass → Return",

        "선택된 궤적을 따라 감속하며 장애물을 우회한 뒤 원래 차로로 복귀하는 예시입니다.",

        conventionalSteps,

        3,

        [
          "선택된 궤적 실행"
        ],

        true
      ),


      makeStage(
        "장면 초기화",
        "reset",

        "SAME SCENE",

        "같은 상황으로 되돌립니다",

        "도로와 차량 조건은 그대로",

        "이제 같은 장면을 NVIDIA Alpamayo의 추론 표현 방식으로 다시 살펴봅니다."
      ),


      makeStage(
        "Alpamayo 소개",
        "reasoning",

        "NVIDIA ALPAMAYO",

        "같은 상황, 다른 판단 표현",

        "Understand → Reason → Decide → Act",

        "Alpamayo에서는 장면 이해와 Chain-of-Causation 추론, 행동 결정과 궤적 생성을 함께 살펴봅니다.",

        reasoningSteps
      ),


      makeStage(
        "장면 이해",
        "reasoning",

        "SCENE UNDERSTANDING",

        "장면의 관계를 함께 이해",

        "Scene Understanding",

        "개별 객체뿐 아니라 진행 차로, 장애물, 반대 차량과 사용 가능한 공간 사이의 관계를 함께 해석합니다.",

        reasoningSteps,

        0,

        [
          "진행 차로 일부가 막힘",
          "반대 차량이 접근 중",
          "주변 공간과 상대 위치를 함께 해석"
        ]
      ),


      makeStage(
        "인과 추론",
        "reasoning",

        "CAUSAL REASONING",

        "가능한 행동의 결과를 추론",

        "Chain-of-Causation",

        "장애물을 통과하려면 어떤 조건이 필요한지, 반대 차량과의 여유가 충분한지 등을 연결해 판단합니다.",

        reasoningSteps,

        1,

        [
          "장애물이 진행 차로 일부를 차단",
          "반대 차량과의 시간·공간 여유 평가",
          "감속 시 확보되는 여유 검토",
          "통과 가능한 후보 행동 평가"
        ]
      ),


      makeStage(
        "행동 결정",
        "reasoning",

        "ACTION DECISION",

        "행동을 결정",

        "Reduce speed and pass",

        "이 개념 예시에서는 충분한 안전 여유가 확보된다고 판단했을 때 감속 후 우회 통과하는 행동을 선택합니다.",

        reasoningSteps,

        2,

        [
          "ACTION",
          "감속 후 통과",
          "안전 여유가 부족하면 다른 행동을 선택"
        ]
      ),


      makeStage(
        "Alpamayo 주행",
        "reasoning",

        "TRAJECTORY OUTPUT",

        "주행 궤적을 생성",

        "Slow → Pass → Return",

        "최종적으로 생성되는 이동 경로는 기존 시스템이 선택한 경로와 동일하거나 유사할 수 있습니다.",

        reasoningSteps,

        3,

        [
          "주행 궤적 생성",
          "선택된 궤적 실행"
        ],

        true
      ),


      makeStage(
        "결론",
        "final",

        "SAME POSSIBLE ACTION",

        "같은 행동에 도달할 수 있습니다",

        "Different Decision Process",

        "이 예시의 핵심은 어느 시스템이 더 과감하게 움직이는지가 아니라, 행동을 결정하고 그 근거를 표현하는 방식의 차이입니다.",

        [],

        -1,

        [
          "Conventional · Perception → Prediction → Planning → Control",

          "Alpamayo · Scene Understanding → Reasoning → Action → Trajectory"
        ]
      )

    ];


    /* =========================================================
       AUTO PLAY HOLD TIME
    ========================================================== */

    const stageHold = [
      1900,
      1700,
      2100,
      2100,
      2400,

      9800,

      1600,
      1900,
      2300,
      2900,
      2300,

      9800,

      6500
    ];


    /* =========================================================
       NEW CONTROLS
    ========================================================== */

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
        aria-label="비교 애니메이션 단계 이동"
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


    /*
     * 제목 바로 아래에
     * 이전 / 다음 버튼 삽입
     */

    if (unifiedHead) {
      unifiedHead.insertAdjacentElement(
        "afterend",
        controls
      );
    } else {
      comparison.prepend(
        controls
      );
    }


    const prevButton = q(
      ".stage-prev",
      controls
    );


    const nextButton = q(
      ".stage-next",
      controls
    );


    const replayButton = q(
      ".stage-replay",
      controls
    );


    const stageCount = q(
      ".stage-count",
      controls
    );


    const stageName = q(
      ".stage-name",
      controls
    );


    /* =========================================================
       STATE
    ========================================================== */

    let currentStage = 0;

    let autoMode = false;

    let hasPlayed = false;

    let isVisible = false;


    let autoTimer = 0;

    let loopTimer = 0;

    let delayTimer = 0;

    let animationFrame = 0;

    let resizeTimer = 0;


    /* =========================================================
       TIMER CLEANUP
    ========================================================== */

    const clearMotion = () => {
      if (animationFrame) {
        cancelAnimationFrame(
          animationFrame
        );
      }


      if (delayTimer) {
        clearTimeout(
          delayTimer
        );
      }


      animationFrame = 0;

      delayTimer = 0;
    };


    const clearAutoTimers = () => {
      if (autoTimer) {
        clearTimeout(
          autoTimer
        );
      }


      if (loopTimer) {
        clearTimeout(
          loopTimer
        );
      }


      autoTimer = 0;

      loopTimer = 0;
    };


    /* =========================================================
       REASONING TEXT
    ========================================================== */

    const setReasoning =
      lines => {

        if (!reasoning) {
          return;
        }


        reasoning.replaceChildren();


        lines.forEach(
          (
            line,
            index
          ) => {

            const node =
              document.createElement(
                "span"
              );


            node.className =
              "reason-node";


            node.textContent =
              line;


            reasoning.append(
              node
            );


            if (
              index <
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


    /* =========================================================
       STEP UI
    ========================================================== */

    const setSteps = (
      labels,
      activeIndex
    ) => {

      stepItems.forEach(
        (
          item,
          index
        ) => {

          const label =
            labels[index] ?? "";


          item.textContent =
            label;


          item.hidden =
            !label;


          item.classList.toggle(
            "active",
            index === activeIndex
          );


          item.classList.toggle(
            "complete",
            activeIndex >= 0 &&
              index < activeIndex
          );
        }
      );
    };


    /* =========================================================
       CONTROL UI UPDATE
    ========================================================== */

    const updateControls = () => {

      if (stageCount) {
        stageCount.textContent =
          `STEP ${
            currentStage + 1
          } / ${
            stages.length
          }`;
      }


      if (stageName) {
        stageName.textContent =
          stages[
            currentStage
          ].name;
      }


      if (prevButton) {
        prevButton.disabled =
          currentStage === 0;
      }


      if (nextButton) {
        nextButton.disabled =
          currentStage ===
          stages.length - 1;
      }
    };


    /* =========================================================
       SVG PATH LENGTH
    ========================================================== */

    const pathLength = () => {

      if (!path) {
        return 0;
      }


      try {
        return path.getTotalLength();
      } catch {
        return 0;
      }
    };


    /* =========================================================
       SVG COORDINATE → ROAD COORDINATE
    ========================================================== */

    const pathPointOnRoad =
      progressValue => {

        if (
          !path ||
          !road
        ) {
          return null;
        }


        const length =
          pathLength();


        if (!length) {
          return null;
        }


        const normalizedProgress =
          Math.min(
            Math.max(
              progressValue,
              0
            ),
            1
          );


        const point =
          path.getPointAtLength(
            length *
              normalizedProgress
          );


        const matrix =
          path.getScreenCTM();


        if (!matrix) {
          return null;
        }


        let screenPoint;


        if (
          typeof DOMPoint !==
          "undefined"
        ) {

          screenPoint =
            new DOMPoint(
              point.x,
              point.y
            ).matrixTransform(
              matrix
            );

        } else {

          const svgPoint =
            path
              .ownerSVGElement
              .createSVGPoint();


          svgPoint.x =
            point.x;


          svgPoint.y =
            point.y;


          screenPoint =
            svgPoint
              .matrixTransform(
                matrix
              );
        }


        const roadRect =
          road
            .getBoundingClientRect();


        return {
          x:
            screenPoint.x -
            roadRect.left,

          y:
            screenPoint.y -
            roadRect.top
        };
      };


    /* =========================================================
       CAR ANGLE
    ========================================================== */

    const pathAngleOnRoad =
      progressValue => {

        const delta = 0.006;


        const before =
          pathPointOnRoad(
            Math.max(
              0,
              progressValue -
                delta
            )
          );


        const after =
          pathPointOnRoad(
            Math.min(
              1,
              progressValue +
                delta
            )
          );


        if (
          !before ||
          !after
        ) {
          return 0;
        }


        const angleFromXAxis =
          Math.atan2(
            after.y -
              before.y,

            after.x -
              before.x
          ) *
          (
            180 /
            Math.PI
          );


        /*
         * 자동차 기본 방향이 위쪽이므로
         * SVG 진행 방향 기준으로 90도 보정
         */

        const carRotation =
          angleFromXAxis +
          90;


        /*
         * 과도하게 자동차가 기울어지는 것을 방지
         */

        return Math.max(
          -24,
          Math.min(
            24,
            carRotation
          )
        );
      };


    /* =========================================================
       ORIGINAL CAR CENTER
    ========================================================== */

    const naturalCarCenter =
      () => {

        if (
          !ego ||
          !road
        ) {
          return null;
        }


        /*
         * transform 제거 후
         * CSS상의 원래 차량 중심을 측정
         */

        ego.style.transition =
          "none";


        ego.style.transform =
          "none";


        void ego.offsetWidth;


        const egoRect =
          ego
            .getBoundingClientRect();


        const roadRect =
          road
            .getBoundingClientRect();


        return {
          x:
            egoRect.left -
            roadRect.left +
            egoRect.width / 2,

          y:
            egoRect.top -
            roadRect.top +
            egoRect.height / 2
        };
      };


    /* =========================================================
       PLACE CAR EXACTLY ON PATH
    ========================================================== */

    const placeCar = (
      progressValue,
      naturalCenter
    ) => {

      if (
        !ego ||
        !naturalCenter
      ) {
        return;
      }


      const target =
        pathPointOnRoad(
          progressValue
        );


      if (!target) {
        return;
      }


      const dx =
        target.x -
        naturalCenter.x;


      const dy =
        target.y -
        naturalCenter.y;


      const angle =
        pathAngleOnRoad(
          progressValue
        );


      ego.style.transform =
        `translate3d(` +
        `${dx}px, ` +
        `${dy}px, ` +
        `0) ` +
        `rotate(${angle}deg)`;
    };


    /* =========================================================
       HIDE TRAJECTORY
    ========================================================== */

    const hidePath = () => {

      if (!path) {
        return;
      }


      const length =
        pathLength();


      path.style.transition =
        "none";


      path.style.strokeDasharray =
        `${length}`;


      path.style.strokeDashoffset =
        `${length}`;


      path.style.opacity =
        "0";
    };


    /* =========================================================
       RESET CAR + PATH
    ========================================================== */

    const resetCarAndPath =
      () => {

        clearMotion();


        if (
          !ego ||
          !path
        ) {
          return;
        }


        const center =
          naturalCarCenter();


        if (center) {
          placeCar(
            0,
            center
          );
        }


        hidePath();
      };


    /* =========================================================
       REDUCED MOTION
    ========================================================== */

    const showStaticDrive =
      () => {

        if (
          !ego ||
          !path
        ) {
          return;
        }


        const center =
          naturalCarCenter();


        const length =
          pathLength();


        path.style.transition =
          "none";


        path.style.strokeDasharray =
          `${length}`;


        path.style.strokeDashoffset =
          "0";


        path.style.opacity =
          "1";


        if (center) {
          placeCar(
            1,
            center
          );
        }
      };


    /* =========================================================
       DRIVE ANIMATION
    ========================================================== */

    const runDrive = () => {

      if (
        !ego ||
        !path ||
        !road
      ) {
        return;
      }


      clearMotion();


      const center =
        naturalCarCenter();


      const length =
        pathLength();


      if (
        !center ||
        !length
      ) {
        return;
      }


      /*
       * 시작 위치는
       * SVG path의 0% 위치와 정확히 동일
       */

      placeCar(
        0,
        center
      );


      /*
       * 궤적을 먼저 생성한 뒤
       * 자동차가 그 경로를 따라 이동
       *
       * 차량이 경로보다 먼저 튀어나가는 문제 방지
       */

      const DRAW_DURATION =
        1400;


      const WAIT_AFTER_DRAW =
        350;


      /*
       * 차량 이동 시간을 충분히 길게 잡음
       *
       * 기존보다 느리고 자연스럽게 이동
       */

      const MOVE_DURATION =
        7200;


      path.style.transition =
        "none";


      path.style.strokeDasharray =
        `${length}`;


      path.style.strokeDashoffset =
        `${length}`;


      path.style.opacity =
        "1";


      /* =====================================================
         1. PATH DRAW
      ====================================================== */

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
                DRAW_DURATION,

              1
            );


          /*
           * trajectory draw easing
           */

          const eased =
            1 -
            Math.pow(
              1 - raw,
              3
            );


          path.style.strokeDashoffset =
            `${
              length *
              (
                1 -
                eased
              )
            }`;


          if (
            raw < 1
          ) {

            animationFrame =
              requestAnimationFrame(
                drawFrame
              );


            return;
          }


          path.style.strokeDashoffset =
            "0";


          /* =================================================
             2. WAIT
          ================================================= */

          delayTimer =
            window.setTimeout(
              () => {

                /* ============================================
                   3. CAR MOVE
                ============================================ */

                const moveStart =
                  performance.now();


                const moveFrame =
                  now2 => {

                    const rawMove =
                      Math.min(
                        (
                          now2 -
                          moveStart
                        ) /
                          MOVE_DURATION,

                        1
                      );


                    /*
                     * ease-in-out
                     *
                     * 출발할 때 천천히
                     * 중앙에서는 조금 빠르게
                     * 마지막에는 다시 감속
                     */

                    const easedMove =
                      0.5 -
                      0.5 *
                      Math.cos(
                        Math.PI *
                        rawMove
                      );


                    /*
                     * 차량 위치를
                     * SVG path 위의 동일 비율 좌표에 위치
                     */

                    placeCar(
                      easedMove,
                      center
                    );


                    if (
                      rawMove < 1
                    ) {

                      animationFrame =
                        requestAnimationFrame(
                          moveFrame
                        );
                    }
                  };


                animationFrame =
                  requestAnimationFrame(
                    moveFrame
                  );

              },

              WAIT_AFTER_DRAW
            );
        };


      animationFrame =
        requestAnimationFrame(
          drawFrame
        );
    };


    /* =========================================================
       APPLY STAGE
    ========================================================== */

    const applyStage =
      index => {

        currentStage =
          Math.max(
            0,

            Math.min(
              index,
              stages.length -
                1
            )
          );


        const stage =
          stages[
            currentStage
          ];


        clearMotion();


        comparison.dataset.stage =
          String(
            currentStage
          );


        comparison.dataset.mode =
          stage.mode;


        /* =====================================================
           SCENE VISIBILITY
        ====================================================== */

        const detectionVisible =
          [
            2,
            3,
            4,
            5,

            8,
            9,
            10,
            11
          ].includes(
            currentStage
          );


        const predictionVisible =
          [
            3,
            4,
            5
          ].includes(
            currentStage
          );


        const candidatesVisible =
          [
            4,
            5
          ].includes(
            currentStage
          );


        if (
          blockedDetection
        ) {
          blockedDetection
            .style.opacity =
              detectionVisible
                ? "1"
                : "0";
        }


        if (
          oncomingDetection
        ) {
          oncomingDetection
            .style.opacity =
              detectionVisible
                ? "1"
                : "0";
        }


        if (
          predictionLabel
        ) {
          predictionLabel
            .style.opacity =
              predictionVisible
                ? "1"
                : "0";
        }


        if (
          candidatePaths
        ) {
          candidatePaths
            .style.opacity =
              candidatesVisible
                ? "1"
                : "0";
        }


        /* =====================================================
           TEXT UPDATE
        ====================================================== */

        if (phase) {
          phase.textContent =
            stage.phaseText;
        }


        if (title) {
          title.textContent =
            stage.titleText;
        }


        if (subtitle) {
          subtitle.textContent =
            stage.subtitleText;
        }


        if (caption) {
          caption.textContent =
            stage.captionText;
        }


        setSteps(
          stage.steps,
          stage.active
        );


        setReasoning(
          stage.reason
        );


        updateControls();


        /* =====================================================
           VEHICLE
        ====================================================== */

        if (
          stage.drive
        ) {

          if (
            reducedMotion.matches
          ) {

            showStaticDrive();

          } else {

            runDrive();

          }

        } else {

          resetCarAndPath();

        }
      };


    /* =========================================================
       AUTO PLAY
    ========================================================== */

    const scheduleAuto =
      () => {

        clearTimeout(
          autoTimer
        );


        if (
          !autoMode ||
          !isVisible
        ) {
          return;
        }


        autoTimer =
          window.setTimeout(
            () => {

              if (
                !autoMode ||
                !isVisible
              ) {
                return;
              }


              if (
                currentStage <
                stages.length -
                  1
              ) {

                applyStage(
                  currentStage +
                    1
                );


                scheduleAuto();


                return;
              }


              /*
               * 마지막 단계가 끝나면
               * 잠깐 대기 후 처음으로 돌아감
               */

              loopTimer =
                window.setTimeout(
                  () => {

                    if (
                      !autoMode ||
                      !isVisible
                    ) {
                      return;
                    }


                    applyStage(
                      0
                    );


                    scheduleAuto();

                  },

                  1400
                );

            },

            stageHold[
              currentStage
            ] ?? 2200
          );
      };


    const startAuto =
      () => {

        clearAutoTimers();

        clearMotion();


        autoMode = true;


        applyStage(
          0
        );


        scheduleAuto();
      };


    /* =========================================================
       MANUAL MODE
    ========================================================== */

    const enterManualMode =
      () => {

        autoMode = false;


        clearAutoTimers();


        clearMotion();
      };


    /* =========================================================
       PREVIOUS
    ========================================================== */

    prevButton
      ?.addEventListener(
        "click",
        () => {

          enterManualMode();


          applyStage(
            currentStage -
              1
          );
        }
      );


    /* =========================================================
       NEXT
    ========================================================== */

    nextButton
      ?.addEventListener(
        "click",
        () => {

          enterManualMode();


          applyStage(
            currentStage +
              1
          );
        }
      );


    /* =========================================================
       REPLAY
    ========================================================== */

    replayButton
      ?.addEventListener(
        "click",
        () => {

          hasPlayed = true;


          startAuto();
        }
      );


    /* =========================================================
       KEYBOARD CONTROL
    ========================================================== */

    comparison.addEventListener(
      "keydown",
      event => {

        if (
          event.key ===
          "ArrowLeft"
        ) {

          event.preventDefault();


          enterManualMode();


          applyStage(
            currentStage -
              1
          );
        }


        if (
          event.key ===
          "ArrowRight"
        ) {

          event.preventDefault();


          enterManualMode();


          applyStage(
            currentStage +
              1
          );
        }
      }
    );


    /* =========================================================
       START ON VIEW
    ========================================================== */

    if (
      "IntersectionObserver" in
      window
    ) {

      new IntersectionObserver(
        entries => {

          const nowVisible =
            Boolean(
              entries[0]
                ?.isIntersecting
            );


          isVisible =
            nowVisible;


          /*
           * 자동재생 중 화면 밖으로 나갔다가
           * 다시 들어온 경우 현재 단계부터 재개
           */

          if (
            nowVisible &&
            hasPlayed &&
            autoMode
          ) {

            applyStage(
              currentStage
            );


            scheduleAuto();


            return;
          }


          /*
           * 화면 밖에서는 애니메이션 중지
           */

          if (
            !nowVisible
          ) {

            clearAutoTimers();


            clearMotion();
          }
        },
        {
          threshold: 0.28
        }
      ).observe(
        comparison
      );

    } else {

      isVisible = true;
      applyStage(currentStage);
    }


    /* =========================================================
       RESPONSIVE RESIZE
    ========================================================== */

    window.addEventListener(
      "resize",
      () => {

        clearTimeout(
          resizeTimer
        );


        resizeTimer =
          window.setTimeout(
            () => {

              const resumeAuto =
                autoMode;


              clearAutoTimers();


              clearMotion();


              /*
               * 화면 크기가 바뀌면
               * SVG 좌표와 차량 위치를 다시 계산
               */

              applyStage(
                currentStage
              );


              if (
                resumeAuto &&
                isVisible
              ) {

                autoMode = true;


                scheduleAuto();
              }

            },

            180
          );
      },
      {
        passive: true
      }
    );


    /*
     * 최초 화면
     */

    if (
      !reducedMotion.matches
    ) {
      applyStage(
        0
      );
    }

  }


  /* =========================================================
     YEAR
  ========================================================== */

  const year = q(
    "#year"
  );


  if (year) {
    year.textContent =
      String(
        new Date()
          .getFullYear()
      );
  }

})();
