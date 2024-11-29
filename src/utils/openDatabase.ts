import { Budget } from "../budgets.js";
import { Category } from "../categories.js";
import { Transaction } from "../transactions.js";

export function openDatabase(dbName: string, dataName: string, keyPath: string): Promise<IDBDatabase> {
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

// Ajouter un élément à la base de données
export async function addItemToDatabase(
  dbName: string,
  storeName: string,
  keyPath: string,
  item: { [key: string]: any },
  formData: FormData
): Promise<void> {
  const db = await openDatabase(dbName, storeName, keyPath);
  console.log('Database opened:', db);
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);

  // Gérer l'ID de l'élément
  if (formData.get('id')) {
    item[keyPath] = parseInt(formData.get('id') as string, 10);
    console.log('Updating item with ID:', item[keyPath]);
  } else {
    const newId = await generateUniqueId(store, keyPath);
    item[keyPath] = newId;
    console.log('Generated new ID:', newId);
  }

  // Enregistrer l'élément dans la base de données
  const request = store.put(item);
  return new Promise<void>((resolve, reject) => {
    request.onsuccess = () => {
      console.log('Item saved successfully:', item);
      resolve();
    };

    request.onerror = (event) => {
      console.error(`Error saving item:`, (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };

    transaction.oncomplete = () => {
      console.log('Transaction completed successfully');
    };

    transaction.onerror = (event) => {
      console.error('Transaction error:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
}

// Générer un ID unique pour les nouveaux éléments
async function generateUniqueId(store: IDBObjectStore, keyPath: string): Promise<number> {
  console.log('Generating unique ID...');
  const cursorRequest = store.openCursor(null, 'prev');
  return new Promise<number>((resolve, reject) => {
    cursorRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        console.log('Found cursor:', cursor);
        resolve(cursor.value[keyPath] + 1);
      } else {
        console.log('No previous cursor found, starting from ID 1');
        resolve(1);
      }
    };

    cursorRequest.onerror = (event) => {
      console.error('Error generating unique ID:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
}

// Récupérer tous les éléments de la base de données
export async function getAllItems(dbName: string, storeName: string, keyPath: string): Promise<(Category | Transaction | Budget)[]> {
  const db = await openDatabase(dbName, storeName, keyPath);
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => {
      const items = (event.target as IDBRequest<(Category | Transaction | Budget)[]>).result;
      resolve(items);
    };

    request.onerror = (event) => {
      console.error(`Error fetching items:`, (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
}

// Supprimer un élément de la base de données
export async function deleteItem(dbName: string, storeName: string, id: number, fields: string[]): Promise<void> {
  try {
    const db = await openDatabase(dbName, storeName, 'id');
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    const request = store.delete(id);
    return new Promise<void>((resolve, reject) => {
      request.onsuccess = () => {
        console.log(`Item with ID ${id} deleted`);
        resolve();
      };

      request.onerror = (event) => {
        console.error(`Error deleting item:`, (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  } catch (error) {
    console.error(`Error deleting item:`, error);
    throw error;
  }
}

// Récupérer un élément par ID
export async function getItemById(dbName: string, storeName: string, keyPath: string, id: number): Promise<Category | Transaction | Budget> {
  const db = await openDatabase(dbName, storeName, keyPath);
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);
  const request = store.get(id);

  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => {
      const item = (event.target as IDBRequest<Category | Transaction | Budget>).result;
      if (item) {
        resolve(item);
      } else {
        reject('Item not found');
      }
    };
    request.onerror = (event) => {
      console.error('Error fetching item:', (event.target as IDBRequest).error);
      reject('Error fetching item');
    };
  });
}