export type SessionConfig = {
  prefix: string;
  ttl: number;
};

export type SessionData<
  T extends Record<string, unknown> = Record<string, unknown>,
> = T;

export type CartSession = {
  cartId: string;
  userId?: string;
};
