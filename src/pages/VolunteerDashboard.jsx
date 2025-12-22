import { useState } from "react";
import ShiftList from "../components/Organization/ShiftList";
import Navbar from "../components/Layout/Navbar";

export default function VolunteerDashboard() {
  const [appliedShifts, setAppliedShifts] = useState([]);

  const shifts = [
    { id: 1, title: "Morning Shift", date: "2025-12-22", location: "Nairobi" },
    { id: 2, title: "Evening Shift", date: "2025-12-23", location: "Nairobi" },
    { id: 3, title: "Weekend Shift", date: "2025-12-24", location: "Mombasa" },
  ];

  // 🔥 Meaningful button logic
  const handleApplyShift = (shift) => {
    if (appliedShifts.find((s) => s.id === shift.id)) return;

    setAppliedShifts([...appliedShifts, shift]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      {/* Navbar */}
      <Navbar />

      {/* Header */}
      <header className="p-8 bg-white shadow-md rounded-b-xl">
        <h1 className="text-4xl font-extrabold mb-2 text-indigo-700">
          Volunteer Dashboard
        </h1>
        <p className="text-gray-600">
          Discover nearby opportunities and make an impact.
        </p>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Available Shifts" value={shifts.length} />
          <StatCard label="Applied Shifts" value={appliedShifts.length} />
          <StatCard label="Upcoming" value={appliedShifts.length} />
        </div>
      </header>

      {/* Shift List */}
      <main className="p-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Available Shifts
        </h2>

        <ShiftList
          shifts={shifts}
          appliedShifts={appliedShifts}
          onApply={handleApplyShift}
        />

        {/* Feedback Section */}
        {appliedShifts.length > 0 && (
          <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-green-700">
              ✅ Applied Shifts
            </h3>
            <ul className="space-y-1 text-gray-700">
              {appliedShifts.map((shift) => (
                <li key={shift.id}>
                  {shift.title} – {shift.location}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

/* Small reusable stat card */
function StatCard({ label, value }) {
  return (
    <div className="bg-indigo-600 text-white p-4 rounded-lg shadow-md text-center">
      <p className="text-sm opacity-80">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
