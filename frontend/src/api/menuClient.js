import { apiRequest } from "./client";

export function fetchProducts() {
  return apiRequest("/products");
}
