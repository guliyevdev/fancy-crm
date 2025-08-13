import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Authservices from "../services/authServices";
import { toast } from "sonner";
import { FiEye, FiEyeOff } from "react-icons/fi";

const ForgetPassword = () => {
    const [formData, setFormData] = useState({
        email: "",
        otpCode: "",
        password: "",
        repeatPassword: ""
    });
    const [errors, setErrors] = useState({
        email: "",
        otp: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [otpTimer, setOtpTimer] = useState(600); // 10 minutes in seconds
    const [isOtpExpired, setIsOtpExpired] = useState(false);
    const navigate = useNavigate();

    // OTP Countdown timer
    useEffect(() => {
        let interval;
        if (showOtpModal && otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer(prev => prev - 1);
            }, 1000);
        } else if (otpTimer === 0) {
            setIsOtpExpired(true);
        }
        return () => clearInterval(interval);
    }, [showOtpModal, otpTimer]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({ email: "" });
        setLoading(true);

        try {
            const response = await Authservices.PostForgetPassword(formData.email);
            if (response.data.status === 200) {
                toast.success("Password reset email sent successfully!");
                setShowOtpModal(true);
                setOtpTimer(600); // Reset timer to 10 minutes
                setIsOtpExpired(false);
            }
        } catch (err) {
            setErrors({
                email: err.response?.data?.message || "Something went wrong!"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOtp = async () => {
        if (isOtpExpired) {
            setErrors(prev => ({ ...prev, otp: "OTP has expired. Please request a new one." }));
            return;
        }

        setErrors(prev => ({ ...prev, otp: "" }));
        try {
            const res = await Authservices.CheckOtp(formData.otpCode, formData.email);
            toast.success("OTP verified successfully!");
            setShowOtpModal(false);
            setShowPasswordModal(true);
        } catch (err) {
            setErrors(prev => ({
                ...prev,
                otp: err.response?.data?.message || "OTP verification failed!"
            }));
        }
    };

    const handleUpdatePassword = async () => {
        if (formData.password !== formData.repeatPassword) {
            setErrors(prev => ({
                ...prev,
                password: "Passwords don't match!"
            }));
            return;
        }

        try {
            const data = {
                ...formData,
                logOutOtherDevice: true
            };

            const response = await Authservices.PostUpdatePassword(data);

            if (response.data.status === 200) {
                toast.success(response.data.message || "Password updated successfully!");
                setFormData({
                    email: "",
                    otpCode: "",
                    password: "",
                    repeatPassword: ""
                });
                setShowPasswordModal(false);
                navigate("/login");
            }
        } catch (err) {
            setErrors(prev => ({
                ...prev,
                password: err.response?.data?.message || "Password update failed!"
            }));
        }
    };

    const handleResendOtp = async () => {
        try {
            const response = await Authservices.PostForgetPassword(formData.email);
            if (response.data.status === 200) {
                toast.success("New OTP sent successfully!");
                setOtpTimer(600);
                setIsOtpExpired(false);
                setFormData(prev => ({ ...prev, otpCode: "" }));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to resend OTP");
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-transparent">
                <h1 className="text-5xl font-bold text-black dark:text-white mb-8">Forgot Password</h1>
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-lg font-semibold text-black dark:text-white mb-3">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full rounded-xl px-3 py-2 bg-white dark:bg-gray-800 border border-[#26323a] text-[#e6eef6] placeholder:text-[#2b3940] focus:outline-none focus:ring-2 focus:ring-[#243040] transition"
                            placeholder="Enter your email"
                            required
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
                        <div className="flex items-end justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-[50%] mt-6 rounded-xl py-2 text-xl font-semibold 
                                    bg-gradient-to-b from-gray-100 to-blue-200 
                                    dark:from-[#243447] dark:to-[#254e79] 
                                    text-gray-900 dark:text-white shadow-inner transition-colors duration-300
                                    ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {loading ? "Sending..." : "Send"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* OTP Verification Modal */}
            {showOtpModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-96">
                        <h2 className="text-xl font-bold mb-4">OTP Verification</h2>
                        <div className="mb-2 text-sm text-gray-600">
                            Time remaining: {formatTime(otpTimer)}
                            {isOtpExpired && <span className="text-red-500 ml-2">(Expired)</span>}
                        </div>
                        <input
                            type="text"
                            name="otpCode"
                            placeholder="OTP Code"
                            value={formData.otpCode}
                            onChange={handleChange}
                            className={`w-full border px-3 py-2 rounded-lg mb-3 text-black ${isOtpExpired ? 'bg-gray-100 cursor-not-allowed' : ''
                                }`}
                            disabled={isOtpExpired}
                            required
                        />
                        <input
                            type="email"
                            value={formData.email}
                            readOnly
                            className="w-full border px-3 py-2 text-black rounded-lg mb-3 bg-gray-100"
                        />
                        {errors.otp && <p className="text-red-500 text-sm mb-2">{errors.otp}</p>}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowOtpModal(false);
                                    setFormData(prev => ({ ...prev, otpCode: "" }));
                                    setOtpTimer(600);
                                    setIsOtpExpired(false);
                                }}
                                className="px-4 py-2 bg-gray-300 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCheckOtp}
                                className={`px-4 py-2 rounded-lg ${isOtpExpired
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white'
                                    }`}
                                disabled={isOtpExpired}
                            >
                                Verify
                            </button>
                        </div>
                        {isOtpExpired && (
                            <div className="mt-3 text-center">
                                <button
                                    onClick={handleResendOtp}
                                    className="text-blue-600 hover:underline text-sm"
                                >
                                    Resend OTP
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Password Update Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-96">
                        <h2 className="text-xl font-bold mb-4 text-black">Update Password</h2>
                        <div className="relative mb-3">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="New Password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 text-black rounded-lg pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        <div className="relative mb-3">
                            <input
                                type={showRepeatPassword ? "text" : "password"}
                                name="repeatPassword"
                                placeholder="Repeat Password"
                                value={formData.repeatPassword}
                                onChange={handleChange}
                                className="w-full border px-3 text-black py-2 rounded-lg pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            >
                                {showRepeatPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mb-2">{errors.password}</p>}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setFormData(prev => ({ ...prev, password: "", repeatPassword: "" }));
                                }}
                                className="px-4 py-2 bg-gray-300 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdatePassword}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForgetPassword;