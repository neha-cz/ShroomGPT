/**
 * 3D portrait ring: scroll wheel rotates the ring through one full orbit while the page
 * position stays fixed; after one full rotation, the page unfreezes and normal scroll continues.
 * @param {{ name, dates, portraitUrl, contribution, quote, substance }[]} props.figures
 * @param {boolean} [props.embedded]
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./OrbitalGallery.css";

gsap.registerPlugin(ScrollTrigger);

/** ~wheel deltaY units (sum) for one full 0→1 orbit */
const WHEEL_UNITS_PER_ORBIT = 2400;

function useBreakpoint() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 800px)");
    const h = () => setNarrow(mq.matches);
    h();
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return narrow;
}

function SplitWords({ text, active, baseDelay = 0, className, wordClass }) {
  const words = useMemo(() => text.split(/(\s+)/), [text]);
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) =>
        /\s+/.test(w) ? (
          <span key={i}>{w}</span>
        ) : (
          <span
            key={i}
            className={wordClass}
            style={{
              "--d": `${baseDelay + i * 0.022}s`,
              display: "inline-block",
              transform: active ? "translateY(0)" : "translateY(22px)",
              opacity: active ? 1 : 0,
              filter: active ? "blur(0)" : "blur(10px)",
              transition:
                "transform 650ms cubic-bezier(0.16,1,0.3,1) var(--d), opacity 500ms ease var(--d), filter 550ms ease var(--d)",
            }}
          >
            {w}
          </span>
        ),
      )}
    </span>
  );
}

function InfoPanel({ figure, activeIndex, reduced, narrow }) {
  const [showKey, setShowKey] = useState(activeIndex);
  const [phase, setPhase] = useState("in");
  const timerRef = useRef(null);

  useEffect(() => {
    if (reduced) {
      setShowKey(activeIndex);
      setPhase("in");
      return;
    }
    setPhase("out");
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowKey(activeIndex);
      setPhase("in");
    }, 160);
    return () => clearTimeout(timerRef.current);
  }, [activeIndex, reduced]);

  const active = phase === "in";
  const f = figure;

  return (
    <aside
      className="og-info"
      aria-live="polite"
      data-narrow={narrow ? "1" : "0"}
    >
      <div
        className="og-info-inner"
        style={{
          transform: active ? "translateX(0)" : "translateX(28px)",
          opacity: active ? 1 : 0,
          transition: reduced
            ? "opacity 220ms ease"
            : "opacity 380ms ease, transform 520ms cubic-bezier(0.16,1,0.3,1)",
        }}
        key={showKey}
      >
        <div className="og-info-eyebrow">
          <span className="og-info-idx">
            {String((showKey % 99) + 1).padStart(2, "0")}
          </span>
          <span className="og-info-sub-line" aria-hidden />
          <span className="og-info-sub">{f.substance}</span>
        </div>

        <h3 className="og-info-name">
          <SplitWords
            text={f.name}
            active={active}
            baseDelay={0.04}
            wordClass="og-word"
          />
        </h3>

        <div className="og-info-dates">{f.dates}</div>

        <p className="og-info-contribution">
          <SplitWords
            text={f.contribution}
            active={active}
            baseDelay={0.18}
            wordClass="og-word"
          />
        </p>

        <blockquote className="og-info-quote">
          <span className="og-quote-mark" aria-hidden>
            “
          </span>
          <span className="og-quote-text">
            <SplitWords
              text={f.quote}
              active={active}
              baseDelay={0.32}
              wordClass="og-word"
            />
          </span>
        </blockquote>
      </div>
    </aside>
  );
}

function RingFigure({ figure, index, total, radius, stackRef }) {
  const baseAngle = (index / total) * 360;
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    stackRef.current[index] = {
      el: ref.current,
      portrait: ref.current.querySelector(".og-portrait"),
      label: ref.current.querySelector(".og-portrait-label"),
      baseAngle,
    };
  }, [index, baseAngle, stackRef]);

  return (
    <div
      ref={ref}
      className="og-ring-slot"
      style={{
        transform: `rotateY(${baseAngle}deg) translateZ(${radius}px) rotateY(${-baseAngle}deg)`,
      }}
      data-index={index}
    >
      <div className="og-portrait">
        <img
          src={figure.portraitUrl}
          alt={`Portrait of ${figure.name}`}
          draggable={false}
          loading={index < 3 ? "eager" : "lazy"}
        />
      </div>
      <div className="og-portrait-label">
        <span className="og-portrait-label-name">{figure.name}</span>
        <span className="og-portrait-label-sub">{figure.substance}</span>
      </div>
    </div>
  );
}

export function OrbitalGallery({ figures, embedded = true }) {
  const reduced = useReducedMotion();
  const narrow = useBreakpoint();
  const n = figures.length;

  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const ringRef = useRef(null);
  const stackRef = useRef([]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [orbitComplete, setOrbitComplete] = useState(false);
  /** True while the stage is in view and we are consuming wheel to rotate (before one full cycle ends). */
  const [scrollLocked, setScrollLocked] = useState(false);

  const progressRef = useRef(0);
  const lockScrollYRef = useRef(0);
  const wheelAccumRef = useRef(0);
  const capturingRef = useRef(false);
  const orbitCompleteRef = useRef(false);
  const applyFrameRef = useRef(null);

  useEffect(() => {
    orbitCompleteRef.current = orbitComplete;
  }, [orbitComplete]);

  useEffect(() => {
    if (reduced) return;
    if (scrollLocked && !orbitComplete) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
  }, [scrollLocked, orbitComplete, reduced]);

  const [radius, setRadius] = useState(420);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const base = Math.min(w * 0.42, h * 0.48);
      setRadius(Math.max(240, Math.min(base, 520)));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const applyFrame = useCallback(
    (t) => {
      t = Math.max(0, Math.min(1, t));
      progressRef.current = t;
      if (!ringRef.current) return;

      const slot = 360 / n;
      const ringAngle = -t * 360;

      let bestI = 0;
      let bestD = Infinity;
      for (let i = 0; i < n; i++) {
        const a = ((i / n) * 360 + ringAngle) % 360;
        const wrapped = ((a + 540) % 360) - 180;
        const d = Math.abs(wrapped);
        if (d < bestD) {
          bestD = d;
          bestI = i;
        }
      }
      setActiveIndex((prev) => (prev === bestI ? prev : bestI));

      gsap.set(ringRef.current, { rotationY: ringAngle });

      for (let i = 0; i < n; i++) {
        const node = stackRef.current[i];
        if (!node) continue;
        const a = (i / n) * 360 + ringAngle;
        const wrapped = (((a + 180) % 360) + 360) % 360 - 180;
        const absA = Math.abs(wrapped);

        const focalWidth = slot * 0.55;
        const focal = Math.max(0, 1 - absA / focalWidth);

        const scale = 1 + focal * 0.8;
        const tz = focal * 220;

        gsap.set(node.portrait, {
          scale,
          z: tz,
        });
        gsap.set(node.label, {
          opacity: focal > 0.4 ? focal : 0,
          y: (1 - focal) * 14,
        });
      }
    },
    [n],
  );

  useEffect(() => {
    applyFrameRef.current = applyFrame;
  }, [applyFrame]);

  const beginCapture = useCallback(() => {
    if (orbitCompleteRef.current) return;
    lockScrollYRef.current = window.scrollY;
    capturingRef.current = true;
    setScrollLocked(true);
    wheelAccumRef.current = progressRef.current * WHEEL_UNITS_PER_ORBIT;
  }, []);

  const endCapture = useCallback(() => {
    capturingRef.current = false;
    setScrollLocked(false);
  }, []);

  /* ScrollTrigger: when the stage straddles the viewport (100vh) — wheel drives orbit, not page scroll. */
  useLayoutEffect(() => {
    if (reduced) return;
    if (!stageRef.current) return;

    const st = ScrollTrigger.create({
      trigger: stageRef.current,
      start: "top top",
      end: "bottom top",
      onEnter: () => {
        if (orbitCompleteRef.current) return;
        beginCapture();
      },
      onEnterBack: () => {
        if (orbitCompleteRef.current) return;
        beginCapture();
      },
      onLeave: endCapture,
      onLeaveBack: endCapture,
    });

    requestAnimationFrame(() => {
      const el = stageRef.current;
      if (el && !orbitCompleteRef.current) {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        if (r.top < vh && r.bottom > 0 && r.top >= -1 && r.top < 4) {
          beginCapture();
        }
      }
      ScrollTrigger.refresh();
    });

    return () => st.kill();
  }, [reduced, beginCapture, endCapture, figures.length]);

  /* Wheel: advance orbit without moving the document until one full 0→1, then release. */
  useEffect(() => {
    if (reduced) return;

    const enforceLock = () => {
      if (orbitCompleteRef.current) return;
      if (!capturingRef.current) return;
      const y = lockScrollYRef.current;
      if (Math.abs(window.scrollY - y) > 0.5) {
        window.scrollTo({ top: y, left: 0, behavior: "auto" });
      }
    };

    const onWheel = (e) => {
      if (orbitCompleteRef.current) return;
      if (!capturingRef.current) return;
      e.preventDefault();

      wheelAccumRef.current += e.deltaY;
      let t = wheelAccumRef.current / WHEEL_UNITS_PER_ORBIT;
      t = Math.max(0, Math.min(1, t));

      applyFrameRef.current?.(t);

      if (t >= 1) {
        endCapture();
        wheelAccumRef.current = WHEEL_UNITS_PER_ORBIT;
        progressRef.current = 1;
        setOrbitComplete(true);
        orbitCompleteRef.current = true;
        return;
      }

      enforceLock();
    };

    const onScroll = () => {
      enforceLock();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced, endCapture]);

  useLayoutEffect(() => {
    if (reduced) return;
    applyFrame(0);
  }, [applyFrame, reduced, n, radius]);

  useEffect(() => {
    if (!reduced) return;
    let t = 0;
    setActiveIndex(0);
    setOrbitComplete(true);
    const id = setInterval(() => {
      t = (t + 1) % n;
      setActiveIndex(t);
    }, 4200);
    return () => clearInterval(id);
  }, [reduced, n]);

  const setProgressFromIndex = (i) => {
    const t = Math.max(0, Math.min(1, i / n));
    progressRef.current = t;
    wheelAccumRef.current = t * WHEEL_UNITS_PER_ORBIT;
    applyFrame(t);
    if (t >= 0.999) {
      endCapture();
      setOrbitComplete(true);
      orbitCompleteRef.current = true;
    }
  };

  return (
    <div
      className={["og-stage", embedded ? "og-stage--embedded" : ""]
        .filter(Boolean)
        .join(" ")}
      ref={stageRef}
      style={{ minHeight: reduced ? "auto" : "100vh" }}
      data-reduced={reduced ? "1" : "0"}
      data-orbit-complete={orbitComplete ? "1" : "0"}
    >
      <section
        ref={sectionRef}
        className="og-pin"
        aria-label="Constellation of altered minds"
      >
        {!embedded && (
          <header className="og-header">
            <div className="og-eyebrow">
              <span className="og-eyebrow-num">02</span>
              <span className="og-eyebrow-line" aria-hidden />
              <span className="og-eyebrow-label">The Precedent</span>
            </div>
            <h2 className="og-title">
              A constellation of <em>altered</em> minds.
            </h2>
            <p className="og-subtitle">
              Scroll to orbit. Each figure credited a shift in consciousness with
              a shift in what they could see.
            </p>
          </header>
        )}

        {!reduced && !orbitComplete && (
          <div className="og-scroll-hint" aria-hidden>
            <span className="og-scroll-hint-label">SCROLL TO ORBIT (PAGE HOLDS)</span>
            <span className="og-scroll-hint-arrow">↕</span>
          </div>
        )}

        <div className="og-scene" data-narrow={narrow ? "1" : "0"}>
          <div className="og-orbit-wrap">
            <div className="og-floor" aria-hidden />
            <div className="og-orbit-rings" aria-hidden>
              <div className="og-orbit-ring og-orbit-ring--1" />
              <div className="og-orbit-ring og-orbit-ring--2" />
            </div>

            <div className="og-perspective">
              <div className="og-tilt">
                <div className="og-ring" ref={ringRef}>
                  {figures.map((f, i) => (
                    <RingFigure
                      key={f.name}
                      figure={f}
                      index={i}
                      total={n}
                      radius={radius}
                      stackRef={stackRef}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <InfoPanel
            figure={figures[activeIndex]}
            activeIndex={activeIndex}
            reduced={reduced}
            narrow={narrow}
          />
        </div>

        <div className="og-progress" role="group" aria-label="Orbit progress">
          {figures.map((f, i) => (
            <button
              key={f.name}
              className="og-progress-dot"
              data-active={i === activeIndex ? "1" : "0"}
              aria-current={i === activeIndex ? "true" : undefined}
              aria-label={`Focus ${f.name}`}
              type="button"
              onClick={() => {
                if (reduced) return;
                setProgressFromIndex(i);
              }}
            >
              <span className="og-progress-dot-dot" />
              <span className="og-progress-dot-label">
                {f.name.split(" ").slice(-1)[0]}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
