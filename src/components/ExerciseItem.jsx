import React from "react";

const ExerciseItem = ({
  exercise,
  week,
  completed,
  showDetails,
  toggleExercise,
  setNoteModal,
  setNoteContent,
}) => {
  // Handle both old string format and new object format
  const exerciseTitle =
    typeof exercise === "object" ? exercise.title : exercise;
  const key = `${week}-${exerciseTitle}`;
  const exerciseData = completed[key];

  // Add execution details if available
  const executionDetails =
    typeof exercise === "object" && exercise.execution
      ? exercise.execution
      : "";

  // Get note if it exists
  const exerciseNote =
    exerciseData && exerciseData.note ? exerciseData.note : null;

  return (
    <div
      className={`flex flex-col p-3 rounded-lg shadow transition hover:shadow-md ${
        exerciseData ? "bg-green-100" : "bg-white"
      }`}
    >
      {" "}
      <div className="flex justify-between items-start w-full">
        <div>
          <span
            onClick={() => showDetails(exercise)}
            className="cursor-pointer hover:text-indigo-600 font-medium block"
          >
            {exerciseTitle}
          </span>
          {executionDetails && (
            <span className="text-sm text-gray-500 block">
              {executionDetails}
            </span>
          )}
          {exerciseNote && (
            <span className="text-sm italic text-indigo-600 block">
              Note: {exerciseNote}
            </span>
          )}
        </div>
        <button
          onClick={() => {
            if (exerciseData) {
              // If already marked as done, just toggle it off
              toggleExercise(week, exerciseTitle);
            } else {
              // Open note modal to add a note before marking as done
              setNoteModal({
                show: true,
                week,
                exercise: exerciseTitle,
                isGroup: false,
                groupKey: "",
              });
              // Clear any previous note content
              setNoteContent("");
            }
          }}
          className={`ml-3 px-3 py-1 rounded-lg flex-shrink-0 flex items-center whitespace-nowrap ${
            exerciseData ? "btn btn-success" : "btn btn-primary"
          }`}
        >
          {exerciseData ? (
            <span className="flex items-center">
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
            </span>
          ) : (
            "Mark Done"
          )}
        </button>
      </div>
    </div>
  );
};

export default ExerciseItem;
