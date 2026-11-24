import { Router } from "express";
import authRoutes from "./auth.routes.js";
import activitiesRoutes from "./activities.routes.js";
import invitationsRoutes from "./invitations.routes.js";
import verificationsRoutes from "./verifications.routes.js";
import participationsRoutes from "./participations.routes.js";
import awardsRoutes from "./awards.routes.js";
import staffCellsRoutes from "./staff-cells.routes.js";
import alumniRoutes from "./alumni.routes.js";

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

// Module 6: Attendance & Contribution Points Engine
apiRouter.use("/participations", participationsRoutes);
apiRouter.use("/scoring-rubric", participationsRoutes);

// Module 7: Private Leaderboard, Award Nominations & Staff Voting
apiRouter.use("/awards", awardsRoutes);
apiRouter.use("/", awardsRoutes); // Exposes /leaderboard as /api/leaderboard

export default apiRouter;

