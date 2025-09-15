"use client";

import { useState, useCallback } from "react";
import { Settings, Lock, Volume2 } from "lucide-react";
import { useSharedScheduler } from "../hooks/useSharedScheduler";
import { useActivityTracker } from "../hooks/useActivityTracker";
import {
  INACTIVITY_TIMEOUT,
  LOCK_PASSWORD,
} from "../components/ShowCallScheduler/constants";
import Header from "../components/ShowCallScheduler/Header";
import TimePicker from "../components/ShowCallScheduler/TimePicker";
import ActionButtons from "../components/ShowCallScheduler/ActionButtons";
import StatusDisplay from "../components/ShowCallScheduler/StatusDisplay";
import ActivityLog from "../components/ShowCallScheduler/ActivityLog";
import ConfirmationDialog from "../components/ShowCallScheduler/ConfirmationDialog";
import PasswordScreen from "../components/ShowCallScheduler/PasswordScreen";
import SettingsPanel from "../components/ShowCallScheduler/SettingsPanel";
import ManualCallsPanel from "../components/ShowCallScheduler/ManualCallsPanel";

export default function ShowCallSchedulerPage() {
  const [isLocked, setIsLocked] = useState(false);
  const [lockPassword, setLockPassword] = useState("");
  const [lockError, setLockError] = useState("");

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [showSettingsUnlock, setShowSettingsUnlock] = useState(false);
  const [settingsPassword, setSettingsPassword] = useState("");
  const [settingsError, setSettingsError] = useState("");

  // Manual calls state
  const [showManualCalls, setShowManualCalls] = useState(false);
  const [showCallsUnlock, setShowCallsUnlock] = useState(false);
  const [callsPassword, setCallsPassword] = useState("");
  const [callsError, setCallsError] = useState("");

  const scheduler = useSharedScheduler();

  const onInactive = useCallback(() => {
    if (
      !showSettings &&
      !showSettingsUnlock &&
      !showManualCalls &&
      !showCallsUnlock
    ) {
      setIsLocked(true);
    }
  }, [showSettings, showSettingsUnlock, showManualCalls, showCallsUnlock]);

  const { resetTimer } = useActivityTracker(
    onInactive,
    INACTIVITY_TIMEOUT,
    !isLocked &&
      !showSettings &&
      !showSettingsUnlock &&
      !showManualCalls &&
      !showCallsUnlock,
  );

  const handleUnlock = () => {
    setIsLocked(false);
    setLockPassword("");
    setLockError("");
    resetTimer();
  };

  const handleSettingsUnlockSuccess = () => {
    setShowSettings(true);
    setShowSettingsUnlock(false);
    setSettingsPassword("");
    setSettingsError("");
    resetTimer();
  };

  const handleCallsUnlockSuccess = () => {
    setShowManualCalls(true);
    setShowCallsUnlock(false);
    setCallsPassword("");
    setCallsError("");
    resetTimer();
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
    resetTimer();
  };

  const handleCloseManualCalls = () => {
    setShowManualCalls(false);
    resetTimer();
  };

  const handleStartSchedule = () => {
    scheduler.startSchedule();
    setShowConfirmDialog(false);
  };

  const handleTestFoh = () => scheduler.playAudio("house_open.wav", "foh");
  const handleTestBackstage = () =>
    scheduler.playAudio("beginners.wav", "backstage");

  const handleUpdateSettings = (newSettings) => {
    scheduler.updateSettings(newSettings);
  };

  // Show loading state
  if (scheduler.loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#191B22", color: "white" }}
      >
        <div className="text-center">
          <div className="text-2xl mb-4">🎭</div>
          <div>Loading Show Call Scheduler...</div>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <PasswordScreen
        Icon={Lock}
        title="Enter Password to Unlock"
        passwordToMatch={LOCK_PASSWORD}
        onSuccess={handleUnlock}
        submitButtonText="Unlock"
        password={lockPassword}
        setPassword={setLockPassword}
        error={lockError}
        setError={setLockError}
      />
    );
  }

  if (showSettingsUnlock) {
    return (
      <PasswordScreen
        Icon={Settings}
        title="Enter Password to Access Settings"
        passwordToMatch={LOCK_PASSWORD}
        onSuccess={handleSettingsUnlockSuccess}
        onCancel={() => {
          setShowSettingsUnlock(false);
          setSettingsPassword("");
          setSettingsError("");
        }}
        submitButtonText="Open Settings"
        password={settingsPassword}
        setPassword={setSettingsPassword}
        error={settingsError}
        setError={setSettingsError}
      />
    );
  }

  if (showCallsUnlock) {
    return (
      <PasswordScreen
        Icon={Volume2}
        title="Enter Password to Access Manual Calls"
        passwordToMatch={LOCK_PASSWORD}
        onSuccess={handleCallsUnlockSuccess}
        onCancel={() => {
          setShowCallsUnlock(false);
          setCallsPassword("");
          setCallsError("");
        }}
        submitButtonText="Open Manual Calls"
        password={callsPassword}
        setPassword={setCallsPassword}
        error={callsError}
        setError={setCallsError}
      />
    );
  }

  if (showSettings) {
    return (
      <SettingsPanel
        fohEnabled={scheduler.fohEnabled}
        setFohEnabled={(enabled) =>
          handleUpdateSettings({ foh_enabled: enabled })
        }
        fohVolume={scheduler.fohVolume}
        setFohVolume={(volume) => handleUpdateSettings({ foh_volume: volume })}
        backstageEnabled={scheduler.backstageEnabled}
        setBackstageEnabled={(enabled) =>
          handleUpdateSettings({ backstage_enabled: enabled })
        }
        backstageVolume={scheduler.backstageVolume}
        setBackstageVolume={(volume) =>
          handleUpdateSettings({ backstage_volume: volume })
        }
        onClose={handleCloseSettings}
        onTestFoh={handleTestFoh}
        onTestBackstage={handleTestBackstage}
      />
    );
  }

  if (showManualCalls) {
    return (
      <ManualCallsPanel
        onTriggerCall={scheduler.triggerCall}
        onClose={handleCloseManualCalls}
        fohEnabled={scheduler.fohEnabled}
        backstageEnabled={scheduler.backstageEnabled}
      />
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#191B22", color: "white" }}
    >
      <Header
        onSettingsClick={() => setShowSettingsUnlock(true)}
        currentTime={scheduler.currentTime}
      />

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Timer and Status Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <StatusDisplay
              fohCalls={scheduler.fohCalls}
              backstageCalls={scheduler.backstageCalls}
              fohEnabled={scheduler.fohEnabled}
              backstageEnabled={scheduler.backstageEnabled}
            />
          </div>

          <div>
            <TimePicker
              hour={scheduler.hour}
              minute={scheduler.minute}
              onAdjustTime={scheduler.adjustTime}
              onSetPresetTime={scheduler.setPresetTime}
              onConfirm={() => setShowConfirmDialog(true)}
              scheduleStarted={scheduler.scheduleStarted}
            />
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => scheduler.setMediaAllowed(!scheduler.mediaAllowed)}
            className={`px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-150 ${
              scheduler.mediaAllowed
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
            style={{ minHeight: "64px" }}
          >
            {scheduler.mediaAllowed
              ? "📷 Photos/Videos Allowed"
              : "🚫 No Photos/Videos Allowed"}
          </button>
        </div>

        {/* Manual Calls Button */}
        <div className="text-center">
          <button
            onClick={() => setShowCallsUnlock(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-150 flex items-center gap-2 mx-auto"
          >
            <Volume2 size={20} />
            Manual Calls
          </button>
        </div>

        <ActionButtons
          onHouseOpen={scheduler.houseOpen}
          onCancelSchedule={scheduler.cancelSchedule}
          onLockScreen={() => setIsLocked(true)}
          scheduleStarted={scheduler.scheduleStarted}
        />

        <ActivityLog logs={scheduler.logs} />
      </div>

      {showConfirmDialog && (
        <ConfirmationDialog
          hour={scheduler.hour}
          minute={scheduler.minute}
          onConfirm={handleStartSchedule}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}

      <style jsx global>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
