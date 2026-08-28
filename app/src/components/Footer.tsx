import { useEffect, useState } from 'react';

const formatSast = (): string =>
  `${new Intl.DateTimeFormat('en-ZA', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Johannesburg',
  }).format(new Date())} SAST`;

export function Footer() {
  const [clock, setClock] = useState(formatSast);

  useEffect(() => {
    const id = window.setInterval(() => setClock(formatSast()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer>
      <span>© {new Date().getFullYear()} Werner — designed &amp; built by hand</span>
      <span>{clock}</span>
      <a href="#top">Back to top ↑</a>
    </footer>
  );
}
