// Full PWA: 12-week fat loss tracker with warm-up, cool-down, workout, reference guide, and progress log
import { useState, useEffect, useCallback } from "react";

import { WORKOUT_PLAN_FULL } from "./workoutData.js";
import { EXERCISE_GUIDE_FULL } from "./exerciseData.js";

export default function WorkoutTracker() {
  const [completed, setCompleted] = useState({});
  const [view, setView] = useState("workouts");
  const [modalContent, setModalContent] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  // Load data once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("workoutProgress");
      if (stored) {
        const parsedData = JSON.parse(stored);
        // Clean up old data (older than 12 weeks)
        const twelveWeeksAgo = Date.now() - 12 * 7 * 24 * 60 * 60 * 1000;
        const cleanedData = Object.fromEntries(
          Object.entries(parsedData).filter(
            ([_, timestamp]) => timestamp > twelveWeeksAgo
          )
        );
        setCompleted(cleanedData);
      }
    } catch (error) {
      console.error("Error loading progress:", error);
      // Reset if data is corrupted
      localStorage.removeItem("workoutProgress");
    }
  }, []);

  // Debounced save to localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem("workoutProgress", JSON.stringify(completed));
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [completed]);

  const toggleExercise = useCallback((week, exercise) => {
    const key = `${week}-${exercise}`;
    setCompleted((prev) => ({ ...prev, [key]: prev[key] ? null : Date.now() }));
  }, []);
  const showDetails = useCallback((exercise) => {
    // Check if it's a warm-up or cool-down
    if (exercise.startsWith("Warm-Up:") || exercise.startsWith("Cool-Down:")) {
      setModalContent({
        title: exercise.split(":")[0].trim(),
        description: exercise.split(":")[1].trim(),
        isWarmupCooldown: true,
      });
      return;
    }

    // For cardio exercises with duration
    if (
      exercise.match(
        /(Elliptical|Treadmill|Row|Walk|Run).*(min|ladder|pyramid|intervals)/i
      )
    ) {
      setModalContent({
        title: "Cardio",
        description: exercise,
        isWarmupCooldown: true,
      });
      return;
    }

    // Extract the base exercise name (remove sets/reps and parenthetical notes)
    const baseExercise = exercise
      .replace(/\s*\d+x\d+.*$/, "") // Remove sets/reps
      .replace(/\s*\([^)]*\)/g, "") // Remove parenthetical notes
      .replace(/\s+ea$/, "") // Remove "ea" suffix
      .split(" ")
      .filter((word) => !word.match(/^[0-9]+$/)) // Remove standalone numbers
      .join(" ")
      .trim();

    // Try different name variations
    const variations = [
      baseExercise,
      baseExercise.replace(/^DB\s+/, ""), // Try without "DB" prefix
      baseExercise.replace(/^Barbell\s+/, ""), // Try without "Barbell" prefix
      ...baseExercise
        .split(" ")
        .map((_, i) => baseExercise.split(" ").slice(i).join(" ")),
    ];

    // Find the first matching exercise in our guide
    const match = variations.find((v) => EXERCISE_GUIDE_FULL[v]);
    if (match && EXERCISE_GUIDE_FULL[match]) {
      const setsReps = exercise.match(/\d+x\d+/)?.[0] || "";
      const extraInfo = exercise.includes("ea") ? " each side" : "";
      const duration = exercise.match(/\d+\s*s/)?.[0] || "";
      const sets = exercise.match(/(\d+)\s*sets?/i)?.[1] || "";

      let prescription = "";
      if (setsReps) prescription = `Prescribed: ${setsReps}${extraInfo}`;
      else if (duration) prescription = `Hold for: ${duration}`;
      else if (sets) prescription = `Prescribed: ${sets} sets${extraInfo}`;

      setModalContent({
        title: match,
        description: EXERCISE_GUIDE_FULL[match],
        prescription,
        isExercise: true,
      });
    } else {
      // For exercises without a guide entry, show the exercise as is
      setModalContent({
        title: baseExercise,
        description:
          "Perform the exercise according to the prescribed sets and reps.",
        prescription: `Prescribed: ${exercise.match(/\d+x\d+/)?.[0] || ""}${
          exercise.includes("ea") ? " each side" : ""
        }`,
        isExercise: true,
      });
    }
  }, []);

  if (view === "progress") {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Progress Log</h1>
        <p className="mb-2">
          Track your lifts, cardio, or measurements weekly in the notebook or
          another app.
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Record Squat / Bench / Deadlift weekly</li>
          <li>Log cardio distance or speed progression</li>
          <li>Note bodyweight or waist size weekly</li>
          <li>Use progress photos every 4 weeks</li>
        </ul>
        <button
          onClick={() => setView("workouts")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Workouts
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center">
        12-Week Fat Loss Tracker
      </h1>
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setShowGuide(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reference Guide
        </button>
        <button
          onClick={() => setView("progress")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Progress Log
        </button>
      </div>
      {Object.entries(WORKOUT_PLAN_FULL).map(([week, exercises]) => (
        <div key={week} className="border rounded-lg p-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">{week}</h2>
          <div className="space-y-2">
            {exercises.map((ex, idx) => {
              const key = `${week}-${ex}`;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded ${
                    completed[key] ? "bg-green-100" : "bg-white"
                  }`}
                >
                  <span
                    onClick={() => showDetails(ex)}
                    className="cursor-pointer hover:text-blue-600"
                  >
                    {ex}
                  </span>
                  <button
                    onClick={() => toggleExercise(week, ex)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {completed[key] ? "✓ Done" : "Mark Done"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}{" "}
      {modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold mb-2">{modalContent.title}</h3>
            {modalContent.isExercise ? (
              <>
                <div className="mb-2 text-blue-600">
                  {modalContent.prescription}
                </div>
                <p className="mb-4">{modalContent.description}</p>
              </>
            ) : (
              <p className="mb-4 text-gray-700">{modalContent.description}</p>
            )}
            <button
              onClick={() => setModalContent(null)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          {" "}
          <div
            className="bg-white rounded-lg p-6 max-w-xl w-full"
            style={{ maxHeight: "80vh" }}
          >
            <h2 className="text-xl font-bold mb-4">Exercise Reference Guide</h2>
            <div
              className="space-y-3 overflow-y-auto pr-2"
              style={{ maxHeight: "calc(80vh - 8rem)" }}
            >
              {Object.entries(EXERCISE_GUIDE_FULL).map(([name, desc]) => (
                <div key={name} className="p-2 border rounded">
                  <strong>{name}</strong>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
