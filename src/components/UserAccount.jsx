import React, { useState } from "react";
import profile from "../assets/profile.jpg"
import { useNavigate } from "react-router-dom";
import Authservices from "../services/authServices";
import Cookies from "js-cookie";
import { toast } from "sonner";

const UserAccount = () => {
    const [activeTab, setActiveTab] = useState("profile");
    const [showLogoutModal, setShowLogoutModal] = useState(false); // Modal state
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phoneNumber: "123-456-7890",
        iden: "JD-001",
    });

    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: "",
    });

    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        setLoadingProfile(true);
        setTimeout(() => {
            toast.success("Profile updated!");
            setLoadingProfile(false);
        }, 1000);
    };

   

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoadingPassword(true);

        try {
            const payload = {
                oldPassword: passwords.current,
                password: passwords.new,
                repeatPassword: passwords.confirm,
                logOutOtherDevice: true
            };

            await Authservices.ChangePassword(payload);
            toast.success("Password changed successfully!");
            setPasswords({
                current: "",
                new: "",
                confirm: "",
            });
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Something went wrong!");
        } finally {
            setLoadingPassword(false);
        }
    };


    const handleLogout = async () => {
        try {
            await Authservices.PostLogOut();

        } catch (err) {
            console.error("Logout error:", err);
        }
        finally {
            Cookies.remove("accessToken"); // tokeni sil
            navigate("/login"); // yönləndir
        }
    };


    return (
        <div className="max-w-6xl mx-auto px-6 py-12 ">
            <h1 className="text-3xl font-semibold text-center text-gray-800 mb-10">Account UserAccount</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar */}
                <div className="bg-white dark:bg-gray-900 rounded-md shadow-md p-6 max-w-5xl mx-auto">
                    <div className="flex flex-col items-center">
                        <img
                            src={profile}
                            alt="Profile"
                            className="rounded-full w-28 h-28 mb-4 border-4 border-gray-200 object-cover"
                        />
                        <h2 className="text-lg font-medium text-gray-800">
                            {profileData.firstName} {profileData.lastName}
                        </h2>
                        <p className="text-sm text-gray-500">{profileData.email}</p>

                        <div className="mt-8 w-full space-y-2">
                            <button
                                onClick={() => setActiveTab("profile")}
                                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "profile"
                                    ? "bg-blue-50 text-blue-600"
                                    : "hover:bg-gray-50 text-gray-700"
                                    }`}
                            >
                                👤 Update Profile
                            </button>
                            <button
                                onClick={() => setActiveTab("password")}
                                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "password"
                                    ? "bg-blue-50 text-blue-600"
                                    : "hover:bg-gray-50 text-gray-700"
                                    }`}
                            >
                                🔒 Change Password
                            </button>
                            <button
                                onClick={() => setShowLogoutModal(true)}
                                className="w-full px-4 py-2 rounded-lg text-sm font-medium transition bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Log out
                            </button>

                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="md:col-span-2 bg-white rounded-xl shadow-md p-8   bg-white dark:bg-gray-900 rounded-md shadow-md ">
                    {activeTab === "profile" ? (
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Edit Profile</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={profileData.firstName}
                                        onChange={handleProfileChange}
                                        className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={profileData.lastName}
                                        onChange={handleProfileChange}
                                        className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={profileData.phoneNumber}
                                        onChange={handleProfileChange}
                                        className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Identifier</label>
                                    <input
                                        type="text"
                                        name="iden"
                                        value={profileData.iden}
                                        onChange={handleProfileChange}
                                        className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        disabled
                                        className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loadingProfile}
                                    className={`px-5 py-2.5 rounded-lg text-white font-medium transition ${loadingProfile
                                        ? "bg-blue-400 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                >
                                    {loadingProfile ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        name="current"
                                        value={passwords.current}
                                        onChange={handlePasswordChange}
                                        className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        name="new"
                                        value={passwords.new}
                                        onChange={handlePasswordChange}
                                        className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirm"
                                        value={passwords.confirm}
                                        onChange={handlePasswordChange}
                                        className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loadingPassword}
                                    className={`px-5 py-2.5 rounded-lg text-white font-medium transition ${loadingPassword
                                        ? "bg-blue-400 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                >
                                    {loadingPassword ? "Saving..." : "Save Password"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>



            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-80 shadow-lg">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                            Eminsiniz?
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                            Sistemdən çıxmaq istədiyinizə əminsiniz?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800"
                            >
                                Xeyr
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                            >
                                Bəli
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserAccount;
