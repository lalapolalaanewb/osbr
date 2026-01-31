import { MongoClient, type MongoClientOptions } from "mongodb";

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// eslint-disable-next-line import/prefer-default-export
export default async function connectDatabase(): Promise<MongoClient> {
  if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }

  const uri = process.env.MONGODB_URI;
  const options: MongoClientOptions | undefined = {
    auth: {
      username: process.env.MONGO_ROOT_USERNAME,
      password: process.env.MONGO_ROOT_PASSWORD,
    },
    authSource: "admin",
  };

  const clientPromise =
    global._mongoClientPromise || new MongoClient(uri, options).connect();

  if (process.env.NODE_ENV !== "production") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    global._mongoClientPromise = new MongoClient(uri, options).connect();
  }

  // Export a module-scoped MongoClient promise. By doing this in a
  // separate module, the client can be shared across functions.
  return clientPromise;
}
