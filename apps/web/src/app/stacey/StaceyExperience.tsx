"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./stacey.module.css";

type Activity = "date-night" | "movie-night" | "date-and-movie";
type Step = "reveal" | "question" | "activity" | "movie" | "schedule" | "food" | "snacks" | "note" | "celebration" | "declined";

const photos = [
  "/stacey/stacey-1.jpg",
  "/stacey/stacey-2.jpg",
  "/stacey/stacey-3.jpg",
  "/stacey/stacey-4.jpg",
];

const activities: Array<{ value: Activity; label: string; detail: string; icon: string }> = [
  { value: "date-night", label: "Date night", detail: "Good food, good conversation, good company.", icon: "✦" },
  { value: "movie-night", label: "Movie night", detail: "A great film, snacks, and a little magic.", icon: "◖" },
  { value: "date-and-movie", label: "Both, please", detail: "A whole lovely evening, from start to finish.", icon: "♡" },
];

const movies = [
  { title: "End of Oak Street", times: ["12:00 pm", "4:00 pm", "8:30 pm"] },
  { title: "Spider-Man", times: ["12:00 pm", "3:00 pm", "6:00 pm", "8:30 pm"] },
  { title: "Above & Below", times: ["2:00 pm"] },
  { title: "Memory of Princess Mumbo", times: ["6:00 pm"] },
  { title: "Zootopia 2", times: ["12:00 pm", "2:00 pm", "4:00 pm", "6:00 pm", "8:00 pm"] },
  { title: "The Dog Stars", times: ["Choose at the cinema"] },
];

const foodChoices = ["Sushi", "Pizza", "Pasta", "Burgers", "Nyama choma", "Coffee & cake"];
const snackChoices = ["Salted popcorn", "Sweet popcorn", "Nachos", "Chocolate", "Soda", "Something else"];

export function StaceyExperience() {
  const [step, setStep] = useState<Step>("reveal");
  const [activity, setActivity] = useState<Activity | "">("");
  const [movieTitle, setMovieTitle] = useState("");
  const [movieShowtime, setMovieShowtime] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [food, setFood] = useState("");
  const [foodNote, setFoodNote] = useState("");
  const [snacks, setSnacks] = useState<string[]>([]);
  const [perfectNote, setPerfectNote] = useState("");
  const [noDodged, setNoDodged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const photoIndex: Record<Step, number> = { reveal: 0, question: 0, activity: 1, movie: 2, schedule: 3, food: 1, snacks: 2, note: 3, celebration: 0, declined: 0 };
  const isMoviePlan = activity === "movie-night" || activity === "date-and-movie";
  const isDatePlan = activity === "date-night" || activity === "date-and-movie";
  const activeMovie = movies.find((movie) => movie.title === movieTitle);

  const nextAfterActivity = () => setStep(isMoviePlan ? "movie" : "schedule");
  const nextAfterMovie = () => setStep("schedule");
  const nextAfterSchedule = () => setStep(isDatePlan ? "food" : "snacks");
  const nextAfterFood = () => setStep(isMoviePlan ? "snacks" : "note");

  const goBack = () => {
    const previous: Partial<Record<Step, Step>> = {
      activity: "question",
      movie: "activity",
      schedule: isMoviePlan ? "movie" : "activity",
      food: "schedule",
      snacks: isDatePlan ? "food" : "schedule",
      note: isMoviePlan ? "snacks" : "food",
    };
    const target = previous[step];
    if (target) setStep(target);
  };

  const toggleSnack = (snack: string) => {
    setSnacks((current) => current.includes(snack) ? current.filter((item) => item !== snack) : [...current, snack]);
  };

  const submitPlan = async () => {
    setError("");
    setSubmitting(true);
    const response = await fetch("/api/stacey-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activity,
        preferredDate,
        timeOfDay,
        foodDrink: [food, foodNote].filter(Boolean).join(" — "),
        movieTitle,
        movieShowtime,
        snacks,
        perfectNote,
      }),
    }).catch(() => null);
    setSubmitting(false);
    if (response?.ok) return setStep("celebration");
    const payload = response ? await response.json().catch(() => null) : null;
    setError(payload?.error || "Something got tangled. Please try once more.");
  };

  const stage = (title: React.ReactNode, eyebrow: string, content: React.ReactNode, canContinue: boolean, onContinue: () => void, button = "Continue") => (
    <div className={styles.stage}>
      <button className={styles.backButton} onClick={goBack} aria-label="Go back to the previous step">← Back</button>
      <div className={styles.stagePhoto}><Image src={photos[photoIndex[step]]} alt="Stacey" fill sizes="(max-width: 700px) 82vw, 240px" /></div>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1>{title}</h1>
      <div className={styles.stageContent}>{content}</div>
      <p className={styles.progress}>{["activity", "movie", "schedule", "food", "snacks", "note"].includes(step) ? `Step ${["activity", "movie", "schedule", "food", "snacks", "note"].indexOf(step) + 1} of ${isMoviePlan && isDatePlan ? 6 : isMoviePlan || isDatePlan ? 5 : 3}` : ""}</p>
      <button className={styles.primaryButton} disabled={!canContinue} onClick={onContinue}>{button} <span>→</span></button>
    </div>
  );

  return (
    <main className={styles.page}>
      <div className={styles.sparkles} aria-hidden="true"><i>✦</i><i>♡</i><i>✧</i><i>✦</i><i>♡</i></div>
      <section className={styles.card} aria-live="polite">
        {step === "reveal" && <div className={styles.reveal}><p className={styles.eyebrow}>For Stacey, with a little courage</p><div className={styles.photoFrame}><Image src={photos[0]} alt="Stacey smiling" width={600} height={492} priority /></div><h1>A little something<br />made just for you.</h1><button className={styles.primaryButton} onClick={() => setStep("question")}>Open it <span>→</span></button><p className={styles.tiny}>P.S. I hope this makes you smile.</p></div>}
        {step === "question" && <div className={styles.question}><p className={styles.eyebrow}>A small confession</p><h1>You&apos;ve been on<br /><em>my mind.</em></h1><p className={styles.note}>I think you&apos;re genuinely gorgeous, and I&apos;ve been a little too shy to say it out loud. So I made this instead: would you let me take you out and make a lovely memory together?</p><div className={styles.answerRow}><button className={styles.primaryButton} onClick={() => setStep("activity")}>Yes, I&apos;d love to! <span>♡</span></button><div className={noDodged ? styles.noAreaDodged : styles.noArea}><button className={styles.noButton} onMouseEnter={() => setNoDodged(true)} onFocus={() => setNoDodged(true)} onClick={() => setStep("declined")}>No, thank you</button></div></div>{noDodged && <p className={styles.dodgeHint}>That little heart was hoping you&apos;d choose yes — but your answer matters.</p>}</div>}
        {step === "activity" && stage(<>What kind of<br /><em>lovely?</em></>, "First, pick the adventure", <div className={styles.activityGrid}>{activities.map((option) => <button className={activity === option.value ? styles.activitySelected : styles.activity} key={option.value} onClick={() => setActivity(option.value)}><span className={styles.activityIcon}>{option.icon}</span><strong>{option.label}</strong><small>{option.detail}</small></button>)}</div>, Boolean(activity), nextAfterActivity, "This one")}
        {step === "movie" && stage(<>Pick the<br /><em>movie moment.</em></>, "A cinema date, coming right up", <div className={styles.movieGrid}>{movies.map((movie) => <button className={movieTitle === movie.title ? styles.movieSelected : styles.movie} key={movie.title} onClick={() => { setMovieTitle(movie.title); setMovieShowtime(""); }}><strong>{movie.title}</strong><small>{movie.times.join(" · ")}</small></button>)}{activeMovie && <div className={styles.timeChoices}>{activeMovie.times.map((time) => <button className={movieShowtime === time ? styles.timeSelected : styles.time} key={time} onClick={() => setMovieShowtime(time)}>{time}</button>)}</div>}</div>, Boolean(movieTitle && movieShowtime), nextAfterMovie, "That showing")}
        {step === "schedule" && stage(<>When shall we<br /><em>make it happen?</em></>, "Your calendar, your call", <div className={styles.formGrid}><label>What day feels good?<input type="date" min={new Date().toISOString().slice(0, 10)} value={preferredDate} onClick={(event) => event.currentTarget.showPicker?.()} onChange={(event) => setPreferredDate(event.target.value)} /></label><label>Best time<select value={timeOfDay} onChange={(event) => setTimeOfDay(event.target.value)}><option value="">Select a time</option><option value="afternoon">Afternoon</option><option value="evening">Evening</option><option value="night">Night</option></select></label></div>, Boolean(preferredDate && timeOfDay), nextAfterSchedule, "Save the date")}
        {step === "food" && stage(<>Let&apos;s eat<br /><em>something great.</em></>, "Your favourites lead the way", <div className={styles.choiceGrid}>{foodChoices.map((choice) => <button className={food === choice ? styles.choiceSelected : styles.choice} key={choice} onClick={() => setFood(choice)}>{choice}</button>)}<label className={styles.otherChoice}>Or tell me what you&apos;re craving<input value={foodNote} maxLength={240} onChange={(event) => setFoodNote(event.target.value)} placeholder="Your perfect choice" /></label></div>, Boolean(food || foodNote.trim()), nextAfterFood, "Sounds delicious")}
        {step === "snacks" && stage(<>Movie snacks?<br /><em>Absolutely.</em></>, "Pick as many as you fancy", <div className={styles.choiceGrid}>{snackChoices.map((choice) => <button className={snacks.includes(choice) ? styles.choiceSelected : styles.choice} key={choice} onClick={() => toggleSnack(choice)}>{snacks.includes(choice) ? "✓ " : ""}{choice}</button>)}</div>, snacks.length > 0, () => setStep("note"), "Snack attack")}
        {step === "note" && stage(<>One last<br /><em>little clue.</em></>, "Help me make it feel just right", <label className={styles.noteLabel}>Anything that would make it extra perfect?<textarea value={perfectNote} maxLength={1200} rows={4} onChange={(event) => setPerfectNote(event.target.value)} placeholder="A little hint for me goes a long way." /></label>, true, submitPlan, submitting ? "Sending your hints…" : "Send my little hints ♡")}
        {error && <p className={styles.error} role="alert">{error}</p>}
        {step === "celebration" && <div className={styles.celebration}><div className={styles.confetti} aria-hidden="true">✦ ♡ ✧ ♥ ✦ ♡</div><p className={styles.eyebrow}>Message received</p><h1>You just made<br /><em>my day.</em></h1><p className={styles.note}>I&apos;ve got your clues. Now I get to plan something worth looking forward to.</p><p className={styles.signature}>— with a very happy smile</p></div>}
        {step === "declined" && <div className={styles.declined}><p className={styles.eyebrow}>Thank you for being honest</p><h1>All good,<br /><em>truly.</em></h1><p className={styles.note}>No hard feelings at all. I hope this little page still gave you a smile, and I&apos;m wishing you the loveliest days ahead.</p><span className={styles.bigHeart}>♡</span></div>}
      </section>
    </main>
  );
}
