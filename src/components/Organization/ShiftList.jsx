import React from "react";

export default function ShiftList({ shifts }) {
  if (!shifts || shifts.length === 0) {
    return <p className="text-gray-600">No shifts available at the moment.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {shifts.map((shift, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between hover:shadow-xl transition"
        >
          <div>
            <h3 className="text-xl font-semibold mb-2">{shift.title}</h3>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Date:</span> {shift.date}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Location:</span> {shift.location}
            </p>
          </div>
          <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
            Apply
          </button>
        </div>
      ))}
    </div>
  );
}

