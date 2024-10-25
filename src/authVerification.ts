// Hash password
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

// Check auth && Token validity
async function checkAuthentication() {
  const isAuthenticated = localStorage.getItem("IsAuthenticated") === "true";
  const authToken = localStorage.getItem("authToken");

  if (!isAuthenticated || !authToken) {
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
      localStorage.removeItem("IsAuthenticated");
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
checkAuthentication();
