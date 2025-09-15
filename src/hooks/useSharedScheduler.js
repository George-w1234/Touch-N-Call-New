import { useState, useEffect, useCallback } from 'react';

export function useSharedScheduler() {
  const [state, setState] = useState({
    current_hour: 19,
    current_minute: 30,
    schedule_started: false,
    media_allowed: false,
    start_time: null
  });
  
  const [settings, setSettings] = useState({
    foh_enabled: true,
    backstage_enabled: true,
    foh_volume: 0.8,
    backstage_volume: 0.8
  });
  
  const [callStatus, setCallStatus] = useState({
    fohCalls: [],
    backstageCalls: []
  });
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial state and poll for updates
  const fetchState = useCallback(async () => {
    try {
      const response = await fetch('/api/scheduler/state');
      if (response.ok) {
        const data = await response.json();
        setState(data.state);
        setSettings(data.settings);
        setCallStatus(data.callStatus);
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Error fetching state:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll for updates every 2 seconds
  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, [fetchState]);

  // Update state on server
  const updateState = useCallback(async (updates) => {
    try {
      const response = await fetch('/api/scheduler/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        // Immediately fetch updated state
        await fetchState();
      }
    } catch (error) {
      console.error('Error updating state:', error);
    }
  }, [fetchState]);

  // Add log entry
  const addLog = useCallback(async (message, type = 'info') => {
    try {
      await fetch('/api/scheduler/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, type })
      });
      await fetchState(); // Refresh to get updated logs
    } catch (error) {
      console.error('Error adding log:', error);
    }
  }, [fetchState]);

  // Trigger manual call
  const triggerCall = useCallback(async (callType, location, message) => {
    try {
      const response = await fetch('/api/scheduler/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callType, location, message })
      });
      
      if (response.ok) {
        await fetchState(); // Refresh to get updated status
        
        // Also play audio if this device can
        try {
          const audio = new Audio(`/${callType}.wav`);
          audio.volume = location === 'foh' ? settings.foh_volume : settings.backstage_volume;
          audio.play().catch(() => {
            // Audio play failed, but that's ok for remote devices
          });
        } catch (e) {
          // Audio not available on this device
        }
      }
    } catch (error) {
      console.error('Error triggering call:', error);
    }
  }, [fetchState, settings]);

  // Schedule management functions
  const adjustTime = useCallback((type, amount) => {
    let newHour = state.current_hour;
    let newMinute = state.current_minute;
    
    if (type === 'hour') {
      newHour = Math.max(0, Math.min(23, newHour + amount));
    } else {
      newMinute = Math.max(0, Math.min(59, newMinute + amount));
    }
    
    updateState({
      state: { current_hour: newHour, current_minute: newMinute }
    });
  }, [state, updateState]);

  const setPresetTime = useCallback((hour, minute) => {
    updateState({
      state: { current_hour: hour, current_minute: minute }
    });
  }, [updateState]);

  const startSchedule = useCallback(() => {
    const startTime = new Date();
    startTime.setHours(state.current_hour, state.current_minute, 0, 0);
    
    updateState({
      state: { 
        schedule_started: true, 
        start_time: startTime.toISOString() 
      }
    });
    
    addLog(`🎭 Show scheduled for ${startTime.toLocaleTimeString('en-US', { hour12: false })}`);
  }, [state, updateState, addLog]);

  const cancelSchedule = useCallback(() => {
    updateState({
      state: { 
        schedule_started: false, 
        start_time: null 
      }
    });
    addLog('❌ Schedule cancelled');
  }, [updateState, addLog]);

  const setMediaAllowed = useCallback((allowed) => {
    updateState({
      state: { media_allowed: allowed }
    });
    addLog(allowed ? '📷 Photos/Videos now allowed' : '🚫 Photos/Videos no longer allowed');
  }, [updateState, addLog]);

  const houseOpen = useCallback(() => {
    triggerCall('house_open', 'foh', '🏠 House is now open');
  }, [triggerCall]);

  const updateSettings = useCallback((newSettings) => {
    updateState({ settings: newSettings });
  }, [updateState]);

  return {
    // State
    hour: state.current_hour,
    minute: state.current_minute,
    scheduleStarted: state.schedule_started,
    mediaAllowed: state.media_allowed,
    startTime: state.start_time,
    currentTime,
    loading,
    
    // Settings
    fohEnabled: settings.foh_enabled,
    backstageEnabled: settings.backstage_enabled,
    fohVolume: settings.foh_volume,
    backstageVolume: settings.backstage_volume,
    
    // Call status
    fohCalls: callStatus.fohCalls,
    backstageCalls: callStatus.backstageCalls,
    
    // Logs
    logs,
    
    // Actions
    adjustTime,
    setPresetTime,
    startSchedule,
    cancelSchedule,
    setMediaAllowed,
    houseOpen,
    updateSettings,
    triggerCall,
    addLog,
    
    // Audio helper (for local playback)
    playAudio: (filename, location) => {
      try {
        const audio = new Audio(`/${filename}`);
        audio.volume = location === 'foh' ? settings.foh_volume : settings.backstage_volume;
        audio.play().catch(() => {});
      } catch (e) {}
    }
  };
}