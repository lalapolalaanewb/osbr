import { NextFunction, Request, Response } from "express";

export const validateOrderId = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { orderId } = req.params;

  if (!orderId || Array.isArray(orderId))
    res.status(400).json({
      success: false,
      message: "Invalid param!",
    });

  next();
};
