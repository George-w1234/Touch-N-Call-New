"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const createSchedule = (showDateTime) => {
  return [
    { label: "🎟️ 20 min FOH Call", time: new Date(showDateTime.getTime() - 20 * 60000), type: "foh", audioBase: "foh_20min" },
    { label: "🎙️ 15 min Call (Backstage)", time: new Date(showDateTime.getTime() - 20 * 60000), type: "backstage", audio: "15min.wav" },
    { label: "🎟️ 10 min FOH Call", time: new Date(showDateTime.getTime() - 10 * 60000), type: "foh", audioBase: "foh_10min" },
    { label: "🎙️ 10 min Call (Backstage)", time: new Date(showDateTime.getTime() - 15 * 60000), type: "backstage", audio: "10min.wav" },
    { label: "🎙️ 5 min Call (Backstage)", time: new Date(showDateTime.getTime() - 10 * 60000), type: "backstage", audio: "5min.wav" },
    { label: "🎟️ 5 min FOH Call", time: new Date(showDateTime.getTime() - 5 * 60000), type: "foh", audioBase: "foh_5min" },
    { label: "🎙️ Beginners (Backstage)", time: new Date(showDateTime.getTime() - 5 * 60000), type: "backstage", audio: "beginners.wav" },
    { label: "🎟️ About to start (3 min)", time: new Date(showDateTime.getTime() - 3 * 60000), type: "foh", audioBase: "foh_3min" },
    { label: "🎟️ About to start (2 min)", time: new Date(showDateTime.getTime() - 2 * 60000), type: "foh", audioBase: "foh_2min" },
  ];
};

export function useShowScheduler({
  fohEnabled,
  backstageEnabled,
  fohVolume,
  backstageVolume,
}) {
  const [hour, setHour] = useState(() => {
    const now = new Date();
    return (now.getHours() + (now.getMinutes() >= 30 ? 1 : 0)) % 24;
  });
  const [minute, setMinute] = useState(() => {
    const now = new Date();
    return now.getMinutes() >= 30 ? 0 : 30;
  });
  const [mediaAllowed, setMediaAllowed] = useState(false);

  const [scheduleStarted, setScheduleStarted] = useState(false);
  const [showTime, setShowTime] = useState(null);
  
  const [fohCalls, setFohCalls] = useState([]);
  const [backstageCalls, setBackstageCalls] = useState([]);
  const [logs, setLogs] = useState([]);
  
  const [currentTime, setCurrentTime] = useState(new Date());

  const audioContextRef = useRef(null);
  const scheduleIntervalRef = useRef(null);

  useEffect(() => {
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
    };
    const handleFirstInteraction = () => {
      initAudioContext();
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };
    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("touchstart", handleFirstInteraction);
    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, []);
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const addLog = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  const playAudio = useCallback(
    (filename, type) => {
      if ((type === "foh" && !fohEnabled) || (type === "backstage" && !backstageEnabled)) {
        return;
      }

      try {
        const audio = new Audio(`/audio/${filename}`);
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
          const source = audioContextRef.current.createMediaElementSource(audio);
          const gainNode = audioContextRef.current.createGain();
          const pannerNode = audioContextRef.current.createStereoPanner();

          if (type === "foh") {
            gainNode.gain.value = fohVolume;
            pannerNode.pan.value = -1; // Left
          } else {
            gainNode.gain.value = backstageVolume;
            pannerNode.pan.value = 1; // Right
          }

          source.connect(gainNode);
          gainNode.connect(pannerNode);
          pannerNode.connect(audioContextRef.current.destination);
        }

        audio.play().catch((err) => {
          addLog(`⚠️ Could not play audio: ${filename}`);
          console.warn("Audio playback failed:", err);
        });
      } catch (err) {
        addLog(`⚠️ Missing audio file: ${filename}`);
      }
    },
    [addLog, fohEnabled, backstageEnabled, fohVolume, backstageVolume]
  );

  useEffect(() => {
    if (!scheduleStarted || !showTime) {
      if (scheduleIntervalRef.current) {
        clearInterval(scheduleIntervalRef.current);
      }
      return;
    }

    const processSchedule = () => {
      const now = new Date();
      const schedule = createSchedule(showTime);
      const completedCalls = new Set();
      const newFohCalls = [];
      const newBackstageCalls = [];

      schedule.forEach((call) => {
        const timeUntil = call.time.getTime() - now.getTime();
        if (timeUntil <= 0 && timeUntil > -60000 && !completedCalls.has(call.label)) {
          completedCalls.add(call.label);
          addLog(call.label);
          if (call.type === "foh") {
            const suffix = mediaAllowed ? "allowed" : "not_allowed";
            playAudio(`${call.audioBase}_${suffix}.wav`, "foh");
          } else {
            playAudio(call.audio, "backstage");
          }
        } else if (timeUntil > 0) {
          const minutes = Math.floor(timeUntil / 60000);
          const seconds = Math.floor((timeUntil % 60000) / 1000);
          const timeDisplay = `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
          const suffix = call.type === "foh" ? (mediaAllowed ? " [Photos OK]" : " [No Photos]") : "";
          const displayText = `${call.label.split(" ").slice(1).join(" ")} in ${timeDisplay}${suffix}`;

          if (call.type === "foh" && fohEnabled) newFohCalls.push(displayText);
          else if (call.type === "backstage" && backstageEnabled) newBackstageCalls.push(displayText);
        }
      });

      setFohCalls(newFohCalls);
      setBackstageCalls(newBackstageCalls);

      if (now.getTime() > showTime.getTime() + 60000) {
        addLog("🎬 Show has started!");
        setScheduleStarted(false);
        setShowTime(null);
        setFohCalls([]);
        setBackstageCalls([]);
      }
    };

    processSchedule();
    scheduleIntervalRef.current = setInterval(processSchedule, 1000);

    return () => {
      if (scheduleIntervalRef.current) clearInterval(scheduleIntervalRef.current);
    };
  }, [scheduleStarted, showTime, mediaAllowed, addLog, playAudio, fohEnabled, backstageEnabled]);

  const adjustTime = (type, direction) => {
    if (scheduleStarted) return;
    if (type === "hour") {
      setHour((prev) => (direction === "up" ? (prev + 1) % 24 : (prev - 1 + 24) % 24));
    } else {
      setMinute((prev) => (direction === "up" ? (prev + 1) % 60 : (prev - 1 + 60) % 60));
    }
  };

  const startSchedule = () => {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    setShowTime(scheduledTime);
    setScheduleStarted(true);
    addLog(`📅 Show scheduled for ${scheduledTime.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })}`);
  };

  const cancelSchedule = () => {
    setScheduleStarted(false);
    setShowTime(null);
    setFohCalls([]);
    setBackstageCalls([]);
    addLog("❌ Schedule cancelled. You may set a new show time.");
  };

  const houseOpen = () => {
    addLog("🏠 House Open");
    playAudio("house_open.wav", "foh");
  };
  
  const setPresetTime = (h, m) => {
    if (scheduleStarted) return;
    setHour(h);
    setMinute(m);
  };

  return {
    hour, minute, mediaAllowed, setMediaAllowed,
    scheduleStarted, fohCalls, backstageCalls,
    logs, currentTime,
    adjustTime, startSchedule, cancelSchedule, houseOpen,
    setPresetTime,
    playAudio,
  };
}
