import { Document, Filter, Sort, UpdateFilter, UpdateOptions } from "mongodb";

export interface APIDefaultResponse<T> {
  success: boolean;
  message: string;
  data?: string | T;
}

export type DimensionType = {
  key: string;
  type: "number" | "string";
};

export type ImageType = {
  alt?: string;
  src: string;
};

export type UpdatedType = {
  at: Date;
  by: string;
};

export type UpdateOneType = {
  filter: Filter<Document>;
  update: Document[] | UpdateFilter<Document>;
  options?: UpdateOptions & {
    sort?: Sort;
  };
};
