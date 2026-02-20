import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Product } from "../models/product.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, quantity } = req.body;

  if (!name || !description || !price || !quantity) {
    throw new ApiError(400, "All fields are required");
  }

  const productExists = await Product.findOne({ name });
  if (productExists) {
    throw new ApiError(400, "Product already exists");
  }
  let imageLocalPath;
  if (req.file && req.file.path) {
    imageLocalPath = req.file.path;
  } else {
    throw new ApiError(400, "Image is required");
  }

  const image = await uploadOnCloudinary(imageLocalPath);
  const product = await Product.create({
    name,
    description,
    price,
    quantity,
    image: image.secure_url,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully."));
});

const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).lean();

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully."));
});

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id).lean();

  if (!product) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Product not found."));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully."));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, quantity } = req.body;

  if (!name || !description || !price || !quantity) {
    throw new ApiError(400, "All fields are required");
  }

  const product = await Product.findByIdAndUpdate(
    id,
    {
      $set: {
        name,
        description,
        price,
        quantity,
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully."));
});

const updateImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // 🧹 Delete previous image from Cloudinary
  if (product.image) {
    const publicId = product.image.split('/').pop().split('.')[0]; // Extract public ID from URL
    await deleteFromCloudinary(publicId); // Assumes your deleteFromCloudinary accepts public ID
  }

  // 📤 Upload new image
  const image = await uploadOnCloudinary(req.file.path);
  product.image = image.secure_url;

  await product.save();

  return res.status(200).json(
    new ApiResponse(200, product, "Product image updated successfully.")
  );
});


const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  if (product.image) {
    const publicId = product.image.split("/").pop().split(".")[0];
    await deleteFromCloudinary(publicId);
  }
  await Product.findByIdAndDelete(id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Product deleted successfully."));
});

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateImage,
};
