import { NextFunction, Request, Response } from "express";

export const validateSessionId = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { sessionId } = req.params;

  if (
    !sessionId ||
    Array.isArray(sessionId) ||
    !sessionId?.includes(process.env.SESSION_PREFIX_CART)
  )
    res.status(400).json({
      success: false,
      message: "Invalid param!",
    });

  next();
};

export const validateAddItem = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const body = req.body;
  console.log("body: ", body);

  if (!body || typeof body !== "object") {
    res.status(400).json({
      success: false,
      message: "Invalid data!",
    });
  }

  if (
    !("categories" in body) ||
    !("created_at" in body) ||
    typeof body.created_at !== "string" ||
    isNaN(new Date(body.created_at).getTime()) ||
    !("created_by" in body) ||
    !("description" in body) ||
    !("kind" in body) ||
    !("name" in body) ||
    !("options" in body) ||
    !("price" in body) ||
    !("quantity" in body) ||
    !("sku" in body) ||
    !("slug" in body) ||
    !("status" in body) ||
    !("tags" in body)
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid data!",
    });
  }

  next();
};

export const validateRemoveItem = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { itemId } = req.params;

  if (!itemId || Array.isArray(itemId))
    res.status(400).json({
      success: false,
      message: "Invalid param!",
    });

  next();
};
