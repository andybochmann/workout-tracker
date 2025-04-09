import React from "react";

/**
 * Modal to display exercise details
 * @param {Object} props
 * @param {Object} props.modalContent - Content to display in the modal
 * @param {Function} props.setModalContent - Function to update modal content (close modal when null)
 */
const ExerciseModal = ({ modalContent, setModalContent }) => {
  if (!modalContent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full">
        <h3 className="text-xl font-bold mb-3 text-indigo-600">
          {modalContent.title}
        </h3>
        {modalContent.isExercise ? (
          <>
            <div className="mb-3 text-emerald-600 font-semibold flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {modalContent.prescription}
            </div>
            <div className="mb-4 max-h-60 overflow-y-auto pr-2">
              <p className="text-slate-700">{modalContent.description}</p>
            </div>
          </>
        ) : (
          <div className="mb-4 max-h-60 overflow-y-auto pr-2">
            <p className="text-slate-700">{modalContent.description}</p>
          </div>
        )}
        <button
          onClick={() => setModalContent(null)}
          className="px-4 py-2 btn btn-primary rounded-lg flex items-center"
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
          Close
        </button>
      </div>
    </div>
  );
};

export default ExerciseModal;
