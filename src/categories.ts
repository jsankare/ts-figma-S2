import { handleFormSubmit, updateListing } from "./utils/form.js";

export interface Category {
  id: number;
  name: string;
  icon?: object;
}

// Gardes de type
export function isCategory(item: any): item is Category {
    return (item as Category).name !== undefined;
}

document.addEventListener('DOMContentLoaded', () => {
  handleFormSubmit('categoriesForm', 'categoriesListing', 'CategoryDatabase', 'categories', 'id', ['name', 'icon'], ['existingIcon']);
  updateListing('CategoryDatabase', 'categories', 'id', ['name', 'icon'], ['existingIcon']);
});