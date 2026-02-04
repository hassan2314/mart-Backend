import { Router } from "express";
import {
    createProduct,
    deleteProduct,
    getProducts,
    updateImage,
    updateProduct,
    getProductById
} from "../controllers/product.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.route("/").get(getProducts);
router.route("/").post(verifyJwt, upload.single("image"), createProduct);

router
    .route("/:id")
    .get(getProductById)
    .put(verifyJwt, updateProduct)
    .delete(verifyJwt, deleteProduct)
    .patch(verifyJwt, upload.single("image"), updateImage);

export default router;