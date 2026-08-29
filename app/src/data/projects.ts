export interface Project {
  name: string;
  url: string;
  /** Full-page capture, relative to the shared asset root. */
  img: string;
  desc: string;
  tags: string[];
  /** Featured cards span the full grid width. */
  featured?: boolean;
}

/** Add a new site by appending one entry — the grid, count-up stat and
 *  scroll-through preview all derive from this list. */
export const projects: Project[] = [
  {
    name: 'SatReach',
    url: 'https://werner-dev-git.github.io/satreach/',
    img: 'screens/satreach.jpg',
    desc: 'Premier Starlink installations, custom hardware and bulletproof connectivity — from the Karoo to Kilimanjaro. Space-dark visuals over African landscapes.',
    tags: ['Design + Build', 'Connectivity', 'Featured'],
    featured: true,
  },
  {
    name: 'EuroFenster',
    url: 'https://werner-dev-git.github.io/aluplast-website/',
    img: 'screens/aluplast.jpg',
    desc: 'Exclusive Southern-African distributor of German-engineered aluplast® window systems. Clean, technical and premium.',
    tags: ['Design + Build', 'Corporate'],
  },
  {
    name: 'Fifty Shades of Green',
    url: 'https://werner-dev-git.github.io/fifty-shades-of-green/',
    img: 'screens/fifty-shades.jpg',
    desc: 'Site for a live comedy show — events, podcast and host. Minimal layout that lets the stage photography breathe.',
    tags: ['Design + Build', 'Entertainment'],
  },
  {
    name: 'DNA Outsourcing',
    url: 'https://werner-dev-git.github.io/EORSite/dna-homepage.html',
    img: 'screens/dna.jpg',
    desc: 'End-to-end payroll outsourcing across Africa, the UAE and Europe. Corporate polish, client logos and trust signals.',
    tags: ['Design + Build', 'B2B / Payroll'],
  },
  {
    name: 'Karua Drilling',
    url: 'https://werner-dev-git.github.io/karua-drilling/',
    img: 'screens/karua.jpg',
    desc: 'Borehole, solar-foundation and fence-post drilling with 20+ years of experience. Power. Precision. Performance.',
    tags: ['Design + Build', 'Industrial'],
  },
  {
    name: 'InBody SA',
    url: 'https://werner-dev-git.github.io/inbody/',
    img: 'screens/inbody.jpg',
    desc: 'Medical-grade body composition analysis for healthcare and fitness professionals. Product catalogue, demo booking and trade-in flows.',
    tags: ['Design + Build', 'Health / Product'],
  },
  {
    name: 'Evetech',
    url: 'https://www.evetech.co.za/',
    img: 'screens/evetech.jpg',
    desc: 'South Africa’s go-to for gaming PCs, laptops and components — a high-volume e-commerce catalogue running since 2007.',
    tags: ['E-commerce', 'Gaming'],
  },
  {
    name: 'Cobalt Creed',
    url: 'https://cobaltcreed.com/',
    img: 'screens/cobaltcreed.jpg',
    desc: 'Factory-direct small-duct high-velocity HVAC systems for builders and developers, manufactured in St. Louis since 1985.',
    tags: ['Corporate', 'Manufacturing'],
  },
  {
    name: 'Crest Advisory Africa',
    url: 'https://crestadvisoryafrica.com/',
    img: 'screens/crest.jpg',
    desc: 'Training, audits and ISO management technology for governance, risk and compliance teams across Africa.',
    tags: ['Corporate', 'Consulting'],
  },
  {
    name: 'FROGG Recruitment',
    url: 'https://www.froggrecruit-sa.co.za/',
    img: 'screens/frogg.jpg',
    desc: 'South African recruitment agency running since 2010 — permanent, fixed-term and executive placements. “We go above and beyond your expectations.”',
    tags: ['Dev', 'Recruitment', 'Live site'],
    featured: true,
  },
];

export interface Service {
  num: string;
  title: string;
  body: string;
}

export const services: Service[] = [
  {
    num: '/ 01',
    title: 'Product & web design',
    body: 'Landing pages, brand sites and app UI designed in Figma — grids, type scales and component libraries included, not just pretty pictures.',
  },
  {
    num: '/ 02',
    title: 'Front-end development',
    body: 'Hand-built, fast and responsive. Semantic HTML, modern CSS and just enough JavaScript — deployed and live, like every site in the section above.',
  },
  {
    num: '/ 03',
    title: 'Motion & interaction',
    body: 'Scroll choreography, hover states and micro-interactions that make an interface feel alive without getting in the way.',
  },
];

export const skills: string[] = [
  'Figma', 'UI / UX', 'Design systems', 'Prototyping', 'HTML / CSS / JS',
  'TypeScript', 'React', 'Next.js', 'Vite', 'Tailwind CSS', 'Supabase',
  'Git / GitHub Pages', 'GSAP / Motion', 'Three.js', 'SEO', 'Accessibility',
];

export const marqueeItems: string[] = [
  'Figma', 'UI / UX', 'React', 'TypeScript', 'Tailwind',
  'Design Systems', 'Motion', 'Three.js', 'Interaction Design',
];


export interface CaseStudyEntry {
  name: string;
  img: string;
  steps: { title: string; body: string }[];
}

/** Two flagship builds, told in three beats each as the capture scrolls.
 *  Copy is drawn from what the live sites actually say — no invented metrics.
 *  The TODO slots are for Werner to drop in real figures. */
export const caseStudies: CaseStudyEntry[] = [
  {
    name: 'SatReach',
    img: 'screens/satreach.jpg',
    steps: [
      {
        title: 'Connectivity, from the Karoo to Kilimanjaro',
        body: 'A Starlink installer serving farms, lodges, expeditions and events — four very different buyers who all arrive on the same homepage. The brief was to speak to each without turning the site into a catalogue.',
      },
      {
        title: 'Space-dark, over real landscape',
        body: 'A near-black palette lets the night-sky and landscape photography carry the page. Solutions are split terrain by terrain, so a farmer and an expedition outfitter each find themselves within one scroll.',
      },
      {
        title: 'Hand-built and shipped',
        body: 'Product line, rental plans, process and enquiry flow — hand-written and deployed to GitHub Pages, no page builder in the stack. TODO: add a real figure here — installs completed, enquiries, or time-to-launch.',
      },
    ],
  },
  {
    name: 'FROGG Recruitment',
    img: 'screens/frogg.jpg',
    steps: [
      {
        title: 'Two audiences, one front door',
        body: 'A recruitment agency running since 2010, placing permanent, fixed-term and executive roles. Employers and candidates want opposite things from the same page, and the old site made both of them hunt.',
      },
      {
        title: 'Split the path immediately',
        body: 'The hero forks straight away — Looking for Staff, or Vacancies — so each visitor is one click from their own journey, with the agency\u2019s track record carried underneath.',
      },
      {
        title: 'Live and in service',
        body: 'Running at froggrecruit-sa.co.za with job posting, vacancy listings and candidate intake. TODO: add a real figure here — placements, listings live, or enquiries per month.',
      },
    ],
  },
];

export interface ProcessStep {
  num: string;
  title: string;
  body: string;
}

export const processSteps: ProcessStep[] = [
  {
    num: '/ 01',
    title: 'Discover',
    body: 'Who is arriving, what they need in the first ten seconds, and what the business needs them to do. Written down before a single frame exists.',
  },
  {
    num: '/ 02',
    title: 'Design',
    body: 'Figma, properly: a type scale, a grid, real colour tokens and components — so the build has something to follow instead of a picture to copy.',
  },
  {
    num: '/ 03',
    title: 'Build',
    body: 'Hand-written and responsive from the first breakpoint. Motion is added where it explains something, and it always respects reduced-motion.',
  },
  {
    num: '/ 04',
    title: 'Ship',
    body: 'Deployed, checked on a real phone, and handed over — with the source in your hands, not locked inside a builder.',
  },
];

export const EMAIL = 'wbotha.work@gmail.com';
export const GITHUB_URL = 'https://github.com/werner-dev-git';
