import "./config/env.js";
import exp from "express";
import { connect } from "mongoose";
import { userRoute } from "./APIs/UserAPI.js";
import cookieParser from "cookie-parser";
import { adminRoute } from "./APIs/AdminAPI.js";
import { authorRoute } from "./APIs/AuthorAPI.js";
import { commonRouter } from "./APIs/CommonAPI.js";
import cors from "cors";

//Create express application
const app = exp();
//use cors middleware
const allowedOrigins = [
  "https://capstone-project1-19wv.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // allow exact matches
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // allow local Vite dev servers even if the port changes
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    // allow all Vercel preview deployments for this project
    if (origin.endsWith(".vercel.app") && origin.includes("capstone-project1")) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
//add body parser middleware
app.use(exp.json());
//add cookie parser middleware
app.use(cookieParser());

//connect APIs
app.use("/user-api", userRoute);
app.use("/author-api", authorRoute);
app.use("/admin-api", adminRoute);
app.use("/common-api", commonRouter);

//connect to db
const connectDB = async () => {
  try {
    if (!process.env.DB_URL) {
      throw new Error("Missing DB_URL in backend/.env");
    }

    await connect(process.env.DB_URL);
    console.log("DB connection success");

    //start http server
    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`server started on port ${port}`));
  } catch (err) {
    console.log("Err in DB connection", err);
  }
};

connectDB();

//dealing with invalid path
app.use((req, res, next) => {
  console.log(req.url);
  res.json({ message: `${req.url} is invalid path` });
});

//error handling middleware
app.use((err, req, res, next) => {
  console.log("Error name:", err.name);
  console.log("Error code:", err.code);
  console.log("Full error:", err);

  // mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  // mongoose cast error
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

  if (errCode === 11000) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    return res.status(409).json({
      message: "error occurred",
      error: `${field} "${value}" already exists`,
    });
  }

  // ✅ HANDLE CUSTOM ERRORS
  if (err.status) {
    return res.status(err.status).json({
      message: "error occurred",
      error: err.message,
    });
  }

  // default server error
  res.status(500).json({
    message: "error occurred",
    error: "Server side error",
  });
});
