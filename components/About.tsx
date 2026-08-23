"use client";

import { motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useCallback, useEffect, useLayoutEffect } from "react";
import { bio, timelineItems } from "@/lib/persona";

const BASE_CARD_WIDTH = 260;
const CARD_GAP = 24;
const MAX_CARD_HEIGHT = 260;
const WIDTH_STEP = 40;
const MAX_CARD_WIDTH = 2200;
const LINE_TO_CARD_GAP = 12;
const DOT_ZONE_HEIGHT = 20;
const TIMELINE_VERTICAL_PADDING = 0;
const DEFAULT_CARD_HEIGHT = 170;
const INTRO_SWEEP_DURATION_MS = 1100;

export default function About() {
  const ref = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardContentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const hasInitializedTimelinePosition = useRef(false);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [cardWidths, setCardWidths] = useState<number[]>([]);
  const [cardHeights, setCardHeights] = useState<number[]>([]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, [handleScroll]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -(BASE_CARD_WIDTH + CARD_GAP) : BASE_CARD_WIDTH + CARD_GAP,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    setCardWidths((prev) => timelineItems.map((_, index) => prev[index] ?? BASE_CARD_WIDTH));
    setCardHeights((prev) => timelineItems.map((_, index) => prev[index] ?? DEFAULT_CARD_HEIGHT));
  }, []);

  useLayoutEffect(() => {
    if (cardWidths.length === 0) return;

    const nextWidths = [...cardWidths];
    const nextHeights = [...cardHeights];
    let changed = false;
    let heightsChanged = false;

    timelineItems.forEach((_, index) => {
      const contentEl = cardContentRefs.current[index];
      if (!contentEl) return;

      const contentHeight = contentEl.getBoundingClientRect().height;
      const roundedHeight = Math.ceil(contentHeight);
      if ((nextHeights[index] ?? 0) !== roundedHeight) {
        nextHeights[index] = roundedHeight;
        heightsChanged = true;
      }
      const currentWidth = nextWidths[index] ?? BASE_CARD_WIDTH;

      if (contentHeight > MAX_CARD_HEIGHT && currentWidth < MAX_CARD_WIDTH) {
        const proportionalWidth = Math.ceil((currentWidth * contentHeight) / MAX_CARD_HEIGHT);
        const steppedWidth = Math.ceil(proportionalWidth / WIDTH_STEP) * WIDTH_STEP;
        nextWidths[index] = Math.min(MAX_CARD_WIDTH, Math.max(currentWidth + WIDTH_STEP, steppedWidth));
        changed = true;
      }
    });

    if (changed) {
      setCardWidths(nextWidths);
    }
    if (heightsChanged) {
      setCardHeights(nextHeights);
    }
  }, [cardWidths, cardHeights]);

  useEffect(() => {
    handleScroll();
  }, [cardWidths, handleScroll]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isInView || hasInitializedTimelinePosition.current) return;

    let sweepRafId = 0;

    const settle = () => {
      hasInitializedTimelinePosition.current = true;

      // Resting short of the true max would clip the latest (rightmost) card's
      // own content to reveal more of the previous one -- there's no scroll
      // position that shows the last card in full AND extra peek of the one
      // before it, since the viewport is a fixed width. So rest at the true
      // max; the sweep animation below is what carries the "there's more"
      // signal instead.
      const target = Math.max(0, el.scrollWidth - el.clientWidth);

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion || target === 0) {
        el.scrollLeft = target;
        handleScroll();
        return;
      }

      // Sweep from the earliest entry across to the latest on first view --
      // a single motion that demonstrates this scrolls, rather than relying
      // on a visitor to notice a small chevron.
      el.scrollLeft = 0;
      const start = performance.now();
      const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / INTRO_SWEEP_DURATION_MS);
        el.scrollLeft = target * easeInOutCubic(progress);
        handleScroll();
        if (progress < 1) {
          sweepRafId = window.requestAnimationFrame(step);
        }
      };
      sweepRafId = window.requestAnimationFrame(step);
    };

    // Wait for layout to settle so widths/heights are measured before computing the sweep target.
    let rafTwo = 0;
    const rafOne = window.requestAnimationFrame(() => {
      rafTwo = window.requestAnimationFrame(settle);
    });

    return () => {
      window.cancelAnimationFrame(rafOne);
      if (rafTwo) window.cancelAnimationFrame(rafTwo);
      if (sweepRafId) window.cancelAnimationFrame(sweepRafId);
    };
  }, [isInView, cardWidths, handleScroll]);

  const resolvedCardWidths = timelineItems.map((_, index) => cardWidths[index] ?? BASE_CARD_WIDTH);
  const resolvedCardHeights = timelineItems.map((_, index) => cardHeights[index] ?? DEFAULT_CARD_HEIGHT);
  const timelineTrackWidth = resolvedCardWidths.reduce((sum, width) => sum + width, 0) + (timelineItems.length - 1) * CARD_GAP;
  const firstDotInset = resolvedCardWidths[0] ? resolvedCardWidths[0] / 2 : BASE_CARD_WIDTH / 2;
  const lastDotInset =
    resolvedCardWidths[resolvedCardWidths.length - 1]
      ? resolvedCardWidths[resolvedCardWidths.length - 1] / 2
      : BASE_CARD_WIDTH / 2;
  const maxTopCardHeight = resolvedCardHeights.reduce(
    (max, height, index) => (index % 2 === 0 ? Math.max(max, height) : max),
    0
  );
  const maxBottomCardHeight = resolvedCardHeights.reduce(
    (max, height, index) => (index % 2 !== 0 ? Math.max(max, height) : max),
    0
  );
  const timelineHeight =
    maxTopCardHeight +
    maxBottomCardHeight +
    DOT_ZONE_HEIGHT +
    LINE_TO_CARD_GAP * 2 +
    TIMELINE_VERTICAL_PADDING * 2;

  return (
    <section
      id="about"
      className="scroll-mt-8 md:scroll-mt-10 pt-12 md:pt-14 pb-8 md:pb-10 relative bg-[var(--bg-primary)]"
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
            <span className="gradient-text">About Me</span>
          </h2>
          <div className="w-24 h-1 accent-gradient mx-auto mb-4" />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-gray-400 leading-relaxed text-center w-full mb-4"
          >
            {bio}
          </motion.p>

          {/* Horizontal Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative mb-2 pt-0"
          >
            {/* Scroll arrow — left */}
            <motion.button
              aria-label="Scroll left"
              onClick={() => scroll("left")}
              animate={{ opacity: canScrollLeft ? 1 : 0, pointerEvents: canScrollLeft ? "auto" : "none" }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 -translate-x-3 glass border border-white/10 hover-accent-border rounded-full p-2 text-gray-400 hover:text-white hover-accent-shadow transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            {/* Scroll arrow — right */}
            <motion.button
              aria-label="Scroll right"
              onClick={() => scroll("right")}
              animate={{ opacity: canScrollRight ? 1 : 0, pointerEvents: canScrollRight ? "auto" : "none" }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 translate-x-3 glass border border-white/10 hover-accent-border rounded-full p-2 text-gray-400 hover:text-white hover-accent-shadow transition-colors duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>

            {/* Scrollable track */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="relative overflow-x-auto timeline-scroll py-1"
              style={{ scrollSnapType: "x proximity" }}
            >
              {/* Variable-width row so wide-content cards can grow without clipping */}
              <div
                className="relative flex items-stretch"
                style={{
                  gap: `0 ${CARD_GAP}px`,
                  width: `${timelineTrackWidth}px`,
                  height: `${timelineHeight}px`,
                }}
              >
                {/* Central gradient line */}
                <div
                  className="absolute h-px -translate-y-1/2 accent-gradient-triple pointer-events-none"
                  style={{
                    left: `${firstDotInset}px`,
                    right: `${lastDotInset}px`,
                    top: "50%",
                  }}
                  aria-hidden
                />

                {timelineItems.map((item, index) => {
                  const isTop = index % 2 === 0;
                  return (
                    <motion.div
                      key={`${item.year}-${item.title}`}
                      initial={{ opacity: 0, y: isTop ? -20 : 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: isTop ? -20 : 20 }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                      className="relative z-10 h-full shrink-0"
                      style={{
                        width: `${resolvedCardWidths[index]}px`,
                        height: `${timelineHeight}px`,
                        scrollSnapAlign: "start",
                      }}
                    >
                      {/* Node is always pinned to the same Y so cards cannot shift timeline alignment */}
                      <div
                        className="absolute left-1/2 top-1/2 z-20 h-6 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                        aria-hidden
                      >
                        <div className="w-3 h-3 rounded-full accent-gradient ring-4 ring-[var(--bg-primary)] shadow-[0_0_12px_rgba(var(--accent-primary-rgb),0.5)]" />
                      </div>

                      <div
                        className="absolute left-0 right-0"
                        style={
                          isTop
                            ? { bottom: `calc(50% + ${LINE_TO_CARD_GAP}px)` }
                            : { top: `calc(50% + ${LINE_TO_CARD_GAP}px)` }
                        }
                      >
                        <div
                          ref={(el) => {
                            cardContentRefs.current[index] = el;
                          }}
                          className="glass rounded-xl p-3 md:p-4 w-full border border-white/10 hover-accent-border transition-all duration-300 hover-accent-shadow"
                        >
                          <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full accent-gradient-soft accent-text mb-2">
                            {item.year}
                          </span>
                          <h4 className="font-semibold text-white text-sm mb-1">{item.title}</h4>
                          <p className="accent-text-soft text-xs font-medium mb-1">{item.organization}</p>
                          <p className="text-gray-400 text-xs leading-relaxed mb-2">{item.description}</p>
                          {item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.tags.map((tag) => (
                                <span key={tag} className="px-2 py-0.5 text-xs bg-white/5 rounded border border-white/10 text-gray-400">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Tech Stack Marquee */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative overflow-hidden py-1"
          >
            <div className="inline-flex w-max animate-marquee">
              {[...Array(2)].map((_, setIdx) => (
                <div key={setIdx} className="flex shrink-0 items-center gap-8 px-6">
                  {[
                    { name: "Java", icon: "https://cdn.simpleicons.org/openjdk/437291" },
                    { name: "Spring Framework", icon: "https://cdn.simpleicons.org/springboot/6DB33F" },
                    { name: "Python", icon: "https://cdn.simpleicons.org/python/3776AB" },
                    { name: "FastAPI", icon: "https://cdn.simpleicons.org/fastapi/009688" },
                    { name: "React Framework", icon: "https://cdn.simpleicons.org/react/61DAFB" },
                    { name: "Node.js", icon: "https://cdn.simpleicons.org/nodedotjs/339933" },
                    { name: "AWS", icon: "https://www.vectorlogo.zone/logos/amazon_aws/amazon_aws-icon.svg" },
                    { name: "SQL", icon: "https://cdn.simpleicons.org/postgresql/4169E1" },
                    { name: "TypeScript", icon: "https://cdn.simpleicons.org/typescript/3178C6" },
                    { name: "Kafka", icon: "https://cdn.simpleicons.org/apachekafka/231F20" },
                    { name: "Docker", icon: "https://cdn.simpleicons.org/docker/2496ED" },
                    { name: "Kubernetes", icon: "https://cdn.simpleicons.org/kubernetes/326CE5" },
                    { name: "Jenkins", icon: "https://cdn.simpleicons.org/jenkins/D24939" },
                    { name: "Go", icon: "https://cdn.simpleicons.org/go/00ADD8" },
                    { name: "Cloudflare", icon: "https://cdn.simpleicons.org/cloudflare/F38020" },
                    { name: "Prometheus", icon: "https://cdn.simpleicons.org/prometheus/E6522C" },
                    { name: "Grafana", icon: "https://cdn.simpleicons.org/grafana/F46800" },
                    { name: "HTML", icon: "https://cdn.simpleicons.org/html5/E34F26" },
                    { name: "CSS", icon: "https://cdn.simpleicons.org/css/1572B6" },
                  ].map((tech) => (
                    <motion.div
                      key={`${tech.name}-${setIdx}`}
                      className="group flex flex-col items-center gap-3 shrink-0 p-5 rounded-2xl glass border border-white/10 hover-accent-border transition-all duration-300 hover-accent-shadow hover:-translate-y-1 cursor-default"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        className="flex items-center justify-center"
                      >
                        <img
                          src={tech.icon}
                          alt={tech.name}
                          className="h-14 w-14 object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                      </motion.div>
                      <span className="text-sm font-medium text-gray-400 group-hover:text-gray-200 transition-colors">
                        {tech.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
