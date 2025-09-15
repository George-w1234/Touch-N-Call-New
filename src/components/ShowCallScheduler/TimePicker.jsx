"use client";

import { presetTimes } from "./constants";

export default function TimePicker({
  hour,
  minute,
  onAdjustTime,
  onSetPresetTime,
  onConfirm,
  scheduleStarted,
}) {
  return (
    <div className="text-center">
      <h2 className="text-xl mb-6">Tap the time to start show:</h2>
      <div className="flex items-center justify-center space-x-12">
        {/* Time Controls */}
        <div className="flex items-center space-x-8">
          {/* Hour Control */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => onAdjustTime("hour", "up")}
              disabled={scheduleStarted}
              className="p-4 text-2xl font-bold bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-colors duration-150 mb-2"
              style={{ minWidth: "60px", minHeight: "60px" }}
            >
              ▲
            </button>
            <button
              onClick={onConfirm}
              disabled={scheduleStarted}
              className="p-4 text-4xl font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors duration-150 cursor-pointer"
              style={{ minWidth: "80px", minHeight: "80px" }}
            >
              {hour.toString().padStart(2, "0")}
            </button>
            <button
              onClick={() => onAdjustTime("hour", "down")}
              disabled={scheduleStarted}
              className="p-4 text-2xl font-bold bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-colors duration-150 mt-2"
              style={{ minWidth: "60px", minHeight: "60px" }}
            >
              ▼
            </button>
          </div>

          {/* Separator */}
          <div className="text-4xl font-bold">:</div>

          {/* Minute Control */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => onAdjustTime("minute", "up")}
              disabled={scheduleStarted}
              className="p-4 text-2xl font-bold bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-colors duration-150 mb-2"
              style={{ minWidth: "60px", minHeight: "60px" }}
            >
              ▲
            </button>
            <button
              onClick={onConfirm}
              disabled={scheduleStarted}
              className="p-4 text-4xl font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors duration-150 cursor-pointer"
              style={{ minWidth: "80px", minHeight: "80px" }}
            >
              {minute.toString().padStart(2, "0")}
            </button>
            <button
              onClick={() => onAdjustTime("minute", "down")}
              disabled={scheduleStarted}
              className="p-4 text-2xl font-bold bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-colors duration-150 mt-2"
              style={{ minWidth: "60px", minHeight: "60px" }}
            >
              ▼
            </button>
          </div>
        </div>

        {/* Preset Time Buttons */}
        <div className="flex flex-col space-y-3">
          <h3 className="text-lg font-semibold mb-2">Quick Times:</h3>
          {presetTimes.map((preset) => (
            <button
              key={preset.label}
              onClick={() => onSetPresetTime(preset.hour, preset.minute)}
              disabled={scheduleStarted}
              className="px-6 py-3 text-lg font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition-colors duration-150"
              style={{ minWidth: "100px" }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
