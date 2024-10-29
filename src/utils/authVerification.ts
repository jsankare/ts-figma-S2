import { openDatabase } from "./openDatabase.js";
import { logoutLogic } from "./logout.js";

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

// Check auth && Token validity
async function checkAuthentication() {
  const userEmail = localStorage.getItem("userMail");
  const authToken = getCookie("token");

  if (!userEmail || !authToken) {
    logoutLogic();
    return;
  }

  // Fetch token
  const db = await openDatabase();
  const transaction = db.transaction("users", "readonly");
  const store = transaction.objectStore("users");
  const index = store.index("token");
  const request = index.get(authToken);

  request.onsuccess = () => {
    const user = request.result;

    // Check token validity
    if (!user || !user.tokenExpiry || new Date(user.tokenExpiry) < new Date()) {
      console.log("Token expiré ou utilisateur introuvable");
      logoutLogic();
    } else {
      console.log("Authentification réussie !");
    }
  };

  request.onerror = () => {
    console.error("Erreur lors de la vérification du token");
    logoutLogic();
  };
}

// Call Auth function at page load
checkAuthentication().then(() => console.log("success"));
