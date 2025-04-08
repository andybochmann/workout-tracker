// Full PWA: 12-week fat loss tracker with warm-up, cool-down, workout, reference guide, and progress log
import { useState, useEffect, useCallback, useRef } from "react";

import { WORKOUT_PLAN_FULL } from "./workoutData.js";
import { EXERCISE_GUIDE_FULL } from "./exerciseData.js";

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

  // Add a ref to track if data has been loaded
  const dataLoaded = useRef(false);

  // Header component for consistent navigation
  const Header = () => (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-center mb-4">
        12-Week Fat Loss Tracker
      </h1>
      <div className="flex justify-center gap-3">
        <button
          onClick={() => setShowGuide(true)}
          className="px-4 py-2 btn btn-primary rounded-lg shadow-md"
        >
          Reference Guide
        </button>
        <button
          onClick={() => setView(view === "workouts" ? "progress" : "workouts")}
          className="px-4 py-2 btn btn-primary rounded-lg shadow-md"
        >
          {view === "workouts" ? "Progress Log" : "Back to Workouts"}
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
        const cleanedData = Object.fromEntries(
          Object.entries(parsedData).filter(
            ([_, timestamp]) => timestamp > twelveWeeksAgo
          )
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

  const toggleExercise = useCallback((week, exercise) => {
    const key = `${week}-${exercise}`;
    setCompleted((prev) => {
      const newCompleted = { ...prev };
      if (newCompleted[key]) {
        delete newCompleted[key]; // Use delete for unmarking individual items
      } else {
        newCompleted[key] = Date.now();
      }
      return newCompleted;
    });
  }, []);

  // Function to toggle completion for an entire group
  const toggleGroup = useCallback((groupKey) => {
    setCompleted((prev) => {
      const newCompleted = { ...prev };
      if (newCompleted[groupKey]) {
        delete newCompleted[groupKey]; // Use delete for unmarking groups
      } else {
        newCompleted[groupKey] = Date.now();
      }
      return newCompleted;
    });
  }, []);

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
        const groupKey = `${week}-${groupType}-${groupNumber}`; // Unique key for the group
        const groupItems = [];
        const exercisesInGroup = []; // Keep track of exercises in the group

        // Find all items in this group
        while (
          i < exercises.length &&
          exercises[i].match(
            new RegExp(`^${groupType}\\s+${groupNumber}[A-Z]:`, "i")
          )
        ) {
          const currentEx = exercises[i];
          exercisesInGroup.push(currentEx); // Add exercise to list for potential future use

          groupItems.push(
            <div
              key={`${week}-${currentEx}`} // Use unique key for list item
              className="flex items-center justify-between p-2 rounded bg-white shadow transition hover:shadow-md"
            >
              <span
                onClick={() => showDetails(currentEx)}
                className="cursor-pointer hover:text-blue-600 flex-1 mr-2"
              >
                {/* Remove the A/B/C prefix for display */}
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
            className={`border rounded-lg p-3 mt-2 space-y-2 shadow-md transition ${
              completed[groupKey] ? "bg-green-100" : "bg-gray-50" // Conditional bg on group container
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold">{`${groupType} ${groupNumber}`}</p>
              <button
                onClick={() => toggleGroup(groupKey)} // Use toggleGroup
                className="px-3 py-1 btn btn-primary rounded flex-shrink-0"
              >
                {completed[groupKey] ? "✓ Done" : "Mark Group Done"}
              </button>
            </div>
            <div className="space-y-1">{groupItems}</div>
          </div>
        );
      } else {
        // Render individual exercise (unchanged from previous logic)
        const key = `${week}-${ex}`;
        renderedElements.push(
          <div
            key={key}
            className={`flex items-center justify-between p-2 rounded shadow transition hover:shadow-md ${
              completed[key] ? "bg-green-100" : "bg-white"
            }`}
          >
            <span
              onClick={() => showDetails(ex)}
              className="cursor-pointer hover:text-blue-600 flex-1 mr-2"
            >
              {ex}
            </span>
            <button
              onClick={() => toggleExercise(week, ex)} // Keep individual toggle for non-grouped items
              className="px-3 py-1 btn btn-primary rounded flex-shrink-0"
            >
              {completed[key] ? "✓ Done" : "Mark Done"}
            </button>
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
      <div className="p-4 max-w-3xl mx-auto">
        <Header />
        <h1 className="text-xl font-bold mb-4">Progress Log</h1>

        <div className="mb-4 flex border-b">
          <button
            className={`py-2 px-4 ${
              activeTab === "lifts"
                ? "border-b-2 border-blue-500 font-bold"
                : ""
            }`}
            onClick={() => setActiveTab("lifts")}
          >
            Lifts
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === "measurements"
                ? "border-b-2 border-blue-500 font-bold"
                : ""
            }`}
            onClick={() => setActiveTab("measurements")}
          >
            Measurements
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === "cardio"
                ? "border-b-2 border-blue-500 font-bold"
                : ""
            }`}
            onClick={() => setActiveTab("cardio")}
          >
            Cardio
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow">
          <h2 className="font-bold mb-3">Add New Entry</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={newEntry.date}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, date: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
            </div>

            {activeTab === "lifts" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Exercise
                  </label>
                  <select
                    value={newEntry.lift}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, lift: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Exercise</option>
                    <option value="Squat">Squat</option>
                    <option value="Bench Press">Bench Press</option>
                    <option value="Deadlift">Deadlift</option>
                    <option value="Overhead Press">Overhead Press</option>
                    <option value="Barbell Row">Barbell Row</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Weight (lbs/kg)
                  </label>
                  <input
                    type="number"
                    value={newEntry.weight}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, weight: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    placeholder="Weight"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Reps (optional)
                  </label>
                  <input
                    type="number"
                    value={newEntry.reps}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, reps: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    placeholder="Reps"
                  />
                </div>
              </>
            )}

            {activeTab === "measurements" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Measurement Type
                  </label>
                  <select
                    value={newEntry.measurement}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, measurement: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Type</option>
                    <option value="Weight">Body Weight</option>
                    <option value="Waist">Waist</option>
                    <option value="Chest">Chest</option>
                    <option value="Arms">Arms</option>
                    <option value="Thighs">Thighs</option>
                    <option value="Body Fat %">Body Fat %</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Value
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newEntry.value}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, value: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    placeholder="Value"
                  />
                </div>
              </>
            )}

            {activeTab === "cardio" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Cardio Type
                  </label>
                  <select
                    value={newEntry.cardioType}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, cardioType: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Type</option>
                    <option value="Running">Running</option>
                    <option value="Walking">Walking</option>
                    <option value="Cycling">Cycling</option>
                    <option value="Elliptical">Elliptical</option>
                    <option value="Rowing">Rowing</option>
                    <option value="Swimming">Swimming</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={newEntry.duration}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, duration: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    placeholder="Minutes"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Distance (km/miles)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newEntry.distance}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, distance: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    placeholder="Distance"
                  />
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => addProgressEntry(activeTab)}
            className="px-4 py-2 btn btn-primary rounded"
          >
            Add Entry
          </button>
        </div>

        <div className="mb-6">
          <h2 className="font-bold mb-3">Progress History</h2>

          {activeTab === "lifts" && (
            <div className="overflow-x-auto">
              {progressData.lifts.length === 0 ? (
                <p className="text-gray-500">No lift data recorded yet.</p>
              ) : (
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border">Date</th>
                      <th className="py-2 px-4 border">Exercise</th>
                      <th className="py-2 px-4 border">Weight</th>
                      <th className="py-2 px-4 border">Reps</th>
                      <th className="py-2 px-4 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...progressData.lifts]
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border">
                            {new Date(entry.date).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-4 border">{entry.exercise}</td>
                          <td className="py-2 px-4 border">{entry.weight}</td>
                          <td className="py-2 px-4 border">
                            {entry.reps || "-"}
                          </td>
                          <td className="py-2 px-4 border">
                            <button
                              onClick={() =>
                                deleteProgressEntry("lifts", entry.id)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === "measurements" && (
            <div className="overflow-x-auto">
              {progressData.measurements.length === 0 ? (
                <p className="text-gray-500">
                  No measurement data recorded yet.
                </p>
              ) : (
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border">Date</th>
                      <th className="py-2 px-4 border">Measurement</th>
                      <th className="py-2 px-4 border">Value</th>
                      <th className="py-2 px-4 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...progressData.measurements]
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border">
                            {new Date(entry.date).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-4 border">{entry.type}</td>
                          <td className="py-2 px-4 border">{entry.value}</td>
                          <td className="py-2 px-4 border">
                            <button
                              onClick={() =>
                                deleteProgressEntry("measurements", entry.id)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === "cardio" && (
            <div className="overflow-x-auto">
              {progressData.cardio.length === 0 ? (
                <p className="text-gray-500">No cardio data recorded yet.</p>
              ) : (
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border">Date</th>
                      <th className="py-2 px-4 border">Type</th>
                      <th className="py-2 px-4 border">Duration</th>
                      <th className="py-2 px-4 border">Distance</th>
                      <th className="py-2 px-4 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...progressData.cardio]
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border">
                            {new Date(entry.date).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-4 border">{entry.type}</td>
                          <td className="py-2 px-4 border">
                            {entry.duration || "-"} min
                          </td>
                          <td className="py-2 px-4 border">
                            {entry.distance || "-"}
                          </td>
                          <td className="py-2 px-4 border">
                            <button
                              onClick={() =>
                                deleteProgressEntry("cardio", entry.id)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-3xl mx-auto">
      <Header />

      {Object.entries(WORKOUT_PLAN_FULL).map(([week, exercises]) => {
        const weekCompleted = isWeekCompleted(week, exercises);
        return (
          <div key={week} className="border rounded-lg shadow overflow-hidden">
            <div
              className={`${
                weekCompleted ? "bg-green-600" : "bg-blue-500"
              } text-white p-3 flex justify-between items-center cursor-pointer hover:${
                weekCompleted ? "bg-green-700" : "bg-blue-600"
              } transition`}
              onClick={() => toggleWeekExpansion(week)}
            >
              <h2 className="text-xl font-semibold">
                {week} {weekCompleted && "✓"}
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
              <div className="p-4 space-y-2 bg-gray-50">
                {renderExercises(week, exercises)}
              </div>
            </div>
          </div>
        );
      })}

      {modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold mb-3">{modalContent.title}</h3>
            {modalContent.isExercise ? (
              <>
                <div className="mb-3 text-blue-600 font-semibold">
                  {modalContent.prescription}
                </div>
                <div className="mb-4 max-h-60 overflow-y-auto pr-2">
                  <p>{modalContent.description}</p>
                </div>
              </>
            ) : (
              <div className="mb-4 max-h-60 overflow-y-auto pr-2">
                <p className="text-gray-700">{modalContent.description}</p>
              </div>
            )}
            <button
              onClick={() => setModalContent(null)}
              className="px-4 py-2 btn btn-primary rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-lg shadow-lg p-6 max-w-xl w-full"
            style={{ maxHeight: "90vh" }}
          >
            <h2 className="text-xl font-bold mb-4">Exercise Reference Guide</h2>
            <div
              className="space-y-3 overflow-y-auto pr-2"
              style={{ maxHeight: "calc(90vh - 8rem)" }}
            >
              {Object.entries(EXERCISE_GUIDE_FULL).map(([name, desc]) => (
                <div
                  key={name}
                  className="p-3 border rounded shadow-sm hover:shadow-md transition"
                >
                  <strong className="text-blue-600">{name}</strong>
                  <p className="mt-1 text-gray-700">{desc}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="mt-4 px-4 py-2 btn btn-primary rounded"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
