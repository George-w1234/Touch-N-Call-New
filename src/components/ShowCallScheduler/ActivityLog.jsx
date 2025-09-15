"use client";

export default function ActivityLog({ logs }) {
  return (
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
          <div className="opacity-75">Tap the time to confirm show start</div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id || log.timestamp}
              className="flex items-start gap-2"
            >
              <span className="opacity-75 text-xs shrink-0">
                {new Date(log.timestamp).toLocaleTimeString("en-US", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
              <span className="flex-1">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
