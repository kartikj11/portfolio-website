/**
 * Canonical resume content, extracted verbatim from MASTER_RESUME.md.
 * Components import from this file; do not hardcode copy in JSX.
 * Copy rewrites happen at the component layer, not here.
 */

export type Profile = {
  name: string;
  location: string;
  email: string;
  phone: string;
  links: {
    linkedin: string;
    github: string;
  };
};

export type Education = {
  school: string;
  location: string;
  degree: string;
  gpa: string;
  period: string;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  location: string;
  period: string;
  startYear: number;
  endYear: number | "Present";
  bullets: string[];
  /**
   * Editorial prose rewrite of the role, authored for the site.
   * Each string is one paragraph. Content is grounded in `bullets`
   * and MASTER_RESUME.md — no invented metrics, systems, or dates.
   */
  narrative: string[];
};

export type Project = {
  id: string;
  title: string;
  stack: string[];
  description: string;
  client?: string;
  /**
   * Curated stack (≤6) shown in the Selected Builds mono line. When
   * omitted, `stack` is used. Kept separate so the full stack from the
   * resume stays intact in `stack` for later surfaces.
   */
  featuredStack?: string[];
  /**
   * Short editorial paragraph (~2 sentences). Third-person, describes
   * the system, not the career. Grounded in MASTER_RESUME.md.
   */
  narrative?: string;
  /**
   * If true, surfaced in the Selected Builds section. Curation lives in
   * the data layer; UI reads projects.filter(p => p.featured).
   */
  featured?: boolean;
};

export type SkillGroup = {
  label: string;
  items: string[];
  highlighted?: string[];
};

export type Achievement = {
  title: string;
  description: string;
};

export type HeroStat = {
  id: string;
  value: string;
  label: string;
  source: string;
};

export const profile: Profile = {
  name: "Kartik Jindal",
  location: "Bangalore, India",
  email: "Jkartik156@gmail.com",
  phone: "+91 9314877175",
  links: {
    linkedin: "https://www.linkedin.com/in/kartik-jindal-723113206/",
    github: "https://github.com/kartikj11",
  },
};

export const education: Education[] = [
  {
    school: "SRM Institute of Science and Technology",
    location: "Kattankulathur, Tamil Nadu",
    degree:
      "B.Tech, Computer Science with Specialisation in Cyber Security",
    gpa: "9.01",
    period: "September 2020 – June 2024",
  },
];

export const experience: Experience[] = [
  {
    id: "intuit",
    company: "Intuit",
    role: "CW DevOps Engineer",
    location: "Bangalore, India",
    period: "September 2025 – Present",
    startYear: 2025,
    endYear: "Present",
    bullets: [
      "Built and maintained cloud infrastructure using **AWS CloudFormation**.",
      "Updated DevOps codebases to comply with **SOX** and enterprise compliance standards, improving logging and audit readiness.",
      "Developed automation workflows using **StackStorm** to streamline operations and incident response.",
      "Maintained and operated enterprise-grade DevTools platforms including **GitHub Enterprise, JFrog Enterprise, and Jenkins Enterprise**, ensuring high availability and reliability for development teams.",
      "Reduced load on **GitHub Enterprise by 15.5% (~120K requests/hour)** over 3 months by profiling and identifying top consumers, then driving targeted optimization recommendations.",
      "Developed **audit automation tools for Just-In-Time (JIT) access** on GitHub, strengthening access governance and reducing manual audit overhead.",
      "Built a **telemetry service for golden signals** on GitHub instances using **Telegraf** and **Starlark**, enabling real-time observability of latency, traffic, errors, and saturation metrics.",
    ],
    narrative: [
      "My day job is keeping the developer platform boring — GitHub Enterprise, JFrog Enterprise, and Jenkins Enterprise, the boxes every engineer at the company quietly depends on. Cloud infrastructure is shaped with AWS CloudFormation; the codebase around it is being pulled into SOX and enterprise-compliance posture, which mostly means tightening logging and making audit trails something an auditor can actually read.",
      "The load-reduction work on GitHub Enterprise started as a profiling exercise. Three months of watching traffic, isolating the top consumers, and walking specific teams through targeted optimizations — not a rewrite, a conversation. The 120K requests an hour that stopped hitting the platform did so because the callers changed, not because the platform did.",
      "Around that, a few smaller systems. A telemetry service for the golden signals on GitHub instances, written against Telegraf with Starlark for the shaping logic, so latency, traffic, errors, and saturation become something a dashboard can answer for. StackStorm workflows for the operational edges — the steps an on-call would otherwise run by hand. And an audit tool for Just-In-Time access on GitHub, built so access reviews stop being a manual spreadsheet exercise.",
    ],
  },
  {
    id: "celebal",
    company: "Celebal Technologies",
    role: "Cloud Infra and Security Junior Associate",
    location: "Jaipur, Rajasthan",
    period: "August 2024 – August 2025",
    startYear: 2024,
    endYear: 2025,
    bullets: [
      "Created **multi-stage CI/CD pipelines in Azure DevOps** to deploy infrastructure and application layers with environment-specific variables, approval gates, and compliance checks.",
      "Streamlined deployment of **Kubernetes**-based workloads in **Azure Kubernetes Service (AKS)** using **Helm charts** and integrated **Nginx ingress controllers** for scalable traffic routing.",
      "Implemented **Hub-and-Spoke network architectures** in Azure using **Terraform** and Azure DevOps.",
      "Automated end-to-end deployment of enterprise-grade infrastructure using **modular Terraform**, enabling repeatable, auditable provisioning across environments.",
      "Conducted research and development on Azure services, including **Azure Cognitive Services, AI Service, App Gateway, WAF, Firewall, and Azure Kubernetes Service (AKS)**. Gained experience in Landing Pages and Infra data flows.",
      "Implemented an **AI Chatbot using Azure API Management (APIM)** and extended **Retrieval-Augmented Generation (RAG)** capabilities using **Azure AI Search**.",
      "Specialised in the **security and networking aspects of infrastructure**, investigating Azure's data storage, **Azure Monitor, Log Analytics, Diagnostic settings**, and troubleshooting methods.",
      'Mastered **Terraform Automation** to design complex architectures, such as **"Avanos,"** which included **secure site-to-site connections** to datacenters, integration with **Azure Data Factory, Data Lake, Synapse**, and end-to-end data visualization in **PowerBI**. Achieved full data privacy through the use of **Azure Private Endpoints and Private DNS Zones**.',
    ],
    narrative: [
      "A year on the Azure side of the fence, mostly writing Terraform for clients who needed their infrastructure to be repeatable before it could be anything else. Modular Terraform as the substrate; multi-stage Azure DevOps pipelines on top — environment-specific variables, approval gates, compliance checks wired into the same definition that did the deploy. Kubernetes workloads ran on AKS, packaged with Helm, fronted by Nginx ingress.",
      "The architecture I spent the most time on was an engagement called Avanos — a private data estate stitched across site-to-site links from Azure back into the customer's datacenters, then through Data Factory, Data Lake, and Synapse, ending in PowerBI. Every hop was designed to never leave private space: Private Endpoints and Private DNS Zones carried the traffic. The Hub-and-Spoke work, the APIM-fronted RAG chatbot over Azure AI Search, the WAF and firewall posture — all of it came from the same instinct, which is that security and networking aren't a late-stage concern, they're the shape of the diagram.",
    ],
  },
  {
    id: "wise-work",
    company: "Wise Work",
    role: "Software Engineer Intern",
    location: "Bangalore, India",
    period: "February 2023 – July 2024",
    startYear: 2023,
    endYear: 2024,
    bullets: [
      "Developed an infrastructure-focused **MudBlazor** project aimed at visualising, evaluating, and managing cloud databases for enterprise clients. Integrated **advanced predictive analytics algorithms** to proactively identify and mitigate potential issues, ensuring smooth operations and minimal downtime.",
      "Built and integrated a back-end system for **PwC's regulatory repository and ad-hoc reporting platform**, leveraging **Azure DB** and **.NET 8** to enable advanced filtering, seamless front-end integration, and improved data management.",
      "Spearheaded **ChatGPT API** model creation, enhancing the function of internal servers and document management systems.",
    ],
    narrative: [
      "First real engineering job, sitting between the application and the database, learning what production actually asks of you. The largest piece was a MudBlazor tool that gave enterprise clients a view into their cloud databases — inventory, health, the usual — plus a predictive layer meant to catch problems before an on-call did.",
      "The rest of the time went to a regulatory-repository and ad-hoc reporting backend for a PwC engagement, built on Azure DB and .NET 8, and some early work wiring ChatGPT's API into internal servers and document systems back when that still felt unfamiliar.",
    ],
  },
];

export const skills: SkillGroup[] = [
  {
    label: "Programming Languages",
    items: ["Python", "C/C++", "PL/SQL"],
  },
  {
    label: "Software Development",
    items: ["ReactJS", "Flask", "Node.JS", "HTML/CSS/JS"],
  },
  {
    label: "Database Management",
    items: ["MySQL", ".NET 8", "MongoDB", "Azure DB"],
  },
  {
    label: "Cloud Infrastructure",
    items: [
      "Terraform",
      "AWS CloudFormation",
      "Azure Cognitive Services",
      "Azure IaaS",
      "Azure Data Factory",
      "Azure Data Lake",
      "Azure Synapse",
      "Azure Key Vault",
      "Azure Automation",
      "Azure API Management (APIM)",
      "Azure AI Search",
      "Azure Private Endpoints",
      "Azure Private DNS Zones",
    ],
    highlighted: ["Terraform", "AWS CloudFormation"],
  },
  {
    label: "DevOps & Infrastructure",
    items: [
      "Terraform",
      "Azure Services",
      "Kubernetes",
      "Git",
      "Docker",
      "StackStorm",
      "Helm",
      "Nginx",
      "MudBlazor",
      "PowerShell",
    ],
    highlighted: ["Kubernetes", "Docker", "StackStorm"],
  },
  {
    label: "DevTools Platforms",
    items: ["GitHub Enterprise", "JFrog Enterprise", "Jenkins Enterprise"],
    highlighted: ["GitHub Enterprise", "JFrog Enterprise", "Jenkins Enterprise"],
  },
  {
    label: "CI/CD & Pipeline Management",
    items: [
      "Azure DevOps",
      "YAML",
      "GitLab CI/CD",
      "GitHub Actions",
      "Jenkins",
    ],
    highlighted: ["Azure DevOps"],
  },
  {
    label: "Cyber Security Tools and Technologies",
    items: [
      "NMAP",
      "Steganography",
      "Metasploit",
      "BurpSuite",
      "Shogan",
      "Azure Firewall",
      "WAF",
      "App Gateway",
    ],
  },
  {
    label: "Observability & Compliance",
    items: [
      "Telegraf",
      "Starlark",
      "Golden Signals Telemetry",
      "Azure Monitor",
      "Log Analytics",
      "Diagnostic Settings",
      "SOX Compliance",
      "JIT Access Auditing",
    ],
    highlighted: ["Telegraf", "Starlark"],
  },
];

export const projects: Project[] = [
  {
    id: "velocity-engine",
    title: "Velocity Engine for Intuit",
    client: "Intuit",
    stack: ["StackStorm", "MongoDB", "SSO"],
    featuredStack: ["StackStorm", "MongoDB", "SSO"],
    featured: true,
    narrative:
      "A custom StackStorm deployment inside Intuit, extended with a bespoke UI layer, role-based access controls, and MongoDB-backed state. Built as a platform for end-to-end workflow automation across internal operations — the shared substrate the automations themselves live on, not any one of them.",
    description:
      "A custom StackStorm deployment internally named Velocity Engine. SSO integration, a custom UI layer, MongoDB-backed controls, and end-to-end workflow automation for internal operations.",
  },
  {
    id: "petronas",
    title: "Cloud Infrastructure-as-Code Deployment for Petronas",
    client: "Petronas",
    stack: ["Terraform", "Helm", "HTML/CSS/JS", "YAML"],
    featuredStack: ["Terraform", "Helm", "Kubernetes", "Azure", "YAML"],
    featured: true,
    narrative:
      "An Infrastructure-as-Code framework on Azure for Petronas, with Terraform as the substrate and application delivery handled through Kubernetes and Helm. Built to be reusable — the scaffolding the rest of the engagement could lean on, not a one-off deploy.",
    description:
      "Led the design and deployment of a robust **Infrastructure-as-Code (IaC)** framework on Azure for Petronas, leveraging **Terraform** to provide secure, reusable cloud infrastructure. Enhanced deployment velocity and reliability by integrating **Kubernetes and Helm** for seamless application delivery at scale.",
  },
  {
    id: "inspiro",
    title: "Automated SFTP-to-Azure Data Ingestion Pipeline for Inspiro",
    client: "Inspiro",
    stack: ["Terraform", "YAML", "Azure Data Factory"],
    featuredStack: [
      "Terraform",
      "Azure Data Factory",
      "Azure Blob Storage",
      "YAML",
    ],
    featured: true,
    narrative:
      "An Azure Data Factory pipeline for Inspiro, ingesting files continuously from a secure SFTP endpoint into Azure Blob Storage. Provisioned through Terraform and wired into a CI/CD flow — the kind of pipeline that should run for years without being touched.",
    description:
      "Built a production-grade **Azure Data Factory** pipeline for Inspiro to continuously ingest files from a secure **SFTP server into Azure Blob Storage**. Focused on secure data transit, access control, and operational reliability within a **CI/CD-driven infrastructure**.",
  },
  {
    id: "hdfc",
    title: "Auto-Rotate Azure Key Vault Secrets for HDFC",
    client: "HDFC",
    stack: [
      "PowerShell",
      "Azure Automation",
      "Terraform",
      "Azure Key Vault",
    ],
    featuredStack: [
      "Terraform",
      "Azure Automation",
      "Azure Key Vault",
      "PowerShell",
    ],
    featured: true,
    narrative:
      "A policy-driven secret rotation loop for HDFC, running on Azure Automation against their Key Vaults. Everything provisioned through Terraform; the rotation itself scheduled and access-controlled, so the operation that used to be a calendar reminder became infrastructure.",
    description:
      "Delivered an automated solution for HDFC to rotate **Azure Key Vault secrets**, ensuring secure, policy-driven key updates and compliance. Provisioned all resources with **Terraform** and enabled scheduled, access-controlled secret management using **Azure Automation** — reducing manual efforts and boosting security for critical cloud workloads.",
  },
  {
    id: "finansier",
    title: "Finansier: Business Dashboard Web App",
    featured: false,
    stack: [
      "ReactJs",
      "NextJs",
      "MongoDB",
      "Helmet",
      "Morgan",
      "CORS",
      "dotenv",
      "Material-UI",
      "Redux",
      "Recharts",
      "Vite",
      "TypeScript",
    ],
    description:
      "Developed a responsive business dashboard web app using **React.js, Material-UI, and Recharts**. Key features include responsive design, customizable components, interactive charts, and theming options. Implemented a grid layout for adaptability across screen sizes, showcasing historical revenue data and a **linear regression model**. Utilised Material-UI AppBar, Recharts line chart, and a table for displaying detailed monthly and daily data. Backend includes **RESTful API endpoints** fetching data from **MongoDB** (KPI, Product, Transaction collections) and follows best coding practices.",
  },
  {
    id: "absenteeism",
    title: "AI-Powered Absenteeism Predictor",
    featured: false,
    stack: ["Python", "HTML", "CSS", "JS"],
    description:
      "Engineered a predictive absenteeism model using **AdaBoost, XGBoost, and Random Forest Regressor**, amalgamating HR analysis, surveys, and sentiment data. Employed advanced preprocessing to yield insights for reducing absenteeism, enhancing employee satisfaction, and refining HR strategies.",
  },
  {
    id: "pixel-cloak",
    title: "Pixel Cloak: Steganography for Secure Communication",
    featured: false,
    stack: ["Python", "HTML", "CSS", "JavaScript"],
    description:
      "Implemented secure communication protocols through **advanced encryption and hashing algorithms**. Strengthened defense mechanisms against potential security threats, encompassing **man-in-the-middle and passive attacks**.",
  },
  {
    id: "real-estate",
    title: "Real Estate Price Predictor",
    featured: false,
    stack: ["Python"],
    description:
      "Developed a predictive model for real estate pricing. Utilises specific housing features for price prediction. Employs **data analysis and predictive modelling techniques**. Aids in informed decision-making for buyers and sellers.",
  },
  {
    id: "ogani",
    title: "OGANI — E-commerce for Farmers",
    featured: false,
    stack: [
      "HTML",
      "CSS",
      "SCSS",
      "Tailwind",
      "JavaScript",
      "Node.JS",
      "SQL",
    ],
    description:
      "An e-commerce website built for farmers to cut out middlemen and increase generated revenue. Built with HTML, CSS, SCSS, Tailwind, JavaScript, and a **Node.JS** backend.",
  },
  {
    id: "python-minor",
    title: "Python Minor Projects",
    featured: false,
    stack: ["Python", "SQL"],
    description:
      "Developed Python projects including a **Keylogger**, implementation of ciphers (**AES, DES, SHA-256, RSA**), and **password generator**, focusing on cybersecurity applications. Additionally created diverse projects like a **Hotel Management System, Voice Assistant**, and **Automation of Dino game**, showcasing versatility and technical proficiency.",
  },
];

/**
 * The 16 items the Marquee renders. Each entry is something already named
 * by the site — Hero metadata, Build Log prose, or Selected Builds stacks —
 * not everything on the resume. Ordering is intentional: IaC → runtime →
 * automation → DevTools platforms → CI/CD → Azure → data → observability →
 * scripting. The loop carries a narrative even though it's infinite.
 */
export const featuredSkills: string[] = [
  "Terraform",
  "AWS CloudFormation",
  "Kubernetes",
  "Helm",
  "StackStorm",
  "GitHub Enterprise",
  "JFrog",
  "Jenkins",
  "Azure DevOps",
  "Azure Data Factory",
  "Azure Key Vault",
  "Azure",
  "MongoDB",
  "Telegraf",
  "Starlark",
  "PowerShell",
];

export const achievements: Achievement[] = [
  {
    title: "Excellence Scholarship",
    description:
      "Awarded by SRM Institute of Science and Technology to students who have performed outstandingly in academia.",
  },
];

export const heroStats: HeroStat[] = [
  {
    id: "github-load",
    value: "15.5%",
    label: "GitHub Enterprise load, reduced",
    source: "Intuit · 3 months",
  },
  {
    id: "github-rph",
    value: "~120K",
    label: "requests per hour, saved",
    source: "profiled. optimized. shipped.",
  },
];
