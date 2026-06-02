export function setupNetworkMonitor(syncFn: () => void): () => void {
  let intervalId: ReturnType<typeof setInterval> | null = null

  function startInterval() {
    if (intervalId !== null) clearInterval(intervalId)
    intervalId = setInterval(() => {
      if (navigator.onLine) syncFn()
    }, 60_000)
  }

  function stopInterval() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function handleOnline() {
    syncFn()
    startInterval()
  }

  function handleOffline() {
    stopInterval()
  }

  function handleVisibilityChange() {
    if (document.visibilityState === "visible" && navigator.onLine) {
      syncFn()
    }
  }

  window.addEventListener("online", handleOnline)
  window.addEventListener("offline", handleOffline)
  document.addEventListener("visibilitychange", handleVisibilityChange)

  if (navigator.onLine) {
    startInterval()
  }

  return () => {
    window.removeEventListener("online", handleOnline)
    window.removeEventListener("offline", handleOffline)
    document.removeEventListener("visibilitychange", handleVisibilityChange)
    stopInterval()
  }
}
