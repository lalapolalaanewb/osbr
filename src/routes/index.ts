import express from "express";
import {
  addItem,
  checkout,
  deleteCarts,
  getCart,
  getCarts,
  removeItem,
} from "../controllers/cart";
import {
  deleteOrder,
  deleteOrders,
  getOrder,
  getOrders,
} from "../controllers/order";
import {
  validateAddItem,
  validateRemoveItem,
  validateSessionId,
} from "../validations/cart";
import { validateOrderId } from "../validations/order";

const router = express.Router();

router.post(
  "/cart/:sessionId/items",
  validateSessionId,
  validateAddItem,
  addItem,
);
router.get("/cart/:sessionId", validateSessionId, getCart);
router.post("/cart/:sessionId/checkout", validateSessionId, checkout);
router.delete(
  "/cart/:sessionId/items/:itemId",
  validateSessionId,
  validateRemoveItem,
  removeItem,
);

/**
 * Test Purposes
 */
router.get("/cart", getCarts);
router.delete("/cart", deleteCarts);
router.get("/order", getOrders);
router.delete("/order", deleteOrders);
router.get("/order/:orderId", validateOrderId, getOrder);
router.delete("/order/:orderId", validateOrderId, deleteOrder);

export default router;
