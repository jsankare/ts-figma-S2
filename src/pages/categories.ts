import { handleFormSubmit, updateListing } from "../shared/components/form.js";
import { Category } from "../core/database/types";

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
    ["name"],
    ["existingIcon", "icon"],
  );
  updateListing("CategoryDatabase", "categories", ["name", "icon"]);
});
