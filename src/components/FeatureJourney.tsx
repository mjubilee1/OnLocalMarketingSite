"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type JourneyStep = {
  title: string;
  desc: string;
  /** Path under /public */
  shot: string;
  /** Caption shown on the app-window chrome */
  caption: string;
};

/**
 * Pinned scroll showcase — Trainual's `journey_pin` pattern.
 *
 * A tall scroll-space holds a sticky viewport. As you scroll through it the
 * progress rail fills, steps flip to active/complete, and the real app
 * screenshot cross-fades to match the active step.
 */
export function FeatureJourney({ steps }: { steps: JourneyStep[] }) {
  const spaceRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = spaceRef.current;
    if (!el) return;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        if (total <= 0) return;
        // 0 → 1 across the pinned region
        const p = Math.min(1, Math.max(0, -rect.top / total));
        setProgress(p);
        // Split the travel evenly between steps, biased so the last step
        // is fully shown before the section releases.
        const idx = Math.min(steps.length - 1, Math.floor(p * steps.length * 1.001));
        setActive(idx);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [steps.length]);

  return (
    <div
      ref={spaceRef}
      className="relative"
      style={{ height: `${steps.length * 70 + 50}vh` }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 lg:grid-cols-[0.85fr_1.15fr]">
          {/* ---- Steps rail ---- */}
          <div className="hidden lg:block">
            <div className="relative pl-8">
              {/* rail base + fill */}
              <div className="absolute left-[11px] top-2 h-[calc(100%-1rem)] w-0.5 rounded bg-white/12" />
              <div
                className="absolute left-[11px] top-2 w-0.5 origin-top rounded bg-gradient-to-b from-brand-300 to-cyan-300 transition-[height] duration-300 ease-out"
                style={{ height: `calc((100% - 1rem) * ${progress})` }}
              />

              <ul className="space-y-2.5">
                {steps.map((s, i) => {
                  const isActive = i === active;
                  const isDone = i < active;
                  return (
                    <li key={s.title} className="relative">
                      <span
                        className={`absolute -left-8 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300 ${
                          isActive
                            ? "border-cyan-300 bg-cyan-300 text-brand-950"
                            : isDone
                              ? "border-brand-300 bg-brand-300 text-brand-950"
                              : "border-white/20 bg-brand-950 text-white/40"
                        }`}
                      >
                        {isDone ? (
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12.5l4 4 10-10" />
                          </svg>
                        ) : (
                          <span className="text-[11px] font-bold">{i + 1}</span>
                        )}
                      </span>

                      <div
                        className="text-base font-bold transition-colors duration-300"
                        style={{ color: isActive ? "#fff" : "rgba(255,255,255,.45)" }}
                      >
                        {s.title}
                      </div>

                      {/* description expands only for the active step */}
                      <div
                        className="grid transition-all duration-300 ease-out"
                        style={{
                          gridTemplateRows: isActive ? "1fr" : "0fr",
                          opacity: isActive ? 1 : 0,
                        }}
                      >
                        <p className="overflow-hidden text-sm leading-relaxed text-brand-100/70">
                          <span className="mt-1 block max-w-sm">{s.desc}</span>
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* ---- Screenshot stage ---- */}
          <div>
            {/* Mobile: active step label (rail is hidden below lg) */}
            <div className="mb-4 lg:hidden">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                <span>
                  {active + 1} / {steps.length}
                </span>
                <span className="h-px flex-1 bg-white/15" />
              </div>
              <div className="mt-2 text-lg font-bold text-white">{steps[active].title}</div>
              <p className="mt-1 text-sm leading-relaxed text-brand-100/70">
                {steps[active].desc}
              </p>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -inset-5 -z-10 rounded-[2.25rem] bg-gradient-to-br from-brand-500/25 via-transparent to-cyan-400/20 blur-2xl" />
              <div className="overflow-hidden rounded-2xl border border-white/12 bg-brand-950 shadow-2xl shadow-brand-950/60">
                {/* window chrome */}
                <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.04] px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-3 text-[11px] font-medium text-white/60">
                    {steps[active].caption}
                  </span>
                  <span className="ml-auto flex items-center gap-1.5 text-[10px] font-medium text-cyan-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                    Offline
                  </span>
                </div>

                {/* cross-fading real screenshots */}
                <div className="relative aspect-[1800/1116]">
                  {steps.map((s, i) => (
                    <Image
                      key={s.shot}
                      src={s.shot}
                      alt={`OnLocalAI — ${s.title}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 640px"
                      priority={i === 0}
                      className="object-cover object-top transition-opacity duration-500"
                      style={{ opacity: i === active ? 1 : 0 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
