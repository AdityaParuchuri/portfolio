"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";
import SpotlightGrid from "./SpotlightGrid";
import AvatarTrigger from "./VirtualMe/AvatarTrigger";
import ChatModal from "./VirtualMe/ChatModal";

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative"
    >
      <SpotlightGrid />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <AnimatePresence>
            {!isModalOpen && (
              <AvatarTrigger key="avatar-trigger" onOpen={() => setIsModalOpen(true)} />
            )}
          </AnimatePresence>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
          >
            <span className="gradient-text">Aditya Paruchuri</span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-3xl md:text-5xl lg:text-6xl font-semibold text-gray-300 mb-8"
          >
            Full-Stack Software Engineer
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <button
              onClick={() => scrollToSection("projects")}
              className="btn-primary"
            >
              View My Work
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="btn-secondary"
            >
              Get In Touch
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex gap-6 justify-center"
          >
            <a
              href="https://github.com/AdityaParuchuri"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 glass rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-110"
              aria-label="GitHub"
            >
              <Github className="w-6 h-6" />
            </a>
            <a
              href="https://www.linkedin.com/in/aditya-paruchuri/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 glass rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-110"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a
              href="mailto:saiaditya.paruchuri@gmail.com"
              className="p-3 glass rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-110"
              aria-label="Email"
            >
              <Mail className="w-6 h-6" />
            </a>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <button
          onClick={() => scrollToSection("about")}
          className="animate-bounce p-2 rounded-full glass hover:bg-white/10 transition-colors duration-300"
          aria-label="Scroll to next section"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
      </motion.div>

      <ChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
