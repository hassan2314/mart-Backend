import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";
import { getDashboardStats } from "../controllers/admin.controller.js";

const router = Router();

// Admin protected routes
router.route("/dashboard-stats").get(verifyJwt, verifyAdmin, getDashboardStats);

export default router;
