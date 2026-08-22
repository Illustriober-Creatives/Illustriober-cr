"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useHydrated } from "@/components/motion/useHydrated";

export function ScrollProgress() {
  const hydrated = useHydrated();
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    damping: 28,
    mass: 0.18,
    stiffness: 95,
  });

  if (!hydrated || reduceMotion) {
    return null;
  }

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-0.5 origin-left bg-[#F39314]"
      style={{ scaleX }}
    />
  );
}
