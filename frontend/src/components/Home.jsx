import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { api } from '../api/client';
import { useAuth } from '../store/authStore';

function Home() {
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await api.get("/common-api/articles");
        setArticles(response.data.payload);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load articles");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // convert UTC → IST
  const formatDateIST = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
    });
  };

  const navigateToArticle = (articleObj) => {
    navigate(`/article/${articleObj._id}`, { state: articleObj });
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-6">Welcome to MyBlog</h1>
      <p className="text-lg text-slate-600 mb-10 max-w-2xl">
        Discover the latest articles, tutorials, and stories on tech, design, and lifestyle.
      </p>
      
      {!isAuthenticated && (
        <div className="flex gap-4">
          <NavLink to="/register" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">Get Started</NavLink>
          <NavLink to="/login" className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition">Sign In</NavLink>
        </div>
      )}

      <div className="mt-20 w-full max-w-5xl text-left">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-2">Latest Posts</h2>
        
        {loading && <p className="text-slate-500 text-center py-10">Loading articles...</p>}
        {error && <p className="text-red-500 text-center py-10">{error}</p>}
        {!loading && !error && articles.length === 0 && (
          <p className="text-slate-500 text-center py-10">No articles available.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div 
              key={article._id} 
              className="border border-slate-200 rounded-xl p-5 bg-white hover:shadow-md transition cursor-pointer flex flex-col h-full"
              onClick={() => navigateToArticle(article)}
            >
              <span className="text-blue-600 text-xs font-bold uppercase">{article.category}</span>
              <h3 className="text-xl font-bold mt-2 text-slate-800">{article.title}</h3>
              <p className="text-slate-500 mt-2 text-sm line-clamp-3">
                {article.content.slice(0, 100)}{article.content.length > 100 ? "..." : ""}
              </p>
              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-2">
                  {article.author?.profileImageUrl ? (
                    <img src={article.author.profileImageUrl} alt="Author" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {article.author?.firstName || "Unknown Author"}
                </span>
                <span>{formatDateIST(article.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
