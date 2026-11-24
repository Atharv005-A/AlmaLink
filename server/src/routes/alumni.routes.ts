import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { AlumniController } from "../controllers/alumni.controller.js";

const router = Router();

// All alumni endpoints require an active session
router.use(requireAuth);

router.get("/profile", AlumniController.getProfile);
router.patch("/profile", AlumniController.updateProfile);
router.get("/dashboard", AlumniController.getDashboard);

export default router;
