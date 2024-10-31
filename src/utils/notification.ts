export function showNotification(
  title: string,
  options?: NotificationOptions,
  vibrationPattern?: number[],
): void {
  if (!("Notification" in window)) {
    console.warn("Les notifications ne sont pas supportées par ce navigateur.");
    return;
  }

  const createNotification = () => {
    const notification = new Notification(title, options);
    notification.onclick = () => {
      console.log("Notification cliquée !");
    };
    notification.onclose = () => {
      console.log("Notification fermée.");
    };
    if (vibrationPattern && "vibrate" in navigator) {
      navigator.vibrate(vibrationPattern);
    }
  };

  if (Notification.permission === "granted") {
    createNotification();
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        createNotification();
      } else {
        console.warn("Permission de notification refusée.");
      }
    });
  } else {
    console.warn("Les notifications sont désactivées pour ce site.");
  }
}

(window as any).notifyMe = showNotification;
