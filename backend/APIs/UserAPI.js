import exp from "express";
import { register, authenticate } from "../services/authService.js";
import { ArticleModel } from "../models/ArticleModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { upload } from "../config/multer.js";
import cloudinary from "../config/cloudinary.js";
import { uploadToCloudinary } from "../config/cloudinaryUpload.js";

export const userRoute = exp.Router();

//Register user
userRoute.post("/users", upload.single("profileImageUrl"), async (req, res, next) => {
  let cloudinaryResult;

  try {
    //getb user obj
    let userObj = req.body;

    //  Step 1: upload image to cloudinary from memoryStorage (if exists)
    if (req.file) {
      cloudinaryResult = await uploadToCloudinary(req.file.buffer);
    }

    // Step 2: call existing register()
    const newUserObj = await register({
      ...userObj,
      role: "USER",
      profileImageUrl: cloudinaryResult?.secure_url,
    });

    res.status(201).json({
      message: "user created",
      payload: newUserObj,
    });
  } catch (err) {
    // Step 3: rollback
    if (cloudinaryResult?.public_id) {
      await cloudinary.uploader.destroy(cloudinaryResult.public_id);
    }

    next(err); // send to your error middleware
  }
});

//Read all articles(protected route)
userRoute.get("/articles", verifyToken("USER"), async (req, res) => {
  //read articles of all authors which are active
  const articles = await ArticleModel.find({ isArticleActive: true }).populate("author");
  //send res
  res.status(200).json({ message: "all articles", payload: articles });
});

//Add comment to an article(protected route)
userRoute.put("/articles", verifyToken("USER"), async (req, res) => {
  const { articleId, comment } = req.body;

  if (!articleId) {
    return res.status(400).json({ message: "articleId is required" });
  }

  const cleanComment = comment?.trim();
  if (!cleanComment) {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  //find article by id and update
  const articleWithComment = await ArticleModel.findOneAndUpdate(
    { _id: articleId, isArticleActive: true },
    { $push: { comments: { user: req.user.userId, comment: cleanComment } } },
    { new: true, runValidators: true },
  )
    .populate("author", "firstName email")
    .populate("comments.user", "firstName email profileImageUrl");

  //if article not found
  if (!articleWithComment) {
    return res.status(404).json({ message: "Article not found" });
  }
  //send res
  res.status(200).json({ message: "comment added successfully", payload: articleWithComment });
});

//next() ---> next middleware
//next(err) ---> error handling middleware
