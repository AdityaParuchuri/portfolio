"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { AVATAR_LAYOUT_ID } from "./avatarLayoutId";

interface AvatarTriggerProps {
  onOpen: () => void;
}

export default function AvatarTrigger({ onOpen }: AvatarTriggerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ delay: 0.2, duration: 0.8 }}
      className="flex flex-col items-center group cursor-pointer"
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
      {/* This element's own transform is owned by framer-motion's layout
          projection (for the shared flight path into the modal) -- the
          idle pulse lives on the inner div instead so the two transforms
          never fight each other. */}
      <motion.div
        layoutId={AVATAR_LAYOUT_ID}
        className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] transition-transform duration-300 group-hover:scale-110"
      >
        <div className="animate-pop-pulse w-full h-full rounded-full overflow-hidden glass ring-2 ring-[rgba(var(--accent-primary-rgb),0.3)] ring-offset-2 ring-offset-[var(--bg-primary)] shadow-xl hover-accent-shadow-strong">
          <Image
            src="/images/avatar.jpg"
            alt="Aditya Paruchuri"
            width={160}
            height={160}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="animate-text-pulse mt-3 text-xs text-gray-400"
      >
        Tap To Interact
      </motion.p>
    </motion.div>
  );
}
