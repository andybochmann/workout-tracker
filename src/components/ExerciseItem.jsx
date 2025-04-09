import React from "react";

const ExerciseItem = ({
  exercise,
  week,
  completed,
  showDetails,
  toggleExercise,
}) => {
  const key = `${week}-${exercise}`;
  const exerciseData = completed[key];

  // For debugging - add this to check what's in exerciseData
  console.log("Exercise data for", key, exerciseData);

  return (
    <div
      className={`flex flex-col p-3 rounded-lg shadow transition hover:shadow-md ${
        exerciseData ? "bg-green-100" : "bg-white"
      }`}
    >
      {" "}
      <div className="flex justify-between items-center w-full">
        <span
          onClick={() => showDetails(exercise)}
          className="cursor-pointer hover:text-indigo-600 font-medium"
        >
          {exercise}
        </span>
        <button
          onClick={() => toggleExercise(week, exercise)}
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
