import exp from "express";
import { authenticate } from "../services/authService.js";
import { UserTypeModel } from "../models/UserModel.js";
import { ArticleModel } from "../models/ArticleModel.js";
import bcrypt from "bcryptjs";
import { verifyToken } from "../middlewares/verifyToken.js";
export const commonRouter = exp.Router();

//login
commonRouter.post("/login", async (req, res) => {
  //get user cred object
  let userCred = req.body;
  //call authenticate service
  let { token, user } = await authenticate(userCred);
  //save tokan as httpOnly cookie
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  //send res
  res.status(200).json({ message: "login success", payload: user });
});

//logout for User, Author and Admin
commonRouter.get("/logout", (req, res) => {
  // Clear the cookie named 'token'
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.status(200).json({ message: "Logged out successfully" });
});

//Change password(Protected route)
commonRouter.put("/change-password", async (req, res) => {
  //get current password and new password
  const { role, email, currentPassword, newPassword } = req.body;
  // Prevent same password
  if (currentPassword === newPassword) {
    return res.status(400).json({ message: "newPassword must be different from currentPassword" });
  }

  // Find user by email (works for USER, AUTHOR, ADMIN — all same collection)
  const account = await UserTypeModel.findOne({ email });
  if (!account) {
    return res.status(404).json({ message: "Account not found" });
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, account.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }
  // Hash and save new password
  account.password = await bcrypt.hash(newPassword, 10);
  await account.save();

  res.status(200).json({ message: "Password changed successfully" });
});

//Page refresh
commonRouter.get("/check-auth", verifyToken("USER","AUTHOR","ADMIN"), (req, res) => {
  res.status(200).json({
    message: "authenticated",
    payload: req.user
  });
});

// Read all active articles (public)
commonRouter.get("/articles", async (req, res) => {
  const articles = await ArticleModel.find({ isArticleActive: true }).populate("author", "firstName lastName email profileImageUrl");
  res.status(200).json({ message: "all articles", payload: articles });
});

// Read one article with comments (for USER/AUTHOR/Admin)
commonRouter.get("/articles/:id", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res) => {
  const { id } = req.params;

  const article = await ArticleModel.findById(id)
    .populate("author", "firstName email")
    .populate("comments.user", "firstName email");

  if (!article) {
    return res.status(404).json({ message: "Article not found" });
  }

  // Users can read only active articles.
  if (req.user.role === "USER" && !article.isArticleActive) {
    return res.status(404).json({ message: "Article not found" });
  }

  // Authors can read only their own articles.
  if (req.user.role === "AUTHOR" && article.author?._id.toString() !== req.user.userId) {
    return res.status(403).json({ message: "Forbidden. You can only view your own articles" });
  }

  res.status(200).json({ message: "article", payload: article });
});