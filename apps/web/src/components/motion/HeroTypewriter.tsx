"use client";

import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import styles from "./HeroTypewriter.module.css";

const HOLD_DURATION_MS = 5_000;
const BETWEEN_PHRASES_MS = 320;
const TYPE_RHYTHM_MS = [82, 58, 104, 70, 92] as const;
const DELETE_RHYTHM_MS = [38, 30, 46] as const;
const FALLBACK_PHRASES = ["useful software."] as const;
const SERVICES_FALLBACK_PHRASES = ["Reliable"] as const;

type TypewriterPhase = "typing" | "holding" | "deleting" | "between";

type HeroTypewriterProps = {
  phrases: readonly string[];
  variant?: "home" | "services";
};

function getTypingDelay(phrase: string, characterIndex: number) {
  const character = phrase[characterIndex];

  if (character === " ") return 46;
  if (character === "." || character === ",") return 170;

  const rhythmIndex = (characterIndex + phrase.length) % TYPE_RHYTHM_MS.length;
  return TYPE_RHYTHM_MS[rhythmIndex];
}

function getDeletingDelay(characterIndex: number) {
  return DELETE_RHYTHM_MS[characterIndex % DELETE_RHYTHM_MS.length];
}

export function HeroTypewriter({ phrases, variant = "home" }: HeroTypewriterProps) {
  const safePhrases = phrases.length > 0
    ? phrases
    : variant === "services"
      ? SERVICES_FALLBACK_PHRASES
      : FALLBACK_PHRASES;
  const longestPhrase = useMemo(
    () => safePhrases.reduce((longest, phrase) => phrase.length > longest.length ? phrase : longest),
    [safePhrases],
  );
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [phase, setPhase] = useState<TypewriterPhase>("typing");
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const currentPhrase = safePhrases[phraseIndex % safePhrases.length];
  const displayedPhrase = currentPhrase.slice(0, characterCount);

  useEffect(() => {
    if (isPaused || shouldReduceMotion) return;

    let delay = 0;
    let advance: () => void;

    if (phase === "typing" && characterCount < currentPhrase.length) {
      delay = getTypingDelay(currentPhrase, characterCount);
      advance = () => setCharacterCount((count) => count + 1);
    } else if (phase === "typing") {
      advance = () => setPhase("holding");
    } else if (phase === "holding") {
      delay = HOLD_DURATION_MS;
      advance = () => setPhase("deleting");
    } else if (phase === "deleting" && characterCount > 0) {
      delay = getDeletingDelay(characterCount);
      advance = () => setCharacterCount((count) => count - 1);
    } else if (phase === "deleting") {
      advance = () => setPhase("between");
    } else {
      delay = BETWEEN_PHRASES_MS;
      advance = () => {
        setPhraseIndex((index) => (index + 1) % safePhrases.length);
        setPhase("typing");
      };
    }

    const timeout = window.setTimeout(advance, delay);
    return () => window.clearTimeout(timeout);
  }, [characterCount, currentPhrase, isPaused, phase, safePhrases.length, shouldReduceMotion]);

  const controlLabel = isPaused ? "Resume animated headline" : "Pause animated headline";
  const rotatingWord = (
    <span className={styles.rotator} data-paused={isPaused} data-phase={phase}>
      <span className={styles.sizer}>{longestPhrase}</span>
      <span className={styles.liveWord}>
        <em className={styles.word}>{displayedPhrase}</em>
        <span className={styles.caret} />
      </span>
      <span className={styles.reducedMotionPhrase}>{safePhrases[0]}</span>
    </span>
  );

  return (
    <div className={`${styles.shell} ${variant === "services" ? styles.services : ""}`}>
      {variant === "services" ? (
        <h1 className="font-display text-[clamp(2.975rem,calc(6vw-2px),6.075rem)] leading-[1.02] tracking-normal">
          <span className="sr-only">Reliable software, shaped around your business.</span>
          <span className={styles.servicesLine} aria-hidden="true">
            <span className={styles.servicesOpening}>{rotatingWord} software, shaped</span>
            <span className={styles.servicesTail}>around your business.</span>
          </span>
        </h1>
      ) : (
        <h1 className="max-w-4xl font-display text-5xl leading-[0.9] tracking-normal sm:text-6xl md:text-7xl lg:max-w-none lg:text-[clamp(5.1875rem,calc(7vw-5px),7.6875rem)] lg:leading-[0.84]">
          <span className="sr-only">It all starts with useful software.</span>
          <span className={styles.line} aria-hidden="true">
            <span className={styles.firstLine}>It all starts</span>
            <span className={styles.purposeLine}>
              with {rotatingWord}
            </span>
          </span>
        </h1>
      )}
      <button
        aria-label={controlLabel}
        aria-pressed={isPaused}
        className={styles.motionControl}
        onFocus={() => setIsPaused(true)}
        onClick={() => setIsPaused((paused) => !paused)}
        title={controlLabel}
        type="button"
      >
        {isPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
      </button>
    </div>
  );
}
