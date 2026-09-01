"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/** True when the visitor has asked for reduced motion. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/**
 * Scroll-triggered reveal (Trainual's GSAP entrance, done natively).
 * Fades + lifts into place the first time it enters the viewport.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(22px)",
        transition: reduced
          ? undefined
          : `opacity .7s cubic-bezier(.22,1,.36,1) ${delay}ms, transform .7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
        willChange: shown ? undefined : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

/**
 * Rotating word (Trainual's data-word-1…8 headline rotator).
 * Swaps a single word on a timer with a soft vertical flip.
 */
export function WordRotator({
  words,
  interval = 2200,
  className = "",
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [i, setI] = useState(0);
  const [animating, setAnimating] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || words.length < 2) return;
    const id = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setI((v) => (v + 1) % words.length);
        setAnimating(false);
      }, 260);
    }, interval);
    return () => clearInterval(id);
  }, [reduced, words.length, interval]);

  // Measure each word so the slot can animate to the active word's width —
  // no dead gap after a short word, no reflow of the text that follows.
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const [widths, setWidths] = useState<number[]>([]);

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const measure = () =>
      setWidths(
        Array.from(el.children).map((c) => (c as HTMLElement).getBoundingClientRect().width)
      );
    measure();
    // Re-measure once webfonts settle, so the slot matches the rendered face.
    document.fonts?.ready?.then(measure).catch(() => {});
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [words]);

  return (
    <span
      className={`relative inline-block overflow-hidden align-bottom ${className}`}
      style={{
        width: widths[i] ? `${widths[i]}px` : undefined,
        transition: reduced ? undefined : "width .3s cubic-bezier(.22,1,.36,1)",
      }}
    >
      {/* hidden measuring copies */}
      <span
        ref={measureRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 opacity-0"
        style={{ visibility: "hidden" }}
      >
        {words.map((w) => (
          <span key={w} className="inline-block whitespace-nowrap">
            {w}
          </span>
        ))}
      </span>

      <span
        className="block whitespace-nowrap"
        style={{
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(-0.35em)" : "none",
          transition: reduced ? undefined : "opacity .26s ease, transform .26s ease",
        }}
      >
        {words[i]}
      </span>
    </span>
  );
}

/**
 * Infinite marquee (Trainual's logo-marquee track).
 * Duplicates its children so the loop is seamless.
 */
export function Marquee({
  children,
  speed = 38,
}: {
  children: ReactNode;
  speed?: number;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <div className="marquee-mask relative overflow-hidden">
      <div
        className="flex w-max gap-3"
        style={
          reduced ? undefined : { animation: `marquee-scroll ${speed}s linear infinite` }
        }
      >
        <div className="flex shrink-0 gap-3">{children}</div>
        <div aria-hidden className="flex shrink-0 gap-3">
          {children}
        </div>
      </div>
    </div>
  );
}
