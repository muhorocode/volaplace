import { useState } from "react";
import Navbar from "../components/Layout/Navbar";
import AuditTable from "../components/Admin/AuditTable";

export default function AdminDashboard() {
  const [stipend, setStipend] = useState(500);

  // Mock audit/payment records (passed to AuditTable)
  const auditRecords = [
    {
      id: 1,
      volunteer: "John Doe",
      hours: 8,
      amount: 4000,
      location: "Nairobi",
      status: "Pending",
      date: "2025-12-21",
    },
    {
      id: 2,
      volunteer: "Jane Smith",
      hours: 10,
      amount: 5000,
      location: "Mombasa",
      status: "Approved",
      date: "2025-12-22",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      {/* Top Navigation */}
      <Navbar />

      <main className="p-8 space-y-8">
        {/* HEADER */}
        <header className="bg-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-4xl font-extrabold text-indigo-700">
            Admin Control Panel
          </h1>
          <p className="text-gray-600 mt-2">
            Review volunteer work, manage stipends, and audit payments.
          </p>
        </header>

        {/* STIPEND MANAGEMENT */}
        <section className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">
            Stipend Rate Management
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <input
              type="number"
              value={stipend}
              onChange={(e) => setStipend(Number(e.target.value))}
              className="border px-4 py-2 rounded-lg w-40"
            />
            <button
              onClick={() =>
                alert(`Base stipend updated to KES ${stipend} per hour`)
              }
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Update Rate
            </button>
          </div>
        </section>

        {/* AUDIT TABLE (YOUR MAIN RESPONSIBILITY) */}
        <section className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">
            Audit & Payment Records
          </h2>

          <AuditTable records={auditRecords} />
        </section>
      </main>
    </div>
  );
}
