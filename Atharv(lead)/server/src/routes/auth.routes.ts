import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@almalink/shared";

const router = Router();

// Public Routes
router.post("/login", validateBody(loginSchema), AuthController.login);
router.post("/forgot-password", validateBody(forgotPasswordSchema), AuthController.forgotPassword);
router.post("/reset-password", validateBody(resetPasswordSchema), AuthController.resetPassword);
router.get("/invitation/:token", AuthController.verifyInvitation);

// Protected Routes (Session Required)
router.get("/me", requireAuth, AuthController.getCurrentUser);
router.post("/logout", requireAuth, AuthController.logout);

export default router;

