import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { motion } from 'motion/react';
import { EMAIL, GITHUB_URL } from '@/data/projects';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { Magnetic } from './Magnetic';
import { Reveal } from './Reveal';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export function ContactSection() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [copied, setCopied] = useState(false);

  useGSAP(
    () => {
      if (reduced) return;
      const heading = ref.current?.querySelector('h2');
      if (!heading) return;
      const split = new SplitText(heading, { type: 'words' });
      gsap.from(split.words, {
        yPercent: 75, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07,
        scrollTrigger: { trigger: heading, start: 'top 82%', once: true },
      });
      return () => split.revert();
    },
    { scope: ref, dependencies: [reduced] },
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the mailto button still works */
    }
  };

  return (
    <section id="contact" className="contact container" ref={ref}>
      <div className="kicker mono">04 — Contact</div>
      <h2>Let&rsquo;s build something <em>green</em>.</h2>
      <Reveal as="p">
        Have a project, a product or just an idea? My inbox is open — tell me what you&rsquo;re
        making and I&rsquo;ll tell you how I can help.
      </Reveal>

      <Reveal delay={0.1} className="contact-actions">
        <Magnetic>
          <a className="btn btn-glass-accent" href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </Magnetic>
        <Magnetic>
          <motion.button
            type="button"
            className="btn btn-glass"
            onClick={copy}
            animate={copied ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: 0.45 }}
          >
            {copied ? 'Copied ✓' : 'Copy email'}
          </motion.button>
        </Magnetic>
        <Magnetic>
          <a className="btn btn-glass" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
        </Magnetic>
      </Reveal>
    </section>
  );
}
