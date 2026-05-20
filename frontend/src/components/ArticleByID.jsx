import { useParams, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../store/authStore";
import { toast } from "react-hot-toast";
import {
  articlePageWrapper,
  articleHeader,
  articleCategory,
  articleMainTitle,
  articleAuthorRow,
  authorInfo,
  articleContent,
  articleFooter,
  articleActions,
  editBtn,
  deleteBtn,
  loadingClass,
  errorClass,
  inputClass,
} from "../styles/common.js";
import { useForm } from "react-hook-form";

function ArticleByID() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const user = useAuth((state) => state.currentUser);

  const [article, setArticle] = useState(location.state || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    const getArticle = async () => {
      if (!article) setLoading(true);

      try {
        const res = await api.get(`/common-api/articles/${id}`);

        setArticle(res.data.payload);
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.error || "Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    getArticle();
  }, [id]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // delete & restore article
  const toggleArticleStatus = async () => {
    const newStatus = !article.isArticleActive;

    const confirmMsg = newStatus ? "Restore this article?" : "Delete this article?";
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await api.patch(`/author-api/articles/${id}/status`, { isArticleActive: newStatus });

      console.log("SUCCESS:", res.data);

      setArticle(res.data.payload);

      toast.success(res.data.message);
    } catch (err) {
      console.log("ERROR:", err.response);

      const msg = err.response?.data?.message;

      if (err.response?.status === 400) {
        toast(msg); // already deleted/active case
      } else {
        setError(msg || "Operation failed");
      }
    }
  };

  //edit article
  const editArticle = (articleObj) => {
    navigate("/edit-article", { state: articleObj });
  };

  //post comment by user
  const addComment = async (commentObj) => {
    try {
      setCommentLoading(true);
      const payload = {
        articleId: article._id,
        comment: commentObj.comment,
      };
      const res = await api.put("/user-api/articles", payload);
      if (res.status === 200) {
        toast.success(res.data.message);
        setArticle(res.data.payload);
        reset({ comment: "" });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) return <p className={loadingClass}>Loading article...</p>;
  if (error) return <p className={errorClass}>{error}</p>;
  if (!article) return null;

  return (
    <div className={articlePageWrapper}>
      {/* Header */}
      <div className={articleHeader}>
        <span className={articleCategory}>{article.category}</span>

        <h1 className={`${articleMainTitle} uppercase`}>{article.title}</h1>

        <div className={articleAuthorRow}>
          <div className={authorInfo}>✍️ {article.author?.firstName || "Author"}</div>

          <div>{formatDate(article.createdAt)}</div>
        </div>
      </div>

      {/* Content */}
      <div className={articleContent}>{article.content}</div>

      {/* AUTHOR actions */}
      {user?.role === "AUTHOR" && (
        <div className={articleActions}>
          <button className={editBtn} onClick={() => editArticle(article)}>
            Edit
          </button>

          <button className={deleteBtn} onClick={toggleArticleStatus}>
            {article.isArticleActive ? "Delete" : "Restore"}
          </button>
        </div>
      )}
      {/* form to add comment if role is USER */}
      {/* USER actions */}
      {user?.role === "USER" && (
        <div className={articleActions}>
          <form onSubmit={handleSubmit(addComment)}>
            <textarea
              rows="3"
              {...register("comment", {
                required: "Comment is required",
                minLength: {
                  value: 2,
                  message: "Comment should be at least 2 characters",
                },
                maxLength: {
                  value: 500,
                  message: "Comment should be less than 500 characters",
                },
              })}
              className={inputClass}
              placeholder="Write your comment here..."
            />
            {errors.comment && <p className={`${errorClass} mt-2`}>{errors.comment.message}</p>}
            <button
              type="submit"
              disabled={commentLoading}
              className="bg-amber-600 text-white px-5 py-2 rounded-2xl mt-5 disabled:opacity-60"
            >
              {commentLoading ? "Posting..." : "Add comment"}
            </button>
          </form>
        </div>
      )}

      {/* comments */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-slate-700">Comments ({(article.comments || []).length})</h3>

        {(article.comments || []).length === 0 && (
          <p className="text-slate-500 mt-3">No comments yet. Be the first to share feedback.</p>
        )}

        {(article.comments || []).map((comment, index) => {
          const userName =
            typeof comment.user === "object"
              ? comment.user?.firstName || comment.user?.email || "User"
              : "User";
          const userEmail = typeof comment.user === "object" ? comment.user?.email : "";
          const commentDate = comment.createdAt ? formatDate(comment.createdAt) : "";

          return (
            <div
              key={comment._id || `${comment.user?._id || comment.user}-${index}`}
              className="bg-gray-100 border border-gray-200 p-5 rounded-2xl mt-4"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="font-semibold text-slate-700">{userName}</p>
                {commentDate && <p className="text-xs text-slate-500">{commentDate}</p>}
              </div>
              {userEmail && <p className="text-xs text-slate-500 mb-2">{userEmail}</p>}
              <p className="text-slate-700 leading-relaxed">{comment.comment}</p>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className={articleFooter}>Last updated: {formatDate(article.updatedAt)}</div>
    </div>
  );
}

export default ArticleByID;

// {
//   "user":"6989799b7013502767d3f82b",
//   "articleId":"6989750220ce5bf826ec4f7e",
//   "comment":"good article"

// }
