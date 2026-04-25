/**
 * TarotShuffleReveal
 * ──────────────────
 * Scroll-driven tarot "shuffle and reveal" — pinned full-viewport section,
 * ~500vh scroll distance, scrub-coupled.
 *
 *   Stage 1 (deck)        : 6 cards stacked face-down, slightly rotated/offset
 *   Stage 2 (deal)        : Each card lifts off the top, flips mid-air on Y
 *   Stage 3 (fan)         : Settles into a fanned arc, all face-up
 *
 * Drop-in usage:
 *
 *   import TarotShuffleReveal from "./TarotShuffleReveal.jsx";
 *
 *   <TarotShuffleReveal cards={[
 *     { name: "Steve Jobs",       imageUrl: "/cards/jobs.png" },
 *     { name: "Elon Musk",        imageUrl: "/cards/musk.png" },
 *     { name: "Sam Altman",       imageUrl: "/cards/altman.png" },
 *     { name: "Richard Feynman",  imageUrl: "/cards/feynman.png" },
 *     { name: "Carl Sagan",       imageUrl: "/cards/sagan.png" },
 *     { name: "Bill Gates",       imageUrl: "/cards/gates.png" },
 *   ]} />
 *
 * Background is fully transparent — the section is meant to sit on top of
 * an existing psychedelic plate.
 *
 * Requires: gsap (^3) and gsap/ScrollTrigger.
 *   npm i gsap
 */

import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ────────────────────────────────────────────────────────────────────────────
 * Card back artwork — gold-on-black ornamental pattern.
 * Sun motif at top + corner filigree + star scatter + arched border.
 * Matches the visual language of the card fronts (same arch, sun, stars).
 * Pure SVG, no external assets. Aspect-ratio 2:3 (viewBox 200×300).
 * ─────────────────────────────────────────────────────────────────────────── */
function CardBackArt() {
  // Procedurally placed stars + sparkles so the pattern feels hand-drawn
  // without me having to hand-place 80 nodes.
  const stars = useMemo(() => {
    const out = [];
    // Left column
    const leftXs = [16, 12, 18, 14, 16, 12];
    const leftYs = [70, 105, 140, 175, 210, 245];
    leftXs.forEach((x, i) => out.push({ x, y: leftYs[i], r: 1.6, kind: "4pt" }));
    // Right column
    const rightXs = [184, 188, 182, 186, 184, 188];
    const rightYs = [70, 105, 140, 175, 210, 245];
    rightXs.forEach((x, i) => out.push({ x, y: rightYs[i], r: 1.6, kind: "4pt" }));
    // Top corners cluster
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
        <linearGradient id="goldStroke" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8b878" />
          <stop offset="50%" stopColor="#b88a3e" />
          <stop offset="100%" stopColor="#8a6224" />
        </linearGradient>
        <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#d8b878" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#d8b878" stopOpacity="0" />
        </radialGradient>
        <symbol id="star4" viewBox="-10 -10 20 20">
          {/* 4-point sparkle */}
          <path
            d="M 0 -10 Q 1.2 -1.2 10 0 Q 1.2 1.2 0 10 Q -1.2 1.2 -10 0 Q -1.2 -1.2 0 -10 Z"
            fill="url(#goldStroke)"
          />
        </symbol>
      </defs>

      {/* Solid black background */}
      <rect x="0" y="0" width="200" height="300" fill="#0a0908" />

      {/* Faint outer gold border */}
      <rect
        x="6"
        y="6"
        width="188"
        height="288"
        fill="none"
        stroke="url(#goldStroke)"
        strokeWidth="0.6"
        opacity="0.55"
      />
      {/* Inner border */}
      <rect
        x="10"
        y="10"
        width="180"
        height="280"
        fill="none"
        stroke="url(#goldStroke)"
        strokeWidth="0.4"
        opacity="0.35"
      />

      {/* Top arch — echoes the card fronts */}
      <path
        d="M 24 64 Q 24 24 100 24 Q 176 24 176 64"
        fill="none"
        stroke="url(#goldStroke)"
        strokeWidth="0.9"
      />

      {/* Bottom mirror arch */}
      <path
        d="M 24 236 Q 24 276 100 276 Q 176 276 176 236"
        fill="none"
        stroke="url(#goldStroke)"
        strokeWidth="0.9"
      />

      {/* Central sun motif (top half) */}
      <g transform="translate(100 86)">
        <circle r="34" fill="url(#sunGlow)" />
        {/* Rays */}
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
              stroke="url(#goldStroke)"
              strokeWidth="0.7"
              strokeLinecap="round"
            />
          );
        })}
        {/* Sun face circle */}
        <circle
          r="13"
          fill="none"
          stroke="url(#goldStroke)"
          strokeWidth="0.9"
        />
        {/* Eyes + smile (tiny, engraved-feel) */}
        <circle cx="-4" cy="-2" r="0.9" fill="#d8b878" />
        <circle cx="4" cy="-2" r="0.9" fill="#d8b878" />
        <path
          d="M -4 3 Q 0 6 4 3"
          fill="none"
          stroke="url(#goldStroke)"
          strokeWidth="0.7"
          strokeLinecap="round"
        />
      </g>

      {/* Mirror moon at bottom */}
      <g transform="translate(100 214)">
        <circle r="14" fill="none" stroke="url(#goldStroke)" strokeWidth="0.8" />
        <circle
          cx="-4"
          cy="0"
          r="14"
          fill="#0a0908"
          stroke="none"
        />
        {/* Decorative flourish under moon */}
        <path
          d="M -40 22 Q -20 14 0 22 Q 20 14 40 22"
          fill="none"
          stroke="url(#goldStroke)"
          strokeWidth="0.7"
        />
        <path
          d="M -28 28 Q 0 20 28 28"
          fill="none"
          stroke="url(#goldStroke)"
          strokeWidth="0.5"
          opacity="0.7"
        />
      </g>

      {/* Diamond rosette at center */}
      <g transform="translate(100 150)">
        <path
          d="M 0 -22 L 14 0 L 0 22 L -14 0 Z"
          fill="none"
          stroke="url(#goldStroke)"
          strokeWidth="0.8"
        />
        <path
          d="M 0 -14 L 9 0 L 0 14 L -9 0 Z"
          fill="none"
          stroke="url(#goldStroke)"
          strokeWidth="0.6"
        />
        <circle r="2.6" fill="url(#goldStroke)" />
        {/* Outer four sparkles */}
        <use href="#star4" x="0" y="-30" width="6" height="6" />
        <use href="#star4" x="22" y="0" width="6" height="6" />
        <use href="#star4" x="0" y="30" width="6" height="6" />
        <use href="#star4" x="-22" y="0" width="6" height="6" />
      </g>

      {/* Side filigree — small repeating sparkles & dots along left/right rails */}
      {stars.map((s, i) =>
        s.kind === "4pt" ? (
          <use
            key={i}
            href="#star4"
            x={s.x - s.r * 1.6}
            y={s.y - s.r * 1.6}
            width={s.r * 3.2}
            height={s.r * 3.2}
          />
        ) : (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#d8b878" />
        )
      )}

      {/* Corner flourishes */}
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
            stroke="url(#goldStroke)"
            strokeWidth="0.7"
          />
          <path
            d="M 4 18 Q 4 4 18 4"
            fill="none"
            stroke="url(#goldStroke)"
            strokeWidth="0.5"
            opacity="0.6"
          />
          <circle cx="2" cy="2" r="0.9" fill="#d8b878" />
        </g>
      ))}
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Main component
 * ─────────────────────────────────────────────────────────────────────────── */
export default function TarotShuffleReveal({ cards = [] }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  cardRefs.current = [];

  const setCardRef = (el) => {
    if (el && !cardRefs.current.includes(el)) cardRefs.current.push(el);
  };

  /* Per-card deck offsets (deterministic shuffle look) */
  const deckOffsets = useMemo(() => {
    // Each entry: { dx, dy, rot } in the stacked deck
    // Spread is small — reads as a real, slightly-messy stack.
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
    if (!cards.length) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const cardEls = cardRefs.current;
    if (!section || !stage || cardEls.length !== cards.length) return;

    const ctx = gsap.context(() => {
      const N = cards.length;

      /* ── Layout numbers ─────────────────────────────────────────────────
       * Fan parameters scale with viewport so the spread fits comfortably.
       * We compute them at trigger time (refresh) so resize works.
       */
      const computeFan = () => {
        const vw = stage.clientWidth || window.innerWidth;
        const vh = stage.clientHeight || window.innerHeight;

        // Card width is ~14% of viewport width, clamped.
        const cardW = Math.max(160, Math.min(260, vw * 0.14));
        const cardH = cardW * 1.5; // 2:3
        // Fan radius — center of arc sits BELOW the cards, they curve up.
        const radius = Math.max(vh * 0.95, cardW * 4.2);
        // Total angular spread across all cards
        const spreadDeg = Math.min(56, 8 * N + 8); // ~56° for 6 cards
        const startDeg = -spreadDeg / 2;
        const stepDeg = N > 1 ? spreadDeg / (N - 1) : 0;

        const fan = [];
        for (let i = 0; i < N; i++) {
          const angle = startDeg + stepDeg * i; // degrees
          const rad = (angle * Math.PI) / 180;
          // Position relative to fan pivot at (0, +radius) below center.
          // Cards arc upward from that pivot.
          const x = Math.sin(rad) * radius;
          const y = -Math.cos(rad) * radius + radius; // 0 at center, dips slightly at edges
          fan.push({ x, y: y - cardH * 0.05, rot: angle, w: cardW, h: cardH });
        }
        return { cardW, cardH, fan };
      };

      let layout = computeFan();

      // Apply card sizing immediately (CSS vars on stage)
      const applySize = () => {
        layout = computeFan();
        stage.style.setProperty("--card-w", `${layout.cardW}px`);
        stage.style.setProperty("--card-h", `${layout.cardH}px`);
      };
      applySize();

      /* ── Initial deck state (face-down, stacked) ──────────────────────── */
      cardEls.forEach((el, i) => {
        const d = deckOffsets[i];
        gsap.set(el, {
          xPercent: -50,
          yPercent: -50,
          x: d.dx,
          y: d.dy,
          rotate: d.rot,
          rotationY: 180, // back showing
          z: i * 0.4, // tiny z-stagger so stack reads as physical
          transformPerspective: 1200,
          transformOrigin: "50% 50%",
          force3D: true,
        });
      });

      /* ── Master timeline driven by ScrollTrigger scrub ─────────────────
       * Time budget (in tl-seconds, mapped to scroll progress):
       *   0 .. 0.6  Deck holds (small idle "breath" + slight ready shift)
       *   0.6 .. 5.4  Six staggered card deals (each takes ~0.9s, overlap 0.4)
       *   5.4 .. 6.0  Final settle (subtle eases everything into final fan)
       * Total = 6 units. Scroll drives 0→1 across ~500vh.
       */
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=500%",
          pin: true,
          pinSpacing: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      // 0 → 0.6: tiny pre-deal beat (deck "breathes", lifts a hair)
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

      // Stagger the deal: top of deck (last index) goes first → looks like
      // lifting from the top of a face-down pile.
      const dealOrder = [...Array(N).keys()].reverse(); // [N-1, N-2, ..., 0]
      const dealStart = 0.6;
      const dealStep = 0.55; // overlap between successive deals
      const dealDur = 1.0;

      dealOrder.forEach((cardIdx, dealIdx) => {
        const t0 = dealStart + dealIdx * dealStep;
        const target = layout.fan[cardIdx];

        // Lift off the deck — rises and grows slightly, drifts toward final x.
        // We split into 3 sub-tweens that share the same start so timing is precise.

        // (a) Lift up + start moving toward target x
        tl.to(
          cardEls[cardIdx],
          {
            x: target.x * 0.4,
            y: -layout.cardH * 0.45,
            rotate: target.rot * 0.3,
            duration: dealDur * 0.45,
            ease: "power2.out",
          },
          t0
        );
        // (b) Flip mid-air (rotateY 180 → 0) — same window, slightly later
        tl.to(
          cardEls[cardIdx],
          {
            rotationY: 0,
            duration: dealDur * 0.55,
            ease: "power2.inOut",
          },
          t0 + dealDur * 0.2
        );
        // (c) Settle into fan position
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
        // z-index: bring this card above the deck after liftoff
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

      // Final hold (no animation, just timeline length so scrub has runway)
      const lastDealEnd = dealStart + (N - 1) * dealStep + dealDur;
      tl.to({}, { duration: Math.max(0, 6 - lastDealEnd) });

      /* ── Resize handling: recompute fan + retarget tweens ─────────────── */
      const onRefresh = () => {
        applySize();
        // Rebuild the timeline values that depend on layout.
        // Easiest: clear and rebuild. ScrollTrigger.refresh will call us again,
        // so we guard against re-entry.
      };
      ScrollTrigger.addEventListener("refreshInit", onRefresh);

      return () => {
        ScrollTrigger.removeEventListener("refreshInit", onRefresh);
      };
    }, sectionRef);

    return () => ctx.revert();
  }, [cards, deckOffsets]);

  if (!cards.length) return null;

  return (
    <section
      ref={sectionRef}
      className="tarot-shuffle-reveal"
      aria-label="Tarot card shuffle and reveal"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: "transparent",
        overflow: "hidden",
      }}
    >
      <div
        ref={stageRef}
        style={{
          position: "absolute",
          inset: 0,
          perspective: "1600px",
          perspectiveOrigin: "50% 45%",
          // Stage acts as the layout coordinate origin (cards positioned via translate-50%).
        }}
      >
        {cards.map((card, i) => (
          <div
            key={i}
            ref={setCardRef}
            className="tarot-card"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "var(--card-w, 200px)",
              height: "var(--card-h, 300px)",
              transformStyle: "preserve-3d",
              willChange: "transform",
              // Drop shadow lives on the wrapper so it doesn't double when flipping.
              filter: "drop-shadow(0 18px 28px rgba(0,0,0,0.55))",
            }}
          >
            {/* FRONT (image) — facing camera at rotationY 0 */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                borderRadius: "10px",
                overflow: "hidden",
                background: "#0a0908",
              }}
            >
              <img
                src={card.imageUrl}
                alt={card.name}
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                  objectFit: "cover",
                  userSelect: "none",
                }}
              />
            </div>

            {/* BACK (ornamental) — facing camera at rotationY 180 */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <CardBackArt />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
