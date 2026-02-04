import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Blog } from "../models/blog.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";

const getBlogs = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = category ? { category } : {};

  const blogs = await Blog.find(filter)
    .populate("author", "fullname username")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, blogs, "Blogs fetched successfully."));
});

const getBlogById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid blog ID");
  }

  const blog = await Blog.findById(id).populate("author", "fullname username");

  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, blog, "Blog fetched successfully."));
});

const createBlog = asyncHandler(async (req, res) => {
  const { title, content, category, authorName } = req.body;

  if (!title || !content) {
    throw new ApiError(400, "Title and content are required");
  }

  let imageUrl = "";
  if (req.file?.path) {
    const uploadResult = await uploadOnCloudinary(req.file.path);
    imageUrl = uploadResult?.secure_url || "";
  }

  const blog = await Blog.create({
    title,
    content,
    image: imageUrl,
    category: category || "smart-cooking",
    author: req.user?._id,
    authorName: authorName || req.user?.fullname,
  });

  const populated = await Blog.findById(blog._id).populate(
    "author",
    "fullname username"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, populated, "Blog created successfully."));
});

const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, category, authorName } = req.body;

  const blog = await Blog.findById(id);
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;
  if (category !== undefined) updates.category = category;
  if (authorName !== undefined) updates.authorName = authorName;

  if (req.file?.path) {
    if (blog.image) {
      const publicId = blog.image.split("/").pop().split(".")[0];
      await deleteFromCloudinary(publicId);
    }
    const uploadResult = await uploadOnCloudinary(req.file.path);
    updates.image = uploadResult?.secure_url || "";
  }

  const updated = await Blog.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  ).populate("author", "fullname username");

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Blog updated successfully."));
});

const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);

  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  if (blog.image) {
    const publicId = blog.image.split("/").pop().split(".")[0];
    await deleteFromCloudinary(publicId);
  }

  await Blog.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Blog deleted successfully."));
});

export { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog };
