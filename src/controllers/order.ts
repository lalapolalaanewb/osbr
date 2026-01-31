import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import {
  deleteOrder as deleteOrderUseCase,
  deleteOrders as deleteOrdersUseCase,
  getOrder as getOrderUseCase,
  getOrders as getOrdersUseCase,
} from "../usecases/order";

export const getOrder = async (
  req: Request<{ orderId: string }>,
  res: Response,
): Promise<void> => {
  const { orderId } = req.params;

  try {
    const orderData = await getOrderUseCase({
      _id:
        typeof orderId === "string"
          ? ObjectId.createFromHexString(orderId)
          : orderId,
    });
    if (!orderData.success) {
      res.status(400).json({
        success: false,
        message: orderData.message,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Successfully get order data.`,
      data: orderData.data,
    });
  } catch (error) {
    console.error("Something went wrong at getOrder:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const ordersData = await getOrdersUseCase();
    if (!ordersData.success) {
      res.status(400).json({
        success: false,
        message: ordersData.message,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Successfully get orders data.`,
      data: ordersData.data,
    });
  } catch (error) {
    console.error("Something went wrong at getOrders:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteOrder = async (
  req: Request<{ orderId: string }>,
  res: Response,
): Promise<void> => {
  const { orderId } = req.params;

  try {
    const deleteOrderData = await deleteOrderUseCase(orderId);
    if (!deleteOrderData.success) {
      res.status(400).json({
        success: false,
        message: deleteOrderData.message,
      });
      return;
    }

    res.status(204).json({
      success: true,
      message: `Successfully delete order data.`,
    });
    return;
  } catch (error) {
    console.error("Something went wrong at deleteOrder:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
};

export const deleteOrders = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const ordersData = await deleteOrdersUseCase();
    if (!ordersData.success) {
      res.status(400).json({
        success: false,
        message: ordersData.message,
      });
      return;
    }

    res.status(204).json({
      success: true,
      message: `Successfully get orders data.`,
    });
  } catch (error) {
    console.error("Something went wrong at deleteOrders:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
