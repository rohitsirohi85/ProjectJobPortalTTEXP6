// Presentation-only helpers (icons, avatars, formatting). No data logic here.
const PALETTE = [
  ['#e8e6ff', '#3b30d9'], ['#ffe9d2', '#b4560a'], ['#d9f5ea', '#0b7a58'],
  ['#ffe0e6', '#b8243f'], ['#dff1ff', '#0d5f99'], ['#f3e4ff', '#7a2bb5'],
];

export function Avatar({ name = '?', size = 48, round = false }) {
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const [bg, fg] = PALETTE[hash % PALETTE.length];
  return (
    <span
      className="avatar"
      aria-hidden="true"
      style={{ width: size, height: size, background: bg, color: fg, borderRadius: round ? '50%' : size * 0.28, fontSize: size * 0.42 }}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

export function timeAgo(date) {
  if (!date) return '';
  const s = Math.max(0, (Date.now() - new Date(date).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

const P = {
  search: 'M11 4a7 7 0 1 0 4.4 12.4l4.1 4.1 1.4-1.4-4.1-4.1A7 7 0 0 0 11 4Z',
  pin: 'M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.500a2.5 2.5 0 0 1 0 5Z',
  bookmark: 'M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z',
  mail: 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 7.500L4.500 7h15L12 12.500Z',
  phone: 'M6.600 3h3l1.500 4-2 1.300a11 11 0 0 0 5.600 5.600L16 12l4 1.500v3a2 2 0 0 1-2 2A15 15 0 0 1 4.600 5a2 2 0 0 1 2-2Z',
  file: 'M6 2h8l5 5v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm7 1.500V8h4.500L13 3.500Z',
  arrow: 'M5 12h12m-5-6 6 6-6 6',
  check: 'M5 12.500l4.500 4.500L19 7.500',
  plus: 'M12 5v14M5 12h14',
  briefcase: 'M9 4h6a1 1 0 0 1 1 1v2h4a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4V5a1 1 0 0 1 1-1Zm1 2v1h4V6h-4Z',
};

export function Icon({ name, size = 18, stroke = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="icon"
      fill={stroke ? 'none' : 'currentColor'} stroke={stroke ? 'currentColor' : 'none'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={P[name]} />
    </svg>
  );
}

export function Spinner({ label = 'Loading' }) {
  return <div className="loader" role="status"><span className="spin" />{label}…</div>;
}
