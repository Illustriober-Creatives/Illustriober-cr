"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import styles from "./stacey.module.css";

type Activity = "date-night" | "movie-night" | "date-and-movie";
type Step = "reveal" | "question" | "plan" | "celebration" | "declined";

const activities: Array<{ value: Activity; label: string; detail: string; icon: string }> = [
  { value: "date-night", label: "Date night", detail: "Good food, good conversation, good company.", icon: "✦" },
  { value: "movie-night", label: "Movie night", detail: "Popcorn, a great film, and a little magic.", icon: "◖" },
  { value: "date-and-movie", label: "Both, please", detail: "Why pick one when we could make a whole evening of it?", icon: "♡" },
];

export function StaceyExperience() {
  const [step, setStep] = useState<Step>("reveal");
  const [photoAvailable, setPhotoAvailable] = useState(true);
  const [activity, setActivity] = useState<Activity | "">("");
  const [noDodged, setNoDodged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submitPlan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/stacey-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activity,
        preferredDate: form.get("preferredDate"),
        timeOfDay: form.get("timeOfDay"),
        foodDrink: form.get("foodDrink"),
        movieTaste: form.get("movieTaste"),
        perfectNote: form.get("perfectNote"),
      }),
    }).catch(() => null);

    setSubmitting(false);
    if (response?.ok) {
      setStep("celebration");
      return;
    }

    const payload = response ? await response.json().catch(() => null) : null;
    setError(payload?.error || "Something got tangled. Please try once more.");
  };

  return (
    <main className={styles.page}>
      <div className={styles.sparkles} aria-hidden="true"><i>✦</i><i>♡</i><i>✧</i><i>✦</i><i>♡</i></div>
      <section className={styles.card} aria-live="polite">
        {step === "reveal" && (
          <div className={styles.reveal}>
            <p className={styles.eyebrow}>For Stacey, with a little courage</p>
            <div className={styles.photoFrame}>
              {photoAvailable ? (
                <Image src="/stacey-photo.jpg" alt="A favourite photo of Stacey" width={600} height={492} priority onError={() => setPhotoAvailable(false)} />
              ) : (
                <div className={styles.photoFallback} aria-label="Photo placeholder">S</div>
              )}
            </div>
            <h1>A little something<br />made just for you.</h1>
            <button className={styles.primaryButton} onClick={() => setStep("question")}>Open it <span>→</span></button>
            <p className={styles.tiny}>P.S. I hope this makes you smile.</p>
          </div>
        )}

        {step === "question" && (
          <div className={styles.question}>
            <p className={styles.eyebrow}>A small confession</p>
            <h1>You&apos;ve been on<br /><em>my mind.</em></h1>
            <p className={styles.note}>I think you&apos;re genuinely gorgeous, and I&apos;ve been a little too shy to say it out loud. So I made this instead: would you let me take you out and make a lovely memory together?</p>
            <div className={styles.answerRow}>
              <button className={styles.primaryButton} onClick={() => setStep("plan")}>Yes, I&apos;d love to! <span>♡</span></button>
              <div className={noDodged ? styles.noAreaDodged : styles.noArea}>
                <button className={styles.noButton} onMouseEnter={() => setNoDodged(true)} onFocus={() => setNoDodged(true)} onClick={() => setStep("declined")}>No, thank you</button>
              </div>
            </div>
            {noDodged && <p className={styles.dodgeHint}>That little heart was hoping you&apos;d choose yes — but your answer matters.</p>}
          </div>
        )}

        {step === "plan" && (
          <form className={styles.planner} onSubmit={submitPlan}>
            <p className={styles.eyebrow}>The fun part</p>
            <h1>Let&apos;s make it<br /><em>your kind of lovely.</em></h1>
            <fieldset>
              <legend>Pick our adventure</legend>
              <div className={styles.activityGrid}>
                {activities.map((option) => (
                  <label className={activity === option.value ? styles.activitySelected : styles.activity} key={option.value}>
                    <input type="radio" name="activity" value={option.value} checked={activity === option.value} onChange={() => setActivity(option.value)} required />
                    <span className={styles.activityIcon}>{option.icon}</span><strong>{option.label}</strong><small>{option.detail}</small>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className={styles.formGrid}>
              <label>What day feels good?<input type="date" name="preferredDate" required /></label>
              <label>Best time<select name="timeOfDay" required defaultValue=""><option value="" disabled>Select a time</option><option value="afternoon">Afternoon</option><option value="evening">Evening</option><option value="night">Night</option></select></label>
            </div>
            <label>Food or drink you&apos;d be excited about <span>(optional)</span><input name="foodDrink" maxLength={300} placeholder="Coffee, sushi, mocktails, a hidden gem..." /></label>
            <label>Your movie taste <span>(optional)</span><input name="movieTaste" maxLength={300} placeholder="Rom-com, thriller, animation, no horror please..." /></label>
            <label>Anything that would make it extra perfect? <span>(optional)</span><textarea name="perfectNote" maxLength={1200} rows={3} placeholder="A little hint for me goes a long way." /></label>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button className={styles.primaryButton} type="submit" disabled={submitting || !activity}>{submitting ? "Sending your hints…" : "Send my little hints ♡"}</button>
          </form>
        )}

        {step === "celebration" && <div className={styles.celebration}><div className={styles.confetti} aria-hidden="true">✦ ♡ ✧ ♥ ✦ ♡</div><p className={styles.eyebrow}>Message received</p><h1>You just made<br /><em>my day.</em></h1><p className={styles.note}>I&apos;ve got your clues. Now I get to plan something worth looking forward to.</p><p className={styles.signature}>— with a very happy smile</p></div>}
        {step === "declined" && <div className={styles.declined}><p className={styles.eyebrow}>Thank you for being honest</p><h1>All good,<br /><em>truly.</em></h1><p className={styles.note}>No hard feelings at all. I hope this little page still gave you a smile, and I&apos;m wishing you the loveliest days ahead.</p><span className={styles.bigHeart}>♡</span></div>}
      </section>
    </main>
  );
}
