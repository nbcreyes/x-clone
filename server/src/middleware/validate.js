import { ZodError } from "zod";
import { AppError } from "./errorHandler.js";

/**
 * Zod validation middleware factory.
 * Pass in a Zod schema and it validates req.body against it.
 * If validation fails, a 400 error is returned with field-level messages.
 * If validation passes, req.body is replaced with the parsed (sanitized) data.
 *
 * Usage:
 *   import { registerSchema } from "../lib/validators.js";
 *   router.post("/register", validate(registerSchema), authController.register);
 *
 * @param {import("zod").ZodSchema} schema
 */
const validate = (schema) => (req, res, next) => {
  try {
    // parse() throws if validation fails, returns sanitized data if it passes
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      // Format Zod errors into a readable object: { field: "message" }
      const formattedErrors = error.errors.reduce((acc, err) => {
        const field = err.path.join(".");
        acc[field] = err.message;
        return acc;
      }, {});

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formattedErrors,
      });
    }
    next(error);
  }
};

export { validate };