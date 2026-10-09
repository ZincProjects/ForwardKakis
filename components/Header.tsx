import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import SettingsButton from "./SettingsButton";

export default function Header() {
  return (
    <header className="no-print border-b border-line bg-surface/80">
      <nav
        aria-label="Main"
        className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"
      >
        <Link href="/" className="flex items-center gap-2 rounded-lg font-display text-2xl font-bold text-brand">
          <span aria-hidden="true">🤝</span>
          ForwardKakis
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/analyse"
            className="rounded-lg px-3 py-2 font-semibold text-ink hover:bg-surface-2"
          >
            Analyse
          </Link>
          <Link
            href="/history"
            className="rounded-lg px-3 py-2 font-semibold text-ink hover:bg-surface-2"
          >
            History
          </Link>
          <SettingsButton />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
