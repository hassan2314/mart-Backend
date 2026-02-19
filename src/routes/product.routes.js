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
import { verifyAdmin } from "../middleware/admin.middleware.js"; // Corrected import
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
    verifyAdmin, // Corrected usage
    upload.single("image"),
    validate(createProductValidator),
    createProduct
  );

router
  .route("/:id")
  .get(getProductById)
  .put(verifyJwt, verifyAdmin, validate(updateProductValidator), updateProduct) // Corrected usage
  .delete(verifyJwt, verifyAdmin, deleteProduct) // Corrected usage
  .patch(verifyJwt, verifyAdmin, upload.single("image"), updateImage); // Corrected usage

export default router;