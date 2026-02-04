import { body, param, validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    const extracted = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    throw new ApiError(400, "Validation failed", extracted);
  };
};

export const registerValidator = [
  body("fullname").trim().notEmpty().withMessage("Full name is required"),
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("email").trim().isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("phoneNumber").trim().notEmpty().withMessage("Phone number is required"),
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
];

export const loginValidator = [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const changePasswordValidator = [
  body("oldPassword").notEmpty().withMessage("Old password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];

export const createProductValidator = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("quantity")
    .isInt({ min: 0 })
    .withMessage("Quantity must be a non-negative integer"),
];

export const updateProductValidator = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("quantity")
    .isInt({ min: 0 })
    .withMessage("Quantity must be a non-negative integer"),
];

export const createOrderValidator = [
  body("orderItems")
    .isArray({ min: 1 })
    .withMessage("Order items must be a non-empty array"),
  body("orderItems.*.product")
    .isMongoId()
    .withMessage("Invalid product ID"),
  body("orderItems.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  body("orderItems.*.price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
];
