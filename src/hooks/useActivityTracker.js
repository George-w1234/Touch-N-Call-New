"use client";

import { useEffect, useRef, useCallback } from "react";

export function useActivityTracker(onInactive, timeout, active) {
  const inactivityTimeoutRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    if (active) {
      inactivityTimeoutRef.current = setTimeout(onInactive, timeout);
    }
  }, [onInactive, timeout, active]);

  useEffect(() => {
    const handleActivity = () => resetTimer();

    document.addEventListener("click", handleActivity);
    document.addEventListener("keypress", handleActivity);
    document.addEventListener("mousemove", handleActivity);
    document.addEventListener("touchstart", handleActivity);

    resetTimer(); // Start the timer initially

    return () => {
      document.removeEventListener("click", handleActivity);
      document.removeEventListener("keypress", handleActivity);
      document.removeEventListener("mousemove", handleActivity);
      document.removeEventListener("touchstart", handleActivity);
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [resetTimer]);
  
  return { resetTimer };
}
