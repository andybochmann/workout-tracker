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

// Import the new workout plan JSON file
import WorkoutPlanData from "./full_12_week_workout_plan.json";

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
        const firstWeek = Object.keys(WorkoutPlanData)[0];
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
    // If exercise is an object (from the new JSON format)
    if (typeof exercise === "object") {
      let prescription = "";

      // Format prescription information based on available fields
      if (exercise.execution) {
        prescription = `Prescribed: ${exercise.execution}`;
      }

      // Add rest information if available
      if (exercise.rest && exercise.rest.trim() !== "") {
        prescription += `, Rest: ${exercise.rest}`;
      }

      setModalContent({
        title: exercise.title,
        description: exercise.description,
        prescription,
        isExercise:
          exercise.title !== "Warm-Up" && exercise.title !== "Cool-Down",
        isWarmupCooldown:
          exercise.title === "Warm-Up" || exercise.title === "Cool-Down",
      });
      return;
    }

    // Legacy code for handling string exercises (should not be reached with new format)
    setModalContent({
      title: "Exercise",
      description: "Please update to the new exercise format.",
      isExercise: true,
    });
  }, []);
  // Function to check if all exercises in a week are completed
  const isWeekCompleted = useCallback(
    (week, exercises) => {
      // Check all individual exercises
      const individualExercises = exercises.filter((ex) => !ex.group);
      const allIndividualCompleted = individualExercises.every(
        (ex) => completed[`${week}-${ex.title}`]
      );

      // Check all exercise groups
      const groups = new Set();
      exercises.forEach((ex) => {
        if (ex.group) {
          groups.add(`${week}-${ex.group}`);
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
  ); // Updated renderExercises function for the new JSON format
  const renderExercises = (week, exercises) => {
    const renderedElements = [];

    // Group exercises by their group property
    const groupedExercises = {};

    // First, collect all exercises that belong to groups
    exercises.forEach((ex) => {
      if (ex.group) {
        if (!groupedExercises[ex.group]) {
          groupedExercises[ex.group] = [];
        }
        groupedExercises[ex.group].push(ex);
      }
    });

    // Now render the exercises
    exercises.forEach((ex) => {
      // If it's a non-grouped exercise
      if (!ex.group) {
        // Render individual exercise using the ExerciseItem component
        renderedElements.push(
          <ExerciseItem
            key={`${week}-${ex.title}`}
            exercise={ex}
            week={week}
            completed={completed}
            showDetails={showDetails}
            toggleExercise={toggleExercise}
            setNoteModal={setNoteModal}
            setNoteContent={setNoteContent}
          />
        );
      }
      // If it's the first exercise of a group we haven't rendered yet
      else if (
        groupedExercises[ex.group] &&
        groupedExercises[ex.group].includes(ex)
      ) {
        // Get all exercises in this group
        const exercisesInThisGroup = groupedExercises[ex.group];

        // Create group items from grouped exercises
        const groupItems = exercisesInThisGroup.map((groupEx) => (
          <div
            key={`${week}-${groupEx.title}`}
            className="flex items-center justify-between p-3 rounded-lg bg-white shadow transition hover:shadow-md mb-2"
          >
            <span
              onClick={() => showDetails(groupEx)}
              className="cursor-pointer hover:text-indigo-600 flex-1 mr-2"
            >
              {groupEx.title}
            </span>
          </div>
        ));

        // Determine the group type from the group name (e.g., "superset_1" -> "Superset")
        const groupType = ex.group.includes("superset")
          ? "Superset"
          : ex.group.includes("tri-set")
          ? "Tri-Set"
          : ex.group.includes("complex")
          ? "Complex"
          : "Group";

        // Extract the group number from the group ID
        const groupNumber = ex.group.match(/\d+/)
          ? ex.group.match(/\d+/)[0]
          : "";

        // Generate a group key
        const groupKey = `${week}-${ex.group}`;

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
            setNoteModal={setNoteModal}
            setNoteContent={setNoteContent}
          />
        );

        // Remove these exercises from the groupedExercises to avoid rendering them again
        delete groupedExercises[ex.group];
      }
    });

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
      <Header view={view} setView={setView} setShowGuide={setShowGuide} />{" "}
      {Object.entries(WorkoutPlanData).map(([week, exercises]) => (
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
      />{" "}
      <GuideModal
        showGuide={showGuide}
        setShowGuide={setShowGuide}
        workoutPlanData={WorkoutPlanData}
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
