export type InteractionCallback = (eventType: string) => void;

/**
 * Monitors user interactions and invokes the provided callback when an interaction occurs.
 * @param callback - Function to call when an interaction is detected.
 * @param interval - Optional interval to check `navigator.userActivation.isActive`.
 */
export function monitorUserInteraction(
  callback: InteractionCallback,
  interval: number = 1000,
): void {
  const events = ["click", "mousemove", "keydown", "scroll", "touchstart"];
  // Each event listener is tied to an interaction detection
  events.forEach((event) => {
    window.addEventListener(event, () => callback(event));
  });

  // Check loop with interval
  const intervalId = setInterval(() => {
    if (navigator.userActivation?.isActive) {
      callback("navigator.userActivation.isActive");
    }
  }, interval);

  // Clean up
  window.addEventListener("before clean up", () => clearInterval(intervalId));
}
