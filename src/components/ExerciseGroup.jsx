import React from "react";

const ExerciseGroup = ({
  week,
  groupType,
  groupNumber,
  groupItems,
  completed,
  toggleGroup,
  setNoteModal,
  setNoteContent,
}) => {
  // For the new JSON structure, the groupKey will use the actual group identifier from the JSON
  const groupKey = `${week}-${groupType.toLowerCase()}_${groupNumber}`;

  return (
    <div
      className={`border rounded-xl p-4 mt-3 space-y-2 shadow-md transition ${
        completed[groupKey] ? "bg-green-100" : "bg-slate-50"
      }`}
    >
      {" "}
      <div className="flex justify-between items-center mb-3">
        <p className="font-semibold text-slate-700 flex-shrink">{`${groupType} ${groupNumber}`}</p>{" "}
        <button
          onClick={() => {
            if (completed[groupKey]) {
              // If already marked as done, just toggle it off
              toggleGroup(groupKey);
            } else {
              // Open note modal to add a note before marking as done
              setNoteModal({
                show: true,
                week,
                exercise: `${groupType} ${groupNumber}`,
                isGroup: true,
                groupKey: groupKey,
              });
              // Clear any previous note content
              setNoteContent("");
            }
          }}
          className={`px-3 py-1 rounded-lg flex-shrink-0 ml-4 flex items-center ${
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
    </div>
  );
};

export default ExerciseGroup;
