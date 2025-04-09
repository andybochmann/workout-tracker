import React from "react";

/**
 * Header component for consistent navigation
 * @param {Object} props
 * @param {string} props.view - Current view (workouts or progress)
 * @param {Function} props.setView - Function to change view
 * @param {Function} props.setShowGuide - Function to toggle exercise guide visibility
 */
const Header = ({ view, setView, setShowGuide }) => (
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

export default Header;
