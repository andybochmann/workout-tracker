// file# Import component files
import Header from "./components/Header";
import NotesModal from "./components/NotesModal";
import ExerciseModal from "./components/ExerciseModal";
import GuideModal from "./components/GuideModal";
import ProgressLog from "./components/ProgressLog";
import WeeklyWorkout from "./components/WeeklyWorkout";
import ExerciseItem from "./components/ExerciseItem";
import ExerciseGroup from "./components/ExerciseGroup";
import { useState, useEffect, useCallback, useRef } from "react";

import { WORKOUT_PLAN_FULL } from "./workoutData.js";
import { EXERCISE_GUIDE_FULL } from "./exerciseData.js";

export default function WorkoutTracker() {
  // State management
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
        setCompleted((prev) => {
          const newCompleted = { ...prev };
          newCompleted[key] = {
            timestamp: Date.now(),
          };
          return newCompleted;
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
        setCompleted((prev) => {
          const newCompleted = { ...prev };
          newCompleted[groupKey] = {
            timestamp: Date.now(),
          };
          return newCompleted;
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
  // Update the renderExercises function to use the new component-based design
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

        // Add the group container using the ExerciseGroup component
        renderedElements.push(
          <ExerciseGroup
            key={groupKey}
            week={week}
            groupType={groupType}
            groupNumber={groupNumber}
            groupItems={groupItems}
            completed={completed}
            toggleGroup={toggleGroup}
          />
        );
      } else {
        // Render individual exercise using the ExerciseItem component
        renderedElements.push(
          <ExerciseItem
            key={`${week}-${ex}`}
            exercise={ex}
            week={week}
            completed={completed}
            showDetails={showDetails}
            toggleExercise={toggleExercise}
          />
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

  // Render the Progress Log view
  if (view === "progress") {
    return (
      <div className="p-4 max-w-3xl mx-auto bg-slate-50 min-h-screen">
        <Header view={view} setView={setView} setShowGuide={setShowGuide} />
        <ProgressLog
          progressData={progressData}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          newEntry={newEntry}
          setNewEntry={setNewEntry}
          addProgressEntry={addProgressEntry}
          deleteProgressEntry={deleteProgressEntry}
        />
      </div>
    );
  }

  // Render the Workouts view
  return (
    <div className="p-4 space-y-4 max-w-3xl mx-auto bg-slate-50 min-h-screen">
      <Header view={view} setView={setView} setShowGuide={setShowGuide} />

      {Object.entries(WORKOUT_PLAN_FULL).map(([week, exercises]) => (
        <WeeklyWorkout
          key={week}
          week={week}
          exercises={exercises}
          completed={completed}
          expandedWeeks={expandedWeeks}
          toggleWeekExpansion={toggleWeekExpansion}
          renderExercises={renderExercises}
          isWeekCompleted={isWeekCompleted}
        />
      ))}

      <ExerciseModal
        modalContent={modalContent}
        setModalContent={setModalContent}
      />

      <GuideModal
        showGuide={showGuide}
        setShowGuide={setShowGuide}
        EXERCISE_GUIDE_FULL={EXERCISE_GUIDE_FULL}
      />

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
