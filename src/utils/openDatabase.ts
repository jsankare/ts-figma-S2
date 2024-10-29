export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request: IDBOpenDBRequest = indexedDB.open("UserDatabase", 1);

    request.onerror = (event) => {
      console.error("Erreur lors de l'ouverture de la base de données", event);
      reject("Impossible d'ouvrir la base de données");
    };

    request.onsuccess = (event) => {
      const db = request.result;
      console.log("Base de données ouverte avec succès");
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;

      if (!db.objectStoreNames.contains("users")) {
        const userStore = db.createObjectStore("users", { keyPath: "email" });
        userStore.createIndex("token", "token", { unique: false });
      } else {
        const transaction = (event.target as IDBOpenDBRequest).transaction;
        const userStore = transaction!.objectStore("users");
        if (!userStore.indexNames.contains("token")) {
          userStore.createIndex("token", "token", { unique: false });
        }
      }
    };
  });
}
