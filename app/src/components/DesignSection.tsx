import { FigmaWall } from './FigmaWall';
import { Reveal } from './Reveal';

export function DesignSection() {
  return (
    <section id="design" className="block container">
      <div className="section-head">
        <div>
          <div className="kicker mono">02 — Figma wall</div>
          <Reveal as="h2">Design</Reveal>
        </div>
        <Reveal as="p">
          A continuously scrolling wall of UI explorations and visual design. Hover to pause,
          click any shot to view it full-size — swipe or use arrow keys to browse.
        </Reveal>
      </div>
      <FigmaWall />
    </section>
  );
}
