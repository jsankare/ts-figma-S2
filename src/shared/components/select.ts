import { getAllItems } from "../../core/database/dbUtils.js";
import { Category } from "../../core/database/types.js";
import { getCurrentUser } from "../../core/auth/handleUser.js";

export async function populateCategorySelects(modalContent: HTMLElement | null, isTransactionSelect: boolean = false): Promise<void> {
  try {
    const currentUser = await getCurrentUser();  // Récupère l'utilisateur actuel
    if (!currentUser) {
      console.error("No current user found");
      return;
    }

    // Récupère toutes les catégories
    const categories = await getAllItems("categories");

    // Filtrer les catégories pour inclure uniquement celles de l'utilisateur actuel
    const userCategories = categories.filter((category: Category) =>
      category.userId === currentUser.id  // Assurez-vous que les catégories sont liées à l'utilisateur actuel
    );

    // Crée les options HTML à partir des catégories filtrées
    const categoryOptions = userCategories
      .map((category: Category) =>
        category.id && category.name
          ? `<option value="${category.id}">${category.name}</option>`
          : ""
      )
      .join("");

    if (isTransactionSelect) {
      const transactionCategorySelect = document.getElementById("transactionCategory") as HTMLSelectElement;
      if (!transactionCategorySelect) {
        console.error("#transactionCategorySelect not found");
        return;
      }

      transactionCategorySelect.innerHTML = `
        <option value="" selected disabled>Sélectionnez une catégorie</option>
        <option value="">Toutes</option>
        ${categoryOptions}
      `;
      console.log("Transaction category select populated successfully.");
    } else if (modalContent) {
      const categorySelects: NodeListOf<HTMLSelectElement> = modalContent.querySelectorAll(".categorySelect");
      categorySelects.forEach((select: HTMLSelectElement) => {
        select.innerHTML = `<option value="" disabled selected>Choisir une catégorie</option>${categoryOptions}`;
      });
      console.log("Category selects in modal populated successfully.");
    }
  } catch (error) {
    console.error("Failed to populate categories:", error);
  }
}


export async function fetchAllCurrencies(
  countryCode: string,
): Promise<{ currency: string; currencies: string[] }> {
  let apiUrl = "";
  if (!countryCode) {
    apiUrl = `https://restcountries.com/v3.1/all`;
  } else {
    apiUrl = `https://restcountries.com/v3.1/alpha/${countryCode}`;
  }

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(
        `Erreur lors de la récupération des données : ${response.statusText}`,
      );
    }

    const countries = await response.json();
    const currenciesSet = new Set<string>();

    countries.forEach((country: any) => {
      if (country.currencies) {
        Object.keys(country.currencies).forEach((currencyCode: string) => {
          currenciesSet.add(currencyCode);
        });
      }
    });

    const currencies = Array.from(currenciesSet);
    return {
      currency: currencies[0] || "",
      currencies,
    };
  } catch (error) {
    console.error(`Erreur pour le code pays ${countryCode}:`, error);
    return {
      currency: "",
      currencies: [],
    };
  }
}

export async function populateCurrencySelect(): Promise<void> {
  const currencySelect = document.getElementById(
    "currency",
  ) as HTMLSelectElement;
  if (!currencySelect) return;

  try {
    const { currencies } = await fetchAllCurrencies(""); // Pass empty string for all currencies
    currencies.forEach((currency: string) => {
      const option = document.createElement("option");
      option.value = currency;
      option.textContent = currency;
      currencySelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erreur lors du remplissage du select des devises :", error);
  }
}