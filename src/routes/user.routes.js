import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  validate,
  registerValidator,
  loginValidator,
  changePasswordValidator,
} from "../validators/index.js";
import {
  currentPasswordChange,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  updateProfile,
} from "../controllers/user.controller.js";

const router = Router();

router
  .route("/register")
  .post(upload.single("avatar"), validate(registerValidator), registerUser);

router.route("/login").post(validate(loginValidator), loginUser);

router.route("/logout").post(verifyJwt, logoutUser);

router.route("/refresh-token").post(refreshToken);

router.route("/current-user").get(verifyJwt, getCurrentUser);

router
  .route("/update")
  .patch(verifyJwt, upload.single("avatar"), updateProfile);
router
  .route("/change-password")
  .put(verifyJwt, validate(changePasswordValidator), currentPasswordChange);

export default router;
