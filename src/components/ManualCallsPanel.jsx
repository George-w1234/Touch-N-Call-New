"use client";

import { Volume2, Users, Home, Clock, AlertTriangle } from "lucide-react";

const CALL_TYPES = {
  foh: [
    { type: "house_open", label: "🏠 House Open", description: "Open house to audience" },
    { type: "house_to_half", label: "🕐 House to Half", description: "30 minutes to curtain" },
    { type: "house_to_fifteen", label: "🕒 House to 15", description: "15 minutes to curtain" },
    { type: "house_to_five", label: "🕔 House to 5", description: "5 minutes to curtain" },
    { type: "house_closed", label: "🚪 House Closed", description: "Close house doors" },
  ],
  backstage: [
    { type: "beginners", label: "👥 Beginners", description: "Beginners to stage" },
    { type: "half_hour", label: "🕕 Half Hour", description: "Half hour to places" },
    { type: "fifteen_minutes", label: "🕐 Fifteen Minutes", description: "15 minutes to places" },
    { type: "five_minutes", label: "🕔 Five Minutes", description: "5 minutes to places" },
    { type: "places", label: "🎭 Places", description: "All cast to places" },
    { type: "standby", label: "⚡ Standby", description: "Standby for go" },
    { type: "go", label: "✅ GO", description: "Show go!" },
    { type: "intermission", label: "☕ Intermission", description: "Intermission begins" },
    { type: "end_of_show", label: "🎊 End of Show", description: "Show complete" },
  ]
};

export default function ManualCallsPanel({ onTriggerCall, onClose, fohEnabled, backstageEnabled }) {
  const handleCallClick = (callType, location) => {
    onTriggerCall(callType, location);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4 rounded-lg"
        style={{ backgroundColor: "#1E1E29", color: "white" }}
      >
        <div className="p-6 border-b" style={{ borderColor: "#2D303A" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Volume2 size={24} />
              Manual Calls
            </h2>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
          <p className="text-gray-400 mt-2">
            Trigger individual calls manually. Audio will play on devices with sound enabled.
          </p>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* FOH Calls */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Home size={20} />
              <h3 className="text-xl font-semibold">Front of House</h3>
              {!fohEnabled && (
                <span className="text-sm text-orange-400 flex items-center gap-1">
                  <AlertTriangle size={16} />
                  Audio Disabled
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              {CALL_TYPES.foh.map((call) => (
                <button
                  key={call.type}
                  onClick={() => handleCallClick(call.type, "foh")}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-150 ${
                    fohEnabled
                      ? "border-blue-500 hover:bg-blue-500 hover:bg-opacity-20 hover:border-blue-400"
                      : "border-gray-600 hover:bg-gray-600 hover:bg-opacity-20"
                  }`}
                >
                  <div className="font-semibold">{call.label}</div>
                  <div className="text-sm text-gray-400">{call.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Backstage Calls */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users size={20} />
              <h3 className="text-xl font-semibold">Backstage</h3>
              {!backstageEnabled && (
                <span className="text-sm text-orange-400 flex items-center gap-1">
                  <AlertTriangle size={16} />
                  Audio Disabled
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              {CALL_TYPES.backstage.map((call) => (
                <button
                  key={call.type}
                  onClick={() => handleCallClick(call.type, "backstage")}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-150 ${
                    backstageEnabled
                      ? "border-green-500 hover:bg-green-500 hover:bg-opacity-20 hover:border-green-400"
                      : "border-gray-600 hover:bg-gray-600 hover:bg-opacity-20"
                  }`}
                >
                  <div className="font-semibold">{call.label}</div>
                  <div className="text-sm text-gray-400">{call.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-800 bg-opacity-50 border-t" style={{ borderColor: "#2D303A" }}>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock size={16} />
            <span>Calls are logged and synced across all connected devices</span>
          </div>
        </div>
      </div>
    </div>
  );
}