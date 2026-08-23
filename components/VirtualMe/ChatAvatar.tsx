"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { AVATAR_LAYOUT_ID } from "./avatarLayoutId";

export default function ChatAvatar() {
  return (
    <div className="flex justify-center mb-4">
      <motion.div layoutId={AVATAR_LAYOUT_ID} className="w-16 h-16">
        <div className="animate-pop-pulse w-full h-full rounded-full overflow-hidden glass ring-2 ring-[rgba(var(--accent-primary-rgb),0.3)]">
          <Image
            src="/images/avatar.jpg"
            alt="Aditya Paruchuri"
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>
    </div>
  );
}
