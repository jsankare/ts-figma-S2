import { toastAlert } from "../shared/components/alert.js";
import { updateItem } from "../core/database/dbUtils.js";
import { getCurrentUser } from "../core/auth/handleUser.js";
import { User } from "../core/database/types.js";

let stream: MediaStream | null = null;

async function startCamera(): Promise<void> {
  const video = document.getElementById("video") as HTMLVideoElement;

  try {
    // Request access to the camera
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    // Show the button to take a photo
    document
      .getElementById("take-photo-button")
      ?.style.setProperty("display", "block");

    // Hide the button to start the camera
    document
      .getElementById("start-camera-button")
      ?.style.setProperty("display", "none");
  } catch (error) {
    toastAlert("error", "Erreur lors de l'accès à la caméra.");
    console.error("Erreur caméra:", error);
  }
}

async function takePicture(): Promise<void> {
  const video = document.getElementById("video") as HTMLVideoElement;
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;

  if (!stream) {
    toastAlert("error", "Flux de caméra non initialisé.");
    return;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    toastAlert("error", "Impossible de récupérer le contexte du canvas.");
    return;
  }

  if (video.videoWidth === 0 || video.videoHeight === 0) {
    toastAlert(
      "error",
      "Erreur : la vidéo n'a pas encore été chargée ou l'image est vide.",
    );
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Draw the video stream image onto the canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert the canvas image to a base64 string
  const pictureDataUrl = canvas.toDataURL("image/jpeg");

  // Stop the camera stream
  const tracks = stream.getTracks();
  tracks.forEach((track) => track.stop());
  stream = null; // Reset stream

  try {
    // Update the profile picture in the database
    const user = await getCurrentUser();
    if (!user) {
      toastAlert("error", "Utilisateur non trouvé.");
      return;
    }

    await updateItem("users", user.id, { picture: pictureDataUrl });

    // Update the profile picture in the DOM
    const profilePicture = document.getElementById(
      "profile--picture",
    ) as HTMLImageElement;
    if (profilePicture) {
      profilePicture.src = pictureDataUrl;
      profilePicture.style.display = "block";
    }

    toastAlert("success", "Votre photo de profil a bien été mise à jour.");
  } catch (error) {
    toastAlert(
      "error",
      "Erreur lors de la mise à jour de la photo de profil.",
    );
    console.error("Erreur lors de la mise à jour:", error);
  }
}

export { startCamera, takePicture };
