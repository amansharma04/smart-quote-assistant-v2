// Theme presets. Each theme is a set of literal Tailwind class strings (not
// dynamically constructed) so Tailwind's content scanner can find them at
// build time. Switching an industry's `theme` field in its config swaps the
// whole look with no component changes.
export const THEMES = {
  modern: {
    pageBg: 'bg-paper',
    cardBg: 'bg-white',
    heroBg: 'bg-white',
    heroText: 'text-ink',
    border: 'border-line',
    radius: 'rounded-card',
    accentText: 'text-signal-teal',
    accentBg: 'bg-signal-teal',
    accentBgHover: 'hover:bg-signal-tealDark',
  },
  minimal: {
    pageBg: 'bg-white',
    cardBg: 'bg-white',
    heroBg: 'bg-white',
    heroText: 'text-ink',
    border: 'border-line',
    radius: 'rounded-none',
    accentText: 'text-ink',
    accentBg: 'bg-ink',
    accentBgHover: 'hover:bg-ink/80',
  },
  professional: {
    pageBg: 'bg-slate-50',
    cardBg: 'bg-white',
    heroBg: 'bg-slate-900',
    heroText: 'text-white',
    border: 'border-slate-200',
    radius: 'rounded-md',
    accentText: 'text-blue-700',
    accentBg: 'bg-blue-700',
    accentBgHover: 'hover:bg-blue-800',
  },
  dark: {
    pageBg: 'bg-ink',
    cardBg: 'bg-slate-850',
    heroBg: 'bg-ink',
    heroText: 'text-white',
    border: 'border-white/10',
    radius: 'rounded-card',
    accentText: 'text-signal-teal',
    accentBg: 'bg-signal-teal',
    accentBgHover: 'hover:bg-signal-tealDark',
  },
  blue: {
    pageBg: 'bg-paper',
    cardBg: 'bg-white',
    heroBg: 'bg-white',
    heroText: 'text-ink',
    border: 'border-line',
    radius: 'rounded-card',
    accentText: 'text-signal-teal',
    accentBg: 'bg-signal-teal',
    accentBgHover: 'hover:bg-signal-tealDark',
  },
  green: {
    pageBg: 'bg-paper',
    cardBg: 'bg-white',
    heroBg: 'bg-white',
    heroText: 'text-ink',
    border: 'border-line',
    radius: 'rounded-card',
    accentText: 'text-signal-green',
    accentBg: 'bg-signal-green',
    accentBgHover: 'hover:bg-emerald-700',
  },
}

export function getTheme(themeName) {
  return THEMES[themeName] || THEMES.modern
}
