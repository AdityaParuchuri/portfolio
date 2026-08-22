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
