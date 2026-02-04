import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateImage,
  updateProduct,
  getProductById,
} from "../controllers/product.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
  validate,
  createProductValidator,
  updateProductValidator,
} from "../validators/index.js";

const router = Router();

router.route("/").get(getProducts);
router
  .route("/")
  .post(
    verifyJwt,
    adminOnly,
    upload.single("image"),
    validate(createProductValidator),
    createProduct
  );

router
  .route("/:id")
  .get(getProductById)
  .put(verifyJwt, adminOnly, validate(updateProductValidator), updateProduct)
  .delete(verifyJwt, adminOnly, deleteProduct)
  .patch(verifyJwt, adminOnly, upload.single("image"), updateImage);

export default router;