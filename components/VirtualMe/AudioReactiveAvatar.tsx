"use client";

import Image from "next/image";
import { useEffect, useRef, type RefObject } from "react";

interface AudioReactiveAvatarProps {
  state: "idle" | "thinking" | "speaking";
  analyserRef: RefObject<AnalyserNode | null>;
}

export default function AudioReactiveAvatar({ state, analyserRef }: AudioReactiveAvatarProps) {
  const circleRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (state !== "speaking") {
      if (circleRef.current) {
        circleRef.current.style.transform = "";
        circleRef.current.style.boxShadow = "";
      }
      return;
    }

    const dataArray = new Uint8Array(128);

    const tick = () => {
      const analyser = analyserRef.current;
      if (analyser && circleRef.current) {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length;
        // Speech audio's frequency-bin average sits low relative to the
        // 0-255 range (energy concentrated in a few formant bins, not
        // spread evenly), so a linear mapping barely moves. A sqrt curve
        // with a boost makes quiet-to-moderate speech visibly reactive
        // while still clamping loud peaks to a sane max.
        const level = Math.min(1, Math.sqrt(average / 255) * 1.8);

        const scale = 1 + level * 0.18;
        const strongAlpha = 0.2 + level * 0.5;
        const softAlpha = 0.15 + level * 0.35;

        circleRef.current.style.transform = `scale(${scale})`;
        circleRef.current.style.boxShadow = `0 25px 50px -12px rgba(var(--accent-primary-rgb), ${strongAlpha}), 0 0 20px rgba(var(--accent-primary-rgb), ${softAlpha})`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (circleRef.current) {
        circleRef.current.style.transform = "";
        circleRef.current.style.boxShadow = "";
      }
    };
  }, [state, analyserRef]);

  return (
    <div className="flex justify-center mb-4">
      <div
        ref={circleRef}
        className={`w-16 h-16 rounded-full overflow-hidden glass ring-2 ring-[rgba(var(--accent-primary-rgb),0.3)] ${
          state !== "speaking" ? "animate-pop-pulse" : ""
        }`}
      >
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
