import React from "react";

/**
 * Modal to display the exercise reference guide
 * @param {Object} props
 * @param {boolean} props.showGuide - Whether to show the guide modal
 * @param {Function} props.setShowGuide - Function to toggle guide visibility
 * @param {Object} props.workoutPlanData - Workout plan data from JSON file
 */
const GuideModal = ({ showGuide, setShowGuide, workoutPlanData }) => {
  if (!showGuide) return null;

  // Extract all unique exercises from the workout plan
  const allExercises = new Map();

  // Loop through all weeks and collect unique exercises with their descriptions
  Object.values(workoutPlanData).forEach((weekExercises) => {
    weekExercises.forEach((exercise) => {
      if (
        exercise.title &&
        exercise.description &&
        !allExercises.has(exercise.title)
      ) {
        allExercises.set(exercise.title, exercise.description);
      }
    });
  });

  return (
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
          {Array.from(allExercises).map(([name, desc]) => (
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
  );
};

export default GuideModal;
