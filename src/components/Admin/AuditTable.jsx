import { useMemo, useState } from "react";

export default function AuditTable({ records = [] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");

  /* ===============================
     FILTER + SEARCH + SORT LOGIC
     =============================== */

  const filteredRecords = useMemo(() => {
    let data = [...records];

    // Search by volunteer name
    if (search) {
      data = data.filter((r) =>
        r.volunteer.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "All") {
      data = data.filter((r) => r.status === statusFilter);
    }

    // Sorting
    if (sortBy === "amount") {
      data.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === "date") {
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return data;
  }, [records, search, statusFilter, sortBy]);

  /* ===============================
     TOTAL AMOUNT PAID
     =============================== */
  const totalPaid = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + r.amount, 0);
  }, [filteredRecords]);

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 space-y-6">
      {/* ===============================
          HEADER
         =============================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Payment Audit Log
          </h2>
          <p className="text-gray-500 text-sm">
            Review all stipend transactions made to volunteers
          </p>
        </div>

        <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-semibold">
          Total Paid: KES {totalPaid.toLocaleString()}
        </div>
      </div>

      {/* ===============================
          CONTROLS
         =============================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search volunteer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
        </select>
      </div>

      {/* ===============================
          TABLE
         =============================== */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-indigo-600 text-white">
              <th className="p-4 text-left">Volunteer</th>
              <th className="p-4 text-left">Amount (KES)</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center p-8 text-gray-500"
                >
                  No audit records found
                </td>
              </tr>
            ) : (
              filteredRecords.map((record, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-medium text-gray-800">
                    {record.volunteer}
                  </td>
                  <td className="p-4 font-semibold">
                    {record.amount.toLocaleString()}
                  </td>
                  <td className="p-4 text-gray-600">
                    {record.date}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={record.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===============================
          FOOTER
         =============================== */}
      <div className="text-sm text-gray-500 text-right">
        Showing {filteredRecords.length} of {records.length} records
      </div>
    </div>
  );
}

/* ===============================
   STATUS BADGE COMPONENT
   =============================== */
function StatusBadge({ status }) {
  const styles = {
    Completed: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Failed: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-4 py-1 rounded-full text-sm font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
