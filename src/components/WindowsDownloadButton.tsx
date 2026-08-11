"use client";

import { useEffect, useState, type FormEvent, type SVGProps } from "react";
import { trackEvent } from "@/lib/gtag";

const ACTIVATION_CODE =
  process.env.NEXT_PUBLIC_ACTIVATION_CODE?.trim().toUpperCase() || "ONLOCAL-BETA";
const UNLOCK_KEY = "onlocal_download_unlocked";

type WindowsDownloadButtonProps = {
  href: string;
};

export function WindowsDownloadButton({ href }: WindowsDownloadButtonProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(UNLOCK_KEY) === "1") {
        setUnlocked(true);
      }
    } catch {
      // sessionStorage may be unavailable
    }
  }, []);

  function handleUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();

    if (normalized === ACTIVATION_CODE) {
      setUnlocked(true);
      setError(null);
      try {
        sessionStorage.setItem(UNLOCK_KEY, "1");
      } catch {
        // ignore
      }
      trackEvent("activation_unlock", { activation_code: normalized });
      return;
    }

    setError("That code isn’t valid. Request access if you need one.");
    trackEvent("activation_failed");
  }

  if (!unlocked) {
    return (
      <div className="w-full max-w-sm">
        <form onSubmit={handleUnlock} className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <label className="sr-only" htmlFor="activation-code">
            Activation code
          </label>
          <input
            id="activation-code"
            name="activation-code"
            type="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="Enter access code"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              if (error) setError(null);
            }}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-emerald-500/30 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            Unlock
          </button>
        </form>
        {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
        <p className="mt-2 text-xs text-slate-500">
          Early access is code-gated.{" "}
          <a
            href={`mailto:montrell@onlocalai.com,Subash@onlocalai.com?subject=${encodeURIComponent(
              "Request OnLocalAI access code"
            )}`}
            className="font-medium text-emerald-700 underline-offset-2 hover:underline"
          >
            Request a code
          </a>
        </p>
      </div>
    );
  }

  return (
    <a
      className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
      href={href}
      onClick={() =>
        trackEvent("download_windows", {
          link_url: href,
          file_extension: "exe",
          activation_code: ACTIVATION_CODE,
        })
      }
    >
      <WindowsIcon className="h-4 w-4" />
      Download for Windows
      <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
        Alpha
      </span>
    </a>
  );
}

function WindowsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3 5.4l7.3-1v7.1H3V5.4zm0 13.2l7.3 1v-7H3v6zm8.3 1.1L21 21V12.5h-9.7v7.2zm0-15.4v7.2H21V3l-9.7 1.3z" />
    </svg>
  );
}
