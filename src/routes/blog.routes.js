import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js"; // Corrected import
import { rejectReadOnly } from "../middleware/demoAccess.middleware.js";
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
  .post(verifyJwt, verifyAdmin, rejectReadOnly, upload.single("image"), createBlog);

router
  .route("/:id")
  .get(getBlogById)
  .put(verifyJwt, verifyAdmin, rejectReadOnly, upload.single("image"), updateBlog)
  .delete(verifyJwt, verifyAdmin, rejectReadOnly, deleteBlog);

export default router;
