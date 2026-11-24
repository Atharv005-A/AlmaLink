import { Router } from "express";
import authRoutes from "./auth.routes.js";
import activitiesRoutes from "./activities.routes.js";
import invitationsRoutes from "./invitations.routes.js";
import verificationsRoutes from "./verifications.routes.js";
import staffCellsRoutes from "./staff-cells.routes.js";
import alumniRoutes from "./alumni.routes.js";
import auditRoutes from "./audit.routes.js";

const apiRouter = Router();

// Module 1: Authentication & Role Management
apiRouter.use("/auth", authRoutes);

// Module 2: Alumni Verification Queue & Alumni Portal
apiRouter.use("/verifications", verificationsRoutes);
apiRouter.use("/alumni", alumniRoutes);

// Module 3: Activity & Event Management
apiRouter.use("/activities", activitiesRoutes);

// Module 4: Alumni Invitations & Matchmaking
apiRouter.use("/invitations", invitationsRoutes);

// Module 5: College Cell & Staff Management
apiRouter.use("/staff-cells", staffCellsRoutes);

// Module 8: Governance, Reporting & Audit Logging
apiRouter.use("/audit-logs", auditRoutes);

export default apiRouter;
