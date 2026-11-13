import { Request, Response, NextFunction } from "express";
import { Role } from "@almalink/shared";

/**
 * Restricts access to users holding one of the authorized roles
 */
export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: "fail",
        message: "Authentication required.",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: "fail",
        message: "Forbidden: You do not have permission to access this resource.",
      });
      return;
    }

    next();
  };
};

/**
 * Restricts coordinators to actions within their assigned cell
 */
export const requireCellAccess = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ status: "fail", message: "Authentication required." });
    return;
  }

  // Super Admins and College Admins bypass cell scoping
  if (req.user.role === Role.SUPER_ADMIN || req.user.role === Role.COLLEGE_ADMIN) {
    return next();
  }

  const requestedCellId = parseInt(req.params.cellId || req.body.cellId, 10);
  if (!requestedCellId || req.user.cellId !== requestedCellId) {
    res.status(403).json({
      status: "fail",
      message: "Forbidden: You may only access activities and records for your assigned cell.",
    });
    return;
  }

  next();
};
