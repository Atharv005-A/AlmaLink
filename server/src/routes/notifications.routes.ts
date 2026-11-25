import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { NotificationController } from "../controllers/notification.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", NotificationController.getNotifications);
router.patch("/:id/read", NotificationController.markAsRead);
router.post("/mark-all-read", NotificationController.markAllAsRead);

export default router;
