"use client";

import type { SVGProps } from "react";
import { trackEvent } from "@/lib/gtag";

type WindowsDownloadButtonProps = {
  href: string;
};

export function WindowsDownloadButton({ href }: WindowsDownloadButtonProps) {
  return (
    <a
      className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
      href={href}
      onClick={() =>
        trackEvent("download_windows", {
          link_url: href,
          file_extension: "exe",
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
