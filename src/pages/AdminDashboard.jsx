import { useState } from "react";
import Navbar from "../components/Layout/Navbar";
// import StatsCard from "../components/Admin/StatsCard";
// import VolunteerTable from "../components/Admin/VolunteerTable";
// import PaymentHistory from "../components/Admin/PaymentHistory";

export default function AdminDashboard() {
  const [stipend, setStipend] = useState(500);

  const volunteers = [
    {
      id: 1,
      name: "John Doe",
      hours: 8,
      location: "Nairobi",
      status: "Pending",
    },
    {
      id: 2,
      name: "Jane Smith",
      hours: 10,
      location: "Mombasa",
      status: "Approved",
    },
  ];

  const payments = [
    { id: 1, name: "John Doe", amount: 4000, date: "2025-12-21" },
    { id: 2, name: "Jane Smith", amount: 5000, date: "2025-12-22" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <Navbar />

      <main className="p-8 space-y-10">
        {/* HEADER */}
        <header className="bg-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-4xl font-extrabold text-indigo-700">
            Admin Control Panel
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor volunteers, manage stipends, and authorize payments.
          </p>
        </header>

        {/* STATS */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard title="Total Volunteers" value="124" color="indigo" />
          <StatsCard title="Active Shifts" value="38" color="purple" />
          <StatsCard title="Pending Approvals" value="7" color="yellow" />
          <StatsCard title="Total Paid (KES)" value="1.2M" color="green" />
        </section>

        {/* STIPEND MANAGEMENT */}
        <section className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">
            Stipend Rate Management
          </h2>

          <div className="flex items-center gap-4">
            <input
              type="number"
              value={stipend}
              onChange={(e) => setStipend(e.target.value)}
              className="border p-3 rounded w-40 text-lg"
            />
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition">
              Update Rate
            </button>
          </div>
        </section>

        {/* VOLUNTEER ACTIVITY */}
        <VolunteerTable volunteers={volunteers} stipend={stipend} />

        {/* PAYMENT HISTORY */}
        <PaymentHistory payments={payments} />
      </main>
    </div>
  );
}
