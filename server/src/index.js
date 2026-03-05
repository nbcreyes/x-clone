import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import { createServer as createSocketServer } from "./lib/socket.js";
import { redisClient, connectRedis } from "./lib/redis.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// ------------------------------------------------------------
// SECURITY MIDDLEWARE
// helmet sets secure HTTP headers
// cors restricts which origins can call this API
// ------------------------------------------------------------
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // needed for image serving
}));

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true, // required for cookies/sessions to work cross-origin
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ------------------------------------------------------------
// REQUEST PARSING MIDDLEWARE
// ------------------------------------------------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ------------------------------------------------------------
// LOGGING MIDDLEWARE
// morgan logs every request in development
// format: METHOD /path STATUS response-time ms
// ------------------------------------------------------------
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ------------------------------------------------------------
// SESSION MIDDLEWARE
// express-session stores session ID in a cookie.
// The session data itself is stored in PostgreSQL via Auth.js.
// ------------------------------------------------------------
app.use(session({
  secret: process.env.SESSION_SECRET || "fallback-secret-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,   // prevents JS access to cookie
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
}));

// ------------------------------------------------------------
// ROUTES
// All API routes are mounted under /api
// ------------------------------------------------------------
app.use("/api", routes);

// ------------------------------------------------------------
// ERROR HANDLING
// Must be registered after routes.
// 404 handler catches any route not matched above.
// errorHandler catches anything thrown inside route handlers.
// ------------------------------------------------------------
app.use(notFoundHandler);
app.use(errorHandler);

// ------------------------------------------------------------
// SOCKET.IO
// Attach Socket.io to the HTTP server after Express is set up.
// ------------------------------------------------------------
createSocketServer(httpServer);

// ------------------------------------------------------------
// START SERVER
// Connect to Redis first, then start listening.
// ------------------------------------------------------------
const PORT = process.env.PORT || 3001;

const start = async () => {
  try {
    await connectRedis();
    console.log("Redis connected");

    httpServer.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();

export default app;