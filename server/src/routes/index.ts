import { Router } from "express";
import authRoutes from "./auth.routes.js";
import activitiesRoutes from "./activities.routes.js";
import invitationsRoutes from "./invitations.routes.js";
import verificationsRoutes from "./verifications.routes.js";

const apiRouter = Router();

// Module 1: Authentication & Role Management
apiRouter.use("/auth", authRoutes);

// Module 2: Alumni Verification Queue
apiRouter.use("/verifications", verificationsRoutes);

// Module 3: Activity & Event Management
apiRouter.use("/activities", activitiesRoutes);

// Module 4: Alumni Invitations & Matchmaking
apiRouter.use("/invitations", invitationsRoutes);

export default apiRouter;

