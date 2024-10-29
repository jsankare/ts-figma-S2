export async function uploadImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject("Erreur lors de la lecture du fichier");
    };

    reader.readAsDataURL(file);
  });
}
