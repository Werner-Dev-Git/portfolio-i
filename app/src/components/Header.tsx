import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from '@/lib/theme';
import { Magnetic } from './Magnetic';

const LINKS = [
  { href: '#dev', label: 'Dev' },
  { href: '#design', label: 'Design' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
];

/** Highlights the nav link whose section currently owns the viewport. */
function useActiveSection(): string {
  const [active, setActive] = useState('');
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    LINKS.forEach(({ href }) => {
      const el = document.querySelector(href);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  return active;
}

export function Header() {
  const { theme, toggle } = useTheme();
  const active = useActiveSection();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header>
        <a className="brand" href="#top" aria-label="Home">
          <span className="brand-mark">W</span>
          <span className="brand-name">Werner</span>
        </a>

        <nav className="desktop" aria-label="Primary">
          {LINKS.map(({ href, label }) => (
            <a key={href} href={href} className={active === href ? 'is-current' : undefined}>
              {label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <motion.button
            type="button"
            className="theme-toggle"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              const btn = e.currentTarget;
              const b = btn.getBoundingClientRect();
              btn.animate({ rotate: ['0deg', '360deg'] }, { duration: 700, easing: 'cubic-bezier(.22,1,.36,1)' });
              toggle({ x: b.left + b.width / 2, y: b.top + b.height / 2 });
            }}
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
              </svg>
            )}
          </motion.button>

          <Magnetic>
            <a href="#contact" className="btn btn-accent">Hire me</a>
          </Magnetic>

          <button
            type="button"
            className="theme-toggle menu-btn"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </header>

      {/* AnimatePresence gives the menu a real exit animation on close. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={() => setMenuOpen(false)}
          >
            {LINKS.map(({ href, label }) => (
              <a key={href} href={href}>{label}</a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
