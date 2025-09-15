"use client";

export default function ConfirmationDialog({ hour, minute, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-gray-800 p-8 rounded-lg text-center">
        <h3 className="text-xl font-semibold mb-6">
          Start show at {hour.toString().padStart(2, "0")}:
          {minute.toString().padStart(2, "0")}?
        </h3>
        <div className="flex space-x-4 justify-center">
          <button
            onClick={onConfirm}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 font-semibold rounded-lg transition-colors duration-150"
          >
            ✅ Start
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 font-semibold rounded-lg transition-colors duration-150"
          >
            ❌ Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
