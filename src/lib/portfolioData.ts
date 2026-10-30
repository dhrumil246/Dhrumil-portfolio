// Static portfolio data — imported directly, no API round-trip needed.

const PROFILE = {
  name: "Dhrumil Amin",
  title: "AI Engineer. Full-Stack Builder.",
  tagline: "Building AI-powered products that solve real problems — one commit at a time.",
  location: "Bharuch, Gujarat, India",
  experience: "1+ years",
  email: "dhrumilamin.645@gmail.com",
  github: "github.com/dhrumil246",
  linkedin: "https://www.linkedin.com/in/dhrumil-amin-47429a260/",
  website: "",
};

const SKILLS: Record<string, string[]> = {
  languages: ["Python", "TypeScript", "JavaScript", "C++", "Java", "SQL"],
  ai: ["PyTorch", "scikit-learn", "CNNs", "Conformal Prediction", "LLM Agents", "MCP", "Voice AI"],
  frontend: ["React", "Next.js", "GSAP", "Tailwind CSS"],
  backend: ["FastAPI", "Node.js", "Express.js", "REST APIs", "WebSockets"],
  databases: ["PostgreSQL", "Supabase", "MySQL", "MongoDB"],
  tools: ["Git", "GitHub", "Docker", "Twilio", "OOP", "DSA"],
};

const PROJECTS = [
  {
    name: "yieldguard",
    title: "YieldGuard",
    description:
      "Agentic AI root-cause analyser for semiconductor wafer yield failures — classifies defect patterns, scores sensor anomalies, and ranks root causes with cited evidence. Runners-up at IBM Bob AI Hackathon 2026.",
    tech: ["PyTorch", "MCP", "IBM Bob", "FastAPI", "Next.js", "Gemini", "scikit-learn"],
    role: "Lead Developer / ML Engineer",
    impact: "Custom CNN at 0.923 macro-F1; conformal prediction lifted excursion detection 34.7% → 93.9%",
    link: "github.com/Parva-28/bob-ai-hackathon-DuckDuckGo",
    year: "2026",
    // Every figure below is from the repo's RESUME_CONTEXT.md, including its
    // "do not claim" list: runners-up not winner, 4-person team, internal eval.
    caseStudy: [
      {
        heading: "THE PROBLEM",
        lines: [
          "When a fab's yield drops, engineers correlate wafer-map defect patterns, hundreds of sensor readings and past incidents by hand. It is slow, and every hour of delay means more wafers run under the same fault.",
          "We built YieldGuard in 9 days as a team of 4 for the IBM Bob AI Hackathon 2026, and placed runners-up. I led development, with about 80% of the commits: model training, the MCP server, evaluation and input validation.",
        ],
      },
      {
        heading: "WHAT I BUILT",
        lines: [
          "WaferCNN: a ResNet-style CNN trained from scratch on WM-811K wafer maps. 615K parameters, 9 defect classes.",
          "A 14-tool MCP server that IBM Bob orchestrates: classify the wafer, score sensor anomalies, retrieve similar past cases, rank root causes.",
          "Every root-cause hypothesis has to cite the sensor, case or parameter it rests on. Hypotheses without evidence are stripped at the server, before the agent ever sees them.",
          "Before the AI's ranking loads, the engineer writes down their own hypothesis first, so the tool supports their judgement instead of replacing it (cognitive forcing, Buçinca et al. 2021).",
        ],
      },
      {
        heading: "WHAT DIDN'T WORK",
        lines: [
          "A Vision Transformer with 3× the parameters scored 0.698 macro-F1 against the CNN's 0.923. I kept it in the repo as a documented negative result.",
          "The sensor anomaly detector is weak: it catches 6 of 21 failing lots. So I present it as anomaly scoring, not failure prediction, and quote recall instead of accuracy, because always guessing \"pass\" is already 93% accurate.",
        ],
      },
      {
        heading: "THE BUG THAT CHANGED THE DESIGN",
        lines: [
          "I fed the classifier an empty array. It answered \"Scratch\" with 100% confidence.",
          "A confident model on garbage input is worse than no model. I built a validation gate that rejects malformed and out-of-distribution uploads before any model runs. It rejected 8 of 8 adversarial inputs.",
        ],
      },
      {
        heading: "NUMBERS",
        lines: [
          "Macro-F1 0.858 → 0.923, from fixing a class-imbalance double-correction: a weighted sampler stacked on a weighted loss. The rarest class, Scratch, went 0.695 → 0.861.",
          "+0.0075 more from 8-view test-time augmentation, which costs nothing because a wafer is rotationally symmetric.",
          "Conformal prediction on CMP polishing data raised excursion detection from 34.7% to 93.9%, with 94.0% measured interval coverage. The cases its abstention gate refused had 1.76× the error of the ones it kept.",
          "The live agent scored 16/18 (13–16 across 5 runs) on end-to-end scenarios we wrote ourselves: an internal benchmark, not an external one.",
        ],
      },
      {
        heading: "WHAT I'D DO NEXT",
        lines: [
          "Real paired data. WM-811K and SECOM are unrelated public datasets, so our combined incidents are constructed scenarios, not real fab failures.",
          "Cross-validation instead of one held-out split, so every number above comes with error bars.",
        ],
      },
    ],
  },
  {
    name: "vaani",
    title: "Vaani",
    description:
      "AI sales agent platform that discovers and enriches leads, then places outbound calls where an AI voice agent holds a live conversation in Hindi and other Indian languages, transcribing every turn.",
    tech: ["Next.js", "FastAPI", "Supabase", "Sarvam AI", "Twilio", "WebSockets"],
    role: "Lead Developer",
    impact: "Real-time Indian-language AI voice calls over live phone lines, with streaming transcripts and barge-in",
    link: "github.com/dhrumil246/Vaani-AI",
    year: "2026",
    // From the repo's benchmarks/README.md, docs/call-log.md and fix commits,
    // all authored by Dhrumil. Benchmark caveat kept: synthetic corpus.
    caseStudy: [
      {
        heading: "THE PROBLEM",
        lines: [
          "Small Indian sales teams spend most of the day dialling. The voice bots that exist speak English, and the people they call often answer in Hindi, Gujarati or Tamil.",
          "A team of 3, about a month. I built most of the real-time voice service (about 80% of its commits) and wrote its benchmarks and live-call log.",
        ],
      },
      {
        heading: "WHAT I BUILT",
        lines: [
          "The phone pipeline: Twilio media stream → Sarvam streaming speech-to-text → LLM → Sarvam text-to-speech → back to the caller. μ-law at 8 kHz end to end, with no resampling anywhere.",
          "Honest barge-in: when the prospect interrupts, only the audio they actually heard goes into the model's context. The agent remembers what was heard, not what was queued.",
          "The loop around the call: campaigns, callbacks, live transfer to a teammate, and the outcome written back to the lead's pipeline stage.",
        ],
      },
      {
        heading: "MEASURE BEFORE BUILDING",
        lines: [
          "Before writing the call loop, I benchmarked Sarvam in English, Hindi and Gujarati: 36 utterances each, degraded through a real phone codec.",
          "Speech-to-text finalised in ~716 ms (p50) and text-to-speech started in ~190 ms. 500 ms of that STT figure was our own silence setting, a dial rather than a cost.",
          "The research warned latency spikes to 5–7 s under load. It didn't reproduce. The real limit was the account: about 3 concurrent streams, refused outright rather than slowed down. Procurement, not engineering.",
        ],
      },
      {
        heading: "WHAT REAL CALLS TAUGHT ME",
        lines: [
          "Call 2 ran entirely in English though Hindi was requested. Twilio drops query strings on stream URLs, and nothing errored. Config that silently falls back is worse than config that fails.",
          "Call 3 chopped one sentence into three turns. Hindi speakers pause mid-sentence more than English speakers, and I had shortened the silence window to save latency. Fix: 500 ms for English, 800 ms for Indian languages.",
          "Call 5: the open model wrote incoherent Hindi and leaked Cyrillic letters into Devanagari. I routed by language instead: the fast model for English, Sarvam's for Indian languages. 830 ms slower but fluent, and sounding wrong in the language the product is built around costs more than 830 ms.",
        ],
      },
      {
        heading: "BUGS ONLY A LIVE CALL FINDS",
        lines: [
          "Calls were hanging up on real people at ~30 s. Twilio's answering-machine detection timed out, guessed \"machine\", and we trusted it. Now a back-and-forth conversation overrules the guess.",
          "After one interruption, cancelled audio still counted as playing, so every later word fired another barge-in: about 25 in 11 seconds.",
          "\"We're not interested right now\" permanently disqualified the lead, while the opt-out logic deliberately refused to read that sentence as an opt-out. Two parts of the system disagreed, and the irreversible reading won. Now it doesn't.",
        ],
      },
      {
        heading: "WHAT I'D DO NEXT",
        lines: [
          "Semantic turn detection. A silence timer can't tell an unfinished Hindi sentence from a finished one; it only counts milliseconds.",
          "Re-run the benchmark on real call recordings. The corpus is Sarvam's own voice fed to Sarvam's own speech recognition, so its accuracy numbers are optimistic.",
        ],
      },
    ],
  },
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
    company: "TechGenius Club, CHARUSAT",
    role: "Tech Lead",
    period: "2025 – Present",
    highlights: [
      "Serving as Tech Lead, overseeing technical initiatives and club projects",
      "Organized Techathon — designed problem statements for Track Trace and CQuest events",
    ],
  },
  {
    company: "IEEE CHARUSAT Student Branch",
    role: "Webmaster",
    period: "2025 – 2026",
    highlights: [
      "Designed, developed, and deployed the official IEEE CHARUSAT SB website using Next.js",
      "Implemented smooth UI animations and optimized page performance",
      "Managed end-to-end website maintenance, deployment, and content updates",
    ],
  },
  {
    company: "AIML Club, CHARUSAT",
    role: "Web Team Member",
    period: "2025 – 2026",
    highlights: [
      "Maintained and enhanced the club website for reliability and responsiveness",
      "Implemented UI and performance improvements to improve usability and stability",
    ],
  },
];

const ACHIEVEMENTS = [
  "Runners-up (2nd place) at IBM Bob AI Hackathon 2026 — YieldGuard",
  "NPTEL Elite Certification in Programming in Modern C++",
  "Solved 200+ problems on LeetCode",
  "Finalist at National Level ODOO Hackathon 2025",
  "Finalist at MSBC DataQuest 2025",
  "Finalist at RECKON 7.0 2026",
  "Lead Organizer of Institute-level Line Following Robot Race",
  "Lead Organizer of Institute-level Event C-Quest",
];

export const PORTFOLIO_DATA = {
  PROFILE,
  SKILLS,
  PROJECTS,
  EXPERIENCE_DATA,
  ACHIEVEMENTS,
};

export type PortfolioData = typeof PORTFOLIO_DATA;
