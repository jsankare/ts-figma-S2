import { handleFormSubmit, updateListing } from "../shared/components/form.js";

export interface Transaction {
  id: number;
  type: string;
  name: string;
  transaction: string;
  amount: number;
  category: string;
  date: string;
  description: string;
}

export function isTransaction(item: any): item is Transaction {
  return (item as Transaction).amount !== undefined;
}

document.addEventListener("DOMContentLoaded", () => {
  handleFormSubmit(
    "transactionsForm",
    "transactionsListing",
    "TransactionDatabase",
    "transactions",
    "id",
    ["type", "name", "amount", "category", "date"],
    ["description"],
  );
  updateListing("TransactionDatabase", "transactions", "id", [
    "type",
    "name",
    "amount",
    "category",
    "date",
    "description",
  ]);
});
