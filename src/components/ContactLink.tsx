"use client";

import type { ReactNode } from "react";
import { trackEvent } from "@/lib/gtag";

type ContactLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  source: string;
};

export function ContactLink({ href, className, children, source }: ContactLinkProps) {
  return (
    <a
      href={href}
      className={className}
      onClick={() =>
        trackEvent("request_access", {
          link_url: href,
          source,
        })
      }
    >
      {children}
    </a>
  );
}
