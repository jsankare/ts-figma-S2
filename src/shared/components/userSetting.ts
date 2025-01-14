import { toastAlert } from "./alert.js";
import { User } from "../../core/database/types.js";
import { populateCurrencySelect, fetchAllCurrencies } from "./select.js";
import { addItem } from "../../core/database/dbUtils.js";

// import { API_KEY_GOOGLE } from "../../config.js";
import {
  getCountryCodeFromAddress,
  loadGoogleMapsAPI,
  fillAddressWithGeolocation,
} from "../../utils/geolocation.js";

loadGoogleMapsAPI();

export function displayAccountSettingsForm(user: User) {
  const formContainer = document.getElementById(
    "profile_modification",
  ) as HTMLElement;
  formContainer.innerHTML = `
    <h2 class="title">Modifier mes information</h2>
    <form class="form" id="account-settings-form">
      <div class="row">  
       <div class="column">
      <label class="label label-text" for="firstname">Prénom</label>
      <input class="input input-text" type="text" id="firstname" name="firstname" value="${user.firstname}" required>
      
      <label class="label label-text" for="lastname">Nom</label>
      <input class="input input-text" type="text" id="lastname" name="lastname" value="${user.lastname}" required>
      
      <label class="label label-text" for="email">Email</label>
      <input class="input input-text" type="email" id="email" name="email" value="${user.email}" disabled>
      </div>

      <div class="column">
      
      <label class="label label-text" for="address">Adresse</label>
      <div class="geoloc_container" style="display: flex; gap: 8px;">
        <input class="input input-text" type="text" id="address" name="address" value="${user.adress || ""}" required>
        <button type="button" id="get-location-btn">📍 Remplir mon adresse</button>
      </div>
      
      <label class="label label-text" for="currency">Devise</label>
      <select id="currency" name="currency" required>
      </select>
      
      <div class="checkbox-input-container">
        <label class="label label-checkbox" for="notifications">Notifications</label>
        <div class="custom-checkbox-container">
          <input name="notifications" type="checkbox" name="alert" id="notifications" class="input-checkbox" ${user.notifications ? "checked" : ""}>
          <label for="alert" class="custom-checkbox"></label>
        </div>
      </div>
      </div>
      
      </div>
      <button type="submit">Sauvegarder les modifications</button>
    </form>
  `;

  populateCurrencySelect();

  loadGoogleMapsAPI()
    .then(() => {
      initAutocomplete();
    })
    .catch((error) => {
      console.error("Erreur lors du chargement de l'API Google Maps :", error);
      toastAlert("error", "Erreur lors du chargement de l'API Google Maps.");
    });

  // Gestion du bouton de géolocalisation
  const getLocationBtn = document.getElementById(
    "get-location-btn",
  ) as HTMLButtonElement;
  getLocationBtn.addEventListener("click", fillAddressWithGeolocation);

  const form = document.getElementById(
    "account-settings-form",
  ) as HTMLFormElement;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newFirstname = (
      document.getElementById("firstname") as HTMLInputElement
    ).value;
    const newLastname = (
      document.getElementById("lastname") as HTMLInputElement
    ).value;
    const newAddress = (document.getElementById("address") as HTMLInputElement)
      .value;
    const newCurrency = (
      document.getElementById("currency") as HTMLSelectElement
    ).value;
    const newNotifications = (
      document.getElementById("notifications") as HTMLInputElement
    ).checked;

    const data = {
      id: user.id,
      email: user.email,
      firstname: newFirstname,
      lastname: newLastname,
      address: newAddress,
      currency: newCurrency,
      notifications: newNotifications,
    };

    try {
      await addItem('users', data);
      toastAlert("success", "Informations mises à jour avec succès.");
    } catch (error) {
      toastAlert("error", "Erreur lors de la mise à jour des informations.");
    }
  });
}

function initAutocomplete() {
  const addressInput = document.getElementById("address") as HTMLInputElement;

  const currencySelect = document.getElementById(
    "currency",
  ) as HTMLSelectElement;
  // Initialise l'autocomplétion Google Places
  let google: any = window.google;
  const autocomplete = new google.maps.places.Autocomplete(addressInput, {
    types: ["address"],
  });

  // Précise la localisation pour améliorer les suggestions
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const circle = new google.maps.Circle({
        center: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        radius: position.coords.accuracy,
      });
      autocomplete.setBounds(circle.getBounds());
    });
  }

  // Écoute les modifications apportées par autocomplétion
  autocomplete.addListener("place_changed", async () => {
    const place = autocomplete.getPlace();
    if (place.geometry) {
      const countryCode = place.address_components.find((component: any) =>
        component.types.includes("country"),
      )?.short_name;

      if (countryCode) {
        const currencies = await fetchAllCurrencies(countryCode);
        const currency = currencies.currencies[0];
        console.log(currency);
        if (currency) currencySelect.value = currency;
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
          const currencies = await fetchAllCurrencies(countryCode);
          const currency = currencies.currencies[0];
          if (currency) currencySelect.value = currency;
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du pays :", error);
      }
    }
  });
}
