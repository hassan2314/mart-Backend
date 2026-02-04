import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
    // adminProfile,
    currentPasswordChange,
    getCurrentUser,
    loginUser,
    logoutUser,
    // orderHistory,
    refreshToken,
    registerUser,
    updateProfile,
    // userProfile,
    
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJwt, logoutUser);

router.route("/refresh-token").post(refreshToken);

router.route("/current-user").get(verifyJwt, getCurrentUser);

// router.route("/user-profile").get(verifyJwt, userProfile);

// router.route("/admin-profile").get(verifyJwt, adminProfile);

// router.route("/order-history").get(verifyJwt, orderHistory);

// routes/user.routes.js
router.route("/update")
  .patch(verifyJwt, upload.single("avatar"), updateProfile);
router.route("/change-password").put(verifyJwt, currentPasswordChange);

export default router;
