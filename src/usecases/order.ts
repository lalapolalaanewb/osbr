import {
  Abortable,
  AggregateOptions,
  DeleteOptions,
  Document,
  Filter,
  ObjectId,
} from "mongodb";
import clientMongo from "../services/db";
import type { APIDefaultResponse, UpdateOneType } from "../types";
import { OrderType } from "../types/order";

export const getOrder = async (
  filter: Filter<Document>,
): Promise<APIDefaultResponse<OrderType>> => {
  try {
    const mongoClient = await clientMongo();
    const order = await mongoClient
      .db()
      .collection("orders")
      .findOne<OrderType>(filter);

    if (!order) {
      await mongoClient.close();
      return { success: false, message: "Order not found!" };
    }

    await mongoClient.close();
    return {
      success: true,
      message: `Successfully get order (${order._id}) data.`,
      data: order,
    };
  } catch (error) {
    console.error(`Something went wrong at getOrder: `, error);
    return { success: false, message: "Query failed" };
  }
};

export const getOrders = async (
  pipeline?: Document[],
  options?: AggregateOptions & Abortable,
): Promise<APIDefaultResponse<OrderType[]>> => {
  try {
    const mongoClient = await clientMongo();
    const orders = await mongoClient
      .db()
      .collection("orders")
      .aggregate<OrderType>(pipeline, options)
      .toArray();

    await mongoClient.close();
    return {
      success: true,
      message: `Successfully get orders data.`,
      data: orders,
    };
  } catch (error) {
    console.error(`Something went wrong at getOrders: `, error);
    return { success: false, message: "Query failed" };
  }
};

export const createOrder = async (
  body: Omit<OrderType, "_id">,
): Promise<APIDefaultResponse<string>> => {
  try {
    const mongoClient = await clientMongo();

    console.log("new order: ", body);
    // Update current location (upsert)
    const order = await mongoClient
      .db()
      .collection("orders")
      .insertOne({
        ...body,
        cartId:
          typeof body.cartId === "string"
            ? ObjectId.createFromHexString(body.cartId)
            : body.cartId,
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
      message: `Successfully create new order data`,
      data: order.insertedId.toString(),
    };
  } catch (error) {
    console.error("Something went wrong at createOrder:", error);
    return { success: false, message: "Internal server error" };
  }
};

export const updateOrder = async (
  orderId: string,
  toUpdate: UpdateOneType,
): Promise<APIDefaultResponse<undefined>> => {
  if (!orderId) return { success: false, message: "Invalid input!" };

  try {
    const mongoClient = await clientMongo();

    const exists = await mongoClient
      .db()
      .collection("orders")
      .findOne(
        {
          _id:
            typeof orderId === "string"
              ? ObjectId.createFromHexString(orderId)
              : orderId,
        },
        { projection: { _id: 1 } },
      );

    if (!exists) {
      await mongoClient.close();
      return {
        success: false,
        message: "Order not found!",
      };
    }

    // Update current location (upsert)
    await mongoClient
      .db()
      .collection("orders")
      .updateOne(toUpdate.filter, toUpdate.update, toUpdate.options);

    await mongoClient.close();
    return {
      success: true,
      message: `Successfully update roder (${orderId}) data`,
    };
  } catch (error) {
    console.error("Something went wrong at updateOrder:", error);
    return { success: false, message: "Internal server error" };
  }
};

export const deleteOrder = async (
  orderId: string,
): Promise<APIDefaultResponse<undefined>> => {
  if (!orderId) return { success: false, message: "Invalid query!" };

  try {
    const mongoClient = await clientMongo();

    const exists = await mongoClient
      .db()
      .collection("orders")
      .findOne<Pick<OrderType, "_id">>(
        {
          _id:
            typeof orderId === "string"
              ? ObjectId.createFromHexString(orderId)
              : orderId,
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
        message: "Order not found!",
      };
    }

    await mongoClient
      .db()
      .collection("orders")
      .deleteOne({
        _id:
          typeof exists._id === "string"
            ? ObjectId.createFromHexString(exists._id)
            : exists._id,
      });

    await mongoClient.close();
    return {
      success: true,
      message: `Successfully delete order (${orderId}) data`,
    };
  } catch (error) {
    console.error("Something went wrong at deleteOrder:", error);
    return { success: false, message: "Internal server error" };
  }
};

export const deleteOrders = async (
  filter?: Filter<Document> | undefined,
  options?: DeleteOptions,
): Promise<APIDefaultResponse<undefined>> => {
  try {
    const mongoClient = await clientMongo();

    await mongoClient.db().collection("orders").deleteMany(filter, options);

    await mongoClient.close();
    return {
      success: true,
      message: `Successfully delete orders data`,
    };
  } catch (error) {
    console.error("Something went wrong at deleteOrders:", error);
    return { success: false, message: "Internal server error" };
  }
};
