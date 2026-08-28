import { services, skills } from '@/data/projects';
import { ServiceCard } from './ServiceCard';
import { SmokeLab } from './SmokeLab';
import { Reveal } from './Reveal';

export function AboutSection() {
  return (
    <section id="about" className="block container">
      <SmokeLab />

      <div className="section-head">
        <div>
          <div className="kicker mono">03 — About</div>
          <Reveal as="h2">Design-minded builder</Reveal>
        </div>
      </div>

      <div className="about-grid">
        <Reveal>
          <p>
            I&rsquo;m Werner, a designer &amp; developer from South Africa. I work the whole
            distance — <strong>from the first Figma frame to the deployed URL</strong> — so
            nothing gets lost in translation between design and code.
          </p>
          <p>
            My clients range from satellite connectivity firms to drilling companies and comedy
            shows: real businesses that need sites which{' '}
            <strong>load fast, look sharp and convert</strong>. And when I&rsquo;m off the clock,
            I&rsquo;m exploring motion, colour and interface ideas on the design wall above.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="chips">
          {skills.map((skill) => <span className="chip" key={skill}>{skill}</span>)}
        </Reveal>
      </div>

      <div className="services">
        {services.map((service, i) => (
          <Reveal key={service.num} delay={i * 0.08}>
            <ServiceCard service={service} index={i} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
