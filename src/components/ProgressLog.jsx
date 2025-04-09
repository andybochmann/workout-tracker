import React from "react";

/**
 * Component to handle the Progress Log view
 * @param {Object} props
 * @param {Object} props.progressData - Progress data (lifts, measurements, cardio)
 * @param {string} props.activeTab - Currently active tab
 * @param {Function} props.setActiveTab - Function to change active tab
 * @param {Object} props.newEntry - Current new entry form data
 * @param {Function} props.setNewEntry - Function to update new entry form
 * @param {Function} props.addProgressEntry - Function to add a new progress entry
 * @param {Function} props.deleteProgressEntry - Function to delete a progress entry
 */
const ProgressLog = ({
  progressData,
  activeTab,
  setActiveTab,
  newEntry,
  setNewEntry,
  addProgressEntry,
  deleteProgressEntry,
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <h1 className="text-xl font-bold mb-4 text-indigo-600">Progress Log</h1>

      <div className="mb-4 flex border-b">
        <TabButton
          label="Lifts"
          isActive={activeTab === "lifts"}
          onClick={() => setActiveTab("lifts")}
        />
        <TabButton
          label="Measurements"
          isActive={activeTab === "measurements"}
          onClick={() => setActiveTab("measurements")}
        />
        <TabButton
          label="Cardio"
          isActive={activeTab === "cardio"}
          onClick={() => setActiveTab("cardio")}
        />
      </div>

      <div className="mb-6 p-4 bg-slate-50 rounded-lg shadow animate-fadeIn">
        <h2 className="font-bold mb-3 flex items-center text-indigo-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add New Entry
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Date field - always visible */}
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">
              Date
            </label>
            <input
              type="date"
              value={newEntry.date}
              onChange={(e) =>
                setNewEntry({ ...newEntry, date: e.target.value })
              }
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Lift tab fields */}
          {activeTab === "lifts" && (
            <LiftsForm newEntry={newEntry} setNewEntry={setNewEntry} />
          )}

          {/* Measurements tab fields */}
          {activeTab === "measurements" && (
            <MeasurementsForm newEntry={newEntry} setNewEntry={setNewEntry} />
          )}

          {/* Cardio tab fields */}
          {activeTab === "cardio" && (
            <CardioForm newEntry={newEntry} setNewEntry={setNewEntry} />
          )}
        </div>

        <button
          onClick={() => addProgressEntry(activeTab)}
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
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add Entry
        </button>
      </div>

      <div className="mb-6 animate-fadeIn">
        <h2 className="font-bold mb-3 flex items-center text-indigo-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          Progress History
        </h2>

        {activeTab === "lifts" && (
          <LiftsTable
            lifts={progressData.lifts}
            deleteEntry={(id) => deleteProgressEntry("lifts", id)}
          />
        )}

        {activeTab === "measurements" && (
          <MeasurementsTable
            measurements={progressData.measurements}
            deleteEntry={(id) => deleteProgressEntry("measurements", id)}
          />
        )}

        {activeTab === "cardio" && (
          <CardioTable
            cardio={progressData.cardio}
            deleteEntry={(id) => deleteProgressEntry("cardio", id)}
          />
        )}
      </div>
    </div>
  );
};

// Tab Button Component
const TabButton = ({ label, isActive, onClick }) => (
  <button
    className={`py-2 px-4 ${
      isActive
        ? "border-b-2 border-indigo-500 font-bold text-indigo-600"
        : "text-slate-700"
    }`}
    onClick={onClick}
  >
    {label}
  </button>
);

// Lifts Form Component
const LiftsForm = ({ newEntry, setNewEntry }) => (
  <>
    <div>
      <label className="block text-sm font-medium mb-1 text-slate-700">
        Exercise
      </label>
      <input
        type="text"
        value={newEntry.lift}
        onChange={(e) => setNewEntry({ ...newEntry, lift: e.target.value })}
        placeholder="e.g. Bench Press"
        className="w-full p-2 border rounded-lg"
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1 text-slate-700">
        Weight (lbs/kg)
      </label>
      <input
        type="number"
        value={newEntry.weight}
        onChange={(e) => setNewEntry({ ...newEntry, weight: e.target.value })}
        placeholder="e.g. 135"
        className="w-full p-2 border rounded-lg"
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1 text-slate-700">
        Reps (optional)
      </label>
      <input
        type="number"
        value={newEntry.reps}
        onChange={(e) => setNewEntry({ ...newEntry, reps: e.target.value })}
        placeholder="e.g. 8"
        className="w-full p-2 border rounded-lg"
      />
    </div>
  </>
);

// Measurements Form Component
const MeasurementsForm = ({ newEntry, setNewEntry }) => (
  <>
    <div>
      <label className="block text-sm font-medium mb-1 text-slate-700">
        Measurement Type
      </label>
      <select
        value={newEntry.measurement}
        onChange={(e) =>
          setNewEntry({
            ...newEntry,
            measurement: e.target.value,
          })
        }
        className="w-full p-2 border rounded-lg"
      >
        <option value="">Select type</option>
        <option value="Weight">Weight</option>
        <option value="Waist">Waist</option>
        <option value="Chest">Chest</option>
        <option value="Arms">Arms</option>
        <option value="Thighs">Thighs</option>
        <option value="Body Fat %">Body Fat %</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium mb-1 text-slate-700">
        Value
      </label>
      <input
        type="number"
        step="0.1"
        value={newEntry.value}
        onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
        placeholder="e.g. 180.5"
        className="w-full p-2 border rounded-lg"
      />
    </div>
  </>
);

// Cardio Form Component
const CardioForm = ({ newEntry, setNewEntry }) => (
  <>
    <div>
      <label className="block text-sm font-medium mb-1 text-slate-700">
        Cardio Type
      </label>
      <select
        value={newEntry.cardioType}
        onChange={(e) =>
          setNewEntry({ ...newEntry, cardioType: e.target.value })
        }
        className="w-full p-2 border rounded-lg"
      >
        <option value="">Select type</option>
        <option value="Running">Running</option>
        <option value="Walking">Walking</option>
        <option value="Cycling">Cycling</option>
        <option value="Elliptical">Elliptical</option>
        <option value="Rowing">Rowing</option>
        <option value="Stair Climber">Stair Climber</option>
        <option value="Swimming">Swimming</option>
        <option value="HIIT">HIIT</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium mb-1 text-slate-700">
        Duration (minutes)
      </label>
      <input
        type="number"
        value={newEntry.duration}
        onChange={(e) => setNewEntry({ ...newEntry, duration: e.target.value })}
        placeholder="e.g. 30"
        className="w-full p-2 border rounded-lg"
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1 text-slate-700">
        Distance (miles/km)
      </label>
      <input
        type="number"
        step="0.1"
        value={newEntry.distance}
        onChange={(e) => setNewEntry({ ...newEntry, distance: e.target.value })}
        placeholder="e.g. 2.5"
        className="w-full p-2 border rounded-lg"
      />
    </div>
  </>
);

// Lifts Table Component
const LiftsTable = ({ lifts, deleteEntry }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-slate-200">
      <thead className="bg-slate-100">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Date
          </th>
          <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Exercise
          </th>
          <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Weight
          </th>
          <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Reps
          </th>
          <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-slate-200">
        {lifts.length === 0 ? (
          <tr>
            <td colSpan="5" className="px-4 py-4 text-center text-slate-500">
              No lift data recorded yet
            </td>
          </tr>
        ) : (
          [...lifts]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                  {entry.exercise}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                  {entry.weight}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                  {entry.reps || "-"}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-red-500 hover:text-red-700 inline-flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))
        )}
      </tbody>
    </table>
  </div>
);

// Measurements Table Component
const MeasurementsTable = ({ measurements, deleteEntry }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-slate-200">
      <thead className="bg-slate-100">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Date
          </th>
          <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Measurement
          </th>
          <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Value
          </th>
          <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-slate-200">
        {measurements.length === 0 ? (
          <tr>
            <td colSpan="4" className="px-4 py-4 text-center text-slate-500">
              No measurement data recorded yet
            </td>
          </tr>
        ) : (
          [...measurements]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                  {entry.type}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                  {entry.value}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))
        )}
      </tbody>
    </table>
  </div>
);

// Cardio Table Component
const CardioTable = ({ cardio, deleteEntry }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-slate-200">
      <thead className="bg-slate-100">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Date
          </th>
          <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Type
          </th>
          <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Duration
          </th>
          <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Distance
          </th>
          <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-slate-200">
        {cardio.length === 0 ? (
          <tr>
            <td colSpan="5" className="px-4 py-4 text-center text-slate-500">
              No cardio data recorded yet
            </td>
          </tr>
        ) : (
          [...cardio]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                  {entry.type}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                  {entry.duration ? `${entry.duration} min` : "-"}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                  {entry.distance ? `${entry.distance} mi/km` : "-"}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))
        )}
      </tbody>
    </table>
  </div>
);

export default ProgressLog;
