"use client";

import { Settings } from "lucide-react";

export default function SettingsPanel({
  fohEnabled,
  setFohEnabled,
  fohVolume,
  setFohVolume,
  backstageEnabled,
  setBackstageEnabled,
  backstageVolume,
  setBackstageVolume,
  onClose,
  onTestFoh,
  onTestBackstage,
}) {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Settings size={32} />
            Audio Settings
          </h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-150"
          >
            ✕ Close
          </button>
        </div>

        <div className="space-y-8">
          {/* FOH Settings */}
          <div className="bg-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              🎟️ FOH Calls (Left Channel)
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Enable FOH Calls</span>
                <button
                  onClick={() => setFohEnabled(!fohEnabled)}
                  className={`px-6 py-2 font-semibold rounded-lg transition-colors duration-150 ${
                    fohEnabled
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {fohEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white">Volume</span>
                  <span className="text-white">
                    {Math.round(fohVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={fohVolume}
                  onChange={(e) => setFohVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  disabled={!fohEnabled}
                />
              </div>
              <button
                onClick={onTestFoh}
                disabled={!fohEnabled}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors duration-150"
              >
                🔊 Test FOH Audio
              </button>
            </div>
          </div>

          {/* Backstage Settings */}
          <div className="bg-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              🎙️ Backstage Calls (Right Channel)
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Enable Backstage Calls</span>
                <button
                  onClick={() => setBackstageEnabled(!backstageEnabled)}
                  className={`px-6 py-2 font-semibold rounded-lg transition-colors duration-150 ${
                    backstageEnabled
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {backstageEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white">Volume</span>
                  <span className="text-white">
                    {Math.round(backstageVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={backstageVolume}
                  onChange={(e) =>
                    setBackstageVolume(parseFloat(e.target.value))
                  }
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  disabled={!backstageEnabled}
                />
              </div>
              <button
                onClick={onTestBackstage}
                disabled={!backstageEnabled}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors duration-150"
              >
                🔊 Test Backstage Audio
              </button>
            </div>
          </div>

          {/* Audio Info */}
          <div className="bg-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">
              ℹ️ Audio Information
            </h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>• FOH calls will play through the LEFT audio channel</p>
              <p>• Backstage calls will play through the RIGHT audio channel</p>
              <p>• Use headphones or a stereo audio system for proper channel separation</p>
              <p>• Test buttons will respect the current volume and enable/disable settings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
