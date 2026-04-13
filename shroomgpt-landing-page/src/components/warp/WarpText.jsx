import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "framer-motion";
import {
  materializeLineRange,
  layoutNextLineRange,
  prepareWithSegments,
} from "@chenglou/pretext";
import { mushroomStore } from "./mushroomStore.js";
import styles from "./WarpText.module.css";

function lineBreakWidth(fullW, lineTop, lineH, mx, my, rx, ry, gap) {
  const lc = lineTop + lineH / 2;
  const safeRy = Math.max(ry, 1);
  const dy = (lc - my) / safeRy;
  if (dy * dy >= 1) return fullW;
  const chordHalf = rx * Math.sqrt(Math.max(0, 1 - dy * dy));
  const obstacleLeft = mx - chordHalf;
  if (obstacleLeft > fullW - gap) return fullW;
  const w = obstacleLeft - gap;
  return Math.max(72, Math.min(fullW, w));
}

function alignOffset(align, fullW, lineWidth) {
  if (align === "center") return (fullW - lineWidth) / 2;
  if (align === "right") return fullW - lineWidth;
  return 0;
}

/**
 * Paragraph text laid out with @chenglou/pretext so lines reflow around the
 * global mushroom cursor, plus subtle bend from scroll + pointer (canvas).
 */
export function WarpText({
  text,
  align = "left",
  typographyClassName = "",
  className = "",
  canvasClassName = "",
  ariaLabel,
  ariaHidden = false,
  /** Use "span" when this replaces copy inside a heading so reduced-motion fallback stays valid HTML. */
  fallbackAs = "p",
}) {
  const reduce = useReducedMotion();
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const probeRef = useRef(null);
  const [boxW, setBoxW] = useState(0);
  const [fontKey, setFontKey] = useState("");
  const boxWRef = useRef(0);
  boxWRef.current = boxW;

  const prepared = useMemo(() => {
    if (text == null || text === "" || !fontKey) return null;
    const font = fontKey.split("\n")[0];
    try {
      return prepareWithSegments(text, font);
    } catch {
      return null;
    }
  }, [text, fontKey]);

  const preparedRef = useRef(prepared);
  preparedRef.current = prepared;

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBoxW(el.clientWidth));
    ro.observe(el);
    setBoxW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const pr = probeRef.current;
    if (!pr) return;
    const cs = getComputedStyle(pr);
    setFontKey(`${cs.font}\n${cs.lineHeight}`);
  }, [boxW, typographyClassName, text]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const probe = probeRef.current;
    const preparedNow = preparedRef.current;
    const fullW = boxWRef.current;
    if (!canvas || !wrap || !probe || !preparedNow || fullW < 8) return;

    const cs = getComputedStyle(probe);
    const font = cs.font;
    const lineHeight = (() => {
      const lh = parseFloat(cs.lineHeight);
      return Number.isFinite(lh) ? lh : parseFloat(cs.fontSize) * 1.5;
    })();
    const color = cs.color;
    const fontSize = parseFloat(cs.fontSize) || 16;
    const rect = wrap.getBoundingClientRect();
    const { clientX, clientY, scrollY } = mushroomStore;
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    const rx = 56;
    const ry = 44 + Math.min(22, scrollY * 0.006);
    const gap = 10;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cursor = { segmentIndex: 0, graphemeIndex: 0 };
    let y = 0;
    const lines = [];
    while (true) {
      const breakW = lineBreakWidth(fullW, y, lineHeight, mx, my, rx, ry, gap);
      const range = layoutNextLineRange(preparedNow, cursor, breakW);
      if (!range) break;
      const line = materializeLineRange(preparedNow, range);
      lines.push({ line, y });
      cursor = range.end;
      y += lineHeight;
    }

    const totalH = Math.max(y + lineHeight * 0.35, lineHeight);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(fullW * dpr);
    canvas.height = Math.floor(totalH * dpr);
    canvas.style.width = `${fullW}px`;
    canvas.style.height = `${totalH}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, fullW, totalH);
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textBaseline = "alphabetic";
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    const phase = scrollY * 0.0035;

    for (const { line, y: lineTop } of lines) {
      const baseline = lineTop + fontSize * 0.88;
      const lx = alignOffset(align, fullW, line.width);
      const lineCx = lx + line.width / 2;
      const lineCy = baseline;
      const dx = lineCx - mx;
      const dy = lineCy - my;
      const dist = Math.hypot(dx, dy);
      const infl = Math.exp(-(dist * dist) / (280 * 280));
      const bendX =
        6 * infl * Math.sin(phase + lineTop * 0.09 + clientX * 0.008);
      const rot =
        0.028 * infl * Math.sin(phase * 1.1 + lineTop * 0.07 + clientY * 0.006);

      ctx.save();
      ctx.translate(lineCx, baseline);
      ctx.rotate(rot);
      ctx.translate(-lineCx, -baseline);
      ctx.fillText(line.text, lx + bendX, baseline);
      ctx.restore();
    }
  }, [align]);

  useEffect(() => {
    if (reduce) return;
    let id = 0;
    const loop = () => {
      draw();
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [reduce, draw, prepared, boxW]);

  useLayoutEffect(() => {
    if (!reduce && prepared && boxW >= 8) draw();
  }, [prepared, boxW, reduce, draw]);

  const mergedProbe = [styles.probe, typographyClassName].filter(Boolean).join(" ");
  const mergedWrap = [styles.wrap, className].filter(Boolean).join(" ");

  if (reduce) {
    const cn = [styles.fallback, typographyClassName, className]
      .filter(Boolean)
      .join(" ");
    const Inner = fallbackAs === "span" ? "span" : "p";
    return (
      <Inner
        className={cn}
        style={{
          textAlign: align,
          display: fallbackAs === "span" ? "block" : undefined,
        }}
      >
        {text}
      </Inner>
    );
  }

  return (
    <div ref={wrapRef} className={mergedWrap}>
      <span ref={probeRef} className={mergedProbe} aria-hidden>
        {text.slice(0, 80) || "A"}
      </span>
      <canvas
        ref={canvasRef}
        className={[styles.canvas, canvasClassName].filter(Boolean).join(" ")}
        aria-hidden={ariaHidden || undefined}
        aria-label={ariaHidden ? undefined : ariaLabel ?? text}
        role={ariaHidden ? "presentation" : undefined}
      />
    </div>
  );
}
