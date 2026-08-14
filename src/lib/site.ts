export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://onlocalai.com";

export const SITE_NAME = "onlocalAI";
export const SITE_LEGAL_NAME = "OnLocalAI";

export const SITE_DESCRIPTION =
  "Private, on-premises AI for messy, inconsistent onboarding — knowledge, training, and support that run on your own computer. Nothing leaves your machine.";

/** Square lockup Google can crawl for Organization.logo and link previews. */
export const SITE_LOGO_PATH = "/brand/onlocalai-logo-colored.png";
export const SITE_LOGO_URL = `${SITE_URL}${SITE_LOGO_PATH}`;

export const CONTACT_EMAILS = [
  "montrell@onlocalai.com",
  "Subash@onlocalai.com",
] as const;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        legalName: SITE_LEGAL_NAME,
        alternateName: ["OnLocalAI", "On Local AI"],
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: SITE_LOGO_URL,
          contentUrl: SITE_LOGO_URL,
          caption: SITE_NAME,
          width: 4000,
          height: 4000,
        },
        image: SITE_LOGO_URL,
        email: [...CONTACT_EMAILS],
        description: SITE_DESCRIPTION,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: { "@id": `${SITE_URL}/#organization` },
        description: SITE_DESCRIPTION,
      },
      {
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Windows, macOS",
        url: SITE_URL,
        image: SITE_LOGO_URL,
        publisher: { "@id": `${SITE_URL}/#organization` },
        description: SITE_DESCRIPTION,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
  };
}
