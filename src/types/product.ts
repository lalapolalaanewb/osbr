import type {
  DefaultStatusType,
  ProductStatusType,
  ProductTypeType,
} from "../utils/fixedDataList";
import type { ImageType, UpdatedType } from "./index";
import type { OrderDiscountType } from "./order";
import type { ReviewType } from "./review";

export type ProductBundleDetailType = {
  product_id: string;
  quantity: number;
  variant_options: string[];
};

export type ProductOptionType = {
  created_at: Date;
  created_by: string;
  id: string;
  name: string;
  updated?: UpdatedType[];
  values: string[];
};

export type ProductSpecificationType = {
  key: string;
  value: string;
};

export type ProductTypeOptType = {
  kind: "default";
  type: ProductTypeType;
  is_stock?: boolean; // should only applicable to `type: item`, whereby item can have stock or not. Ex: Chicken Fried Rice (no stock required) while Frozen Chicken Thigh (stock required)
};

export type ProductBundleType = {
  kind: "bundle";
  bundle: ProductBundleDetailType[];
};

export type ProductVirtualType = {
  kind: "virtual";
  downlodable_link: string;
};

export type DimensionType = {
  key: string;
  type: "number" | "string";
};

export type ProductDimensionDefaultType = {
  key: DimensionType["key"];
  value: number | string;
};

export type ProductMainType = {
  categories: string[];
  description: string;
  dimension?: ProductDimensionDefaultType[];
  discounts?: OrderDiscountType[];
  images?: ImageType[];
  name: string;
  price: number;
  sku: string;
  slug: string; // unique
  specifications?: ProductSpecificationType[];
  tags: string[];
};

export type ProductVariantType = {
  created_at: Date;
  created_by: string;
  options: string[];
  status: DefaultStatusType;
  updated?: UpdatedType[];
} & ProductMainType;

export type ProductVariantBundleType = ProductVariantType & ProductBundleType;
export type ProductVariantTypeType = ProductVariantType & ProductTypeOptType;
export type ProductVariantVirtualType = ProductVariantType & ProductVirtualType;

export type ProductType = {
  _id: string;
  assigned_to?: string;
  created_at: Date;
  created_by: string;
  description: string;
  options: ProductOptionType[];
  published_at?: Date;
  reviews?: ReviewType[];
  slug: string; // unique
  status: ProductStatusType;
  title: string;
  updated?: (UpdatedType & {
    assigned_to?: string;
    status_prev: ProductStatusType;
  })[];
  variants: (
    | ProductVariantTypeType
    | ProductVariantBundleType
    | ProductVariantVirtualType
  )[];
};
