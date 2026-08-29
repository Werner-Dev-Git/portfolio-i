import { ThemeProvider } from '@/lib/theme';
import { SmokeProvider } from '@/lib/smokeConfig';
import { marqueeItems, caseStudies } from '@/data/projects';
import { Header } from '@/components/Header';
import { Cursor } from '@/components/Cursor';
import { ScrollProgress } from '@/components/ScrollProgress';
import { Hero } from '@/components/Hero';
import { Marquee } from '@/components/Marquee';
import { DevSection } from '@/components/DevSection';
import { CaseStudy } from '@/components/CaseStudy';
import { ProcessTimeline } from '@/components/ProcessTimeline';
import { DesignSection } from '@/components/DesignSection';
import { AboutSection } from '@/components/AboutSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';

export default function App() {
  return (
    <ThemeProvider>
      <SmokeProvider>
        <div className="ambient" aria-hidden="true" />
        <div className="grain" aria-hidden="true" />
        <ScrollProgress />
        <Cursor />
        <Header />

        <main>
          <Hero />

          <Marquee duration={30}>
            {marqueeItems.map((item) => (
              <span key={item}>
                <span>{item}</span>
                <span className="d" style={{ marginLeft: 44 }}>◆</span>
              </span>
            ))}
          </Marquee>

          <DevSection />

          <div className="cases container" id="cases">
            {caseStudies.map((study) => (
              <CaseStudy study={study} key={study.name} />
            ))}
          </div>

          <DesignSection />
          <AboutSection />
          <ProcessTimeline />

          <Marquee duration={44} big>
            <span>Let&rsquo;s work together</span><span className="fill">✳</span>
            <span>Design</span><span className="fill">✳</span>
            <span>Development</span><span className="fill">✳</span>
            <span>Motion</span><span className="fill">✳</span>
          </Marquee>

          <ContactSection />
        </main>

        <Footer />
      </SmokeProvider>
    </ThemeProvider>
  );
}
