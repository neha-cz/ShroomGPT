import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import styles from "./TarotShuffleReveal.module.css";

function CardBackArt({ idSuffix = 0 }) {
  const gs = (n) => `tgs${idSuffix}-${n}`;
  const u = (n) => `url(#${gs(n)})`;
  const stars = useMemo(() => {
    const out = [];
    const leftXs = [16, 12, 18, 14, 16, 12];
    const leftYs = [70, 105, 140, 175, 210, 245];
    leftXs.forEach((x, i) => out.push({ x, y: leftYs[i], r: 1.6, kind: "4pt" }));
    const rightXs = [184, 188, 182, 186, 184, 188];
    const rightYs = [70, 105, 140, 175, 210, 245];
    rightXs.forEach((x, i) => out.push({ x, y: rightYs[i], r: 1.6, kind: "4pt" }));
    out.push({ x: 30, y: 28, r: 2.4, kind: "4pt" });
    out.push({ x: 42, y: 18, r: 1.4, kind: "dot" });
    out.push({ x: 22, y: 50, r: 1.2, kind: "dot" });
    out.push({ x: 170, y: 28, r: 2.4, kind: "4pt" });
    out.push({ x: 158, y: 18, r: 1.4, kind: "dot" });
    out.push({ x: 178, y: 50, r: 1.2, kind: "dot" });
    return out;
  }, []);

  return (
    <svg
      viewBox="0 0 200 300"
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={gs("gold")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8b878" />
          <stop offset="50%" stopColor="#b88a3e" />
          <stop offset="100%" stopColor="#8a6224" />
        </linearGradient>
        <radialGradient id={gs("sun")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#d8b878" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#d8b878" stopOpacity="0" />
        </radialGradient>
        <symbol id={gs("star4")} viewBox="-10 -10 20 20">
          <path
            d="M 0 -10 Q 1.2 -1.2 10 0 Q 1.2 1.2 0 10 Q -1.2 1.2 -10 0 Q -1.2 -1.2 0 -10 Z"
            fill={u("gold")}
          />
        </symbol>
      </defs>
      <rect x="0" y="0" width="200" height="300" fill="#0a0908" />
      <rect
        x="6"
        y="6"
        width="188"
        height="288"
        fill="none"
        stroke={u("gold")}
        strokeWidth="0.6"
        opacity="0.55"
      />
      <rect
        x="10"
        y="10"
        width="180"
        height="280"
        fill="none"
        stroke={u("gold")}
        strokeWidth="0.4"
        opacity="0.35"
      />
      <path
        d="M 24 64 Q 24 24 100 24 Q 176 24 176 64"
        fill="none"
        stroke={u("gold")}
        strokeWidth="0.9"
      />
      <path
        d="M 24 236 Q 24 276 100 276 Q 176 276 176 236"
        fill="none"
        stroke={u("gold")}
        strokeWidth="0.9"
      />
      <g transform="translate(100 86)">
        <circle r="34" fill={u("sun")} />
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const r1 = 16;
          const r2 = i % 2 === 0 ? 30 : 24;
          const x1 = Math.cos(a) * r1;
          const y1 = Math.sin(a) * r1;
          const x2 = Math.cos(a) * r2;
          const y2 = Math.sin(a) * r2;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={u("gold")}
              strokeWidth="0.7"
              strokeLinecap="round"
            />
          );
        })}
        <circle r="13" fill="none" stroke={u("gold")} strokeWidth="0.9" />
        <circle cx="-4" cy="-2" r="0.9" fill="#d8b878" />
        <circle cx="4" cy="-2" r="0.9" fill="#d8b878" />
        <path
          d="M -4 3 Q 0 6 4 3"
          fill="none"
          stroke={u("gold")}
          strokeWidth="0.7"
          strokeLinecap="round"
        />
      </g>
      <g transform="translate(100 214)">
        <circle r="14" fill="none" stroke={u("gold")} strokeWidth="0.8" />
        <circle cx="-4" cy="0" r="14" fill="#0a0908" stroke="none" />
        <path
          d="M -40 22 Q -20 14 0 22 Q 20 14 40 22"
          fill="none"
          stroke={u("gold")}
          strokeWidth="0.7"
        />
        <path
          d="M -28 28 Q 0 20 28 28"
          fill="none"
          stroke={u("gold")}
          strokeWidth="0.5"
          opacity="0.7"
        />
      </g>
      <g transform="translate(100 150)">
        <path
          d="M 0 -22 L 14 0 L 0 22 L -14 0 Z"
          fill="none"
          stroke={u("gold")}
          strokeWidth="0.8"
        />
        <path
          d="M 0 -14 L 9 0 L 0 14 L -9 0 Z"
          fill="none"
          stroke={u("gold")}
          strokeWidth="0.6"
        />
        <circle r="2.6" fill={u("gold")} />
        <use href={`#${gs("star4")}`} x="0" y="-30" width="6" height="6" />
        <use href={`#${gs("star4")}`} x="22" y="0" width="6" height="6" />
        <use href={`#${gs("star4")}`} x="0" y="30" width="6" height="6" />
        <use href={`#${gs("star4")}`} x="-22" y="0" width="6" height="6" />
      </g>
      {stars.map((s, i) =>
        s.kind === "4pt" ? (
          <use
            key={i}
            href={`#${gs("star4")}`}
            x={s.x - s.r * 1.6}
            y={s.y - s.r * 1.6}
            width={s.r * 3.2}
            height={s.r * 3.2}
          />
        ) : (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#d8b878" />
        )
      )}
      {[
        { x: 10, y: 10, sx: 1, sy: 1 },
        { x: 190, y: 10, sx: -1, sy: 1 },
        { x: 10, y: 290, sx: 1, sy: -1 },
        { x: 190, y: 290, sx: -1, sy: -1 },
      ].map((c, i) => (
        <g key={i} transform={`translate(${c.x} ${c.y}) scale(${c.sx} ${c.sy})`}>
          <path
            d="M 0 14 Q 0 0 14 0"
            fill="none"
            stroke={u("gold")}
            strokeWidth="0.7"
          />
          <path
            d="M 4 18 Q 4 4 18 4"
            fill="none"
            stroke={u("gold")}
            strokeWidth="0.5"
            opacity="0.6"
          />
          <circle cx="2" cy="2" r="0.9" fill="#d8b878" />
        </g>
      ))}
    </svg>
  );
}

function TarotStaticRow({ cards }) {
  if (!cards.length) return null;
  const n = cards.length;
  return (
    <section
      className={styles.staticSection}
      aria-label="Notable figures"
    >
      <ul className={styles.staticList}>
        {cards.map((card, i) => {
          const spread = Math.min(42, 6 * n);
          const start = -spread / 2;
          const step = n > 1 ? spread / (n - 1) : 0;
          const rot = start + step * i;
          return (
            <li
              key={i}
              className={styles.staticItem}
              style={{ "--static-rot": `${rot}deg` }}
            >
              <div className={styles.staticCard}>
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  draggable={false}
                  className={styles.staticImg}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * Block native scrolling without `body { position: fixed }` (which forces
 * scrollY to 0 and flashes the top of the page when released).
 * Wheel/touch is still controlled separately while the deal runs.
 */
function lockPageScroll() {
  document.body.dataset.tarotLock = "1";
  const gutter = window.innerWidth - document.documentElement.clientWidth;
  if (gutter > 0) {
    document.documentElement.style.paddingRight = `${gutter}px`;
  }
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  document.documentElement.style.overscrollBehavior = "none";
  document.body.style.overscrollBehavior = "none";
  document.documentElement.style.touchAction = "none";
  document.body.style.touchAction = "none";
}

function unlockPageScroll() {
  delete document.body.dataset.tarotLock;
  document.documentElement.style.paddingRight = "";
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  document.documentElement.style.overscrollBehavior = "";
  document.body.style.overscrollBehavior = "";
  document.documentElement.style.touchAction = "";
  document.body.style.touchAction = "";
}

export default function TarotShuffleReveal({ cards = [], lockOffsetPx = 0 }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const tlRef = useRef(null);
  /** "before" | "active" | "after" — while active, page scroll is frozen. */
  const phaseRef = useRef("before");
  const touchLastYRef = useRef(null);
  const layoutRef = useRef(null);

  cardRefs.current = [];

  const setCardRef = (el) => {
    if (el && !cardRefs.current.includes(el)) cardRefs.current.push(el);
  };

  const reduce = useReducedMotion();

  const deckOffsets = useMemo(() => {
    const seed = [
      { dx: -3, dy: -1, rot: -4 },
      { dx: 2, dy: 1, rot: 3 },
      { dx: -1, dy: -2, rot: -2 },
      { dx: 3, dy: 2, rot: 5 },
      { dx: -2, dy: 0, rot: -3 },
      { dx: 1, dy: -1, rot: 2 },
    ];
    return cards.map((_, i) => seed[i % seed.length]);
  }, [cards]);

  useLayoutEffect(() => {
    if (reduce || !cards.length) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const cardEls = cardRefs.current;
    if (!section || !stage || cardEls.length !== cards.length) return;

    const N = cards.length;

    const computeFan = () => {
      const vw = stage.clientWidth || window.innerWidth;
      const vh = stage.clientHeight || window.innerHeight;
      const cardW = Math.max(160, Math.min(260, vw * 0.14));
      const cardH = cardW * 1.5;
      const radius = Math.max(vh * 0.95, cardW * 4.2);
      const spreadDeg = Math.min(56, 8 * N + 8);
      const startDeg = -spreadDeg / 2;
      const stepDeg = N > 1 ? spreadDeg / (N - 1) : 0;
      const fan = [];
      for (let i = 0; i < N; i++) {
        const angle = startDeg + stepDeg * i;
        const rad = (angle * Math.PI) / 180;
        const x = Math.sin(rad) * radius;
        const y = -Math.cos(rad) * radius + radius;
        fan.push({ x, y: y - cardH * 0.05, rot: angle, w: cardW, h: cardH });
      }
      return { cardW, cardH, fan };
    };

    const applySize = () => {
      const layout = computeFan();
      layoutRef.current = layout;
      stage.style.setProperty("--card-w", `${layout.cardW}px`);
      stage.style.setProperty("--card-h", `${layout.cardH}px`);
    };
    applySize();
    const ro = new ResizeObserver(() => applySize());
    ro.observe(stage);
    window.addEventListener("resize", applySize);

    cardEls.forEach((el, i) => {
      const d = deckOffsets[i];
      gsap.set(el, {
        xPercent: -50,
        yPercent: -50,
        x: d.dx,
        y: d.dy,
        rotate: d.rot,
        rotationY: 180,
        z: i * 0.4,
        transformPerspective: 1200,
        transformOrigin: "50% 50%",
        force3D: true,
      });
    });

    const layout0 = layoutRef.current;
    const dealOrder = [...Array(N).keys()].reverse();
    const dealStart = 0.6;
    const dealStep = 0.55;
    const dealDur = 1.0;

    const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });

    tl.to(
      cardEls,
      {
        y: (i) => deckOffsets[i].dy - 4,
        duration: 0.6,
        ease: "power1.out",
        stagger: 0,
      },
      0
    );

    dealOrder.forEach((cardIdx, dealIdx) => {
      const t0 = dealStart + dealIdx * dealStep;
      const target = layout0.fan[cardIdx];
      tl.to(
        cardEls[cardIdx],
        {
          x: target.x * 0.4,
          y: -layout0.cardH * 0.45,
          rotate: target.rot * 0.3,
          duration: dealDur * 0.45,
          ease: "power2.out",
        },
        t0
      );
      tl.to(
        cardEls[cardIdx],
        {
          rotationY: 0,
          duration: dealDur * 0.55,
          ease: "power2.inOut",
        },
        t0 + dealDur * 0.2
      );
      tl.to(
        cardEls[cardIdx],
        {
          x: target.x,
          y: target.y,
          rotate: target.rot,
          duration: dealDur * 0.55,
          ease: "power3.out",
        },
        t0 + dealDur * 0.45
      );
      tl.to(
        cardEls[cardIdx],
        {
          z: 100 + dealIdx,
          duration: 0.01,
          ease: "none",
        },
        t0 + 0.001
      );
    });

    tlRef.current = tl;

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", applySize);
      tl.kill();
      tlRef.current = null;
    };
  }, [cards, deckOffsets, reduce]);

  useEffect(() => {
    if (reduce || !cards.length) return;
    const lockOffset = Math.max(0, Number(lockOffsetPx) || 0);

    const completeLock = () => {
      if (phaseRef.current !== "active") return;
      phaseRef.current = "after";
      const tl = tlRef.current;
      if (tl) tl.progress(1, false);
      unlockPageScroll();
      // scrollY never changed while locked (no body position:fixed) — do not call scrollTo.
      touchLastYRef.current = null;
    };

    const enterLock = () => {
      if (phaseRef.current !== "before") return;
      const el = sectionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < lockOffset) {
        phaseRef.current = "after";
        if (tlRef.current) tlRef.current.progress(1, false);
        return;
      }
      const lockY0 = window.scrollY + r.top - lockOffset;
      window.scrollTo({ top: lockY0, left: 0, behavior: "auto" });
      lockPageScroll();
      phaseRef.current = "active";
      touchLastYRef.current = null;
      if (tlRef.current) tlRef.current.progress(0, false);
    };

    const onScroll = () => {
      if (phaseRef.current !== "before") return;
      const el = sectionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < lockOffset) {
        phaseRef.current = "after";
        if (tlRef.current) tlRef.current.progress(1, false);
        return;
      }
      if (r.top <= lockOffset && r.bottom > lockOffset) enterLock();
    };

    /** @returns {boolean} true if this event completed the deal (page should be allowed to scroll) */
    const tryProgressFromDelta = (delta) => {
      const tl = tlRef.current;
      if (!tl) return false;
      const inc = delta * 0.00022;
      const p = Math.min(1, Math.max(0, tl.progress() + inc));
      tl.progress(p, false);
      if (p >= 0.999) {
        completeLock();
        return true;
      }
      return false;
    };

    const onWheel = (e) => {
      if (phaseRef.current !== "active") return;
      const justFinished = tryProgressFromDelta(e.deltaY);
      if (!justFinished) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const onTouchStart = (e) => {
      if (phaseRef.current !== "active" || e.touches.length === 0) return;
      touchLastYRef.current = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (phaseRef.current !== "active" || e.touches.length === 0) return;
      const y = e.touches[0].clientY;
      const last = touchLastYRef.current;
      if (last == null) {
        touchLastYRef.current = y;
        e.preventDefault();
        return;
      }
      const dy = last - y;
      touchLastYRef.current = y;
      const justFinished = tryProgressFromDelta(dy * 1.2);
      if (!justFinished) e.preventDefault();
    };

    const onKeyDown = (e) => {
      if (phaseRef.current !== "active") return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        const justFinished = tryProgressFromDelta(40);
        if (!justFinished) e.preventDefault();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        const justFinished = tryProgressFromDelta(-40);
        if (!justFinished) e.preventDefault();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    window.addEventListener("keydown", onKeyDown, { capture: true });
    requestAnimationFrame(() => onScroll());

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      window.removeEventListener("keydown", onKeyDown, { capture: true });
      if (document.body.dataset.tarotLock) unlockPageScroll();
      touchLastYRef.current = null;
    };
  }, [reduce, cards.length, lockOffsetPx]);

  if (reduce) {
    return <TarotStaticRow cards={cards} />;
  }

  if (!cards.length) return null;

  return (
    <section
      ref={sectionRef}
      className={styles.scrollSection}
      aria-label="Tarot card shuffle and reveal"
    >
      <div
        ref={stageRef}
        className={styles.stage}
      >
        {cards.map((card, i) => (
          <div
            key={i}
            ref={setCardRef}
            className={styles.card}
          >
            <div className={styles.cardFace}>
              <img
                src={card.imageUrl}
                alt={card.name}
                draggable={false}
                className={styles.cardImg}
              />
            </div>
            <div className={styles.cardBack}>
              <CardBackArt idSuffix={i} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
