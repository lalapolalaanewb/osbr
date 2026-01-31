import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { cartCacheService, cartSessionService } from "../services/session";
import { CartType } from "../types/cart";
import type { OrderItemCustomType, OrderItemVariantType } from "../types/order";
import {
  deleteCarts as deleteCartsUseCase,
  getCart as getCartUseCase,
  getCarts as getCartsUseCase,
  updateCart,
} from "../usecases/cart";
import { createOrder, getOrder } from "../usecases/order";
import handleCalcOrder from "../utils/handleCalcOrder";

export const addItem = async (
  req: Request<
    { sessionId: string },
    unknown,
    OrderItemVariantType | OrderItemCustomType
  >,
  res: Response,
): Promise<void> => {
  const { sessionId } = req.params;
  const body = req.body;

  try {
    const sessionCart = await cartSessionService.getSession(
      sessionId.split(process.env.SESSION_PREFIX_CART)[1]!,
    );
    if (!sessionCart) {
      res.status(400).json({
        success: false,
        message: `Failed to get cart session!`,
      });
      return;
    }

    const cartData = await getCartUseCase(sessionCart.cartId);
    if (!cartData.success || !cartData.data || typeof cartData === "string") {
      res.status(404).json({ success: false, message: cartData.message });
      return;
    }
    const cart = cartData.data as CartType;

    const itemNew = {
      ...body,
      categories:
        body.categories.length > 1
          ? body.categories.map((item) =>
              typeof item === "string"
                ? ObjectId.createFromHexString(item)
                : item,
            )
          : [],
      // created_by:
      //   typeof body.created_by === "string"
      //     ? ObjectId.createFromHexString(body.created_by)
      //     : body.created_by, // should be ObjectId - ignore for simple test
      ...("discounts" in body &&
        body.discounts.length > 0 && {
          discounts: body.discounts.map((item) => ({
            ...item,
            ...("_id" in item && {
              _id:
                typeof item._id === "string"
                  ? ObjectId.createFromHexString(item._id)
                  : item._id,
            }),
            // created_by:
            //   typeof item.created_by === "string"
            //     ? ObjectId.createFromHexString(item.created_by)
            //     : item.created_by, // should be ObjectId - ignore for simple test
            ...("updated" in item &&
              item.updated.length > 0 && {
                updated: item.updated.map((item2) => ({
                  ...item2,
                  // by:
                  //   typeof item2.by === "string"
                  //     ? ObjectId.createFromHexString(item2.by)
                  //     : item2.by, // should be ObjectId - ignore for simple test
                })),
              }),
          })),
        }),
      ...("product_id" in body && {
        product_id:
          typeof body.product_id === "string"
            ? ObjectId.createFromHexString(body.product_id)
            : body.product_id,
      }),
      ...("updated" in body &&
        body.updated.length > 0 && {
          updated: body.updated.map((item) => ({
            ...item,
            // by:
            //   typeof item.by === "string"
            //     ? ObjectId.createFromHexString(item.by)
            //     : item.by, // should be ObjectId - ignore for simple test
          })),
        }),
    };
    const { sub_total, total } = handleCalcOrder({
      ...(cart.discounts &&
        cart.discounts.length > 0 && {
          discounts: cart.discounts,
        }),
      items: [...cart.items, body],
    });
    const updateCartData = await updateCart(cart._id, {
      filter: {
        _id:
          typeof cart._id === "string"
            ? ObjectId.createFromHexString(cart._id)
            : cart._id,
      },
      update: {
        $set: {
          sub_total,
          total,
        },
        // @ts-expect-error [intentional]
        $push: {
          items: itemNew,
        },
      },
    });
    if (!updateCartData.success) {
      res.status(400).json(updateCartData);
      return;
    }

    await cartCacheService.updateSession(cart._id, {
      items: [...cart.items, body],
      sub_total,
      total,
    });

    res.status(204).json({
      success: true,
      message: `Successfully add new item to cart.`,
    });
  } catch (error) {
    console.error(`Something went wrong at addItem: `, error);
    res.status(500).json({ success: false, message: "Query failed" });
  }
};

export const getCart = async (
  req: Request<{ sessionId: string }>,
  res: Response,
): Promise<void> => {
  const { sessionId } = req.params;

  try {
    const sessionCart = await cartSessionService.getSession(
      sessionId.split(process.env.SESSION_PREFIX_CART)[1]!,
    );
    if (!sessionCart) {
      res.status(400).json({
        success: false,
        message: `Failed to get cart session!`,
      });
      return;
    }

    const cartData = await getCartUseCase(sessionCart.cartId);
    if (!cartData.success) {
      res.status(404).json({ success: false, message: cartData.message });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Successfully get cart data.`,
      data: cartData.data,
    });
  } catch (error) {
    console.error("Something went wrong at getCart:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getCarts = async (req: Request, res: Response): Promise<void> => {
  try {
    const cartsData = await getCartsUseCase();
    if (!cartsData.success) {
      res.status(400).json({
        success: false,
        message: cartsData.message,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Successfully get carts data.`,
      data: cartsData.data,
    });
  } catch (error) {
    console.error("Something went wrong at getCarts:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const checkout = async (
  req: Request<{ sessionId: string }>,
  res: Response,
): Promise<void> => {
  const { sessionId } = req.params;

  try {
    const sessionCart = await cartSessionService.getSession(
      sessionId.split(process.env.SESSION_PREFIX_CART)[1]!,
    );
    if (!sessionCart) {
      res.status(400).json({
        success: false,
        message: `Failed to get cart session!`,
      });
      return;
    }

    const cartData = await getCartUseCase(sessionCart.cartId);
    if (!cartData.success || !cartData.data || typeof cartData === "string") {
      res.status(404).json({ success: false, message: cartData.message });
      return;
    }
    const cart = cartData.data as CartType;
    console.log("cart: ", cart);

    const existingOrder = await getOrder({
      cartId:
        typeof cart._id === "string"
          ? ObjectId.createFromHexString(cart._id)
          : cart._id,
      status: {
        $in: ["draft", "pending"],
      },
    });
    console.log("existingOrder: ", existingOrder);

    if (
      existingOrder.success &&
      existingOrder.data &&
      typeof existingOrder.data === "object"
    ) {
      res.status(200).json({
        success: true,
        message: `Successfully get order data.`,
        data: existingOrder,
      });
      return;
    }

    const { _id, status, updated, ...others } = cart;
    const newOrderData = await createOrder({
      ...others,
      cartId: cart._id,
      delivery_charge: 0, // should go through a function to calculate delivery charges based on order.shipping_address
      fulfillment: "new",
      shipping_address: {
        addressOne: "",
        city: "",
        country: "MY",
        created_at: new Date(),
        created_by: cart.created_by,
        postcode: "",
        state: "selangor",
      },
      status: "draft",
    });
    if (
      !newOrderData.success ||
      !newOrderData.data ||
      newOrderData.data === undefined
    ) {
      res.status(400).json({
        success: false,
        message: `Failed to create new order data!`,
      });
      return;
    }

    const orderData = await getOrder({
      _id: ObjectId.createFromHexString(newOrderData.data as string),
    });
    if (!orderData.success) {
      res.status(400).json({
        success: false,
        message: `Failed to get new order data!`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Successfully get checkout data.`,
      data: orderData.data,
    });
  } catch (error) {
    console.error("Something went wrong at checkout:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const removeItem = async (
  req: Request<{ sessionId: string; itemId: string }>,
  res: Response,
): Promise<void> => {
  const { sessionId, itemId } = req.params;

  try {
    const sessionCart = await cartSessionService.getSession(
      sessionId.split(process.env.SESSION_PREFIX_CART)[1]!,
    );
    if (!sessionCart) {
      res.status(400).json({
        success: false,
        message: `Failed to get cart session!`,
      });
      return;
    }

    const cartData = await getCartUseCase(sessionCart.cartId);
    if (!cartData.success || !cartData.data || typeof cartData === "string") {
      res.status(404).json({ success: false, message: cartData.message });
      return;
    }
    const cart = cartData.data as CartType;

    if (!cart.items.find((item) => item.slug === itemId)) {
      res.status(400).json({
        success: false,
        message: "No such item exists in cart!",
      });
      return;
    }

    const { sub_total, total } = handleCalcOrder({
      ...(cart.discounts &&
        cart.discounts.length > 0 && {
          discounts: cart.discounts,
        }),
      items: cart.items.filter((item) => item.slug !== itemId),
    });

    const updateCartData = await updateCart(cart._id, {
      filter: {
        _id:
          typeof cart._id === "string"
            ? ObjectId.createFromHexString(cart._id)
            : cart._id,
      },
      update: {
        $set: {
          sub_total,
          total,
        },
        // @ts-expect-error [intentional]
        $pull: {
          items: {
            slug: itemId,
          },
        },
      },
    });
    if (!updateCartData.success) {
      res.status(400).json(updateCartData);
      return;
    }

    await cartCacheService.updateSession(cart._id, {
      items: cart.items.filter((item) => item.slug !== itemId),
      sub_total,
      total,
    });

    res.status(200).json({
      success: true,
      message: `Successfully remove item from cart.`,
      data: {
        ...cart,
        items: cart.items.filter((item) => item.slug !== itemId),
        sub_total,
        total,
      },
    });
  } catch (error) {
    console.error("Something went wrong at removeItem:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteCarts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const cartsData = await deleteCartsUseCase();
    if (!cartsData.success) {
      res.status(400).json({
        success: false,
        message: cartsData.message,
      });
      return;
    }

    res.status(204).json({
      success: true,
      message: `Successfully get carts data.`,
    });
  } catch (error) {
    console.error("Something went wrong at getCarts:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
