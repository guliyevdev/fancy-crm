import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Authservices from "../services/authServices";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await Authservices.PostLogin(formData, {
        headers: {
          deviceId: "some-device-id",
          "Accept-Language": "en",
        },
      });

      const { accessToken } = response.data.data;
      Cookies.set("accessToken", accessToken, { expires: 0.3 });
      toast.success("Daxil oldunuz!");
      navigate("/user-account");
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-3xl w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        
        {/* Form Side */}
        <div className="p-10 md:p-16 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-8">
            Daxil ol
          </h1>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-gray-400 focus:outline-none transition"
                placeholder="example@mail.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Şifrə
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-gray-400 focus:outline-none pr-12 transition"
                  placeholder="Şifrənizi daxil edin"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 font-medium">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-semibold rounded-2xl shadow-lg transition"
            >
              Daxil ol
            </button>
          </form>

          <div className="mt-6 text-sm text-gray-600 dark:text-gray-300 flex justify-between">
            <Link to="/forgot-password" className="hover:underline">
              Şifrəni unutmusan?
            </Link>
          </div>
        </div>

        {/* Avatar / Side Image */}
        <div className="hidden md:flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="w-40 h-40 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-xl">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-500 dark:text-gray-300"
            >
              <circle cx="12" cy="8" r="4" fill="currentColor" />
              <path
                d="M4 20c0-4 4-6 8-6s8 2 8 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
