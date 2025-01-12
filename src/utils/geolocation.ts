import { toastAlert } from "../shared/components/alert.js";
import { fetchAllCurrencies } from "../shared/components/select.js";

const API_KEY_GOOGLE = "AIzaSyAG0gEdLgnbO12KDsceMtSJ9z-IvPGnXQ8";

// Fonction pour charger dynamiquement le script de Google Maps
export function loadGoogleMapsAPI(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById("google-maps-script")) {
      resolve(); // Le script est déjà chargé
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY_GOOGLE}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Impossible de charger l'API Google Maps"));

    document.head.appendChild(script);
  });
}

// Fonction pour remplir le champ adresse avec la géolocalisation
export async function fillAddressWithGeolocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const { address, countryCode } =
            await getAddressAndCountryFromCoordinates(lat, lon);
          const addressInput = document.getElementById(
            "address",
          ) as HTMLInputElement;
          const currencySelect = document.getElementById(
            "currency",
          ) as HTMLSelectElement;

          // Mettre à jour les champs
          if (address) {
            addressInput.value = address;
            toastAlert("success", "Adresse remplie avec succès !");
          }

          // Adapter la devise et la langue en fonction du pays
          if (countryCode) {
            const { currency } = await fetchAllCurrencies(countryCode);
            if (currency) currencySelect.value = currency;
          }
        } catch (error) {
          console.error("Erreur :", error);
          toastAlert("error", "Erreur lors de la récupération de l'adresse.");
        }
      },
      () => {
        toastAlert("error", "Géolocalisation refusée par l'utilisateur.");
      },
    );
  } else {
    toastAlert(
      "error",
      "La géolocalisation n'est pas supportée par ce navigateur.",
    );
  }
}

export async function getAddressAndCountryFromCoordinates(
  lat: number,
  lon: number,
): Promise<{ address: string; countryCode: string }> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${API_KEY_GOOGLE}`,
    );
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const result = data.results[0];
      const address = result.formatted_address;

      // Extraire le code pays
      const countryComponent = result.address_components.find(
        (component: any) => component.types.includes("country"),
      );
      const countryCode = countryComponent?.short_name || "";

      return { address, countryCode };
    } else {
      console.error(
        "Erreur API Google Maps :",
        data.status,
        data.error_message,
      );
      return { address: "", countryCode: "" };
    }
  } catch (error) {
    console.error("Erreur avec Google Maps API:", error);
    return { address: "", countryCode: "" };
  }
}

export async function getCountryCodeFromAddress(
  address: string,
): Promise<{ countryCode: string }> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY_GOOGLE}`,
    );
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const result = data.results[0];

      // Trouve le code pays dans les composants de l'adresse
      const countryComponent = result.address_components.find(
        (component: any) => component.types.includes("country"),
      );

      return { countryCode: countryComponent?.short_name || "" };
    } else {
      console.error(
        "Erreur API Google Maps :",
        data.status,
        data.error_message,
      );
      return { countryCode: "" };
    }
  } catch (error) {
    console.error("Erreur avec Google Maps API :", error);
    return { countryCode: "" };
  }
}
