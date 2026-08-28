import { projects } from '@/data/projects';
import { SiteCard } from './SiteCard';
import { Reveal } from './Reveal';

export function DevSection() {
  return (
    <section id="dev" className="block container">
      <div className="section-head">
        <div>
          <div className="kicker mono">01 — Live sites</div>
          <Reveal as="h2">Dev</Reveal>
        </div>
        <Reveal as="p">
          Full-page captures of real, deployed sites. Hover a card and it glides through the
          whole page — click anywhere to open the live site.
        </Reveal>
      </div>

      <div className="work-grid">
        {projects.map((project) => (
          <SiteCard key={project.url} project={project} />
        ))}
      </div>
    </section>
  );
}
