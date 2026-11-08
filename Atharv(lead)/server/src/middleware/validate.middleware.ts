import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));

        res.status(400).json({
          status: "fail",
          message: issues[0]?.message || "Validation failed",
          errors: issues,
        });
        return;
      }

      res.status(400).json({
        status: "fail",
        message: "Invalid request payload",
      });
    }
  };
};

