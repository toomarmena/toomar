import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...p,
});

export const IconHome = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10h5v-6h4v6h5V10" />
  </svg>
);
export const IconComic = (p: P) => (
  <svg {...base(p)}>
    <rect x="5" y="3" width="14" height="18" rx="1" />
    <path d="M5 9h14M5 15h14" />
  </svg>
);
export const IconNovel = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z" />
    <path d="M20 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z" />
  </svg>
);
export const IconLibrary = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 3h12v18l-6-4-6 4z" />
  </svg>
);
export const IconUser = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);
export const IconSearch = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);
export const IconBack = (p: P) => (
  // Points right: "back" in an RTL interface.
  <svg {...base(p)}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </svg>
);
export const IconArrowLeft = (p: P) => (
  <svg {...base(p)}>
    <path d="M19 12H5" />
    <path d="M11 6l-6 6 6 6" />
  </svg>
);
export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

/** The verified check: blue circle, white tick. Granted by the editor, never bought. */
export function VerifiedMark({ className = "", size = 14, onDark = false }: { className?: string; size?: number; onDark?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`inline-block shrink-0 align-[-2px] ${className}`} role="img" aria-label="مبدع موثّق">
      <title>مبدع موثّق</title>
      <circle cx="12" cy="12" r="11" fill={onDark ? "#FFFFFF" : "#2B5CF6"} />
      <path d="M7 12.5l3 3 7-7" stroke={onDark ? "#2B5CF6" : "#FFFFFF"} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---- social and sharing ----
export const IconShare = (p: P) => (
  <svg {...base(p)}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
  </svg>
);
export const IconLink = (p: P) => (
  <svg {...base(p)}>
    <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
    <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
  </svg>
);
export const IconGlobe = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </svg>
);
export const IconInstagram = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
export const IconX = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 4l16 16M20 4L4 20" />
  </svg>
);
export const IconFacebook = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8a1 1 0 0 1 0 0z" />
  </svg>
);
export const IconYoutube = (p: P) => (
  <svg {...base(p)}>
    <rect x="2" y="6" width="20" height="12" rx="4" />
    <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
  </svg>
);
export const IconTiktok = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5" />
    <path d="M14 4c.5 2.5 2.2 4 4.5 4.2" />
  </svg>
);
export const IconWhatsapp = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 20l1.3-3.8A8 8 0 1 1 8 19z" />
    <path d="M9 9.5c0 2.5 3 5.5 5.5 5.5l1-1.5-2-1-1 1a5 5 0 0 1-2-2l1-1-1-2z" fill="currentColor" stroke="none" />
  </svg>
);
