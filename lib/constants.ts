export const CATEGORIES = [
  "Tops",
  "Bottoms",
  "Dresses",
  "Outerwear",
  "Knitwear",
  "Shoes",
  "Bags",
  "Accessories",
] as const;

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size"] as const;

export const CONDITIONS = [
  "New with tags",
  "Excellent",
  "Very good",
  "Good",
  "Fair",
] as const;

export const ITEM_STATUSES = ["AVAILABLE", "RESERVED", "SOLD"] as const;

export const RESERVATION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
] as const;

export const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  SOLD: "Sold",
  PENDING: "Pending pickup",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
};
