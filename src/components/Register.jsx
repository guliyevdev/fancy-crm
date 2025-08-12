import React, { useState } from "react";
import caratService from "../services/caratService";
import Authservices from "../services/authServices";
import { toast } from "sonner";

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        fin: "",
        email: "",
        phoneNumber: "",
        password: "",
        repeatPassword: ""
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        setErrors({
            ...errors,
            [e.target.name]: ""
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.repeatPassword) {
            setErrors((prev) => ({
                ...prev,
                repeatPassword: "Şifrələr eyni deyil"
            }));
            return;
        }

        try {
            const res = await Authservices.PostRegister(formData);
            console.log("Qeydiyyat uğurlu:", res.data);
            toast.success("Qeydiyyat tamamlandı!");
            setErrors({});
            setFormData({
                firstName: "",
                lastName: "",
                fin: "",
                email: "",
                phoneNumber: "",
                password: "",
                repeatPassword: ""
            });

        } catch (err) {
            console.error("Qeydiyyat xətası:", err);

            if (err.response?.data?.data) {
                const backendErrors = err.response.data.data.reduce((acc, item) => {
                    acc[item.field] = item.message;
                    return acc;
                }, {});
                setErrors(backendErrors);
            } else {
                toast.error(err.response?.data?.message || "Xəta baş verdi!");
            }
        }
    };

    return (
        <div className="min-h-screen bg-transparent dark:bg-slate-900 flex items-center justify-center p-6">
            <div className="w-full max-w-4xl bg-transparent">
                <div className=" grid md:grid-cols-3 gap-6 ">
                    <div className="md:col-span-3  w-full">
                        <h1 className=" text-5xl md:text-6xl font-bold dark:text-[#e6eef6] mb-8">
                            Registration
                        </h1>

                        <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={handleSubmit}>
                            {/* Ad */}
                            <div >
                                <label className="block text-lg font-semibold dark:dark:text-[#e6eef6] mb-3">Ad</label>
                                <input
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    type="text"
                                    className="w-full rounded-xl px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 text-gray-900 dark:dark:text-[#e6eef6]"
                                />
                                {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                            </div>

                            {/* Soyad */}
                            <div>
                                <label className="block text-lg font-semibold dark:text-[#e6eef6] mb-3">Soyad</label>
                                <input
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    type="text"
                                    className="w-full rounded-xl px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 text-gray-900 dark:dark:text-[#e6eef6]"
                                />
                                {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                            </div>

                            {/* Fin */}
                            <div>
                                <label className="block text-lg font-semibold dark:text-[#e6eef6] mb-3">Fin</label>
                                <input
                                    name="fin"
                                    value={formData.fin}
                                    onChange={handleChange}
                                    type="text"
                                    className="w-full rounded-xl px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 text-gray-900 dark:dark:text-[#e6eef6]"
                                />
                                {errors.fin && <p className="text-red-500 text-sm">{errors.fin}</p>}
                            </div>

                            {/* Mail */}
                            <div>
                                <label className="block text-lg font-semibold dark:text-[#e6eef6] mb-3">Mail</label>
                                <input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    type="email"
                                    className="w-full rounded-xl px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 text-gray-900 dark:dark:text-[#e6eef6]"
                                />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                            </div>

                            {/* Nömrə */}
                            <div>
                                <label className="block text-lg font-semibold dark:text-[#e6eef6] mb-3">Nömrə</label>
                                <input
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    type="tel"
                                    className="w-full rounded-xl px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 text-gray-900 dark:dark:text-[#e6eef6]"
                                />
                                {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-lg font-semibold dark:text-[#e6eef6] mb-3">Password</label>
                                <input
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    type="password"
                                    className="w-full rounded-xl px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 text-gray-900 dark:dark:text-[#e6eef6]"
                                />
                                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                            </div>

                            {/* Repeat Password */}
                            <div>
                                <label className="block text-lg font-semibold dark:text-[#e6eef6] mb-3">Repeat Password</label>
                                <input
                                    name="repeatPassword"
                                    value={formData.repeatPassword}
                                    onChange={handleChange}
                                    type="password"
                                    className="w-full rounded-xl px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 text-gray-900 dark:dark:text-[#e6eef6]"
                                />
                                {errors.repeatPassword && <p className="text-red-500 text-sm">{errors.repeatPassword}</p>}
                            </div>

                            {/* Submit */}
                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    className="w-full mt-2 rounded-xl py-2 text-xl font-semibold bg-gradient-to-b from-gray-100 to-blue-200 dark:from-[#243447] dark:to-[#254e79] text-gray-900 dark:text-white shadow-inner transition-colors duration-300"
                                >
                                    Sign Up
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
