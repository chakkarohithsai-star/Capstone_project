import { useForm } from "react-hook-form";
import { NavLink, useNavigate, useLocation } from "react-router";
import { useAuth } from "../store/authStore";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

function Login() {
  const { register, handleSubmit } = useForm();
  const login = useAuth((state) => state.login);
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const currentUser = useAuth((state) => state.currentUser);
  const error = useAuth((state) => state.error);
  const navigate = useNavigate();
  const location = useLocation();

  const onUserLogin = async (userCredObj) => {
    await login(userCredObj);
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (location.pathname === "/login") {
        if (currentUser.role === "USER") {
          toast.success("Logged in successfully");
          navigate("/user-profile");
        } else if (currentUser.role === "AUTHOR") {
          navigate("/author-profile");
        }
      }
    }
  }, [isAuthenticated, currentUser]);

  return (
    <div className="flex items-center justify-center py-20 px-4 bg-white min-h-[80vh]">
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Sign In</h2>
        
        {error && <p className="bg-red-50 text-red-600 border border-red-200 rounded-md p-3 text-sm mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit(onUserLogin)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              {...register("email")} 
              placeholder="you@example.com" 
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <a href="/forgot-password" className="text-xs text-blue-600 hover:underline">Forgot password?</a>
            </div>
            <input 
              type="password" 
              {...register("password")} 
              placeholder="••••••••" 
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition mt-2">
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{" "}
          <NavLink to="/register" className="text-blue-600 font-medium hover:underline">
            Create one
          </NavLink>
        </p>
      </div>
    </div>
  );
}

export default Login;
