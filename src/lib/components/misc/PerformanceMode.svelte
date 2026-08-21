<script lang="ts">
  import { browser } from "$app/environment";
  import { getPreferences } from "$ctx";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";

  const THRESHOLD = 24;
  const MIN_SAMPLES = 10; // Require more samples before triggering
  const SMOOTHING_FACTOR = 0.2; // For exponential moving average
  const INITIALIZATION_DELAY = 3000; // Wait 3 seconds after mount before detecting
  const preferences = getPreferences();

  let fps = 60;
  let smoothedFps = 60;
  let rafId: number;
  let startTime = 0;

  let frameCount = 0;
  let lastTime = 0;
  let shownToast = $state(false);
  let lowFpsStreak = 0;
  let fpsHistory: number[] = [];
  let isTabActive = true;
  let lastVisibilityChange = 0;

  // Handle visibility changes to avoid false positives when tab/window is inactive
  function handleVisibilityChange() {
    const wasActive = isTabActive;
    isTabActive = !document.hidden;
    lastVisibilityChange = performance.now();

    // If tab becomes active again, reset some tracking to avoid stale data
    if (!wasActive && isTabActive) {
      // Reset FPS history after becoming active again
      fpsHistory = [];
      lowFpsStreak = 0;
      smoothedFps = 60; // Reset to a neutral value
      frameCount = 0;
      lastTime = performance.now();
    }
  }

  function measure(now: number) {
    // Skip measurement if tab is not active to avoid false positives
    if (!isTabActive) {
      rafId = requestAnimationFrame(measure);
      return;
    }

    frameCount++;
    const delta = now - lastTime;

    if (delta >= 1000) {
      fps = Math.round((frameCount * 1000) / delta);
      frameCount = 0;
      lastTime = now;

      // Apply exponential moving average for smoothing
      smoothedFps = smoothedFps * (1 - SMOOTHING_FACTOR) + fps * SMOOTHING_FACTOR;

      // Add to history for trend analysis
      fpsHistory.push(fps);
      if (fpsHistory.length > 15) {
        fpsHistory.shift(); // Keep only last 15 samples for better accuracy
      }

      // Only start detecting after initialization period and ensure we have enough samples
      const timeSinceStart = now - startTime;
      const timeSinceVisibilityChange = now - lastVisibilityChange;

      // Wait for initialization AND ensure tab has been active for at least 2 seconds
      if (
        timeSinceStart > INITIALIZATION_DELAY &&
        timeSinceVisibilityChange > 2000 &&
        fpsHistory.length >= MIN_SAMPLES
      ) {
        checkPerformance();
      }
    }

    rafId = requestAnimationFrame(measure);
  }

  function checkPerformance() {
    // Calculate average of recent samples
    const recentAverage = fpsHistory.reduce((sum, fps) => sum + fps, 0) / fpsHistory.length;

    // Count how many recent samples are below threshold
    const lowSamples = fpsHistory.filter((fps) => fps < THRESHOLD).length;
    const lowPercentage = lowSamples / fpsHistory.length;

    // More strict detection: require ALL recent samples to be below threshold
    // AND the smoothed FPS to be consistently low
    const allSamplesLow = lowPercentage === 1.0; // 100% of samples are low
    const isConsistentlyLow = recentAverage < THRESHOLD && smoothedFps < THRESHOLD;

    if (allSamplesLow && isConsistentlyLow) {
      lowFpsStreak++;
      if (lowFpsStreak >= 2 && !shownToast) {
        // Require 2 consecutive periods where ALL samples are low
        activatePerformanceMode();
      }
    } else {
      lowFpsStreak = 0; // Reset streak if any sample is good
    }
  }

  function activatePerformanceMode() {
    if (shownToast) return; // Prevent multiple toasts
    toast.warning("Low Performance Detected", {
      id: "low-performance",
      description: "We've detected low performance on your device. Would you like to enable Performance Mode?",
      action: {
        label: "Enable",
        onClick: () => {
          preferences.performanceMode = true;
          toast.message("Performance Mode Enabled", {
            id: "performance-mode-enabled",
            description:
              "Please note that the performance detection is not 100% accurate and may not always reflect your device's capabilities, be your own judge. You can always disable performance mode in settings.",
            duration: 5000
          });
        }
      },
      duration: Number.POSITIVE_INFINITY
    });
    shownToast = true;
  }

  // Start measuring FPS once component mounts
  onMount(() => {
    if (browser) {
      startTime = performance.now();
      lastTime = startTime;
      lastVisibilityChange = startTime;
      rafId = requestAnimationFrame(measure);
    }
    return () => {
      if (browser && rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  });
</script>

<svelte:document on:visibilitychange={handleVisibilityChange} />
