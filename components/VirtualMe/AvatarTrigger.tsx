"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface AvatarTriggerProps {
  onOpen: () => void;
}

export default function AvatarTrigger({ onOpen }: AvatarTriggerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.8 }}
      className="mb-6 flex flex-col items-center group cursor-pointer"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      aria-label="Open chat with virtual Aditya"
    >
      <div className="animate-pop-pulse w-[120px] h-[120px] md:w-[160px] md:h-[160px] rounded-full overflow-hidden glass ring-2 ring-[rgba(var(--accent-primary-rgb),0.3)] ring-offset-2 ring-offset-[var(--bg-primary)] shadow-xl transition-all duration-300 group-hover:scale-110 hover-accent-shadow-strong">
        <Image
          src="/images/avatar.jpg"
          alt="Aditya Paruchuri"
          width={160}
          height={160}
          className="w-full h-full object-cover"
          priority
        />
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="mt-3 text-xs text-gray-400"
      >
        tap to interact
      </motion.p>
    </motion.div>
  );
}
