import { toastAlert } from "./alert.js";
import { openDatabase } from "../../core/database/openDatabase.js";
import { API_KEY_GOOGLE } from '../../config.js';

// Fonction pour charger dynamiquement le script de Google Maps
function loadGoogleMapsAPI(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-maps-script')) {
      resolve(); // Le script est déjà chargé
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY_GOOGLE}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Impossible de charger l'API Google Maps"));

    document.head.appendChild(script);
  });
}


export function displayAccountSettingsForm(user) {
  const formContainer = document.getElementById('profile--wrapper') as HTMLElement;
  formContainer.innerHTML = `
    <form id="account-settings-form">
      <label for="firstname">Prénom</label>
      <input type="text" id="firstname" name="firstname" value="${user.firstname}" required>
      
      <label for="lastname">Nom</label>
      <input type="text" id="lastname" name="lastname" value="${user.lastname}" required>
      
      <label for="email">Email</label>
      <input type="email" id="email" name="email" value="${user.email}" disabled>
      
      <label for="address">Adresse</label>
      <div style="display: flex; gap: 8px;">
        <input type="text" id="address" name="address" value="${user.address || ''}" required>
        <button type="button" id="get-location-btn">📍 Remplir mon adresse</button>
      </div>
      
      <label for="currency">Devise</label>
      <select id="currency" name="currency" required>
        <option value="USD" ${user.currency === 'USD' ? 'selected' : ''}>USD</option>
        <option value="EUR" ${user.currency === 'EUR' ? 'selected' : ''}>EUR</option>
        <option value="GBP" ${user.currency === 'GBP' ? 'selected' : ''}>GBP</option>
      </select>
      
      <label for="notifications">Notifications</label>
      <input type="checkbox" id="notifications" name="notifications" ${user.notifications ? 'checked' : ''}>
      
      <label for="language">Langue</label>
      <select id="language" name="language" required>
        <option value="fr" ${user.language === 'fr' ? 'selected' : ''}>Français</option>
        <option value="en" ${user.language === 'en' ? 'selected' : ''}>English</option>
      </select>
      
      <button type="submit">Sauvegarder les modifications</button>
    </form>
  `;

  loadGoogleMapsAPI()
    .then(() => {
      initAutocomplete();
    })
    .catch((error) => {
      console.error("Erreur lors du chargement de l'API Google Maps :", error);
      toastAlert("error", "Erreur lors du chargement de l'API Google Maps.");
    });

  // Gestion du bouton de géolocalisation
  const getLocationBtn = document.getElementById("get-location-btn") as HTMLButtonElement;
  getLocationBtn.addEventListener("click", fillAddressWithGeolocation);

  const form = document.getElementById("account-settings-form") as HTMLFormElement;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newFirstname = (document.getElementById('firstname') as HTMLInputElement).value;
    const newLastname = (document.getElementById('lastname') as HTMLInputElement).value;
    const newAddress = (document.getElementById('address') as HTMLInputElement).value;
    const newCurrency = (document.getElementById('currency') as HTMLSelectElement).value;
    const newNotifications = (document.getElementById('notifications') as HTMLInputElement).checked;
    const newLanguage = (document.getElementById('language') as HTMLSelectElement).value;

    try {
      await updateUserInfo(user.email, newFirstname, newLastname, newAddress, newCurrency, newNotifications, newLanguage);
      toastAlert("success", "Informations mises à jour avec succès.");
    } catch (error) {
      toastAlert("error", "Erreur lors de la mise à jour des informations.");
    }
  });
}


// Fonction pour remplir le champ adresse avec la géolocalisation
async function fillAddressWithGeolocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const { address, countryCode } = await getAddressAndCountryFromCoordinates(lat, lon);
        const addressInput = document.getElementById("address") as HTMLInputElement;
        const currencySelect = document.getElementById("currency") as HTMLSelectElement;
        const languageSelect = document.getElementById("language") as HTMLSelectElement;

        // Mettre à jour les champs
        if (address) {
          addressInput.value = address;
          toastAlert("success", "Adresse remplie avec succès !");
        }

        // Adapter la devise et la langue en fonction du pays
        if (countryCode) {
          const { currency, language } = getCurrencyAndLanguageByCountry(countryCode);
          if (currency) currencySelect.value = currency;
          if (language) languageSelect.value = language;
        }
      } catch (error) {
        console.error("Erreur :", error);
        toastAlert("error", "Erreur lors de la récupération de l'adresse.");
      }
    }, () => {
      toastAlert("error", "Géolocalisation refusée par l'utilisateur.");
    });
  } else {
    toastAlert("error", "La géolocalisation n'est pas supportée par ce navigateur.");
  }
}

async function getAddressAndCountryFromCoordinates(lat: number, lon: number): Promise<{ address: string, countryCode: string }> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${API_KEY_GOOGLE}`
    );
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const result = data.results[0];
      const address = result.formatted_address;

      // Extraire le code pays
      const countryComponent = result.address_components.find((component: any) =>
        component.types.includes("country")
      );
      const countryCode = countryComponent?.short_name || "";

      return { address, countryCode };
    } else {
      console.error("Erreur API Google Maps :", data.status, data.error_message);
      return { address: "", countryCode: "" };
    }
  } catch (error) {
    console.error("Erreur avec Google Maps API:", error);
    return { address: "", countryCode: "" };
  }
}




async function updateUserInfo(email: string, firstname: string, lastname: string, address: string, currency: string, notifications: boolean, language: string) {
  const db = await openDatabase('UserDatabase', 'users');
  const transaction = db.transaction("users", "readwrite");
  const store = transaction.objectStore("users");
  const index = store.index("email");

  const userRequest = index.get(email);
  userRequest.onsuccess = () => {
    const user = userRequest.result;
    if (user) {
      user.firstname = firstname;
      user.lastname = lastname;
      user.address = address;
      user.currency = currency;
      user.notifications = notifications;
      user.language = language;
      store.put(user);
    }
  };

  return new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = reject;
  });
}

function getCurrencyAndLanguageByCountry(countryCode: string): { currency: string, language: string } {
  const countryMap: { [key: string]: { currency: string, language: string } } = {
    "US": { currency: "USD", language: "en" },
    "FR": { currency: "EUR", language: "fr" },
    "GB": { currency: "GBP", language: "en" },
    "DE": { currency: "EUR", language: "de" },
    "ES": { currency: "EUR", language: "es" },
    "IT": { currency: "EUR", language: "it" },
    // Ajoute d'autres pays si nécessaire
  };

  return countryMap[countryCode] || { currency: "", language: "" };
}


function initAutocomplete() {
  const addressInput = document.getElementById("address") as HTMLInputElement;
  const currencySelect = document.getElementById("currency") as HTMLSelectElement;
  const languageSelect = document.getElementById("language") as HTMLSelectElement;

  // Initialise l'autocomplétion Google Places
  const autocomplete = new google.maps.places.Autocomplete(addressInput, {
    types: ['address'], 
  });

  // Précise la localisation pour améliorer les suggestions
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const circle = new google.maps.Circle({
        center: { lat: position.coords.latitude, lng: position.coords.longitude },
        radius: position.coords.accuracy,
      });
      autocomplete.setBounds(circle.getBounds());
    });
  }

  // Écoute les modifications apportées par autocomplétion
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    if (place.geometry) {
      const countryCode = place.address_components.find((component: any) =>
        component.types.includes("country")
      )?.short_name;

      if (countryCode) {
        const { currency, language } = getCurrencyAndLanguageByCountry(countryCode);
        if (currency) currencySelect.value = currency;
        if (language) languageSelect.value = language;
      }
    }
  });

  // **NOUVEAU :** Ajoute un événement pour les saisies manuelles
  addressInput.addEventListener("change", async () => {
    const address = addressInput.value;
    if (address) {
      try {
        const { countryCode } = await getCountryCodeFromAddress(address);
        if (countryCode) {
          const { currency, language } = getCurrencyAndLanguageByCountry(countryCode);
          if (currency) currencySelect.value = currency;
          if (language) languageSelect.value = language;
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du pays :", error);
      }
    }
  });
}

async function getCountryCodeFromAddress(address: string): Promise<{ countryCode: string }> {
  
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY_GOOGLE}`
    );
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const result = data.results[0];

      // Trouve le code pays dans les composants de l'adresse
      const countryComponent = result.address_components.find((component: any) =>
        component.types.includes("country")
      );

      return { countryCode: countryComponent?.short_name || "" };
    } else {
      console.error("Erreur API Google Maps :", data.status, data.error_message);
      return { countryCode: "" };
    }
  } catch (error) {
    console.error("Erreur avec Google Maps API :", error);
    return { countryCode: "" };
  }
}
