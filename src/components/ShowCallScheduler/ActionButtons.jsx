"use client";

export default function ActionButtons({
  onHouseOpen,
  onCancelSchedule,
  onLockScreen,
  scheduleStarted,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button
        onClick={onHouseOpen}
        className="px-8 py-4 text-lg font-semibold bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-150"
        style={{ minHeight: "64px" }}
      >
        🏠 House Open
      </button>

      {scheduleStarted && (
        <button
          onClick={onCancelSchedule}
          className="px-8 py-4 text-lg font-semibold bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-150"
          style={{ minHeight: "64px" }}
        >
          ❌ Cancel Schedule
        </button>
      )}

      <button
        onClick={onLockScreen}
        className="px-8 py-4 text-lg font-semibold bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors duration-150"
        style={{ minHeight: "64px" }}
      >
        🔒 Lock Screen
      </button>
    </div>
  );
}
