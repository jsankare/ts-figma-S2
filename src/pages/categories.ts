import { handleFormSubmit } from "../shared/components/form.js"; 
import { updateListing } from "../shared/components/listing.js";

document.addEventListener("DOMContentLoaded", () => {
  handleFormSubmit(
    "categoriesForm",
    "categoriesListing",
    "categories",
    ["name"],
    ["existingIcon", "icon"],
  );
  updateListing("categories", ["name", "icon"]);
});
