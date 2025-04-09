import React from "react";

/**
 * Modal for adding notes to exercises or exercise groups
 * @param {Object} props
 * @param {Object} props.noteModal - Modal configuration object
 * @param {string} props.noteContent - Current note content
 * @param {Function} props.setNoteContent - Function to update note content
 * @param {Function} props.saveExerciseNote - Function to save the note
 * @param {Function} props.setNoteModal - Function to update modal state
 */
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

export default NotesModal;
