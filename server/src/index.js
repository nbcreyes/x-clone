import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import { createServer as createSocketServer } from "./lib/socket.js";
import { connectRedis } from "./lib/redis.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";
import dotenv from "dotenv";
import { connectPubSub } from "./lib/redisPubSub.js";

dotenv.config();

const app = express();

// Trust Railway's reverse proxy so express-rate-limit
// can correctly identify client IPs from X-Forwarded-For
app.set("trust proxy", 1);

const httpServer = http.createServer(app);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(session({
  secret: process.env.SESSION_SECRET || "fallback-secret-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}));

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

const start = async () => {
  try {
    await connectRedis();
    console.log("Redis connected");

    await connectPubSub();

    await createSocketServer(httpServer);

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();

export default app;