import AuditTable from "../components/Admin/AuditTable";
import Navbar from "../components/Layout/Navbar";

export default function AdminDashboard() {
  const records = [
    { volunteer: "John Doe", amount: 50, date: "2025-12-20" },
    { volunteer: "Jane Smith", amount: 60, date: "2025-12-21" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Header */}
      <header className="p-6 bg-white shadow-md mb-6">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-700">
          Manage stipends and monitor volunteer activities.
        </p>
      </header>

      <main className="p-6 space-y-6">
        {/* Base Stipend Form */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Base Stipend Rate</h2>
          <form className="flex gap-2">
            <input
              type="number"
              className="border rounded p-2 w-32"
              placeholder="Amount"
            />
            <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
              Update
            </button>
          </form>
        </section>

        {/* Payment History */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Payment History</h2>
          <AuditTable records={records} />
        </section>
      </main>
    </div>
  );
}
