import type { DiscountStatusType } from "../utils/fixedDataList";
import type { UpdatedType } from "./index";

export type DiscountType = {
  _id: string;
  code: string;
  created_by: string;
  created_at: Date;
  amount: number;
  name: string;
  type: DiscountStatusType;
  updated?: UpdatedType[];
};
