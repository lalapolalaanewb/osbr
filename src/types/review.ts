import type { ReviewStatusType } from "../utils/fixedDataList";
import type { ImageType, UpdatedType } from "./index";

export type ReviewType = {
  alias?: string;
  comment: string;
  concernedSKUs?: string[];
  created_at: Date;
  created_by: string;
  customer?: string;
  id: string;
  images?: ImageType[];
  rating?: number;
  status: ReviewStatusType;
  updated?: UpdatedType[];
};
