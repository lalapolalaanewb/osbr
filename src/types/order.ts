import type {
  OrderFulfillmentType,
  OrderStatusType,
} from "../utils/fixedDataList";
import type { DiscountType } from "./disccount";
import type { UpdatedType } from "./index";
import type {
  ProductType,
  ProductVariantBundleType,
  ProductVariantTypeType,
  ProductVariantVirtualType,
} from "./product";
import type {
  AddressUserType,
  DefaultUserDetailsType,
  DefaultUserType,
} from "./user";

export type OrderAddressType = Omit<
  AddressUserType,
  "id" | "dateCreated" | "dateUpdated"
>;

export type OrderCustomerType = {
  customer_id?: string;
} & Pick<DefaultUserType, "email"> &
  Pick<DefaultUserDetailsType, "name" | "phoneDetails">;

export type OrderDiscountType = DiscountType | OrderDiscount2Type;
export type OrderDiscount2Type = Omit<DiscountType, "_id" | "code"> & {
  id: string;
};

export type OrderItemVariantType = (
  | ProductVariantTypeType
  | ProductVariantBundleType
  | ProductVariantVirtualType
) & {
  product_id: ProductType["_id"];
  quantity: number;
};

export type OrderItemCustomType = (
  | ProductVariantTypeType
  | ProductVariantBundleType
  | ProductVariantVirtualType
) & {
  quantity: number;
};

export type OrderItemType = OrderItemVariantType | OrderItemCustomType;

export type OrderType = {
  _id: string;
  billing_address?: OrderAddressType;
  cartId: string;
  created_at: Date;
  created_by: string;
  customer: OrderCustomerType;
  delivery_charge: number;
  discounts?: OrderDiscountType[];
  fulfillment: OrderFulfillmentType;
  items: OrderItemType[];
  remarks: string;
  shipping_address: OrderAddressType;
  status: OrderStatusType;
  sub_total: number;
  total: number;
  updated?: UpdatedType[];
};
