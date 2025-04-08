// Full PWA: 12-week fat loss tracker with warm-up, cool-down, workout, reference guide, and progress log
import { useState, useEffect, useCallback, useRef } from "react";

import { WORKOUT_PLAN_FULL } from "./workoutData.js";
import { EXERCISE_GUIDE_FULL } from "./exerciseData.js";

// Define NotesModal outside the main component
const NotesModal = ({
  noteModal,
  noteContent,
  setNoteContent,
  saveExerciseNote,
  setNoteModal,
}) => {
  if (!noteModal.show) return null;

  const title = noteModal.isGroup
    ? `Add note for ${noteModal.groupKey.split("-").slice(1).join(" ")}`
    : `Add note for ${noteModal.exercise}`;

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  const handleNoteChange = (e) => {
    setNoteContent(e.target.value);
  };

  const handleCancel = () => {
    setNoteModal((prev) => ({ ...prev, show: false }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div
        className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full"
        onClick={handleContentClick}
      >
        <h3 className="text-xl font-bold mb-3 text-indigo-600">{title}</h3>
        <p className="mb-3 text-slate-700">
          Add an optional note (e.g., weight, reps, or other details)
        </p>
        <textarea
          value={noteContent}
          onChange={handleNoteChange}
          className="w-full p-3 border rounded-lg mb-4 h-24 resize-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
          placeholder="e.g., 135lbs x 8 reps"
        />
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={saveExerciseNote}
            className="px-4 py-2 btn btn-primary rounded-lg"
          >
            Save & Mark Complete
          </button>
        </div>
      </div>
    </div>
  );
};

export default function WorkoutTracker() {
  const [completed, setCompleted] = useState({});
  const [view, setView] = useState("workouts");
  const [modalContent, setModalContent] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [progressData, setProgressData] = useState({
    lifts: [],
    measurements: [],
    cardio: [],
  });
  const [activeTab, setActiveTab] = useState("lifts");
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split("T")[0],
    lift: "",
    weight: "",
    reps: "",
    measurement: "",
    value: "",
    cardioType: "",
    duration: "",
    distance: "",
  });
  const [noteModal, setNoteModal] = useState({
    show: false,
    week: "",
    exercise: "",
    isGroup: false,
    groupKey: "",
  });
  const [noteContent, setNoteContent] = useState("");

  // Add a ref to track if data has been loaded
  const dataLoaded = useRef(false);

  // Header component for consistent navigation
  const Header = () => (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-center mb-4 text-indigo-600">
        12-Week Fat Loss Tracker
      </h1>
      <div className="flex justify-center gap-3">
        {view === "workouts" && (
          <button
            onClick={() => setShowGuide(true)}
            className="px-4 py-2 btn btn-primary rounded-lg shadow-md flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            Reference Guide
          </button>
        )}
        <button
          onClick={() => setView(view === "workouts" ? "progress" : "workouts")}
          className="px-4 py-2 btn btn-primary rounded-lg shadow-md flex items-center"
        >
          {view === "workouts" ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Progress Log
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Workouts
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Load data once on mount
  useEffect(() => {
    // Prevent multiple loading of data
    if (dataLoaded.current) return;

    // Mark data as loaded at the beginning
    dataLoaded.current = true;

    // Load completed state
    try {
      const stored = localStorage.getItem("workoutProgress");
      if (stored) {
        const parsedData = JSON.parse(stored);
        const twelveWeeksAgo = Date.now() - 12 * 7 * 24 * 60 * 60 * 1000;

        // Filter out old entries
        // Handle both old format (value is timestamp) and new format (value is object with timestamp)
        const cleanedData = Object.fromEntries(
          Object.entries(parsedData).filter(([_, value]) => {
            const timestamp =
              typeof value === "object" ? value.timestamp : value;
            return timestamp > twelveWeeksAgo;
          })
        );

        setCompleted(cleanedData);
      }
    } catch (error) {
      console.error("Error loading workout progress:", error);
      localStorage.removeItem("workoutProgress"); // Clear only if corrupted
    }

    // Load expanded state
    try {
      const storedExpanded = localStorage.getItem("expandedWeeks");
      if (storedExpanded) {
        setExpandedWeeks(JSON.parse(storedExpanded));
      } else {
        const firstWeek = Object.keys(WORKOUT_PLAN_FULL)[0];
        setExpandedWeeks({ [firstWeek]: true });
      }
    } catch (error) {
      console.error("Error loading expanded weeks:", error);
      localStorage.removeItem("expandedWeeks"); // Clear only if corrupted
      const firstWeek = Object.keys(WORKOUT_PLAN_FULL)[0];
      setExpandedWeeks({ [firstWeek]: true }); // Reset to default
    }

    // Load progress data
    try {
      const storedProgress = localStorage.getItem("progressData");
      if (storedProgress) {
        const parsedProgress = JSON.parse(storedProgress);
        const validProgress = {
          lifts: Array.isArray(parsedProgress.lifts)
            ? parsedProgress.lifts
            : [],
          measurements: Array.isArray(parsedProgress.measurements)
            ? parsedProgress.measurements
            : [],
          cardio: Array.isArray(parsedProgress.cardio)
            ? parsedProgress.cardio
            : [],
        };
        setProgressData(validProgress);
        console.log("Loaded progress data:", validProgress);
      }
    } catch (error) {
      console.error("Error loading or parsing progress data:", error);
      localStorage.removeItem("progressData"); // Clear only if corrupted
      // Initialize with empty arrays if data is corrupted or missing
      setProgressData({
        lifts: [],
        measurements: [],
        cardio: [],
      });
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

  // Save expanded state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("expandedWeeks", JSON.stringify(expandedWeeks));
    } catch (error) {
      console.error("Error saving expanded state:", error);
    }
  }, [expandedWeeks]);

  // Save progress data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("progressData", JSON.stringify(progressData));
    } catch (error) {
      console.error("Error saving progress data:", error);
    }
  }, [progressData]);

  const toggleExercise = useCallback(
    (week, exercise) => {
      const key = `${week}-${exercise}`;

      if (completed[key]) {
        setCompleted((prev) => {
          const newCompleted = { ...prev };
          delete newCompleted[key];
          return newCompleted;
        });
      } else {
        setNoteContent(""); // Reset note content
        setNoteModal({
          show: true,
          week,
          exercise,
          isGroup: false,
          groupKey: key,
        });
      }
    },
    [completed]
  );

  const saveExerciseNote = useCallback(() => {
    const { week, exercise, isGroup, groupKey } = noteModal;
    const key = isGroup ? groupKey : `${week}-${exercise}`;

    setCompleted((prev) => {
      const newCompleted = { ...prev };
      newCompleted[key] = {
        timestamp: Date.now(),
        note: noteContent.trim(),
      };
      return newCompleted;
    });

    setNoteModal((prev) => ({ ...prev, show: false }));
  }, [noteModal, noteContent]);

  const toggleGroup = useCallback(
    (groupKey) => {
      if (completed[groupKey]) {
        setCompleted((prev) => {
          const newCompleted = { ...prev };
          delete newCompleted[groupKey];
          return newCompleted;
        });
      } else {
        setNoteContent(""); // Reset note content
        setNoteModal({
          show: true,
          week: "",
          exercise: "",
          isGroup: true,
          groupKey,
        });
      }
    },
    [completed]
  );

  // Toggle week expansion
  const toggleWeekExpansion = useCallback((week) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [week]: !prev[week],
    }));
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

  // Function to check if all exercises in a week are completed
  const isWeekCompleted = useCallback(
    (week, exercises) => {
      // Check all individual exercises
      const individualExercises = exercises.filter(
        (ex) => !ex.match(/^(Superset|Tri-Set|Complex)\s+(\d+)[A-Z]:/i)
      );
      const allIndividualCompleted = individualExercises.every(
        (ex) => completed[`${week}-${ex}`]
      );

      // Check all exercise groups
      const groups = new Set();
      exercises.forEach((ex) => {
        const match = ex.match(/^(Superset|Tri-Set|Complex)\s+(\d+)[A-Z]:/i);
        if (match) {
          groups.add(`${week}-${match[1]}-${match[2]}`);
        }
      });

      const allGroupsCompleted = Array.from(groups).every(
        (groupKey) => completed[groupKey]
      );

      // Week is completed if all individual exercises and all groups are completed
      return (
        allIndividualCompleted &&
        allGroupsCompleted &&
        (individualExercises.length > 0 || groups.size > 0)
      ); // Ensure there are exercises to check
    },
    [completed]
  );

  // Update the renderExercises function to use the new design
  const renderExercises = (week, exercises) => {
    const renderedElements = [];
    let i = 0;
    while (i < exercises.length) {
      const ex = exercises[i];
      const isGroupStart = ex.match(
        /^(Superset|Tri-Set|Complex)\s+(\d+)[A-Z]:/i
      );

      if (isGroupStart) {
        const groupType = isGroupStart[1];
        const groupNumber = isGroupStart[2];
        const groupKey = `${week}-${groupType}-${groupNumber}`;
        const groupItems = [];
        const exercisesInGroup = [];

        // Find all items in this group
        while (
          i < exercises.length &&
          exercises[i].match(
            new RegExp(`^${groupType}\\s+${groupNumber}[A-Z]:`, "i")
          )
        ) {
          const currentEx = exercises[i];
          exercisesInGroup.push(currentEx);

          groupItems.push(
            <div
              key={`${week}-${currentEx}`}
              className="flex items-center justify-between p-3 rounded-lg bg-white shadow transition hover:shadow-md mb-2"
            >
              <span
                onClick={() => showDetails(currentEx)}
                className="cursor-pointer hover:text-indigo-600 flex-1 mr-2"
              >
                {currentEx.replace(/^[A-Z]:\s*/, "")}
              </span>
            </div>
          );
          i++;
        }

        // Add the group container with a single button
        renderedElements.push(
          <div
            key={groupKey}
            className={`border rounded-xl p-4 mt-3 space-y-2 shadow-md transition ${
              completed[groupKey] ? "bg-green-100" : "bg-slate-50"
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold text-slate-700">{`${groupType} ${groupNumber}`}</p>
              <button
                onClick={() => toggleGroup(groupKey)}
                className={`px-3 py-1 rounded-lg flex-shrink-0 flex items-center ${
                  completed[groupKey] ? "btn btn-success" : "btn btn-primary"
                }`}
              >
                {completed[groupKey] ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Done
                  </>
                ) : (
                  "Mark Group Done"
                )}
              </button>
            </div>
            <div className="space-y-1">{groupItems}</div>
            {completed[groupKey] && completed[groupKey].note && (
              <div className="mt-2 p-2 bg-yellow-50 rounded-lg text-sm text-slate-700 border border-yellow-200">
                <span className="font-medium">Note:</span>{" "}
                {completed[groupKey].note}
              </div>
            )}
          </div>
        );
      } else {
        // Render individual exercise with improved styling
        const key = `${week}-${ex}`;
        const exerciseData = completed[key];
        renderedElements.push(
          <div
            key={key}
            className={`flex flex-col p-3 rounded-lg shadow transition hover:shadow-md ${
              exerciseData ? "bg-green-100" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                onClick={() => showDetails(ex)}
                className="cursor-pointer hover:text-indigo-600 flex-1 mr-2"
              >
                {ex}
              </span>
              <button
                onClick={() => toggleExercise(week, ex)}
                className={`px-3 py-1 rounded-lg flex-shrink-0 flex items-center ${
                  exerciseData ? "btn btn-success" : "btn btn-primary"
                }`}
              >
                {exerciseData ? (
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 01-1.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Done
                  </span>
                ) : (
                  "Mark Done"
                )}
              </button>
            </div>
            {exerciseData && exerciseData.note && (
              <div className="mt-2 p-2 bg-yellow-50 rounded-lg text-sm text-slate-700 border border-yellow-200">
                <span className="font-medium">Note:</span> {exerciseData.note}
              </div>
            )}
          </div>
        );
        i++;
      }
    }
    return renderedElements;
  };

  // Function to add a new progress entry
  const addProgressEntry = (type) => {
    if (type === "lifts" && (!newEntry.lift || !newEntry.weight)) {
      alert("Please fill in all required fields");
      return;
    } else if (
      type === "measurements" &&
      (!newEntry.measurement || !newEntry.value)
    ) {
      alert("Please fill in all required fields");
      return;
    } else if (
      type === "cardio" &&
      (!newEntry.cardioType || !(newEntry.duration || newEntry.distance))
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setProgressData((prev) => {
      const updatedData = { ...prev };

      if (type === "lifts") {
        updatedData.lifts = [
          ...updatedData.lifts,
          {
            id: Date.now(),
            date: newEntry.date,
            exercise: newEntry.lift,
            weight: parseFloat(newEntry.weight),
            reps: newEntry.reps ? parseInt(newEntry.reps) : null,
          },
        ];
        setNewEntry((prev) => ({ ...prev, lift: "", weight: "", reps: "" }));
      } else if (type === "measurements") {
        updatedData.measurements = [
          ...updatedData.measurements,
          {
            id: Date.now(),
            date: newEntry.date,
            type: newEntry.measurement,
            value: parseFloat(newEntry.value),
          },
        ];
        setNewEntry((prev) => ({ ...prev, measurement: "", value: "" }));
      } else if (type === "cardio") {
        updatedData.cardio = [
          ...updatedData.cardio,
          {
            id: Date.now(),
            date: newEntry.date,
            type: newEntry.cardioType,
            duration: newEntry.duration ? parseFloat(newEntry.duration) : null,
            distance: newEntry.distance ? parseFloat(newEntry.distance) : null,
          },
        ];
        setNewEntry((prev) => ({
          ...prev,
          cardioType: "",
          duration: "",
          distance: "",
        }));
      }

      return updatedData;
    });
  };

  // Function to delete progress entry
  const deleteProgressEntry = (type, id) => {
    setProgressData((prev) => {
      const updatedData = { ...prev };
      updatedData[type] = updatedData[type].filter((entry) => entry.id !== id);

      return updatedData;
    });
  };

  if (view === "progress") {
    return (
      <div className="p-4 max-w-3xl mx-auto bg-slate-50 min-h-screen">
        <Header />
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h1 className="text-xl font-bold mb-4 text-indigo-600">
            Progress Log
          </h1>

          <div className="mb-4 flex border-b">
            <button
              className={`py-2 px-4 ${
                activeTab === "lifts"
                  ? "border-b-2 border-indigo-500 font-bold text-indigo-600"
                  : "text-slate-700"
              }`}
              onClick={() => setActiveTab("lifts")}
            >
              Lifts
            </button>
            <button
              className={`py-2 px-4 ${
                activeTab === "measurements"
                  ? "border-b-2 border-indigo-500 font-bold text-indigo-600"
                  : "text-slate-700"
              }`}
              onClick={() => setActiveTab("measurements")}
            >
              Measurements
            </button>
            <button
              className={`py-2 px-4 ${
                activeTab === "cardio"
                  ? "border-b-2 border-indigo-500 font-bold text-indigo-600"
                  : "text-slate-700"
              }`}
              onClick={() => setActiveTab("cardio")}
            >
              Cardio
            </button>
          </div>

          <div className="mb-6 p-4 bg-slate-50 rounded-lg shadow animate-fadeIn">
            <h2 className="font-bold mb-3 flex items-center text-indigo-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add New Entry
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  Date
                </label>
                <input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, date: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              {activeTab === "lifts" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">
                      Exercise
                    </label>
                    <input
                      type="text"
                      value={newEntry.lift}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, lift: e.target.value })
                      }
                      placeholder="e.g. Bench Press"
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">
                      Weight (lbs/kg)
                    </label>
                    <input
                      type="number"
                      value={newEntry.weight}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, weight: e.target.value })
                      }
                      placeholder="e.g. 135"
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">
                      Reps (optional)
                    </label>
                    <input
                      type="number"
                      value={newEntry.reps}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, reps: e.target.value })
                      }
                      placeholder="e.g. 8"
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </>
              )}

              {activeTab === "measurements" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">
                      Measurement Type
                    </label>
                    <select
                      value={newEntry.measurement}
                      onChange={(e) =>
                        setNewEntry({
                          ...newEntry,
                          measurement: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">Select type</option>
                      <option value="Weight">Weight</option>
                      <option value="Waist">Waist</option>
                      <option value="Chest">Chest</option>
                      <option value="Arms">Arms</option>
                      <option value="Thighs">Thighs</option>
                      <option value="Body Fat %">Body Fat %</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">
                      Value
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newEntry.value}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, value: e.target.value })
                      }
                      placeholder="e.g. 180.5"
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </>
              )}

              {activeTab === "cardio" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">
                      Cardio Type
                    </label>
                    <select
                      value={newEntry.cardioType}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, cardioType: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">Select type</option>
                      <option value="Running">Running</option>
                      <option value="Walking">Walking</option>
                      <option value="Cycling">Cycling</option>
                      <option value="Elliptical">Elliptical</option>
                      <option value="Rowing">Rowing</option>
                      <option value="Stair Climber">Stair Climber</option>
                      <option value="Swimming">Swimming</option>
                      <option value="HIIT">HIIT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={newEntry.duration}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, duration: e.target.value })
                      }
                      placeholder="e.g. 30"
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">
                      Distance (miles/km)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newEntry.distance}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, distance: e.target.value })
                      }
                      placeholder="e.g. 2.5"
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => addProgressEntry(activeTab)}
              className="px-4 py-2 btn btn-primary rounded-lg flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Entry
            </button>
          </div>

          <div className="mb-6 animate-fadeIn">
            <h2 className="font-bold mb-3 flex items-center text-indigo-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Progress History
            </h2>

            {activeTab === "lifts" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Exercise
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Weight
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Reps
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {progressData.lifts.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-4 py-4 text-center text-slate-500"
                        >
                          No lift data recorded yet
                        </td>
                      </tr>
                    ) : (
                      [...progressData.lifts]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((entry) => (
                          <tr key={entry.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                              {new Date(entry.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                              {entry.exercise}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                              {entry.weight}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                              {entry.reps || "-"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              <button
                                onClick={() =>
                                  deleteProgressEntry("lifts", entry.id)
                                }
                                className="text-red-500 hover:text-red-700 inline-flex items-center"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "measurements" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Measurement
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {progressData.measurements.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-4 py-4 text-center text-slate-500"
                        >
                          No measurement data recorded yet
                        </td>
                      </tr>
                    ) : (
                      [...progressData.measurements]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((entry) => (
                          <tr key={entry.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                              {new Date(entry.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                              {entry.type}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                              {entry.value}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              <button
                                onClick={() =>
                                  deleteProgressEntry("measurements", entry.id)
                                }
                                className="text-red-500 hover:text-red-700"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "cardio" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Distance
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {progressData.cardio.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-4 py-4 text-center text-slate-500"
                        >
                          No cardio data recorded yet
                        </td>
                      </tr>
                    ) : (
                      [...progressData.cardio]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((entry) => (
                          <tr key={entry.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                              {new Date(entry.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                              {entry.type}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                              {entry.duration ? `${entry.duration} min` : "-"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                              {entry.distance ? `${entry.distance} mi/km` : "-"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              <button
                                onClick={() =>
                                  deleteProgressEntry("cardio", entry.id)
                                }
                                className="text-red-500 hover:text-red-700"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-3xl mx-auto bg-slate-50 min-h-screen">
      <Header />

      {Object.entries(WORKOUT_PLAN_FULL).map(([week, exercises]) => {
        const weekCompleted = isWeekCompleted(week, exercises);
        return (
          <div
            key={week}
            className="border rounded-xl shadow overflow-hidden bg-white"
          >
            <div
              className={`${
                weekCompleted ? "bg-emerald-600" : "bg-indigo-600"
              } text-white p-4 flex justify-between items-center cursor-pointer hover:${
                weekCompleted ? "bg-emerald-700" : "bg-indigo-700"
              } transition`}
              onClick={() => toggleWeekExpansion(week)}
            >
              <h2 className="text-xl font-semibold flex items-center">
                {weekCompleted && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {week}
              </h2>
              <div
                className={`transition-transform duration-300 ${
                  expandedWeeks[week] ? "rotate-90" : "rotate-0"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <div
              className={`accordion-content ${
                expandedWeeks[week] ? "open" : ""
              }`}
            >
              <div className="p-4 space-y-2 bg-white">
                {renderExercises(week, exercises)}
              </div>
            </div>
          </div>
        );
      })}

      {modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold mb-3 text-indigo-600">
              {modalContent.title}
            </h3>
            {modalContent.isExercise ? (
              <>
                <div className="mb-3 text-emerald-600 font-semibold flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {modalContent.prescription}
                </div>
                <div className="mb-4 max-h-60 overflow-y-auto pr-2">
                  <p className="text-slate-700">{modalContent.description}</p>
                </div>
              </>
            ) : (
              <div className="mb-4 max-h-60 overflow-y-auto pr-2">
                <p className="text-slate-700">{modalContent.description}</p>
              </div>
            )}
            <button
              onClick={() => setModalContent(null)}
              className="px-4 py-2 btn btn-primary rounded-lg flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Close
            </button>
          </div>
        </div>
      )}

      {showGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div
            className="bg-white rounded-xl shadow-lg p-6 max-w-xl w-full"
            style={{ maxHeight: "90vh" }}
          >
            <h2 className="text-xl font-bold mb-4 text-indigo-600 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              Exercise Reference Guide
            </h2>
            <div
              className="space-y-3 overflow-y-auto pr-2"
              style={{ maxHeight: "calc(90vh - 8rem)" }}
            >
              {Object.entries(EXERCISE_GUIDE_FULL).map(([name, desc]) => (
                <div
                  key={name}
                  className="p-4 border rounded-lg shadow-sm hover:shadow-md transition bg-slate-50"
                >
                  <strong className="text-indigo-600">{name}</strong>
                  <p className="mt-2 text-slate-700">{desc}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="mt-4 px-4 py-2 btn btn-primary rounded-lg flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Close Guide
            </button>
          </div>
        </div>
      )}

      <NotesModal
        noteModal={noteModal}
        noteContent={noteContent}
        setNoteContent={setNoteContent}
        saveExerciseNote={saveExerciseNote}
        setNoteModal={setNoteModal}
      />
    </div>
  );
}
