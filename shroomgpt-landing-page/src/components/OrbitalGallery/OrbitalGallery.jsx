/**
 * Scroll-driven 3D portrait ring (GSAP ScrollTrigger).
 * @param {Object} props
 * @param {{ name, dates, portraitUrl, contribution, quote, substance }[]} props.figures
 * @param {boolean} [props.embedded] — hide built-in title block (use when parent supplies heading).
 */
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./OrbitalGallery.css";

gsap.registerPlugin(ScrollTrigger);

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
      glow: ref.current.querySelector(".og-portrait-glow"),
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
      <div className="og-portrait-glow" aria-hidden />
      <div className="og-portrait">
        <img
          src={figure.portraitUrl}
          alt={`Portrait of ${figure.name}`}
          draggable={false}
          loading={index < 3 ? "eager" : "lazy"}
        />
        <div className="og-portrait-edge" aria-hidden />
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

  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: stageRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        pin: sectionRef.current,
        pinSpacing: false,
        anticipatePin: 1,
        onUpdate: (self) => {
          applyFrame(self.progress);
        },
      });

      function applyFrame(t) {
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
          const blur = Math.min(6, (absA / 180) * 6);
          const sat = 1 - Math.min(0.7, (absA / 180) * 0.9);
          const facing = Math.cos((wrapped * Math.PI) / 180);
          const dim = facing < 0 ? Math.max(0.18, 1 + facing * 0.85) : 1;

          gsap.set(node.portrait, {
            scale,
            z: tz,
            filter: `blur(${blur}px) saturate(${sat}) brightness(${dim})`,
            opacity: Math.max(0.25, dim),
          });
          gsap.set(node.glow, {
            opacity: focal,
            scale: 1 + focal * 0.12,
          });
          gsap.set(node.label, {
            opacity: focal > 0.4 ? focal : 0,
            y: (1 - focal) * 14,
          });
        }
      }

      applyFrame(0);
      requestAnimationFrame(() => ST.refresh());
    }, stageRef);

    return () => ctx.revert();
  }, [n, narrow, reduced]);

  useEffect(() => {
    if (!reduced) return;
    let t = 0;
    setActiveIndex(0);
    const id = setInterval(() => {
      t = (t + 1) % n;
      setActiveIndex(t);
    }, 4200);
    return () => clearInterval(id);
  }, [reduced, n]);

  const scrollHeight = narrow ? "400vh" : "600vh";

  return (
    <div
      className={[
        "og-stage",
        embedded ? "og-stage--embedded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      ref={stageRef}
      style={{ height: reduced ? "auto" : scrollHeight }}
      data-reduced={reduced ? "1" : "0"}
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

        {!reduced && (
          <div className="og-scroll-hint" aria-hidden>
            <span className="og-scroll-hint-label">SCROLL TO ORBIT</span>
            <span className="og-scroll-hint-arrow">↓</span>
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
                const stage = stageRef.current;
                if (!stage) return;
                const rect = stage.getBoundingClientRect();
                const top = rect.top + window.scrollY;
                const h = stage.offsetHeight - window.innerHeight;
                const t = i / figures.length;
                window.scrollTo({
                  top: top + h * t,
                  behavior: reduced ? "auto" : "smooth",
                });
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
