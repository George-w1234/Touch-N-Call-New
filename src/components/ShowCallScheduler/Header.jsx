"use client";

import { Settings } from "lucide-react";

export default function Header({ onSettingsClick, currentTime }) {
  return (
    <div
      className="px-6 py-4 border-b"
      style={{ borderColor: "#2D303A", backgroundColor: "#1E1E29" }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold">🎭 Show Call Scheduler</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={onSettingsClick}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors duration-150 flex items-center gap-2"
          >
            <Settings size={20} />
            Settings
          </button>
          <div className="text-sm opacity-75">
            {currentTime.toLocaleTimeString("en-US", { hour12: false })}
          </div>
        </div>
      </div>
    </div>
  );
}
