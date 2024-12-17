interface NavigatorWithBattery extends Navigator {
  getBattery(): Promise<{
    charging: boolean;
    level: number;
    addEventListener(type: string, listener: EventListener): void;
  }>;
}
async function displayBatteryStatus() {
  // Vérifie si l'API Battery est disponible
  if (!("getBattery" in navigator)) {
    console.warn(
      "L'API Battery Status n'est pas prise en charge par ce navigateur.",
    );
    return;
  }

  try {
    const battery = await (navigator as NavigatorWithBattery).getBattery();

    // Création d'un conteneur pour afficher le statut
    const batteryStatusContainer = document.createElement("div");
    batteryStatusContainer.id = "batteryStatus";
    batteryStatusContainer.style.position = "fixed";
    batteryStatusContainer.style.bottom = "10px";
    batteryStatusContainer.style.right = "10px";
    batteryStatusContainer.style.padding = "10px";
    batteryStatusContainer.style.backgroundColor = "#333";
    batteryStatusContainer.style.color = "#fff";
    batteryStatusContainer.style.borderRadius = "8px";
    batteryStatusContainer.style.fontSize = "14px";
    document.body.appendChild(batteryStatusContainer);

    // Fonction pour mettre à jour l'affichage de la batterie
    function updateBatteryStatus() {
      const chargingStatus = battery.charging ? "En charge" : "Non en charge";
      const level = Math.round(battery.level * 100) + "%";
      batteryStatusContainer.textContent = `Batterie : ${level} (${chargingStatus})`;
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

// Appeler la fonction pour afficher le statut de la batterie
displayBatteryStatus();
