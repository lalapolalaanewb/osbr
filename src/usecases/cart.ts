import {
  Abortable,
  AggregateOptions,
  DeleteOptions,
  Document,
  Filter,
  ObjectId,
} from "mongodb";
import clientMongo from "../services/db";
import { cartCacheService } from "../services/session";
import type { APIDefaultResponse, UpdateOneType } from "../types";
import type { CartType } from "../types/cart";

export const getCart = async (
  cartId: string,
): Promise<APIDefaultResponse<CartType>> => {
  try {
    // Try cache first
    const cached = await cartCacheService.getSession(cartId);
    if (cached)
      return {
        success: true,
        message: `Successfully get cart (${cartId}) data.`,
        data: cached,
      };

    // Fallback to DB
    const mongoClient = await clientMongo();
    const cart = await mongoClient
      .db()
      .collection("carts")
      .findOne<CartType>({
        _id:
          typeof cartId === "string"
            ? ObjectId.createFromHexString(cartId)
            : cartId,
      });

    if (!cart) {
      await mongoClient.close();
      return { success: false, message: "Cart not found" };
    }

    // Populate cache
    await cartCacheService.createSession(cartId, cart);

    await mongoClient.close();
    return {
      success: true,
      message: `Successfully get cart (${cartId}) data.`,
      data: cart,
    };
  } catch (error) {
    console.error(`Something went wrong at getCart: `, error);
    return { success: false, message: "Query failed" };
  }
};

export const getCarts = async (
  pipeline?: Document[],
  options?: AggregateOptions & Abortable,
): Promise<APIDefaultResponse<CartType[]>> => {
  try {
    const mongoClient = await clientMongo();
    const carts = await mongoClient
      .db()
      .collection("carts")
      .aggregate<CartType>(pipeline, options)
      .toArray();

    await mongoClient.close();
    return {
      success: true,
      message: `Successfully get carts data.`,
      data: carts,
    };
  } catch (error) {
    console.error(`Something went wrong at getCarts: `, error);
    return { success: false, message: "Query failed" };
  }
};

export const createCart = async (
  body: Omit<CartType, "_id">,
): Promise<APIDefaultResponse<string>> => {
  try {
    const mongoClient = await clientMongo();

    // Update current location (upsert)
    const cart = await mongoClient
      .db()
      .collection("carts")
      .insertOne({
        ...body,
        created_at: new Date().toISOString(),
        ...(body.discounts &&
          body.discounts.length > 0 && {
            discounts: body.discounts.map((item) => ({
              ...item,
              ...("_id" in item &&
                item._id && {
                  _id:
                    typeof item._id === "string"
                      ? ObjectId.createFromHexString(item._id)
                      : item._id,
                }),
            })),
          }),
        ...(body.items &&
          body.items.length > 0 && {
            items: body.items.map((item) => ({
              ...item,
              ...("product_id" in item &&
                item.product_id && {
                  product_id:
                    typeof item.product_id === "string"
                      ? ObjectId.createFromHexString(item.product_id)
                      : item.product_id,
                }), //
              ...(item.discounts &&
                item.discounts.length > 0 && {
                  discounts: item.discounts.map((item2) => ({
                    ...item2,
                    ...("_id" in item2 &&
                      item2._id && {
                        _id:
                          typeof item2._id === "string"
                            ? ObjectId.createFromHexString(item2._id)
                            : item2._id,
                      }),
                  })),
                }),
            })),
          }),
      });

    await mongoClient.close();
    return {
      success: true,
      message: `Successfully create new cart data`,
      data: cart.insertedId.toString(),
    };
  } catch (error) {
    console.error("Something went wrong at createCart:", error);
    return { success: false, message: "Internal server error" };
  }
};

export const updateCart = async (
  cartId: string,
  toUpdate: UpdateOneType,
): Promise<APIDefaultResponse<undefined>> => {
  if (!cartId) return { success: false, message: "Invalid input!" };

  try {
    const mongoClient = await clientMongo();

    const exists = await mongoClient
      .db()
      .collection("carts")
      .findOne(
        {
          _id:
            typeof cartId === "string"
              ? ObjectId.createFromHexString(cartId)
              : cartId,
        },
        { projection: { _id: 1 } },
      );

    if (!exists) {
      await mongoClient.close();
      return {
        success: false,
        message: "Cart not found!",
      };
    }

    // Update current location (upsert)
    await mongoClient
      .db()
      .collection("carts")
      .updateOne(toUpdate.filter, toUpdate.update, toUpdate.options);

    // Invalidate cache after update
    await cartCacheService.destroySession(cartId);

    await mongoClient.close();
    return {
      success: true,
      message: `Successfully update cart (${cartId}) data`,
    };
  } catch (error) {
    console.error("Something went wrong at updateCart:", error);
    return { success: false, message: "Internal server error" };
  }
};

export const deleteCart = async (
  cartId: string,
): Promise<APIDefaultResponse<undefined>> => {
  if (!cartId) return { success: false, message: "Invalid query!" };

  try {
    const mongoClient = await clientMongo();

    const exists = await mongoClient
      .db()
      .collection("carts")
      .findOne<Pick<CartType, "_id">>(
        {
          _id:
            typeof cartId === "string"
              ? ObjectId.createFromHexString(cartId)
              : cartId,
        },
        {
          projection: {
            _id: 1,
          },
        },
      );

    if (!exists) {
      await mongoClient.close();
      return {
        success: false,
        message: "Cart not found!",
      };
    }

    await mongoClient
      .db()
      .collection("carts")
      .deleteOne({
        _id:
          typeof exists._id === "string"
            ? ObjectId.createFromHexString(exists._id)
            : exists._id,
      });

    // Invalidate cache after update
    await cartCacheService.destroySession(cartId);

    await mongoClient.close();
    return {
      success: true,
      message: `Successfully delete cart (${cartId}) data`,
    };
  } catch (error) {
    console.error("Something went wrong at deleteCart:", error);
    return { success: false, message: "Internal server error" };
  }
};

export const deleteCarts = async (
  filter?: Filter<Document> | undefined,
  options?: DeleteOptions,
): Promise<APIDefaultResponse<undefined>> => {
  try {
    const mongoClient = await clientMongo();

    await mongoClient.db().collection("carts").deleteMany(filter, options);

    await mongoClient.close();
    return {
      success: true,
      message: `Successfully delete carts data`,
    };
  } catch (error) {
    console.error("Something went wrong at deleteCarts:", error);
    return { success: false, message: "Internal server error" };
  }
};
