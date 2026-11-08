import { Router } from "express";
import authRoutes from "./auth.routes.js";
import activitiesRoutes from "./activities.routes.js";

const apiRouter = Router();

// Module 1: Authentication & Role Management
apiRouter.use("/auth", authRoutes);

// Module 3: Activity & Event Management
apiRouter.use("/activities", activitiesRoutes);

export default apiRouter;

