interface IdleOptions {
  threshold: number; // Time in milliseconds to consider idle
  onIdle: () => void; // Callback when user becomes idle
  onActive?: () => void; // Optional callback for active state
}

/**
 * Initializes the Idle Detection API.
 * @param {IdleOptions} options - Configuration options.
 */
export function startIdleDetector(options: IdleOptions): void {
  const { threshold, onIdle, onActive } = options;

  if (!('IdleDetector' in window)) {
    console.warn('Idle Detection API is not supported in this browser.');
    return;
  }

  const initialize = async () => {
    try {
      // Check for Idle Detection permissions
      const permissionStatus = await navigator.permissions.query({ name: 'idle-detection' as PermissionName });

      if (permissionStatus.state !== 'granted') {
        console.warn('Idle Detection permission not granted.');
        return;
      }

      const idleDetector = new IdleDetector();

      idleDetector.addEventListener('change', () => {
        const { userState, screenState } = idleDetector;

        if (userState === 'idle' || screenState === 'locked') {
          onIdle();
        } else if (userState === 'active') {
          onActive?.();
        }
      });

      await idleDetector.start({ threshold });
      console.log('Idle Detector started successfully.');
    } catch (error) {
      console.error('Error starting Idle Detector:', error);
    }
  };

  initialize();
}
