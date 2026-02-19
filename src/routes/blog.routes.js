import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js"; // Corrected import
import { upload } from "../middleware/multer.middleware.js";
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blog.controller.js";

const router = Router();

router
  .route("/")
  .get(getBlogs)
  .post(verifyJwt, verifyAdmin, upload.single("image"), createBlog); // Corrected usage

router
  .route("/:id")
  .get(getBlogById)
  .put(verifyJwt, verifyAdmin, upload.single("image"), updateBlog) // Corrected usage, assuming updateBlog handles image changes
  .delete(verifyJwt, verifyAdmin, deleteBlog); // Corrected usage

export default router;
