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

export const EMAIL = 'wbotha.work@gmail.com';
export const GITHUB_URL = 'https://github.com/werner-dev-git';
