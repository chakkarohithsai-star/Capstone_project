import "./config/env.js";
import exp from "express";
import { connect } from "mongoose";
import { userRoute } from "./APIs/UserAPI.js";
import cookieParser from "cookie-parser";
import { adminRoute } from "./APIs/AdminAPI.js";
import { authorRoute } from "./APIs/AuthorAPI.js";
import { commonRouter } from "./APIs/CommonAPI.js";
import cors from "cors";

// MongoDB connection options
const mongoConnectionOptions = {
  serverSelectionTimeoutMS: 10000,
};

// Create express application
const app = exp();

// ================= CORS =================
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// ========================================

// body parser middleware
app.use(exp.json());

// cookie parser middleware
app.use(cookieParser());

// Home route
app.get("/", (req, res) => {
  res.send("Backend server is running successfully");
});

// Connect APIs
app.use("/user-api", userRoute);
app.use("/author-api", authorRoute);
app.use("/admin-api", adminRoute);
app.use("/common-api", commonRouter);

// Connect DB
const connectDB = async () => {
  try {
    if (!process.env.DB_URL) {
      throw new Error("Missing DB_URL");
    }

    await connect(
      process.env.DB_URL.trim(),
      mongoConnectionOptions
    );

    console.log("DB connection success");

    // Start server
    const port = process.env.PORT || 4000;

    app.listen(port, () => {
      console.log(`server started on port ${port}`);
    });
  } catch (err) {
    console.error("Err in DB connection:", err.message);
  }
};

connectDB();

// Invalid path handler
app.use((req, res) => {
  res.status(404).json({
    message: `${req.url} is invalid path`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.log("Error name:", err.name);
  console.log("Error code:", err.code);
  console.log("Full error:", err);

  // Validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  // Cast error
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  const errCode =
    err.code ??
    err.cause?.code ??
    err.errorResponse?.code;

  const keyValue =
    err.keyValue ??
    err.cause?.keyValue ??
    err.errorResponse?.keyValue;

  // Duplicate key error
  if (errCode === 11000) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];

    return res.status(409).json({
      message: "error occurred",
      error: `${field} "${value}" already exists`,
    });
  }

  // Custom error
  if (err.status) {
    return res.status(err.status).json({
      message: "error occurred",
      error: err.message,
    });
  }

  // Default server error
  res.status(500).json({
    message: "error occurred",
    error: "Server side error",
  });
});