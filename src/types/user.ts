import type {
  GenderType,
  ModeType,
  RoleType,
  UserStatusType,
} from "../utils/fixedDataList";
import type { UpdatedType } from "./index";

export type AddressUserType = {
  id: string;
  addressOne: string;
  city: string;
  country: string;
  created_at: Date;
  created_by: string;
  postcode: string;
  state: string;
  addressTwo?: string | null | undefined;
  updated?: UpdatedType[];
};

export type DefaultUserDetailsNameType = {
  first?: string | null | undefined;
  middle?: string | null | undefined;
  last?: string | null | undefined;
  nick?: string | null | undefined;
};

export type DefaultUserDetailsPhoneType = {
  phoneNoCountry: string;
  phoneNo: string;
};

export type DefaultUserDetailsType = {
  addresses?: AddressUserType[];
  avatar?: string;
  dob?: string;
  gender?: GenderType;
  name?: DefaultUserDetailsNameType;
  phoneDetails?: DefaultUserDetailsPhoneType;
};

export type DefaultUserAccessType = {
  access: "read" | "write" | "blocked";
  page: string;
};

export type DefaultUserRealmAccessType = {
  access: "read" | "write";
  blocked_access: string[];
  page: string;
};

export type DefaultUserType = {
  _id: string;
  access: DefaultUserAccessType[];
  byUpdated?: string;
  dateRegistered: Date;
  dateUpdated?: Date;
  dateVerified?: Date;
  details?: Date;
  email: string;
  language: "en_US";
  mode: ModeType;
  password: string;
  realms: DefaultUserRealmAccessType[];
  role: RoleType;
  status: UserStatusType;
  username: string;
};
