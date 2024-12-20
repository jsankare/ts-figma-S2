import { handleFormSubmit, updateListing } from "../shared/components/form.js";

export interface Category {
  id: number;
  name: string;
  icon?: string;
  amount?: number;
}

// Gardes de type
export function isCategory(item: any): item is Category {
  return (item as Category).name !== undefined;
}

document.addEventListener("DOMContentLoaded", () => {
  handleFormSubmit(
    "categoriesForm",
    "categoriesListing",
    "CategoryDatabase",
    "categories",
    ["name", "icon"],
    ["existingIcon"],
  );
  updateListing("CategoryDatabase", "categories", ["name", "icon"]);
});