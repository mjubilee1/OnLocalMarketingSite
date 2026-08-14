import type { SVGProps } from "react";

/**
 * OnLocalAI circular mark, extracted from the brand wordmark.
 * Inherits `currentColor` so it can be tinted per placement.
 */
export function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="40 457 172 172"
      fill="currentColor"
      fillRule="evenodd"
      aria-hidden
      {...props}
    >
      <path d="M 56.473 535.607 C 57.393 527.858 58.898 520.098 62.149 512.942 C 72.14 490.95 93.708 476.391 117.328 473.49 C 124.268 472.638 131.332 472.52 138.252 473.608 C 140.157 473.907 141.988 474.411 143.833 474.953 C 144.219 475.067 145.146 475.131 145.447 475.418 C 145.75 475.708 143.466 476.187 143.216 476.253 C 141.53 476.701 139.979 477.369 138.403 478.109 C 133.801 480.271 129.508 482.82 125.397 485.804 C 112.48 495.181 99.607 507.17 94.295 522.671 C 88.89 538.444 90.71 557.093 102.097 569.878 C 106.618 574.955 112.226 579.27 118.053 582.733 C 119.731 583.731 123.613 585.084 123.292 587.345 C 120.74 594.786 118.288 602.705 114.156 609.393 C 112.094 609.736 109.322 608.735 107.379 608.1 C 102.191 606.405 97.251 604.293 92.424 601.739 C 68.138 588.885 54.156 562.97 56.473 535.607 Z" />
      <path d="M 119.605 609.621 C 121.349 608.592 122.747 606.936 124.35 605.678 C 129.371 601.737 134.078 597.453 138.261 592.625 C 141.858 588.475 145.595 584.309 148.5 579.627 C 159.621 561.709 163.941 538.876 152.96 519.794 C 148.653 512.31 141.922 506.023 134.971 500.99 C 132.474 499.183 129.894 497.548 127.286 495.912 C 126.149 495.198 124.422 494.216 123.835 492.975 C 126.247 490.969 128.281 488.533 130.791 486.629 C 134.316 483.954 138.245 481.917 142.281 480.142 C 144.7 479.079 147.353 477.788 150.022 477.556 C 155.715 477.064 161.866 481.541 166.306 484.59 C 180.552 494.374 190.428 509.277 193.845 526.269 C 194.934 531.686 195.724 537.461 195.572 542.997 C 194.849 569.451 178.78 593.09 154.937 604.225 C 146.313 608.252 136.307 611.055 126.696 610.585 C 124.428 610.474 121.535 610.704 119.386 609.974 C 119.459 609.856 119.532 609.739 119.605 609.621 Z" />
    </svg>
  );
}

type LogoProps = {
  className?: string;
  /** Height of the wordmark in pixels. */
  height?: number;
};

/**
 * Full lockup: circular mark + "onlocalAI" wordmark, set in the brand navy.
 */
export function Logo({ className, height = 26 }: LogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-brand-900 ${className ?? ""}`}
      style={{ height }}
    >
      <BrandMark className="h-full w-auto" style={{ height }} />
      <span
        className="font-semibold tracking-tight text-brand-900"
        style={{ fontSize: height * 0.92, letterSpacing: "-0.02em" }}
      >
        onlocal<span className="text-brand-600">AI</span>
      </span>
    </span>
  );
}
