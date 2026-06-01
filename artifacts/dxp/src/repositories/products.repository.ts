import productsData from "../content/products.json";

export type Product = (typeof productsData)[number];

export function getProducts(): Product[] {
  return productsData;
}

export function getProduct(id: string): Product | undefined {
  return productsData.find((p) => p.id === id);
}
