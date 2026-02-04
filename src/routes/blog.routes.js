import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
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
  .post(verifyJwt, adminOnly, upload.single("image"), createBlog);

router
  .route("/:id")
  .get(getBlogById)
  .put(verifyJwt, adminOnly, updateBlog)
  .patch(verifyJwt, adminOnly, upload.single("image"), updateBlog)
  .delete(verifyJwt, adminOnly, deleteBlog);

export default router;
