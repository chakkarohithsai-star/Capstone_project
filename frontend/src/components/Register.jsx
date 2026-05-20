import { useForm } from "react-hook-form";
import { NavLink } from "react-router";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useNavigate } from "react-router";

function Register() {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const onUserRegister = async (newUser) => {
    setLoading(true);

    const formData = new FormData();
    let { role, profileImageUrl, ...userObj } = newUser;
    
    Object.keys(userObj).forEach((key) => {
      formData.append(key, userObj[key]);
    });
    
    formData.append("profileImageUrl", profileImageUrl[0]);
    
    try {
      if (role === "user") {
        let resObj = await api.post("/user-api/users", formData);
        if (resObj.status === 201) {
          navigate("/login");
        }
      }
      if (role === "author") {
        let resObj = await api.post("/author-api/users", formData);
        if (resObj.status === 201) {
          navigate("/login");
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  if (loading) {
    return <p className="text-center text-blue-600 mt-10 animate-pulse">Processing...</p>;
  }

  return (
    <div className="flex items-center justify-center py-16 px-4 bg-white min-h-[80vh]">
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Create an Account</h2>
        
        {error && <p className="bg-red-50 text-red-600 border border-red-200 rounded-md p-3 text-sm mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit(onUserRegister)} className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Register as</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" {...register("role")} value="user" className="accent-blue-600 w-4 h-4" />
                <span className="text-sm text-slate-700">User</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" {...register("role")} value="author" className="accent-blue-600 w-4 h-4" />
                <span className="text-sm text-slate-700">Author</span>
              </label>
            </div>
          </div>

          <hr className="border-slate-100 my-4" />

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input type="text" {...register("firstName")} placeholder="First name" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input type="text" {...register("lastName")} placeholder="Last name" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" {...register("email")} placeholder="you@example.com" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" {...register("password")} placeholder="Min. 8 characters" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Profile Image</label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              {...register("profileImageUrl")}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  if (!["image/jpeg", "image/png"].includes(file.type)) {
                    setError("Only JPG or PNG allowed");
                    return;
                  }
                  if (file.size > 2 * 1024 * 1024) {
                    setError("File size must be less than 2MB");
                    return;
                  }
                  const previewUrl = URL.createObjectURL(file);
                  setPreview(previewUrl);
                  setError(null);
                }
              }}
            />
            {preview && (
              <div className="mt-3 flex justify-center">
                <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded-full border border-slate-200" />
              </div>
            )}
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition mt-4">
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <NavLink to="/login" className="text-blue-600 font-medium hover:underline">
            Sign in
          </NavLink>
        </p>
      </div>
    </div>
  );
}

export default Register;
