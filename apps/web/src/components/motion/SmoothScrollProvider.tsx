"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { cancelFrame, frame, useReducedMotion } from "framer-motion";
import { ReactLenis, type LenisRef } from "lenis/react";
import { useHydrated } from "@/components/motion/useHydrated";

type SmoothScrollProviderProps = {
  children: ReactNode;
};

const smoothScrollOptions = {
  allowNestedScroll: true,
  anchors: true,
  autoRaf: false,
  duration: 1.15,
  smoothWheel: true,
  touchMultiplier: 1,
  wheelMultiplier: 1,
};

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<LenisRef>(null);
  const hydrated = useHydrated();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!hydrated || reduceMotion) {
      return;
    }

    function update(data: { timestamp: number }) {
      lenisRef.current?.lenis?.raf(data.timestamp);
    }

    frame.update(update, true);

    return () => cancelFrame(update);
  }, [hydrated, reduceMotion]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    document.documentElement.dataset.smoothScroll = reduceMotion ? "off" : "on";

    return () => {
      delete document.documentElement.dataset.smoothScroll;
    };
  }, [hydrated, reduceMotion]);

  if (!hydrated || reduceMotion) {
    return <>{children}</>;
  }

  return (
    <>
      <ReactLenis root options={smoothScrollOptions} ref={lenisRef} />
      {children}
    </>
  );
}
