import ShiftList from "../components/Organization/ShiftList";
import Navbar from "../components/Layout/Navbar";

export default function VolunteerDashboard() {
  const shifts = [
    { title: "Morning Shift", date: "2025-12-22", location: "Nairobi" },
    { title: "Evening Shift", date: "2025-12-23", location: "Nairobi" },
    { title: "Weekend Shift", date: "2025-12-24", location: "Mombasa" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar />

      {/* Header */}
      <header className="p-6 bg-white shadow-md mb-6">
        <h1 className="text-4xl font-bold mb-2">Available Shifts</h1>
        <p className="text-gray-700">
          Browse and select shifts you want to participate in.
        </p>
      </header>

      {/* Shift List */}
      <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ShiftList shifts={shifts} />
      </main>
    </div>
  );
}
