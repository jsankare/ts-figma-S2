export function openDatabase(dbName: string, dataName: string, keyPath : string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request: IDBOpenDBRequest = indexedDB.open(dbName, 1);

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

      if (!db.objectStoreNames.contains(dataName)) {
        const dataStore = db.createObjectStore(dataName, { keyPath: keyPath });
        if (dataName === 'users') {
          dataStore.createIndex("token", "token", { unique: false });
        }
      } else {
        if (dataName === 'users') {
          const transaction = db.transaction(dataName, "versionchange");
          const dataStore = transaction.objectStore(dataName);

          if (!dataStore.indexNames.contains("token")) {
            dataStore.createIndex("token", "token", { unique: false });
            console.log(`Index 'token' created in existing '${dataName}' object store.`);
          }
        }
      }
    };
  });
}