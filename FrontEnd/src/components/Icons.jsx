/** آیکون‌های SVG ساده — بدون ایموجی */

const size = (s) => ({ width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true });

export function IconHome({ s = 18 }) {
  return (
    <svg {...size(s)}>
      <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5z" />
    </svg>
  );
}

export function IconInbox({ s = 18 }) {
  return (
    <svg {...size(s)}>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

export function IconBoard({ s = 18 }) {
  return (
    <svg {...size(s)}>
      <rect x="3" y="3" width="7" height="18" rx="1" />
      <rect x="14" y="3" width="7" height="12" rx="1" />
    </svg>
  );
}

export function IconCalendar({ s = 18 }) {
  return (
    <svg {...size(s)}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export function IconChart({ s = 18 }) {
  return (
    <svg {...size(s)}>
      <path d="M4 20V10M12 20V4M20 20v-7" />
    </svg>
  );
}

export function IconCamera({ s = 18 }) {
  return (
    <svg {...size(s)}>
      <path d="M4 8h3l2-2h6l2 2h3v11H4V8z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

export function IconPaperclip({ s = 16 }) {
  return (
    <svg {...size(s)}>
      <path d="M21 8.5 10.5 19a4.5 4.5 0 0 1-6.4-6.4L15 1.7a3 3 0 0 1 4.2 4.2L8.4 16.7a1.5 1.5 0 0 1-2.1-2.1L16 5" />
    </svg>
  );
}

export function IconChat({ s = 16 }) {
  return (
    <svg {...size(s)}>
      <path d="M4 5h16v11H8l-4 3V5z" />
    </svg>
  );
}

export function IconFolder({ s = 18 }) {
  return (
    <svg {...size(s)}>
      <path d="M3 7h6l2 2h10v10H3V7z" />
    </svg>
  );
}

export function IconFile({ s = 18 }) {
  return (
    <svg {...size(s)}>
      <path d="M7 3h7l5 5v13H7V3z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

export function sidebar__logout({ s = 18 }) {
  return (
    <svg {...size(s)}>
  <path d="M9 12h12l-3 -3" />
  <path d="M18 15l3 -3" />
</svg>
  );
}


/* آیکون‌های انتخاب پروژه */
export function IconDiamond({ s = 18 }) {
  return (
    <svg {...size(s)} strokeWidth={1.6}>
      <path d="M12 2.5 21 12l-9 9.5L3 12 12 2.5z" />
    </svg>
  );
}

export function IconDiamondOutline({ s = 18 }) {
  return (
    <svg {...size(s)} strokeWidth={1.6}>
      <path d="M12 3.5 19.5 12 12 20.5 4.5 12 12 3.5z" />
    </svg>
  );
}

export function IconHex({ s = 18 }) {
  return (
    <svg {...size(s)} strokeWidth={1.6}>
      <path d="M12 2.5 20 7.5v9L12 21.5 4 16.5v-9L12 2.5z" />
    </svg>
  );
}

export function IconTriangle({ s = 18 }) {
  return (
    <svg {...size(s)} strokeWidth={1.6}>
      <path d="M12 3.5 21 19.5H3L12 3.5z" />
    </svg>
  );
}

export function IconCircle({ s = 18 }) {
  return (
    <svg {...size(s)} strokeWidth={1.6}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

export function IconSquare({ s = 18 }) {
  return (
    <svg {...size(s)} strokeWidth={1.6}>
      <rect x="5" y="5" width="14" height="14" rx="1.5" />
    </svg>
  );
}

export function IconStar({ s = 18 }) {
  return (
    <svg {...size(s)} strokeWidth={1.6}>
      <path d="M12 3.5l2.4 5 5.4.6-4 3.7 1.2 5.3L12 15.8 7 18.1l1.2-5.3-4-3.7 5.4-.6L12 3.5z" />
    </svg>
  );
}

export function IconHalf({ s = 18 }) {
  return (
    <svg {...size(s)} strokeWidth={1.6}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4v16" />
      <path d="M12 4a8 8 0 0 1 0 16" fill="currentColor" stroke="none" opacity="0.35" />
    </svg>
  );
}

export const PROJECT_ICON_MAP = {
  diamond: IconDiamond,
  diamondOutline: IconDiamondOutline,
  hex: IconHex,
  triangle: IconTriangle,
  circle: IconCircle,
  square: IconSquare,
  star: IconStar,
  half: IconHalf,
};

export const PROJECT_ICON_KEYS = Object.keys(PROJECT_ICON_MAP);

/** نمایش آیکون پروژه — از کلید یا کاراکتر قدیمی پشتیبانی می‌کند */
export function ProjectIcon({ name, s = 16 }) {
  const legacy = {
    "◆": "diamond",
    "◇": "diamondOutline",
    "◈": "hex",
    "▲": "triangle",
    "●": "circle",
    "■": "square",
    "★": "star",
    "◐": "half",
  };
  const key = PROJECT_ICON_MAP[name] ? name : legacy[name] || "diamond";
  const Comp = PROJECT_ICON_MAP[key] || IconDiamond;
  return <Comp s={s} />;
}

const NAV = {
  home: IconHome,
  inbox: IconInbox,
  boards: IconBoard,
  calendar: IconCalendar,
  reports: IconChart,
};

export function NavIcon({ id, s = 18 }) {
  const Comp = NAV[id] || IconBoard;
  return <Comp s={s} />;
}
