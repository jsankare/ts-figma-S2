import { detectBrowser } from "./navigatorDetection.js";

interface NavigatorWithBattery extends Navigator {
  getBattery(): Promise<{
    charging: boolean;
    level: number;
    addEventListener(type: string, listener: EventListener): void;
  }>;
}
export async function displayBatteryStatus(container: HTMLElement) {
  const browser = detectBrowser();

  // Vérifie si l'API Battery est disponible
  if (!("getBattery" in navigator) || browser === "Brave") {
    console.warn(
      "L'API Battery Status n'est pas prise en charge par ce navigateur.",
    );
    return;
  }

  try {
    const battery = await (navigator as NavigatorWithBattery).getBattery();

    // Création d'un élément pour afficher le statut de la batterie
    const batteryStatusElement = document.createElement("span");
    batteryStatusElement.id = "batteryStatus";
    container.appendChild(batteryStatusElement);

    // Fonction pour mettre à jour l'affichage
    function updateBatteryStatus() {
      const chargingStatus = battery.charging ? "(En charge)" : "";
      const level = Math.round(battery.level * 100) + "%";
      batteryStatusElement.textContent = `Batterie - ${level} ${chargingStatus}`;
    }

    // Mise à jour initiale
    updateBatteryStatus();

    // Écoute des événements de mise à jour
    battery.addEventListener("chargingchange", updateBatteryStatus);
    battery.addEventListener("levelchange", updateBatteryStatus);

    console.log("Battery Status affiché avec succès.");
  } catch (error) {
    console.error("Erreur lors de l’accès à l’API Battery Status:", error);
  }
}
