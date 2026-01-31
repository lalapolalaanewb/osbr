declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: number;
    MONGO_DB_NAME: string;
    MONGODB_URI: string;
    MONGODB_OPTION: string;
    MONGO_ROOT_USERNAME: string;
    MONGO_ROOT_PASSWORD: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_PASSWORD: string;
    API_KEY: string;
    SESSION_PREFIX_CART: string;
    SESSION_TTL_CART: number;
    CACHE_PREFIX_CART: string;
    CACHE_TTL_CART: number;
  }
}
