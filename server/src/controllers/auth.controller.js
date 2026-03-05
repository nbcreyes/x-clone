import authService from "../services/auth.service.js";

/**
 * POST /api/auth/register
 * Creates a new user account and starts a session.
 */
const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);

    // Start a session by storing the userId in the session object.
    // express-session persists this to the session store automatically.
    req.session.userId = user.id;

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticates a user and starts a session.
 */
const login = async (req, res, next) => {
  try {
    const user = await authService.login(req.body);

    // Regenerate the session on login to prevent session fixation attacks.
    // This creates a new session ID while keeping the session data.
    req.session.regenerate((err) => {
      if (err) return next(err);

      req.session.userId = user.id;

      // Save the session explicitly to ensure it is persisted
      // before we send the response
      req.session.save((err) => {
        if (err) return next(err);

        res.json({
          success: true,
          message: "Logged in successfully",
          data: { user },
        });
      });
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Destroys the session and clears the session cookie.
 */
const logout = async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) return next(err);

      // Clear the session cookie from the browser
      res.clearCookie("connect.sid");

      res.json({
        success: true,
        message: "Logged out successfully",
      });
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user.
 * Used by the frontend to hydrate auth state on page load.
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is attached by the requireAuth middleware
    const user = await authService.getMe(req.user.id);

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export default { register, login, logout, getMe };