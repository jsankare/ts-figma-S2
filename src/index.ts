import { monitorUserInteraction } from "./utils/userInteraction.js";
import { generateStatistics } from "./utils/statistics.js";
import { getCurrentUser } from "./core/auth/handleUser.js";

function onUserInteraction(eventType: string) {
  console.log(`User interaction detected: ${eventType}`);
}

function initializeApp() {
  monitorUserInteraction(onUserInteraction);

  console.log("Monitoring user interactions...");
}

initializeApp();

// Charger les statistiques après le chargement de la page
document.addEventListener("DOMContentLoaded", async () => {
  const user = await getCurrentUser();
  if (user) {
    console.log(user.id);
    generateStatistics(user.id);
    const userImgMarkup = document.getElementById(
      "dashboard-pic",
    ) as HTMLImageElement;
    const userNameMarkup = document.getElementById(
      "dashboard-name",
    ) as HTMLImageElement;
    if (userImgMarkup) {   
      try {
        if (user.picture) {
          userImgMarkup.src = user.picture; // Set the image path to user's picture
        } else {
          userImgMarkup.src = "https://picsum.photos/200?grayscale";
        }
        if (user.firstname) {
          userNameMarkup.innerHTML =
            user.firstname.charAt(0).toUpperCase() +
            user.firstname.slice(1);
        } else {
          userNameMarkup.innerHTML = "Inconnu";
        }
      } catch (error) {
        console.error("Error retrieving user information:", error);
      }
    }
  }
});
