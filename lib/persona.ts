export const bio =
  "I'm an ever-curious software engineer with over 3 years of experience building distributed, scalable systems, RESTful APIs, and AI-powered platforms using Java, Python, Spring Boot, and TypeScript. Proficient in event-driven architectures with Kafka, cloud-native deployments on AWS with Kubernetes, and integrating Large Language Models into production systems. Experienced in delivering full-stack solutions with React and Node.js, implementing CI/CD pipelines, and maintaining high-availability systems with comprehensive observability.";

export interface TimelineItem {
  year: string;
  title: string;
  organization: string;
  description: string;
  tags: string[];
  type: "education" | "experience";
}

export const timelineItems: TimelineItem[] = [
  {
    year: "2016-2020",
    title: "Bachelor of Technology in Information and Communication Technology",
    organization: "Dhirubhai Ambani Institute of Information and Communication Technology",
    description: "Undergraduate degree spanning coursework in Computer Science, Mathematics, and Electronics.",
    tags: ["Data Structures and Algorithms", "Computer Netwroks", "Operating Systems", "Database Management Systems", "Computer Organization and Architecture"],
    type: "education",
  },
  {
    year: "2020 - 2020",
    title: "Internship - Software Developer",
    organization: "Defense Research and Development Laboratory",
    description: "Engineered a high-throughput Go telemetry pipeline and fault-tolerant gRPC microservices, then built secure TypeScript/Node.js APIs and React dashboards to enable real-time, reliable monitoring and faster decision-making for mission-critical systems.",
    tags: ["Go", "Typescript", "Node.js", "React", "gRPC"],
    type: "experience",
  },
  {
    year: "2020 - 2022",
    title: "Associate Software Development Engineer",
    organization: "Publicis Sapient",
    description: "Built and scaled high-availability Java/Spring Boot/Kafka microservices, ETL pipelines, and a React vendor portal on AWS, enabling reliable real-time processing, faster analytics workflows, and stronger delivery across cross-functional Agile teams.",
    tags: ["Java", "Spring Boot", "Kafka", "AWS", "React", "PostgreSQL"],
    type: "experience",
  },
  {
    year: "2022 - 2024",
    title: "Master of Science in Information Technology",
    organization: "Arizona State University",
    description: "Masters degree in Information Technology with a focus on distributed systems, cloud computing, and artificial intelligence.",
    tags: ["Distributed Computing", "Data Engineering", "Cloud Infrastructure and Computing", "NLP", "Project Management"],
    type: "education",
  },
  {
    year: "2024 - present",
    title: "Software Engineer",
    organization: "Plaid",
    description: "Architected AI-enabled Java/Spring Boot and Python microservices with secure REST/event-driven APIs, scalable AWS/Kubernetes deployment, and React/TypeScript operational dashboards to power reliable fraud detection, risk scoring, and workflow automation.",
    tags: ["Java", "Spring Boot", "Python", "Typescript", "AWS", "React", "PostgreSQL", "CI/CD", "LLM", "gRPC"],
    type: "experience",
  },
];

export interface Project {
  title: string;
  description: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  image: string;
  size: "large" | "small";
}

export const projects: Project[] = [
  {
    title: "Prior Authorization Engine",
    description:
      "Backend prior authorization engine that ingests FHIR patient data, normalizes it, and uses a rule-based system to evaluate treatment eligibility and identify missing clinical requirements.",
    tags: ["Python", "FastAPI", "FHIR", "EHR"],
    githubUrl: "https://github.com/AdityaParuchuri/PriorAuth-Engine",
    image: "/images/project-1.jpg",
    size: "large",
  },
  {
    title: "AI Powered Survey Bot",
    description:
      "A conversational survey bot that runs multi-turn surveys over SMS/chat, using an LLM (Claude via AI Gateway) to interpret free-text answers against a structured question schema, with response storage, survey/session config, and long-term conversational memory across retakes.",
    tags: ["TypeScript", "Cloudflare", "Claude - AI Gateway", "Zep Cloud"],
    image: "/images/project-2.jpg",
    size: "small",
  },
  {
    title: "Show Me What You Got",
    description:
      "AI-powered movie and TV recommendation web app that understands natural-language preferences and returns personalized picks with rich metadata, trailers, and a polished responsive interface.",
    tags: ["Javascript", "Generative AI", "OpenRouter API", "HTML", "CSS"],
    githubUrl: "https://github.com/AdityaParuchuri/showMeWhatYouGot",
    image: "/images/project-3.jpg",
    size: "small",
  },
  {
    title: "Live Collab",
    description:
      "A real-time collaborative notes app that lets multiple users co-edit the same document concurrently over WebSockets (Socket.io), using Yjs CRDTs to merge simultaneous edits deterministically without locking or last-write-wins data loss, with live presence (avatar chips, per-line cursor indicators), debounced auto-save to MongoDB, and anonymous guest access via shareable document links — no accounts required.",
    tags: ["TypeScript", "Node.js", "Express", "WebSockets (Socket.io)", "MongoDB"],
    githubUrl: "https://github.com/AdityaParuchuri/live-collab",
    liveUrl: "https://live-collab-z46r.onrender.com",
    image: "/images/project-4.jpg",
    size: "large",
  },
];

export function buildSystemPrompt(): string {
  const timelineText = timelineItems
    .map(
      (item) =>
        `- ${item.year}: ${item.title} at ${item.organization} (${item.type}). ${item.description}`
    )
    .join("\n");

  const projectsText = projects
    .map((project) => `- ${project.title}: ${project.description}`)
    .join("\n");

  return `You are speaking as Aditya Paruchuri, answering questions from visitors on your personal portfolio website. Always answer in first person, as if you are Aditya himself talking to the visitor.

Keep answers concise and conversational — 2 to 4 sentences — since they are spoken aloud to the visitor, not just displayed as text.

Base every answer only on the background below. Don't invent, guess, or fabricate any facts, dates, employers, or details that aren't included here — if you don't know something, say so honestly rather than making it up.

If a question is off-topic or inappropriate (unrelated to your background, projects, or experience), decline politely and redirect the conversation back to your work.

## About

${bio}

## Background

${timelineText}

## Projects

${projectsText}`;
}
