"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Clock,
  Settings,
  Home,
  Lock,
  Play,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";

const INACTIVITY_TIMEOUT = 180000; // 3 minutes in milliseconds
const LOCK_PASSWORD = "2021";

export default function ShowCallScheduler() {
  // Time state
  const [hour, setHour] = useState(() => {
    const now = new Date();
    return (now.getHours() + (now.getMinutes() >= 30 ? 1 : 0)) % 24;
  });
  const [minute, setMinute] = useState(() => {
    const now = new Date();
    return now.getMinutes() >= 30 ? 0 : 30;
  });

  // App state
  const [scheduleStarted, setScheduleStarted] = useState(false);
  const [mediaAllowed, setMediaAllowed] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockPassword, setLockPassword] = useState("");
  const [lockError, setLockError] = useState("");
  const [showTime, setShowTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Countdown state
  const [fohCalls, setFohCalls] = useState([]);
  const [backstageCalls, setBackstageCalls] = useState([]);
  const [logs, setLogs] = useState([]);

  // Activity tracking
  const lastActivityRef = useRef(Date.now());
  const scheduleIntervalRef = useRef(null);
  const inactivityTimeoutRef = useRef(null);

  // Preset times
  const presetTimes = [
    { label: "14:30", hour: 14, minute: 30 },
    { label: "17:00", hour: 17, minute: 0 },
    { label: "18:30", hour: 18, minute: 30 },
    { label: "19:30", hour: 19, minute: 30 },
    { label: "20:00", hour: 20, minute: 0 },
  ];

  // Log function
  const addLog = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  // Activity tracking
  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    if (!isLocked) {
      inactivityTimeoutRef.current = setTimeout(() => {
        setIsLocked(true);
      }, INACTIVITY_TIMEOUT);
    }
  }, [isLocked]);

  // Initialize activity tracking
  useEffect(() => {
    const handleActivity = () => recordActivity();

    document.addEventListener("click", handleActivity);
    document.addEventListener("keypress", handleActivity);
    document.addEventListener("mousemove", handleActivity);
    document.addEventListener("touchstart", handleActivity);

    recordActivity(); // Start the timer

    return () => {
      document.removeEventListener("click", handleActivity);
      document.removeEventListener("keypress", handleActivity);
      document.removeEventListener("mousemove", handleActivity);
      document.removeEventListener("touchstart", handleActivity);
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [recordActivity]);

  // Current time ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Schedule management
  const createSchedule = (showDateTime) => {
    return [
      {
        label: "🎟️ 20 min FOH Call",
        time: new Date(showDateTime.getTime() - 20 * 60000),
        type: "foh",
        audioBase: "foh_20min",
      },
      {
        label: "🎙️ 15 min Call (Backstage)",
        time: new Date(showDateTime.getTime() - 20 * 60000),
        type: "backstage",
        audio: "15min.wav",
      },
      {
        label: "🎟️ 10 min FOH Call",
        time: new Date(showDateTime.getTime() - 10 * 60000),
        type: "foh",
        audioBase: "foh_10min",
      },
      {
        label: "🎙️ 10 min Call (Backstage)",
        time: new Date(showDateTime.getTime() - 15 * 60000),
        type: "backstage",
        audio: "10min.wav",
      },
      {
        label: "🎙️ 5 min Call (Backstage)",
        time: new Date(showDateTime.getTime() - 10 * 60000),
        type: "backstage",
        audio: "5min.wav",
      },
      {
        label: "🎟️ 5 min FOH Call",
        time: new Date(showDateTime.getTime() - 5 * 60000),
        type: "foh",
        audioBase: "foh_5min",
      },
      {
        label: "🎙️ Beginners (Backstage)",
        time: new Date(showDateTime.getTime() - 5 * 60000),
        type: "backstage",
        audio: "beginners.wav",
      },
      {
        label: "🎟️ About to start (3 min)",
        time: new Date(showDateTime.getTime() - 3 * 60000),
        type: "foh",
        audioBase: "foh_3min",
      },
      {
        label: "🎟️ About to start (2 min)",
        time: new Date(showDateTime.getTime() - 2 * 60000),
        type: "foh",
        audioBase: "foh_2min",
      },
    ];
  };

  // Audio playback
  const playAudio = useCallback(
    (filename) => {
      try {
        const audio = new Audio(`/audio/${filename}`);
        audio.play().catch((err) => {
          addLog(`⚠️ Could not play audio: ${filename}`);
          console.warn("Audio playback failed:", err);
        });
      } catch (err) {
        addLog(`⚠️ Missing audio file: ${filename}`);
      }
    },
    [addLog],
  );

  // Schedule processing
  useEffect(() => {
    if (!scheduleStarted || !showTime) return;

    const processSchedule = () => {
      const now = new Date();
      const schedule = createSchedule(showTime);
      const completedCalls = new Set();

      const newFohCalls = [];
      const newBackstageCalls = [];

      schedule.forEach((call) => {
        const timeUntil = call.time.getTime() - now.getTime();

        if (
          timeUntil <= 0 &&
          timeUntil > -60000 &&
          !completedCalls.has(call.label)
        ) {
          // Call is happening now (within the last minute)
          completedCalls.add(call.label);
          addLog(call.label);

          if (call.type === "foh") {
            const suffix = mediaAllowed ? "allowed" : "not_allowed";
            playAudio(`${call.audioBase}_${suffix}.wav`);
          } else {
            playAudio(call.audio);
          }
        } else if (timeUntil > 0) {
          // Call is upcoming
          const minutes = Math.floor(timeUntil / 60000);
          const seconds = Math.floor((timeUntil % 60000) / 1000);

          const timeDisplay = `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
          const suffix =
            call.type === "foh"
              ? mediaAllowed
                ? " [Photos OK]"
                : " [No Photos]"
              : "";
          const displayText = `${call.label.split(" ").slice(1).join(" ")} in ${timeDisplay}${suffix}`;

          if (call.type === "foh") {
            newFohCalls.push(displayText);
          } else {
            newBackstageCalls.push(displayText);
          }
        }
      });

      setFohCalls(newFohCalls);
      setBackstageCalls(newBackstageCalls);

      // Check if show has started (1 minute past show time)
      if (now.getTime() > showTime.getTime() + 60000) {
        addLog("🎬 Show has started!");
        setScheduleStarted(false);
        setShowTime(null);
        setFohCalls([]);
        setBackstageCalls([]);
      }
    };

    processSchedule(); // Run immediately
    scheduleIntervalRef.current = setInterval(processSchedule, 1000);

    return () => {
      if (scheduleIntervalRef.current) {
        clearInterval(scheduleIntervalRef.current);
      }
    };
  }, [scheduleStarted, showTime, mediaAllowed, addLog, playAudio]);

  // Time adjustment functions
  const adjustTime = (type, direction) => {
    if (scheduleStarted) return;

    if (type === "hour") {
      setHour((prev) =>
        direction === "up" ? (prev + 1) % 24 : (prev - 1 + 24) % 24,
      );
    } else {
      setMinute((prev) =>
        direction === "up" ? (prev + 1) % 60 : (prev - 1 + 60) % 60,
      );
    }
  };

  // Start schedule
  const startSchedule = () => {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    setShowTime(scheduledTime);
    setScheduleStarted(true);
    setShowConfirmDialog(false);
    addLog(
      `📅 Show scheduled for ${scheduledTime.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })}`,
    );
  };

  // Cancel schedule
  const cancelSchedule = () => {
    setScheduleStarted(false);
    setShowTime(null);
    setFohCalls([]);
    setBackstageCalls([]);
    addLog("❌ Schedule cancelled. You may set a new show time.");
  };

  // House open
  const houseOpen = () => {
    addLog("🏠 House Open");
    playAudio("house_open.wav");
  };

  // Lock screen functions
  const attemptUnlock = () => {
    if (lockPassword === LOCK_PASSWORD) {
      setIsLocked(false);
      setLockPassword("");
      setLockError("");
      recordActivity();
    } else {
      setLockError("Incorrect password");
    }
  };

  const handleUnlockKeyPress = (e) => {
    if (e.key === "Enter") {
      attemptUnlock();
    }
  };

  // New keypad functions
  const addToPassword = (digit) => {
    if (lockPassword.length < 10) {
      // Reasonable limit
      setLockPassword((prev) => prev + digit);
    }
  };

  const clearPassword = () => {
    setLockPassword("");
    setLockError("");
  };

  const backspacePassword = () => {
    setLockPassword((prev) => prev.slice(0, -1));
    setLockError("");
  };

  // Preset time function
  const setPresetTime = (hour, minute) => {
    if (scheduleStarted) return;
    setHour(hour);
    setMinute(minute);
  };

  // Lock screen overlay with keypad
  if (isLocked) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center p-8 max-w-lg">
          <Lock size={64} className="mx-auto mb-8 text-white" />
          <h2 className="text-2xl font-bold text-white mb-8">
            Enter Password to Unlock
          </h2>

          {/* Password Display */}
          <div className="w-80 mx-auto mb-6">
            <input
              type="password"
              value={lockPassword}
              onChange={(e) => setLockPassword(e.target.value)}
              onKeyPress={handleUnlockKeyPress}
              className="w-full px-4 py-4 text-2xl text-center rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Password"
              readOnly
            />
          </div>

          {lockError && (
            <p className="text-red-500 mb-6 text-lg">{lockError}</p>
          )}

          {/* On-Screen Keypad */}
          <div className="grid grid-cols-3 gap-4 mb-6 max-w-xs mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                onClick={() => addToPassword(digit.toString())}
                className="w-16 h-16 bg-gray-700 hover:bg-gray-600 text-white text-2xl font-bold rounded-lg transition-colors duration-150"
              >
                {digit}
              </button>
            ))}

            {/* Bottom row: Clear, 0, Backspace */}
            <button
              onClick={clearPassword}
              className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors duration-150"
            >
              CLR
            </button>
            <button
              onClick={() => addToPassword("0")}
              className="w-16 h-16 bg-gray-700 hover:bg-gray-600 text-white text-2xl font-bold rounded-lg transition-colors duration-150"
            >
              0
            </button>
            <button
              onClick={backspacePassword}
              className="w-16 h-16 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg transition-colors duration-150"
            >
              ⌫
            </button>
          </div>

          {/* Unlock Button */}
          <button
            onClick={attemptUnlock}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition-colors duration-150"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#191B22", color: "white" }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 border-b"
        style={{ borderColor: "#2D303A", backgroundColor: "#1E1E29" }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">🎭 Show Call Scheduler</h1>
          <div className="text-sm opacity-75">
            {currentTime.toLocaleTimeString("en-US", { hour12: false })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Time Picker with Presets */}
        <div className="text-center">
          <h2 className="text-xl mb-6">Tap the time to start show:</h2>
          <div className="flex items-center justify-center space-x-12">
            {/* Time Controls */}
            <div className="flex items-center space-x-8">
              {/* Hour Control */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => adjustTime("hour", "up")}
                  disabled={scheduleStarted}
                  className="p-4 text-2xl font-bold bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-colors duration-150 mb-2"
                  style={{ minWidth: "60px", minHeight: "60px" }}
                >
                  ▲
                </button>
                <button
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={scheduleStarted}
                  className="p-4 text-4xl font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors duration-150 cursor-pointer"
                  style={{ minWidth: "80px", minHeight: "80px" }}
                >
                  {hour.toString().padStart(2, "0")}
                </button>
                <button
                  onClick={() => adjustTime("hour", "down")}
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
                  onClick={() => adjustTime("minute", "up")}
                  disabled={scheduleStarted}
                  className="p-4 text-2xl font-bold bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-colors duration-150 mb-2"
                  style={{ minWidth: "60px", minHeight: "60px" }}
                >
                  ▲
                </button>
                <button
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={scheduleStarted}
                  className="p-4 text-4xl font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors duration-150 cursor-pointer"
                  style={{ minWidth: "80px", minHeight: "80px" }}
                >
                  {minute.toString().padStart(2, "0")}
                </button>
                <button
                  onClick={() => adjustTime("minute", "down")}
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
                  onClick={() => setPresetTime(preset.hour, preset.minute)}
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

        {/* Media Toggle */}
        <div className="text-center">
          <button
            onClick={() => setMediaAllowed(!mediaAllowed)}
            className={`px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-150 ${
              mediaAllowed
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
            style={{ minHeight: "64px" }}
          >
            {mediaAllowed
              ? "📷 Photos/Videos Allowed"
              : "🚫 No Photos/Videos Allowed"}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={houseOpen}
            className="px-8 py-4 text-lg font-semibold bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-150"
            style={{ minHeight: "64px" }}
          >
            🏠 House Open
          </button>

          {scheduleStarted && (
            <button
              onClick={cancelSchedule}
              className="px-8 py-4 text-lg font-semibold bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-150"
              style={{ minHeight: "64px" }}
            >
              ❌ Cancel Schedule
            </button>
          )}

          <button
            onClick={() => setIsLocked(true)}
            className="px-8 py-4 text-lg font-semibold bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors duration-150"
            style={{ minHeight: "64px" }}
          >
            🔒 Lock Screen
          </button>
        </div>

        {/* Status Display */}
        {(fohCalls.length > 0 || backstageCalls.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className="p-6 rounded-lg"
              style={{ backgroundColor: "#2A2F3A" }}
            >
              <h3 className="text-lg font-semibold mb-4">🎟️ FOH Status</h3>
              <div className="space-y-2">
                {fohCalls.length > 0 ? (
                  fohCalls.map((call, index) => (
                    <div key={index} className="text-sm opacity-90">
                      {call}
                    </div>
                  ))
                ) : (
                  <div className="text-sm opacity-75">
                    No upcoming FOH calls
                  </div>
                )}
              </div>
            </div>

            <div
              className="p-6 rounded-lg"
              style={{ backgroundColor: "#2A2F3A" }}
            >
              <h3 className="text-lg font-semibold mb-4">🎙️ Backstage Status</h3>
              <div className="space-y-2">
                {backstageCalls.length > 0 ? (
                  backstageCalls.map((call, index) => (
                    <div key={index} className="text-sm opacity-90">
                      {call}
                    </div>
                  ))
                ) : (
                  <div className="text-sm opacity-75">
                    No upcoming backstage calls
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Activity Log */}
        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: "#111", maxHeight: "400px" }}
        >
          <h3 className="text-lg font-semibold mb-4">📋 Activity Log</h3>
          <div
            className="font-mono text-sm space-y-1 overflow-y-auto"
            style={{ maxHeight: "300px", color: "#00ff00" }}
          >
            {logs.length === 0 ? (
              <div className="opacity-75">
                Tap the time to confirm show start
              </div>
            ) : (
              logs.map((log, index) => <div key={index}>{log}</div>)
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-6">
              Start show at {hour.toString().padStart(2, "0")}:
              {minute.toString().padStart(2, "0")}?
            </h3>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={startSchedule}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 font-semibold rounded-lg transition-colors duration-150"
              >
                ✅ Start
              </button>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 font-semibold rounded-lg transition-colors duration-150"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}