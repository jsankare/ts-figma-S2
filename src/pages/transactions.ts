import { handleFormSubmit } from "../shared/components/form.js";
import { populateCategorySelects } from "../shared/components/select.js";
import { updateListing } from "../shared/components/listing.js";

document.addEventListener("DOMContentLoaded", () => {
  handleFormSubmit(
    "transactionsForm",
    "transactionsListing",
    "transactions",
    ["type", "name", "amount", "date"],
    ["category"],
  );
  updateListing("transactions", [
    "type",
    "name",
    "amount",
    "category",
    "date",
  ]);
});

document
  .getElementById("filterTransactions")
  ?.addEventListener("click", (event) => {
    event.preventDefault();

    updateListing("transactions", [
      "type",
      "name",
      "amount",
      "category",
      "date",
    ]);
  });

populateCategorySelects(null, true);
