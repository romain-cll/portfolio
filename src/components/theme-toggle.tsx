const STORAGE_KEY = 'theme'

/**
 * Runs in <head> before the first paint, so the page never flashes the wrong
 * theme: the visitor's choice if they made one, else the system's, which it
 * keeps following until they do.
 */
export const themeScript = `(() => {
  const root = document.documentElement
  const system = matchMedia('(prefers-color-scheme: dark)')
  const apply = () => {
    let stored = null
    try { stored = localStorage.getItem('${STORAGE_KEY}') } catch {}
    root.dataset.theme = stored ?? (system.matches ? 'dark' : 'light')
  }
  apply()
  system.addEventListener('change', apply)
})()`

function toggle() {
  const root = document.documentElement
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
  root.dataset.theme = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // Private mode: the choice lasts until the page reloads
  }
}

const icon =
  'size-4 fill-none stroke-current stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]'

/** Sun in dark mode, moon in light mode: the icon shows where a click goes */
export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark theme"
      title="Toggle dark theme"
      className="grid cursor-pointer place-items-center self-center text-muted hover:text-text"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`${icon} dark:hidden`}
      >
        <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`${icon} hidden dark:block`}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  )
}
