import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
} from "../controllers/order.controller.js";
import { validate, createOrderValidator } from "../validators/index.js";

const router = Router();

router
  .route("/")
  .post(verifyJwt, validate(createOrderValidator), createOrder)
  .get(verifyJwt, getMyOrders);
router.route("/:id").get(verifyJwt, getOrderById);

export default router;
