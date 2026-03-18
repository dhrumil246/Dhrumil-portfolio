import { NextResponse } from "next/server";

const PROFILE = {
  name: "Dhrumil Amin",
  title: "Developer. Builder. AI Enthusiast.",
  tagline: "Building AI-powered products that solve real problems — one commit at a time.",
  location: "Bharuch, Gujarat, India",
  experience: "1+ years",
  email: "dhrumilamin.645@gmail.com",
  github: "github.com/dhrumil246",
  linkedin: "https://www.linkedin.com/in/dhrumil-amin-47429a260/",
  website: "",
};

const SKILLS: Record<string, string[]> = {
  languages: ["JavaScript", "Python", "C++", "Java", "SQL"],
  frontend: ["React", "Next.js", "GSAP", "Tailwind CSS"],
  backend: ["Node.js", "Express.js", "REST APIs"],
  databases: ["MySQL", "PostgreSQL", "MongoDB"],
  tools: ["Git", "GitHub", "Docker", "OOP", "DSA"],
};

const PROJECTS = [
  {
    name: "ai-resume-analyzer",
    title: "AI Resume Analyzer",
    description:
      "Full-stack AI-powered app to analyze resumes and provide structured feedback on ATS compatibility, tone, content, and skills using NVIDIA NIM.",
    tech: ["React Router 7", "TypeScript", "TailwindCSS", "NVIDIA NIM", "IndexedDB"],
    role: "Solo Developer",
    impact: "Multi-dimensional scoring with ATS compatibility, tone, and skills analysis",
    link: "github.com/dhrumil246/ai-resume-analyzer",
    year: "2025",
  },
  {
    name: "quotmate",
    title: "QuotMate",
    description:
      "AI-powered SaaS to generate Quotations, MOMs, and Work Orders from handwritten images using OCR and LLMs, with Indian GST support and PDF export.",
    tech: ["React", "FastAPI", "PostgreSQL", "NVIDIA NIM", "OpenCV", "WeasyPrint"],
    role: "Backend Developer",
    impact: "Automated business document generation from handwritten notes via AI OCR",
    link: "github.com/dhrumil246/quotmate",
    year: "2026",
  },
  {
    name: "emodiary",
    title: "emoDiary",
    description:
      "AI-powered emotional wellness journal with voice therapy sessions, multi-label emotion tagging, and Indian language support via Groq and Sarvam AI.",
    tech: ["Next.js", "FastAPI", "Supabase", "Groq (Llama)", "Sarvam AI", "Razorpay"],
    role: "Backend Developer",
    impact: "Freemium mental wellness app supporting Hindi, Hinglish, Gujarati, and English",
    link: "https://github.com/Heet-P/Reckon_PhaseGuard",
    year: "2026",
  },
  {
    name: "blueverse",
    title: "BlueVerse",
    description:
      "Competitive quiz platform with JWT auth, team support, live leaderboards, Redis caching, and an admin panel for quiz management.",
    tech: ["React", "Node.js", "Express", "PostgreSQL", "Redis", "JWT"],
    role: "Lead Developer",
    impact: "Real-time individual and team leaderboards with rate limiting and security headers",
    link: "github.com/dhrumil246/BlueVerse",
    year: "2026",
  },
  {
    name: "globaltrotters",
    title: "GlobalTrotters",
    description:
      "Full-stack travel planning app to create itineraries, track budgets, discover destinations, and share trips publicly.",
    tech: ["Next.js", "Supabase", "TailwindCSS", "Shadcn/UI", "Chart.js"],
    role: "Backend Developer",
    impact: "End-to-end trip management with public itinerary sharing and budget breakdowns",
    link: "github.com/dhrumil246/globaltrotters",
    year: "2025",
  },
  {
    name: "ieee-charusat-sb",
    title: "IEEE CHARUSAT SB Website",
    description:
      "Official IEEE Student Branch website with immersive 3D graphics, smooth scroll animations, and Appwrite backend integration.",
    tech: ["Next.js", "TypeScript", "Three.js", "Framer Motion", "Appwrite", "TailwindCSS"],
    role: "Lead Developer",
    impact: "Production-deployed platform for official IEEE CHARUSAT activities",
    link: "github.com/dhrumil246/IEEE-Charusat-SB",
    year: "2025",
  },
  {
    name: "gsap-animation-showcase",
    title: "GSAP Animation Showcase",
    description:
      "Interactive landing page demonstrating advanced GSAP animations with timeline-based effects, scroll triggers, and smooth transitions.",
    tech: ["React", "GSAP", "TailwindCSS", "Vite"],
    role: "Solo Developer",
    impact: "Live demo showcasing professional-grade UI motion and animation techniques",
    link: "gsapprojectdhrumil.netlify.app",
    year: "2025",
  },
  {
    name: "cpp-data-analyzer",
    title: "C++ Data Analyzer",
    description:
      "Command-line tool to process CSV datasets and generate statistical insights including mean, median, std deviation, correlation, and frequency analysis.",
    tech: ["C++", "STL", "CSV Parsing", "OOP"],
    role: "Solo Developer",
    impact: "Full statistical analysis suite with data filtering and export capabilities",
    link: "github.com/dhrumil246/cpp-data-analyzer",
    year: "2025",
  },
];

const EXPERIENCE_DATA = [
  {
    company: "IEEE CHARUSAT Student Branch",
    role: "Webmaster",
    period: "2025 – Present",
    highlights: [
      "Designed, developed, and deployed the official IEEE CHARUSAT SB website using Next.js",
      "Implemented smooth UI animations and optimized page performance",
      "Managing end-to-end website maintenance, deployment, and content updates",
    ],
  },
  {
    company: "TechGenius Club, CHARUSAT",
    role: "Tech Lead",
    period: "2025 – Present",
    highlights: [
      "Serving as Tech Lead, overseeing technical initiatives and club projects",
      "Organized Techathon — designed problem statements for Track Trace and CQuest events",
    ],
  },
  {
    company: "AIML Club, CHARUSAT",
    role: "Web Team Member",
    period: "2025 – Present",
    highlights: [
      "Maintaining and enhancing the club website for reliability and responsiveness",
      "Implemented UI and performance improvements to improve usability and stability",
    ],
  },
];

const ACHIEVEMENTS = [
  "NPTEL Elite Certification in Programming in Modern C++",
  "Solved 200+ problems on LeetCode",
  "Finalist at National Level ODOO Hackathon 2025",
  "Finalist at MSBC DataQuest 2025",
  "Finalist at RECKON 7.0 2026",
  "Lead Organizer of Institute-level Line Following Robot Race",
  "Lead Organizer of Institute-level Event C-Quest"
];

export async function GET() {
  // Simulate network delay to make the boot sequence realistic
  await new Promise((resolve) => setTimeout(resolve, 800));

return NextResponse.json({
  PROFILE,
  SKILLS,
  PROJECTS,
  EXPERIENCE_DATA,
  ACHIEVEMENTS,  // 👈 add this
});
}
