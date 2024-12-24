export function getCurrentUser(
  db: IDBDatabase,
  email: string,
): Promise<
  | {
      id: number;
      email: string;
      password: string;
      firstname: string;
      lastname: string;
      picture: string;
      token?: string;
      tokenExpiry?: Date;
    }
  | undefined
> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("users", "readonly");
    const store = transaction.objectStore("users");
    const index = store.index("email");
    const request = index.get(email);

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => {
      console.error("Erreur lors de la récupération de l'utilisateur", event);
      reject("Erreur lors de la récupération de l'utilisateur");
    };
  });
}
