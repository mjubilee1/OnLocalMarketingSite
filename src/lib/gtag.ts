export const GA_MEASUREMENT_ID = "G-5R4PQNJ3FC";

type GtagEventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(action: string, params?: GtagEventParams) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  // Beacon so mailto / outbound clicks still send before the page loses focus.
  window.gtag("event", action, {
    ...params,
    transport_type: "beacon",
  });
}
