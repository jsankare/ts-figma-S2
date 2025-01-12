import { displayPassword, hashPassword, validatePassword } from "../core/auth/passwordUtils.js";
import { addItem, openDatabase } from "../core/database/dbUtils.js";
import { checkUserExists } from "../core/auth/handleUser.js";
import { toastAlert } from "../shared/components/alert.js";
import { loadGoogleMapsAPI, getAddressAndCountryFromCoordinates } from "../utils/geolocation.js";
import { fetchAllCurrencies } from "../shared/components/select.js";

const API_KEY_GOOGLE = "AIzaSyAG0gEdLgnbO12KDsceMtSJ9z-IvPGnXQ8";

// Register
async function handleRegister(event: Event): Promise<void> {
  event.preventDefault();

  const email = (document.getElementById("mail") as HTMLInputElement).value;
  const firstname = (document.getElementById("firstname") as HTMLInputElement).value;
  const lastname = (document.getElementById("lastname") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement).value;
  const picture = ""; // Add default picture or handle if needed
  const createdAt = new Date();
  const updatedAt = new Date();

  try {
    const db = await openDatabase();
    const userExists = await checkUserExists(email);

    if (userExists) {
      toastAlert("error", "Un utilisateur avec cet e-mail existe déjà !");
      return;
    }

    if (!validatePassword(password)) {
      toastAlert(
        "error",
        "Le mot de passe doit contenir au moins 8 caractères, une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial.",
      );
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Load Google Maps API and detect location
    await loadGoogleMapsAPI();
    let currency = "EUR";
    let address = "";

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const { address: detectedAddress, countryCode } = 
            await getAddressAndCountryFromCoordinates(latitude, longitude);

          address = detectedAddress || "Adresse inconnue";
          if (countryCode) {
            const currencyData = await fetchAllCurrencies(countryCode);
            if (currencyData.currency) {
              currency = currencyData.currency;
            }
          }

          // Prepare user data
          const userData = {
            email,
            password: hashedPassword,
            lastname,
            firstname,
            picture,
            createdAt,
            updatedAt,
            address,
            currency,
          };

          // Add user to the database
          await addItem("users", userData);
          toastAlert("success", "Enregistrement réussi !");
          window.location.href = "login.html";
        },
        (error) => {
          console.error("Erreur lors de la géolocalisation", error);
          toastAlert("error", "Impossible de récupérer la position.");
        }
      );
    } else {
      toastAlert("error", "La géolocalisation n'est pas supportée par ce navigateur.");
    }
  } catch (error) {
    console.error("Échec de l'enregistrement", error);
    toastAlert("error", "Une erreur est survenue, veuillez réessayer");
  }
}

const form = document.querySelector("form");
form?.addEventListener("submit", handleRegister);

displayPassword();
