import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import apiRouter from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middleware with permissive localhost CORS for development
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Health Check Endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    platform: "AlmaLink — MES IMCC Pune",
    timestamp: new Date().toISOString(),
  });
});

// Mount All API Routes
app.use("/api", apiRouter);

app.listen(PORT, () => {
  console.log(`🚀 AlmaLink Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
