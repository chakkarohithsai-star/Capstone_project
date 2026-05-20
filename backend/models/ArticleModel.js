import { Schema, model } from "mongoose";

//Create user comment schema
const userCommentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Comment user is required"],
    },
    comment: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      minlength: [2, "Comment is too short"],
      maxlength: [500, "Comment is too long"],
    },
  },
  {
    timestamps: true,
  },
);

//create article schema
const articleSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Author ID required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    comments: [userCommentSchema],
    isArticleActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: "throw",
    versionKey: false,
  },
);

//Create article model
export const ArticleModel = model("article", articleSchema);
