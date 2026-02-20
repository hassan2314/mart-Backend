import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";
import { getDashboardStats } from "../controllers/admin.controller.js";
import { getAllOrders, updateOrderStatus } from "../controllers/order.controller.js";
import { validate, updateOrderStatusValidator } from "../validators/index.js";

const router = Router();

// Admin protected routes
router.get("/dashboard-stats", verifyJwt, verifyAdmin, getDashboardStats);
router.get("/orders", verifyJwt, verifyAdmin, getAllOrders);
router.patch(
  "/orders/:id",
  verifyJwt,
  verifyAdmin,
  validate(updateOrderStatusValidator),
  updateOrderStatus
);

export default router;
