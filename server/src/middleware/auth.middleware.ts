import { Request, Response, NextFunction } from "express";
import { AuthService, AUTH_COOKIE_NAME } from "../services/auth.service.js";

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  // 1. Try reading token from HTTP-only cookie
  let token = req.cookies?.[AUTH_COOKIE_NAME];

  // 2. Fallback to Authorization header (Bearer token)
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401).json({
      status: "fail",
      message: "Authentication required. Please sign in to continue.",
    });
    return;
  }

  const decoded = AuthService.verifyToken(token);
  if (!decoded) {
    res.status(401).json({
      status: "fail",
      message: "Session expired or invalid. Please sign in again.",
    });
    return;
  }

  req.user = decoded;
  next();
};
