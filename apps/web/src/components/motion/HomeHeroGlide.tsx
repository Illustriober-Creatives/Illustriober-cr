"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useHydrated } from "@/components/motion/useHydrated";

type HomeHeroGlideProps = {
  copy: ReactNode;
  media: ReactNode;
};

export function HomeHeroGlide({ copy, media }: HomeHeroGlideProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 82,
    damping: 24,
    mass: 0.35,
  });
  const copyY = useTransform(smoothProgress, [0, 1], [0, -34]);
  const copyOpacity = useTransform(smoothProgress, [0, 0.82], [1, 0.78]);
  const mediaY = useTransform(smoothProgress, [0, 1], [0, 64]);
  const mediaRotate = useTransform(smoothProgress, [0, 1], [-2, 1.5]);
  const mediaScale = useTransform(smoothProgress, [0, 1], [1, 0.965]);
  const shouldReduceMotion = hydrated && reduceMotion;

  return (
    <section ref={sectionRef} className="relative mx-auto max-w-[90rem] px-5 pb-16 pt-12 md:px-8 md:pb-20 md:pt-20 lg:pb-14 lg:pt-[7.25rem]">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-10">
        <motion.div
          className="min-w-0"
          style={shouldReduceMotion ? undefined : { y: copyY, opacity: copyOpacity }}
        >
          {copy}
        </motion.div>
        <motion.div
          className="relative mx-auto w-full max-w-2xl rounded-[1.8rem] bg-white p-3 shadow-[18px_22px_0_#1F4D3D] lg:-top-[10px] lg:left-[5px] lg:mt-4 lg:max-w-none"
          style={shouldReduceMotion ? undefined : { y: mediaY, rotate: mediaRotate, scale: mediaScale }}
        >
          {media}
        </motion.div>
      </div>
    </section>
  );
}
