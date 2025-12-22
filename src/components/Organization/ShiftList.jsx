export default function ShiftList({ shifts, appliedShifts, onApply }) {
  if (!shifts.length) {
    return (
      <p className="text-center text-gray-600">
        No shifts available at the moment.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {shifts.map((shift) => {
        const isApplied = appliedShifts.some(
          (s) => s.id === shift.id
        );

        return (
          <div
            key={shift.id}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <h3 className="text-xl font-bold text-indigo-700 mb-1">
              {shift.title}
            </h3>
            <p className="text-gray-600">{shift.location}</p>
            <p className="text-gray-500 text-sm mb-4">{shift.date}</p>

            <button
              disabled={isApplied}
              onClick={() => onApply(shift)}
              className={`w-full py-2 rounded font-semibold transition ${
                isApplied
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {isApplied ? "Applied ✔" : "Apply for Shift"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
