"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { motion, useInView, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { useHydrated } from "@/components/motion/useHydrated";

type RevealOptions = {
  children: ReactNode;
  delay?: number;
  y?: number;
  scale?: number;
  blur?: boolean;
  once?: boolean;
};

type ScrollRevealProps = Omit<
  HTMLMotionProps<"div">,
  "animate" | "initial" | "variants" | "whileInView"
> & RevealOptions;
type ScrollRevealListItemProps = Omit<
  HTMLMotionProps<"li">,
  "animate" | "initial" | "variants" | "whileInView"
> & RevealOptions;

const glideEase = [0.22, 1, 0.36, 1] as const;

function getRevealState({
  delay,
  y,
  scale,
  blur,
  transition,
}: Required<Pick<RevealOptions, "delay" | "y" | "scale" | "blur">> & {
  transition: ScrollRevealProps["transition"];
}) {
  return {
    variants: {
      hidden: {
        opacity: 0,
        y,
        scale,
        filter: blur ? "blur(3px)" : "blur(0px)",
      },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      },
    },
    transition: {
      duration: 0.72,
      ease: glideEase,
      delay,
      ...transition,
    },
  };
}

function useRevealVisibility(once: boolean) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const inView = useInView(ref, {
    once,
    amount: 0.18,
    margin: "0px 0px -72px 0px",
  });

  return {
    ref,
    visible: !hydrated || reduceMotion || inView,
  };
}

export function ScrollReveal(props: ScrollRevealProps) {
  const {
    children,
    className,
    delay = 0,
    y = 18,
    scale = 1,
    blur = false,
    once = true,
    transition,
    ...rest
  } = props;
  const { ref, visible } = useRevealVisibility(once);

  return (
    <motion.div
      ref={ref}
      animate={visible ? "visible" : "hidden"}
      className={className}
      initial={false}
      {...getRevealState({ delay, y, scale, blur, transition })}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function ScrollRevealListItem(props: ScrollRevealListItemProps) {
  const {
    children,
    className,
    delay = 0,
    y = 18,
    scale = 1,
    blur = false,
    once = true,
    transition,
    ...rest
  } = props;
  const { ref, visible } = useRevealVisibility(once);

  return (
    <motion.li
      ref={ref}
      animate={visible ? "visible" : "hidden"}
      className={className}
      initial={false}
      {...getRevealState({ delay, y, scale, blur, transition })}
      {...rest}
    >
      {children}
    </motion.li>
  );
}
