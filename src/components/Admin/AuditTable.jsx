import React from "react";

export default function AuditTable({ records }) {
  if (!records || records.length === 0) {
    return <p className="text-gray-600">No payment records available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead className="bg-gray-200">
          <tr>
            <th className="text-left px-6 py-3 font-medium text-gray-700">Volunteer</th>
            <th className="text-left px-6 py-3 font-medium text-gray-700">Amount</th>
            <th className="text-left px-6 py-3 font-medium text-gray-700">Date</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
            >
              <td className="px-6 py-4 text-gray-800">{record.volunteer}</td>
              <td className="px-6 py-4 text-gray-800">${record.amount}</td>
              <td className="px-6 py-4 text-gray-800">{record.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
