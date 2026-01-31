import { NextFunction, Request, Response } from "express";

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["x-api-key"];

  if (apiKey === process.env.API_KEY) {
    return next();
  }

  res.status(401).json({ error: "Invalid API key" });
};
