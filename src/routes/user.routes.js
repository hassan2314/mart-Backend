import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js"; // Import verifyAdmin
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
  inviteManager, // Import inviteManager
  registerInvitedManager, // Import registerInvitedManager
  getAllUsers,      // Import new admin function
  getUserDetails,   // Import new admin function
  updateUserRole,   // Import new admin function
  deleteUser        // Import new admin function
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

// Admin routes
router.route("/invite-manager").post(verifyJwt, verifyAdmin, inviteManager);
router.route("/register-manager").post(registerInvitedManager); // Public route for invited managers to register

// Admin user management routes
router.route("/users").get(verifyJwt, verifyAdmin, getAllUsers);
router
  .route("/users/:userId")
  .get(verifyJwt, verifyAdmin, getUserDetails)
  .put(verifyJwt, verifyAdmin, updateUserRole) // Assuming update user role
  .delete(verifyJwt, verifyAdmin, deleteUser);

export default router;
