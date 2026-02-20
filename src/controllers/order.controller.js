import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

const createOrder = asyncHandler(async (req, res) => {
  const { orderItems } = req.body;

  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    throw new ApiError(400, "Order items are required");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const productIds = [...new Set(orderItems.map((item) => item.product).filter(Boolean))];
  const products = await Product.find({ _id: { $in: productIds } }).lean();

  if (products.length !== productIds.length) {
    throw new ApiError(404, "One or more products not found");
  }

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));
  const validatedItems = [];
  let totalAmount = 0;

  for (const item of orderItems) {
    const { product: productId, quantity, price } = item;

    if (!productId || !quantity || price === undefined) {
      throw new ApiError(400, "Each order item must have product, quantity, and price");
    }

    const product = productMap.get(productId.toString());
    if (!product) {
      throw new ApiError(404, `Product not found: ${productId}`);
    }

    if (quantity > product.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for ${product.name}. Available: ${product.quantity}`
      );
    }

    const itemTotal = product.price * quantity;
    totalAmount += itemTotal;

    validatedItems.push({
      product: product._id,
      quantity,
      price: product.price,
    });
  }

  const shippingAddress = {
    address: user.address || "",
    city: user.city || "",
    postalCode: user.postalCode || "",
  };

  const order = await Order.create({
    user: req.user._id,
    orderItems: validatedItems,
    totalAmount,
    shippingAddress,
  });

  const bulkOps = validatedItems.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: { $inc: { quantity: -item.quantity } },
    },
  }));
  await Product.bulkWrite(bulkOps);

  const populatedOrder = await Order.findById(order._id)
    .populate("orderItems.product", "name image")
    .populate("user", "fullname email");

  return res
    .status(201)
    .json(
      new ApiResponse(201, populatedOrder, "Order created successfully.")
    );
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("orderItems.product", "name image price")
    .sort({ createdAt: -1 })
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully."));
});

const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const order = await Order.findById(id)
    .populate("orderItems.product", "name image price")
    .lean();

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to view this order");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully."));
});

export { createOrder, getMyOrders, getOrderById };
