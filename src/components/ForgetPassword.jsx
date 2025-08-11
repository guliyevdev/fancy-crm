import React, { useState } from "react";
import Authservices from "../services/authServices";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "sonner";

const ForgetPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [otpError, setOtpError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await Authservices.PostForgetPassword(email);
            if (response.data.status === 200) {
                setSuccess("Password reset email sent successfully!");
                setShowOtpModal(true); // modal aç
            }
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOtp = async () => {
        setOtpError("");
        try {
            const res = await Authservices.CheckOtp(otpCode, email);
            toast.success("OTP təsdiq olundu!");
            setShowOtpModal(false);
        } catch (err) {
            setOtpError(err.response?.data?.message || "OTP doğrulama uğursuz oldu!");
        }
    };


    return (
        <div className="min-h-screen bg-[#071016] flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-transparent">
                <h1 className="text-5xl font-bold text-[#e6eef6] mb-8">Forgot Password</h1>
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-lg font-semibold text-[#e6eef6] mb-3">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl px-3 py-2 bg-[#0f1a1f] border border-[#26323a] text-[#e6eef6] placeholder:text-[#2b3940] focus:outline-none focus:ring-2 focus:ring-[#243040] transition"
                            placeholder="Emailinizi daxil edin"
                        />
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
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
                                {loading ? "Göndərilir..." : "Send"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* OTP Modal */}
            {showOtpModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-96">
                        <h2 className="text-xl font-bold mb-4">OTP Təsdiqi</h2>
                        <input
                            type="text"
                            placeholder="OTP Code"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="w-full border px-3 py-2 rounded-lg mb-3"
                        />
                        <input
                            type="email"
                            value={email}
                            readOnly
                            className="w-full border px-3 py-2 rounded-lg mb-3 bg-gray-100"
                        />
                        {otpError && <p className="text-red-500 text-sm mb-2">{otpError}</p>}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowOtpModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded-lg"
                            >
                                Bağla
                            </button>
                            <button
                                onClick={handleCheckOtp}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                            >
                                Göndər
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForgetPassword;
