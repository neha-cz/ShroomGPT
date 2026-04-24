/* OrbitalGallery — scroll-driven 3D portrait ring.
   Props: figures: { name, dates, portraitUrl, contribution, quote, substance }[]
   Behavior:
     - Pinned full-viewport section, 600vh scroll distance (400vh on mobile).
     - GSAP ScrollTrigger with scrub: 0.5 (small smoothing -> no jitter).
     - Ring tilted ~25° off horizontal via wrapper rotateX(-25deg); perspective 1800px on parent.
     - Active figure translateZ forward, scale ~1.8x, thin cyan edge-light.
     - Ring figures: blur + desaturation proportional to angular distance from the focal slot.
     - Text panel slides in from right, words staggered in on activation.
     - Respects prefers-reduced-motion (simple fade sequence, unpinned).
*/

const { useEffect, useLayoutEffect, useMemo, useRef, useState } = React;
const motion = window.Motion ? window.Motion.motion : null;

/* ---------- helpers ---------- */

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const h = () => setReduced(mq.matches);
    h();
    mq.addEventListener?.("change", h);
    return () => mq.removeEventListener?.("change", h);
  }, []);
  return reduced;
}

function useBreakpoint() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 800px)");
    const h = () => setNarrow(mq.matches);
    h();
    mq.addEventListener?.("change", h);
    return () => mq.removeEventListener?.("change", h);
  }, []);
  return narrow;
}

/* Shortest signed distance on a unit circle, in units of "slots". */
function wrapDelta(i, active, n) {
  let d = i - active;
  while (d > n / 2) d -= n;
  while (d < -n / 2) d += n;
  return d;
}

/* ---------- Text panel ---------- */

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
  const [phase, setPhase] = useState("in"); // "in" | "out"
  const timerRef = useRef(null);

  // When activeIndex changes, play a brief exit/enter to re-stagger words.
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
          <span className="og-quote-mark" aria-hidden>“</span>
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

/* ---------- Ring ---------- */

function RingFigure({ figure, index, total, radius, stackRef }) {
  // Initial placement: put figure around the Y-axis ring at angle = (index / total) * 360.
  const baseAngle = (index / total) * 360;
  const ref = useRef(null);

  // Register this node with parent so timeline can animate per-figure properties.
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
        // Placed at rest at baseAngle on the ring:
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

/* ---------- Main component ---------- */

function OrbitalGallery({ figures }) {
  const reduced = useReducedMotion();
  const narrow = useBreakpoint();
  const n = figures.length;

  const sectionRef = useRef(null);     // pinned section (full viewport height)
  const stageRef = useRef(null);       // the scroll trigger + pin root (tall)
  const ringRef = useRef(null);        // rotates around Y
  const tiltRef = useRef(null);        // wraps ring, tilts -25deg on X
  const stackRef = useRef([]);         // per-figure node refs
  const [activeIndex, setActiveIndex] = useState(0);

  // responsive ring radius: based on min(viewport) so it never clips.
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

  // GSAP scroll-driven timeline.
  useLayoutEffect(() => {
    if (reduced) return;
    if (!window.gsap || !window.ScrollTrigger) return;
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    const ST = window.ScrollTrigger;
    const scrollHeight = narrow ? "400%" : "600%";

    const ctx = gsap.context(() => {
      // The master progress drives ring rotation.
      // For each figure to reach the front once (full rotation through all),
      // rotate the ring by -360deg across scroll.
      // We also step the activeIndex so text panel updates.
      const proxy = { t: 0 };

      const st = ST.create({
        trigger: stageRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,              // small smoothing -> no jitter
        pin: sectionRef.current,
        pinSpacing: false,
        anticipatePin: 1,
        onUpdate: (self) => {
          proxy.t = self.progress;
          applyFrame(self.progress);
        },
      });

      function applyFrame(t) {
        // Distribute the journey so each figure has a "settle window".
        // Total angular sweep is 360deg; slot = 360/n.
        const slot = 360 / n;
        const ringAngle = -t * 360; // ring rotates counter-clockwise (so figures come forward)

        // The "focal slot" is at ring-relative angle 0 (pointing toward camera).
        // Which figure index is closest to 0? (activeIndex for panel)
        // Figure i sits at baseAngle = (i/n)*360, so its current angle = baseAngle + ringAngle.
        let bestI = 0;
        let bestD = Infinity;
        for (let i = 0; i < n; i++) {
          const a = ((i / n) * 360 + ringAngle) % 360;
          const wrapped = ((a + 540) % 360) - 180; // (-180, 180]
          const d = Math.abs(wrapped);
          if (d < bestD) { bestD = d; bestI = i; }
        }
        setActiveIndex((prev) => (prev === bestI ? prev : bestI));

        // Rotate the ring
        gsap.set(ringRef.current, { rotationY: ringAngle });

        // Per-figure: compute current angle from front, drive scale/z/blur/opacity
        for (let i = 0; i < n; i++) {
          const node = stackRef.current[i];
          if (!node) continue;
          const a = ((i / n) * 360 + ringAngle);
          const wrapped = (((a + 180) % 360) + 360) % 360 - 180; // (-180, 180]
          const absA = Math.abs(wrapped);

          // How "focal" is this figure? 1 at front, 0 by ~slot/2 distance.
          const focalWidth = slot * 0.55; // narrow focus window
          const focal = Math.max(0, 1 - absA / focalWidth); // 0..1

          // Scale: 1 at rest -> up to 1.8 at focal
          const scale = 1 + focal * 0.8;
          // Translate Z forward on focal (pull out of ring)
          const tz = focal * 220;
          // Blur + desat proportional to angular distance
          const blur = Math.min(6, (absA / 180) * 6);
          const sat = 1 - Math.min(0.7, (absA / 180) * 0.9);
          // Back-of-ring: extra dimming
          const facing = Math.cos((wrapped * Math.PI) / 180); // 1 front, -1 back
          const dim = facing < 0 ? Math.max(0.18, 1 + facing * 0.85) : 1; // back goes to ~0.18

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

      // Defensive refresh
      requestAnimationFrame(() => ST.refresh());
    }, stageRef);

    return () => ctx.revert();
  }, [n, narrow, reduced]);

  // Reduced-motion: cycle activeIndex with simple fade every ~4s
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
      className="og-stage"
      ref={stageRef}
      style={{ height: reduced ? "auto" : scrollHeight }}
      data-reduced={reduced ? "1" : "0"}
    >
      <section
        ref={sectionRef}
        className="og-pin"
        aria-label="Constellation of altered minds"
      >
        {/* Eyebrow + heading */}
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

        {/* Scroll hint */}
        {!reduced && (
          <div className="og-scroll-hint" aria-hidden>
            <span className="og-scroll-hint-label">SCROLL TO ORBIT</span>
            <span className="og-scroll-hint-arrow">↓</span>
          </div>
        )}

        {/* Orbital stage + info panel */}
        <div className="og-scene" data-narrow={narrow ? "1" : "0"}>
          <div className="og-orbit-wrap">
            {/* Orbital shadow ellipse (under the ring) */}
            <div className="og-floor" aria-hidden />
            <div className="og-orbit-rings" aria-hidden>
              <div className="og-orbit-ring og-orbit-ring--1" />
              <div className="og-orbit-ring og-orbit-ring--2" />
            </div>

            <div className="og-perspective">
              <div className="og-tilt" ref={tiltRef}>
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

        {/* Progress markers along the bottom */}
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
                // Jump scroll to the slot for that figure.
                const stage = stageRef.current;
                if (!stage) return;
                const rect = stage.getBoundingClientRect();
                const top = rect.top + window.scrollY;
                const h = stage.offsetHeight - window.innerHeight;
                const t = i / figures.length;
                window.scrollTo({ top: top + h * t, behavior: reduced ? "auto" : "smooth" });
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

window.OrbitalGallery = OrbitalGallery;
