import type { CartStatusType } from "../utils/fixedDataList";
import type { UpdatedType } from "./index";
import type { OrderType } from "./order";

export type CartType = Omit<
  OrderType,
  | "billing_address"
  | "cartId"
  | "fulfillment"
  | "shipping_address"
  | "status"
  | "updated"
> & {
  status: CartStatusType;
  updated?: UpdatedType[];
};
