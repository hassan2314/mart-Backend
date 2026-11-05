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
import { rejectReadOnly } from "../middleware/demoAccess.middleware.js";
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
    rejectReadOnly,
    upload.single("image"),
    validate(createProductValidator),
    createProduct
  );

router
  .route("/:id")
  .get(getProductById)
  .put(verifyJwt, verifyAdmin, rejectReadOnly, validate(updateProductValidator), updateProduct)
  .delete(verifyJwt, verifyAdmin, rejectReadOnly, deleteProduct)
  .patch(verifyJwt, verifyAdmin, rejectReadOnly, upload.single("image"), updateImage);

export default router;