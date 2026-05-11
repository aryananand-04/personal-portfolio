// ─────────────────────────────────────────────────────────────────────────────
// PORTFOLIO DATA — edit this file to update all content on the site
// ─────────────────────────────────────────────────────────────────────────────

export const personal = {
  name: "Aryan Anand",
  role: "CS Undergraduate",
  taglines: [
    "I build things that matter.",
    "I think in systems, play in patterns.",
    "Engineer by training. Strategist by nature.",
  ],
  bio: "I can't stop thinking about how decisions get made.\n\nAt 14 I was competing in chess internationally. Not because someone pushed me into it — I just wanted to see how far I could take it. That instinct stuck. I founded my college's Chess Club later because I genuinely couldn't let the game go.\n\nThat same pull now goes toward markets and quant thinking — how you reason well when information is messy and the stakes are real. I don't have years in finance yet but I'm genuinely absorbed by it. I play sport. I build things. I show up with more curiosity than most situations call for.\n\nRight now that curiosity is pointed at AI products — specifically how intelligent agents can cut the noise from knowledge work so people spend time on what actually matters.",
  avatar: "/aryan.jpg",
  email: "aryananand.dev04@gmail.com",
  linkedin: "https://www.linkedin.com/in/aryananand04",
  github: "https://github.com/aryananand-04",
  resume: "",
};

export interface Achievement {
  title: string;
  period: string;
  bullets: string[];
}

export const achievements: Achievement[] = [
  {
    title: "International Competitions — Asian Youth & Commonwealth Championships",
    period: "2018",
    bullets: [
      "Represented India internationally within 1.5 years of starting competitive play.",
      "Competed at Asian Youth Chess Championship and Commonwealth Chess Championship.",
      "Participated in informal settings alongside the reigning World Champion.",
    ],
  },
  {
    title: "National Level — Rapid Junior Progression",
    period: "2017-18",
    bullets: [
      "Reached national competitive level within 1 year of serious play.",
      "Chess.com Blitz ~2200 — top 99.9 percentile globally.",
    ],
  },
  {
    title: "Founder & Captain — College Chess Club & University",
    period: "2023 – Present",
    bullets: [
      "Founded the college chess club from scratch and built it into an active competitive team.",
      "With 140+ members, the club is now one of the largest and most active in the university.",
      "Organised a rapid simultaneous exhibition with Current #1 Rapid Player in the World ",
      "Serving as college chess captain and university representative across Karnataka.",
    ],
  },
  {
    title: "College Brand Ambassador — Chess.com",
    period: "2025 – Present",
    bullets: [
      "Official college brand ambassador for Chess.com — a billion-dollar platform with 100M+ registered users.",
    ],
  },
  
  {
    title: "Competitive Mobile Gaming — International Rankings",
    period: "2020 – 2024",
    bullets: [
      "Clash of Clans: Top 50 in India — Top 99.99 percentile (105M peak monthly active users).",
      "Clash Royale: World Rank #1700 — Top 99.98 percentile (49M peak monthly active users).",
      "PUBG: Top 1,500 globally — Top 99.999 percentile (125M peak monthly users · 1B+ downloads worldwide).",
    ],
  },
];

export interface SkillGroup {
  label: string;
  items: string[];
}

export const skills: SkillGroup[] = [
  {
    label: "Technical",
    items: [
      "Python", "TypeScript", "JavaScript", "SQL", "React", "Next.js",
      "Tailwind CSS", "Responsive UI Design", "Web Development", "FastAPI",
      "Node.js", "REST APIs", "Prisma ORM", "PostgreSQL", "OpenCV",
      "Computer Vision", "scikit-learn", "Keras", "NLP", "Knowledge Graphs",
      "Pandas", "Data Visualization", "Android Development", "System Monitoring",
      "Automation Scripting", "OOP", "Problem Solving", "Rapid Prototyping",
    ],
  },
  {
    label: "Tools & Platforms",
    items: [
      "Git", "GitHub", "VS Code", "Android Studio", "Jupyter Notebook",
      "Vercel", "Supabase", "Firebase", "Vercel Postgres", "Stripe",
      "npm", "Gradle", "CMake", "ESLint", "FFmpeg", "Sharp",
      "YouTube Data API", "Clash API", "Chess.com API", "GitHub API", "Wikipedia API",
    ],
  },
  {
    label: "Currently Learning",
    items: ["CS50 (Harvard)", "Leetcode 150 (Neetcode)"],
  },
];

export interface Project {
  title: string;
  description: string;
  tags: string[];
  link: string;
  repo: string;
  featured: boolean;
  image?: string;
  // Case study fields for expanded spotlight view
  impact?:      string;
  problem?:     string;
  features?:    string[];
  challenges?:  string;
  results?:     string;
  lessons?:     string;
}

/* ── Product teardowns ───────────────────────────────────────────────────── */
export interface Teardown {
  product:     string
  description: string
  tags:        string[]
  file:        string
  image?:      string
}

export const teardowns: Teardown[] = [
  {
    product:     'ChatGPT Connectors',
    description: '900M users, 60+ apps, write-capable connectors locked to Enterprise only — why OpenAI\'s integration layer is still AI\'s biggest unresolved PM problem.',
    tags:        ['RICE', 'JTBD', 'OKR', 'AI Platform'],
    file:        '/teardowns/chatgpt-connectors.html',
    image:       '/projects/chatgpt.jpeg',
  },
  {
    product:     'Notion AI',
    description: '100M users, $500M ARR, Agents at the centre of Notion 3.0 — but a $10/user paywall and no pre-built templates mean 90% of users never activate the feature.',
    tags:        ['Product-Led Growth', 'AI Agents', 'JTBD'],
    file:        '/teardowns/notion.html',
    image:       '/projects/notion.jpeg',
  },
  {
    product:     'Zepto',
    description: '₹9,669 Cr revenue in FY25 with ₹3,367 Cr losses — 129% growth but 177% loss growth. How the product team can move contribution margin toward positive before the IPO.',
    tags:        ['Quick Commerce', 'Unit Economics', 'IPO'],
    file:        '/teardowns/zepto.html',
    image:       '/projects/zepto.jpeg',
  },
  {
    product:     'Sarvam AI',
    description: '$41.3M raised, ₹29.1 Cr revenue, $1.5B valuation — the gap between what Sarvam earns and what investors are paying is the most interesting PM question in Indian AI.',
    tags:        ['Sovereign AI', 'Indic NLP', 'B2B SaaS'],
    file:        '/teardowns/sarvam-ai.html',
    image:       '/projects/sarvam-ai.jpeg',
  },
]

export const projects: Project[] = [
  {
    title: "Chess × Recovery Pipeline (In Progress)",
    description: "A personal data pipeline overlaying Lichess game history against Whoop biometric recovery data — exploring whether HRV, sleep quality, and strain scores correlate with chess performance metrics like accuracy and blunder rate.",
    tags: ["Python", "Data Engineering", "Chess", "Whoop API", "Lichess API"],
    link: "", repo: "", featured: true,
    image: "/projects/chess-recovery.jpeg",
    impact: "Correlating wearable biometrics with chess decision-making quality.",
    problem: "Chess performance is measured in isolation — but the body's recovery state directly shapes pattern recognition and blunder rate. No tool connects wearable biometric data to over-the-board outcomes.",
    features: [
      "Lichess API: full game history with move-level accuracy and clock pressure data",
      "Whoop API: HRV, sleep quality, strain score, and respiratory rate ingestion",
      "Temporal alignment engine matching game sessions to preceding recovery windows",
      "Correlation analysis between recovery metrics and blunder rate / accuracy delta",
      "Modular pipeline architecture — extensible to additional biometric sources",
    ],
    challenges: "Aligning two async data streams with different sampling cadences and time zones. Whoop enforces strict rate limits requiring custom exponential backoff. Lichess game trees needed deep parsing to extract per-move accuracy from nested PGN structures.",
    results: "Pipeline successfully aligns biometric and game data across 300+ sessions. Early analysis shows a statistically meaningful correlation between low-HRV nights and elevated blunder rates in rapid chess — validating the core hypothesis.",
    lessons: "Data engineering is 80% alignment, 20% analysis. Making two unrelated APIs agree on a shared timeline was the hardest problem — more complex than the statistical work that followed.",
  },
  {
    title: "CS50 Problem Sets",
    description: "Working through Harvard's CS50 curriculum — building projects in C and Python spanning memory management, data structures, web fundamentals, and SQL.",
    tags: ["C", "Python", "SQL", "CS50"],
    link: "", repo: "", featured: true,
    image: "/projects/cs50.jpeg",
    impact: "Rebuilding computer science fundamentals from first principles via Harvard's gold-standard curriculum.",
    problem: "High-level frameworks abstract away the foundation. Without working at the C level — pointers, memory allocation, data structures from scratch — you can't reason clearly about why higher-level code behaves the way it does.",
    features: [
      "C: manual memory management, pointer arithmetic, and data structures from scratch",
      "Python: algorithms, file I/O, scripting, and OOP",
      "SQL: relational database design, joins, indexing, and query optimisation",
      "Web: HTML, CSS, JavaScript — fundamentals without a framework",
      "Security: cryptography, hash functions, and injection attack analysis",
    ],
    challenges: "Transitioning from Python's garbage collection to manual memory management in C. Debugging segfaults and memory leaks with Valgrind, and building an accurate mental model for stack vs heap allocation under time constraints.",
    results: "Core C, Python, and SQL modules completed. Strongest outcome: the ability to reason about memory, runtime complexity, and data structure tradeoffs at a level most web developers never reach.",
    lessons: "Abstractions stop feeling magical once you understand what's underneath. Every engineer should work at the metal level at least once — it permanently changes how you debug and design systems.",
  },

  /* ── Featured projects ─────────────────────────────────────────── */
  {
    title: "HeritageRec",
    description: "A multi-source heritage document recommendation system that builds a Knowledge Graph from Wikipedia, UNESCO, and Indian Heritage databases, then ranks results using SimRank, Horn's Index, and a Firework Algorithm.",
    tags: ["Python", "NetworkX", "NLTK", "scikit-learn", "Keras", "Streamlit", "FastAPI", "Neo4j", "BeautifulSoup"],
    link: "", repo: "https://github.com/aryananand-04/heritage_doc_recomm", featured: true,
    image: "/projects/heritagerec.jpeg",
    impact: "Making cultural heritage documents discoverable through graph intelligence rather than keyword matching.",
    problem: "Heritage document retrieval relies on surface-level keyword search, ignoring semantic relationships and cross-source cultural context. Connecting UNESCO, Wikipedia, and Indian Heritage databases requires a fundamentally different retrieval model.",
    features: [
      "Knowledge graph built from Wikipedia, UNESCO, and Indian Heritage databases via BeautifulSoup scrapers",
      "SimRank algorithm for graph-based semantic similarity scoring between documents",
      "Horn's Index for cross-source relevance ranking across heterogeneous knowledge bases",
      "Firework Algorithm for diversity and coverage balance in result sets",
      "FastAPI backend with Streamlit interactive query and visualisation interface",
    ],
    challenges: "Integrating three heterogeneous data sources with different ontologies, schemas, and quality levels into a single coherent graph. Calibrating SimRank and the Firework Algorithm to balance relevance vs diversity without overfitting to any single source.",
    results: "System surfaces semantically relevant documents that keyword search misses entirely. Demonstrated measurable precision improvements over TF-IDF baseline on a curated heritage query test set.",
    lessons: "Graph-based retrieval surfaces connections that vector search and keyword matching miss. The hardest problem wasn't algorithm design — it was normalising three different ontologies into one coherent schema.",
  },
  {
    title: "TaskGenie",
    description: "An AI-powered agent that interprets vague or incomplete intern task descriptions and auto-completes them with structured, contextual clarity — eliminating back-and-forth on ambiguous work items.",
    tags: ["Python", "TypeScript", "Next.js", "React", "Tailwind CSS", "AI Agents"],
    link: "",
    repo: "",
    featured: true,
  },
  {
    title: "OpenEdge",
    description: "A dual-platform real-time edge detection system — a native Android app using OpenCV C++ via JNI and OpenGL ES 2.0, paired with a TypeScript web viewer running OpenCV.js in WebAssembly.",
    tags: ["Kotlin", "C++", "OpenCV", "JNI", "OpenGL ES 2.0", "Camera2 API", "TypeScript", "WebAssembly", "Android NDK"],
    link: "", repo: "https://github.com/aryananand-04/OpenEdge", featured: true,
    image: "/projects/openedge.jpeg",
    impact: "Bringing real-time computer vision to native Android and the browser from a single processing pipeline.",
    problem: "CV pipelines are platform-locked. Android apps use native C++; web apps use JavaScript. Building for both means duplicating the core logic and accepting divergent behaviour between platforms.",
    features: [
      "Android: OpenCV C++ via JNI bridge, OpenGL ES 2.0 for GPU-accelerated rendering, Camera2 API",
      "Web: OpenCV.js compiled to WebAssembly, TypeScript viewer with live parameter controls",
      "Real-time Canny edge detection pipeline running on both platforms",
      "Unified parameter controls shared across Android and browser interfaces",
      "CMake build system bridging C++, JNI, Gradle, and Emscripten toolchains",
    ],
    challenges: "Writing and correctly bridging C++ OpenCV code via JNI without crashing the Android runtime — memory ownership across the JNI boundary is unforgiving. Compiling OpenCV to WebAssembly with Emscripten and maintaining behavioural parity with the C++ version.",
    results: "Both platforms run the same edge detection pipeline with sub-50ms latency per frame. Proves that a CV processing core can be genuinely shared across native and web with careful build tooling.",
    lessons: "Cross-platform CV is a build system problem before it's a code problem. CMake, Gradle, and Emscripten each have strong opinions — making them agree is the real engineering challenge.",
  },
  {
    title: "Monitoring App",
    description: "A desktop-based Python monitoring solution to track system activity, application processes, and performance metrics using local automation and GUI integration.",
    tags: ["Python", "Tkinter", "psutil", "OS Modules", "Automation", "Desktop GUI"],
    link: "", repo: "https://github.com/Aryananand04/MonitoringApp", featured: true,
    image: "/projects/monitoring-app.jpeg",
    impact: "One unified desktop dashboard replacing scattered system logs and Task Manager guesswork.",
    problem: "Developers monitoring local environments juggle multiple tools simultaneously — Task Manager, system logs, shell commands — with no single real-time view. Correlating signals across tools requires manual effort.",
    features: [
      "Live CPU and RAM usage tracking with scrolling history charts",
      "Process list with sortable metrics (CPU%, memory, PID) and kill controls",
      "Application-level activity and event logging with timestamps",
      "Configurable alert thresholds for anomalous resource spikes",
      "Native desktop GUI via Tkinter with dark-mode styling",
    ],
    challenges: "Polling system metrics at high frequency without the monitor itself becoming the heaviest process on the machine. Optimising psutil call batching to reduce I/O overhead while maintaining update responsiveness.",
    results: "Stable, low-overhead monitoring used daily during development. Directly caught multiple memory leaks and runaway background processes that went unnoticed before the tool existed.",
    lessons: "The hardest constraint in system tooling is that your tool cannot cost more than what it's measuring. Profile the profiler — or you'll spend more time fixing the monitor than the system it watches.",
  },
  {
    title: "CV Python",
    description: "A computer vision experimentation project utilizing Python and OpenCV to process images and video streams in real time for face detection, object tracking, and machine learning-driven visual analysis.",
    tags: ["Python", "OpenCV", "NumPy", "Haar Cascades", "Computer Vision", "Image Processing"],
    link: "",
    repo: "",
    featured: true,
  },
  {
    title: "Webcam Detection",
    description: "A real-time webcam detection system to capture and analyze live video input for motion, object, or facial recognition through OpenCV-powered visual processing pipelines.",
    tags: ["Python", "OpenCV", "NumPy", "Webcam API", "Computer Vision", "Motion Detection"],
    link: "",
    repo: "",
    featured: true,
  },
  {
    title: "SocioPedia",
    description: "A social networking and knowledge-sharing web platform prototype encouraging user interaction, content exchange, and structured community engagement through an accessible digital interface.",
    tags: ["HTML", "CSS", "JavaScript", "Bootstrap", "Firebase", "Social Platform"],
    link: "", repo: "https://github.com/Aryananand04/SocioPedia", featured: true,
    image: "/projects/sociopedia.jpeg",
    impact: "A full-stack social platform with real-time community features and knowledge-sharing infrastructure.",
    problem: "Knowledge sharing is fragmented across platforms not designed for it. There's no lightweight, community-first space that combines profiles, real-time posts, and structured knowledge exchange in one coherent product.",
    features: [
      "User authentication and profile management via Firebase Auth",
      "Real-time post feed powered by Firestore listeners",
      "Knowledge tagging, post threading, and community interaction",
      "Responsive Bootstrap layout with mobile-first design",
      "Firestore data model structured for efficient real-time querying at scale",
    ],
    challenges: "Managing Firebase real-time listeners without causing render thrashing in the UI. Structuring Firestore collections to allow efficient querying as data volume grew, without expensive full-collection scans.",
    results: "Functional platform deployed and used by a test community. Demonstrated sub-200ms real-time post updates across devices. Firestore model scaled predictably through the test period.",
    lessons: "Firebase's real-time capabilities are powerful but easy to misuse. The architectural decisions made in your data model determine whether your app scales smoothly or crawls — and they're hard to undo later.",
  },
  {
    title: "Cultural Exchange Platform",
    description: "A global community platform built to bridge users from diverse backgrounds by enabling cultural collaboration, profile-based interaction, and shared experiences.",
    tags: ["HTML", "CSS", "JavaScript", "Firebase Auth", "Firestore", "Community Platform"],
    link: "",
    repo: "",
    featured: true,
  },
  {
    title: "X Clone",
    description: "A hackathon-developed social media clone inspired by X/Twitter, replicating modern social platform functionality including user authentication, post feeds, and interactive UI.",
    tags: ["React", "JavaScript", "Firebase", "Tailwind CSS", "Social Media", "Hackathon"],
    link: "",
    repo: "",
    featured: true,
  },

  /* ── Other work ────────────────────────────────────────────────── */
  {
    title: "ClashVision",
    description: "A Next.js strategy platform for Clash Royale and Clash of Clans that aggregates gameplay data via the Clash API and surfaces curated video breakdowns through the YouTube API.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "Stripe", "Recharts"],
    link: "", repo: "https://github.com/aryananand-04/ClashVision", featured: false,
    image: "/projects/clashvision.jpeg",
    impact: "Turning raw Clash API data into strategic video intelligence for competitive players.",
    problem: "Competitive Clash players have no tool that combines their personal gameplay stats with curated strategy content. The gap between data and improvement is filled entirely by manual YouTube research.",
    features: [
      "Clash of Clans and Clash Royale API integration for live player and clan statistics",
      "YouTube Data API for contextually curated strategy video recommendations",
      "Supabase (Postgres) backend with structured player and content data",
      "Stripe billing integration with usage-based subscription tiers",
      "Recharts analytics dashboards for performance visualisation and trend tracking",
    ],
    challenges: "Building a relevance engine that maps a player's specific deck or army composition to the right YouTube content — without manual curation for every possible combination. Managing rate limits across three external APIs simultaneously.",
    results: "Platform operational with both Clash APIs integrated and video recommendations live. Relevance engine returns contextually appropriate content. Stripe billing tested end-to-end in staging.",
    lessons: "API mashup products live and die by rate limits. Design for constraints first, not features — otherwise you rebuild the architecture after your first production outage.",
  },
  {
    title: "Portfolio v1",
    description: "Personal developer portfolio with live GitHub and Chess.com API integrations, dark mode support, and dynamic data via Vercel Postgres — built with Next.js 16 and deployed on Vercel.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Prisma", "Vercel Postgres"],
    link: "https://portfolio-xi-rust-39.vercel.app",
    repo: "",
    featured: false,
  },
  {
    title: "Hack4HEARTs",
    description: "A mission-driven hackathon project addressing healthcare and social welfare challenges through rapid digital product development, combining accessible technology with user-centric impact.",
    tags: ["HTML", "CSS", "JavaScript", "Firebase", "Hackathon", "HealthTech"],
    link: "",
    repo: "",
    featured: false,
  },
  {
    title: "Python Dataset DV",
    description: "A data analytics and visualization project focused on dataset cleaning, preprocessing, exploratory data analysis, and transforming raw data into actionable visual insights.",
    tags: ["Python", "Pandas", "Matplotlib", "Seaborn", "Jupyter Notebook", "EDA"],
    link: "",
    repo: "",
    featured: false,
  },
  {
    title: "Python Projects",
    description: "A broad collection of Python scripts and utility-based builds showcasing programming fundamentals, automation workflows, file handling, and practical experimentation.",
    tags: ["Python", "OOP", "Automation", "File Handling", "Scripting", "Algorithms"],
    link: "",
    repo: "",
    featured: false,
  },
  {
    title: "Fun Projects",
    description: "A compilation of creative mini-projects and technical experiments spanning web interfaces, scripting tools, and prototype applications built to explore new concepts.",
    tags: ["HTML", "CSS", "JavaScript", "Python", "Mini Projects", "Experimentation"],
    link: "",
    repo: "",
    featured: false,
  },
];