/**
 * Per-navigation enter transition. `template.tsx` remounts on every route
 * change, so a CSS enter animation is enough (no AnimatePresence/exit) and,
 * unlike a JS-driven one, the page is visible even before hydration.
 * `prefers-reduced-motion` disables it in globals.css.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
