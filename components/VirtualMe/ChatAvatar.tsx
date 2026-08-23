"use client";

import Image from "next/image";

export default function ChatAvatar() {
  return (
    <div className="flex justify-center mb-4">
      <div className="animate-pop-pulse w-16 h-16 rounded-full overflow-hidden glass ring-2 ring-[rgba(var(--accent-primary-rgb),0.3)]">
        <Image
          src="/images/avatar.jpg"
          alt="Aditya Paruchuri"
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
