"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import { projects, type Project } from "@/lib/persona";

function ProjectCard({
  project,
  index,
  isInView,
  isHovered,
  onHover,
  onLeave,
}: {
  project: Project;
  index: number;
  isInView: boolean;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`relative rounded-xl overflow-hidden group cursor-pointer ${
        project.size === "large"
          ? "md:h-[500px] h-[400px]"
          : "md:h-[350px] h-[400px]"
      }`}
    >
      <div className="absolute inset-0 bg-gray-800">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      <div
        className={`absolute inset-0 flex flex-col justify-end p-6 transition-opacity duration-300 ${
          isHovered ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <h3 className="text-2xl md:text-3xl font-bold text-white z-10">
          {project.title}
        </h3>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm p-6 flex flex-col justify-between"
      >
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {project.title}
          </h3>
          <p className="text-gray-300 mb-4 leading-relaxed">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm bg-white/10 rounded-full text-gray-200 border border-white/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all duration-300 border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <Github className="w-5 h-5" />
              <span>Code</span>
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 btn-accent-solid rounded-lg text-white transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-5 h-5" />
              <span>Live Demo</span>
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const leftColumn = projects.filter((_, i) => i % 2 === 0);
  const rightColumn = projects.filter((_, i) => i % 2 === 1);

  return (
    <section
      id="projects"
      className="scroll-mt-8 md:scroll-mt-10 pt-12 md:pt-14 pb-8 md:pb-10 bg-[var(--bg-primary)]"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="pt-1 md:pt-2"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            <span className="gradient-text">Featured Projects</span>
          </h2>
          <div className="w-24 h-1 accent-gradient mx-auto mb-12" />

          <div className="flex flex-col md:flex-row gap-6">
            {[leftColumn, rightColumn].map((column, colIdx) => (
              <div key={colIdx} className="flex-1 flex flex-col gap-6">
                {column.map((project, idx) => {
                  const originalIndex = idx * 2 + colIdx;
                  return (
                    <ProjectCard
                      key={project.title}
                      project={project}
                      index={originalIndex}
                      isInView={isInView}
                      isHovered={hoveredIndex === originalIndex}
                      onHover={() => setHoveredIndex(originalIndex)}
                      onLeave={() => setHoveredIndex(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
