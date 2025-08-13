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
            const token = response.data.data.accessToken;
            Cookies.set("accessToken", token, { expires: 7 });
            toast.success("Daxil oldunuz!");
            navigate("/user-account");
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            }
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-6 transition-colors duration-300">
            <div className="w-full max-w-4xl bg-transparent">
                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Sol: Form */}
                    <div className="md:col-span-2">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-[#e6eef6] mb-8">
                            Daxil ol
                        </h1>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-lg font-semibold text-gray-900 dark:text-[#e6eef6] mb-3">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full rounded-xl px-3 py-2 
                                    bg-gray-100 dark:bg-gray-800 dark:border-gray-700 
                                    border border-gray-300 
                                    text-gray-900 dark:text-[#e6eef6] 
                                    placeholder-gray-500 dark:placeholder-[#2b3940] 
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-lg font-semibold text-gray-900 dark:text-[#e6eef6] mb-3">
                                    Şifrə
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full rounded-xl px-3 py-2 pr-10
                                        bg-gray-100 dark:bg-gray-800 dark:border-gray-700 
                                        border border-gray-300 
                                        text-gray-900 dark:text-[#e6eef6] 
                                        placeholder-gray-500 dark:placeholder-[#2b3940] 
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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

                            {error && (
                                <p className="text-red-600 font-semibold mb-2">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="w-full mt-2 rounded-xl py-2 text-xl font-semibold 
                                bg-gradient-to-b from-gray-100 to-blue-200 
                                dark:from-[#243447] dark:to-[#254e79] 
                                text-gray-900 dark:text-white shadow-inner transition-colors duration-300"
                            >
                                Daxil ol
                            </button>
                        </form>
                    </div>

                    {/* Sağ: Avatar */}
                    <div className="md:col-span-1 flex md:justify-end items-start">
                        <div
                            className="w-36 h-36 md:w-40 md:h-40 rounded-full 
                            bg-gray-200 dark:bg-[rgba(255,255,255,0.06)] 
                            flex items-center justify-center ml-auto"
                        >
                            <svg
                                width="68"
                                height="68"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="text-gray-700 dark:text-[#dfe8ef] opacity-90"
                            >
                                <circle cx="12" cy="8" r="3.5" fill="currentColor" />
                                <path
                                    d="M4 20c0-3.3137 2.6863-6 6-6h4c3.3137 0 6 2.6863 6 6"
                                    fill="currentColor"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Əlavə linklər */}
                    <div className="md:col-span-3 w-full flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-700 dark:text-white transition-colors duration-300">
                        <Link to="/forgot-password" className="hover:underline">
                            Şifrəni unutmusan?
                        </Link>
                        <Link to="/register" className="hover:underline mt-2 sm:mt-0">
                            Hesab yarat
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;