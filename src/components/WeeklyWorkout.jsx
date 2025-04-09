import React from "react";

/**
 * Component to render a weekly workout section
 * @param {Object} props
 * @param {string} props.week - Week identifier (e.g. "Week 1")
 * @param {Array} props.exercises - List of exercises for this week
 * @param {Object} props.completed - Object tracking completed exercises
 * @param {Object} props.expandedWeeks - Object tracking which weeks are expanded
 * @param {Function} props.toggleWeekExpansion - Function to toggle week expansion
 * @param {Function} props.renderExercises - Function to render exercise list
 * @param {Function} props.isWeekCompleted - Function to check if week is completed
 */
const WeeklyWorkout = ({
  week,
  exercises,
  completed,
  expandedWeeks,
  toggleWeekExpansion,
  renderExercises,
  isWeekCompleted,
}) => {
  const weekCompleted = isWeekCompleted(week, exercises);

  return (
    <div className="border rounded-xl shadow overflow-hidden bg-white">
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
      </div>{" "}
      <div
        className={`accordion-content ${
          expandedWeeks[week] ? "open" : ""
        } bg-white`}
      >
        <div className="p-4 space-y-2">{renderExercises(week, exercises)}</div>
      </div>
    </div>
  );
};

export default WeeklyWorkout;
