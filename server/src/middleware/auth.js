import prisma from "../lib/prisma.js";
import { AppError } from "./errorHandler.js";

/**
 * Protects routes that require authentication.
 * Checks for a valid session and attaches the user to req.user.
 *
 * Usage: router.get("/protected", requireAuth, controller)
 */
const requireAuth = async (req, res, next) => {
  try {
    // express-session stores the userId after login
    const userId = req.session?.userId;

    if (!userId) {
      throw new AppError("You must be logged in to access this resource", 401);
    }

    // Fetch the user to make sure the account still exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        location: true,
        website: true,
        coverUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      // Session exists but user was deleted — clear the session
      req.session.destroy();
      throw new AppError("Account not found", 401);
    }

    // Attach user to request object for use in controllers
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional auth middleware.
 * Attaches req.user if a valid session exists, but does not
 * block the request if there is no session.
 *
 * Use this for routes that behave differently when logged in
 * vs logged out (e.g. feed shows like state when logged in).
 */
const optionalAuth = async (req, res, next) => {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      req.user = null;
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
      },
    });

    req.user = user || null;
    next();
  } catch (error) {
    // On error, just continue without auth rather than blocking
    req.user = null;
    next();
  }
};

export { requireAuth, optionalAuth };