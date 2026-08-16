// ─────────────────────────────────────────────────────────────────────────
// Social-card (1200×630) DESIGN SOURCE — NOT an active route.
// The rendered output is committed at public/brand/og-card.png and referenced
// from src/app/layout.tsx. We keep it as a static .png (rather than Next's
// app/opengraph-image.tsx convention) because `output: export` emits that file
// WITHOUT a .png extension, which GitHub Pages and some static hosts serve with
// the wrong content-type — breaking OG scrapers.
//
// To regenerate after editing this design:
//   1. Copy this file to src/app/opengraph-image.tsx
//   2. `npm run build`
//   3. `cp out/opengraph-image public/brand/og-card.png`
//   4. Delete src/app/opengraph-image.tsx again
// ─────────────────────────────────────────────────────────────────────────
import { ImageResponse } from "next/og";

export const alt =
  "OnLocalAI — private, on-premises AI for your whole team";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Required so the image is generated at build time under `output: export`.
export const dynamic = "force-static";

// Generated at build time into a static PNG (works with output: export).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #01185e 0%, #010b33 60%, #01061f 100%)",
          padding: "64px 72px",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 700 }}>
          <span>onlocal</span>
          <span style={{ color: "#6aa3ff" }}>AI</span>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: 960,
            }}
          >
            Private AI for your team&apos;s knowledge, training &amp; support
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 30,
              lineHeight: 1.3,
              color: "#b9c8ee",
              maxWidth: 900,
            }}
          >
            Runs 100% on your own computer. No cloud, no accounts — nothing leaves your machine.
          </div>
        </div>

        {/* Footer row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 24,
              color: "#8fa8dd",
            }}
          >
            <div
              style={{
                display: "flex",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 999,
                padding: "8px 20px",
                color: "#dbe6ff",
              }}
            >
              Works offline · Air-gapped
            </div>
            <div
              style={{
                display: "flex",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 999,
                padding: "8px 20px",
                color: "#dbe6ff",
              }}
            >
              8-in-1, one install
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 600, color: "#ffffff" }}>
            onlocalai.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
