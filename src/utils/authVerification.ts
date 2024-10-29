import { openDatabase } from "./openDatabase";

// Check auth && Token validity
async function checkAuthentication() {
  const userEmail = localStorage.getItem("userMail");
  const authToken = localStorage.getItem("authToken");

  if (!userEmail || !authToken) {
    window.location.href = "login.html";
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
      localStorage.removeItem("userEmail");
      localStorage.removeItem("authToken");
      window.location.href = "login.html";
    } else {
      console.log("Authentification réussie !");
    }
  };

  request.onerror = () => {
    console.error("Erreur lors de la vérification du token");
    window.location.href = "login.html";
  };
}

// Call Auth function at page load
checkAuthentication().then(() => console.log("success"));
