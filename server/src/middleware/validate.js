import { AppError } from '../utils/appError.js';

// Generic validation middleware taking any Zod schema.
// Intercepts invalid request payloads before reaching controllers,
// returning formatted 422 Unprocessable Entity responses.
export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    // Replace req.body with the sanitized/coerced output from Zod
    req.body = parsed;
    next();
  } catch (error) {
    if (error.errors) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(422).json({
        success: false,
        message: 'Validation failed on submitted data',
        errors: formattedErrors,
      });
    }
    next(new AppError('Invalid request data format', 400));
  }
};

