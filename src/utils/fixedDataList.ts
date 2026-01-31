export function capitalizeWord(word: string): string {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function formatSnakeCase(text: string): string {
  if (!text) return "";

  return text.split("_").map(capitalizeWord).join(" ");
}

export type CartStatusType = "abandoned" | "active" | "completed";
export const cartStatuses = ["abandoned", "active", "completed"].map(
  (item) => ({
    label: formatSnakeCase(item),
    value: item,
  }),
);

export type DefaultStatusType = "active" | "inactive";
export const defaultStatuses = ["active", "inactive"].map((item) => ({
  label: formatSnakeCase(item),
  value: item,
}));

export type DiscountStatusType = "fixed" | "percentage";
export const discountStatuses = ["fixed", "percentage"].map((item) => ({
  label: formatSnakeCase(item),
  value: item,
}));

export type GenderType = "male" | "female";
export const genderTypes = ["male", "female"].map((item) => ({
  label: formatSnakeCase(item),
  value: item,
}));

export type ModeType = "dark" | "light";
export const modeTypes = ["dark", "light"].map((item) => ({
  label: formatSnakeCase(item),
  value: item,
}));

export type OrderFulfillmentType =
  | "new"
  | "order_queuing_for_production"
  | "order_producing"
  | "order_production_done"
  | "transit_from_overseas_facility"
  | "transit_regionals_facility"
  | "logistic_recieved_from_facility"
  | "ready_to_deliver"
  | "logistic_arranged_for_delivery"
  | "fulfilled";
export const orderFulfillmentStatuses = [
  "new",
  "order_queuing_for_production",
  "order_producing",
  "order_production_done",
  "transit_from_overseas_facility",
  "transit_regionals_facility",
  "logistic_recieved_from_facility",
  "ready_to_deliver",
  "logistic_arranged_for_delivery",
  "fulfilled",
].map((item) => ({
  label: formatSnakeCase(item),
  value: item,
}));

export type OrderStatusType =
  | "cancel"
  | "draft"
  | "paid"
  | "partial"
  | "partial-refund"
  | "refund";
export const orderStatuses = [
  "cancel",
  "draft",
  "paid",
  "partial",
  "partial-refund",
  "refund",
].map((item) => ({
  label: formatSnakeCase(item),
  value: item,
}));

export type ProductStatusType =
  | "draft"
  | "pending"
  | "published"
  | "correction";
export const productStatuses = [
  "draft",
  "pending",
  "published",
  "correction",
].map((item) => ({
  label: formatSnakeCase(item),
  value: item,
}));

export type ProductTypeType = "item" | "service";
export const productTypes = ["item", "service"].map((item) => ({
  label: formatSnakeCase(item),
  value: item,
}));

export type ReviewStatusType = "active" | "disabled" | "pending";
export const reviewStatuses = ["active", "disabled", "pending"].map((item) => ({
  label: formatSnakeCase(item),
  value: item,
}));

export type RoleType =
  | "merchant"
  | "dev"
  | "admin"
  | "staff"
  | "seller"
  | "seller_staff"
  | "end_consumer"
  | "basic";
export const roleTypes = [
  "merchant",
  "dev",
  "admin",
  "staff",
  "seller",
  "seller_staff",
  "end_consumer",
  "basic",
].map((item) => ({
  label: formatSnakeCase(item),
  value: item,
}));

export type UserStatusType = "active" | "inactive" | "pending" | "disabled";
export const userStatuses = ["active", "inactive", "pending", "disabled"].map(
  (item) => ({
    label: formatSnakeCase(item),
    value: item,
  }),
);
