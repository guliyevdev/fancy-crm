import React, { useEffect, useState } from "react";
import profile from "../assets/profile.jpg";
import { useNavigate } from "react-router-dom";
import Authservices from "../services/authServices";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { FiEye, FiEyeOff } from "react-icons/fi";

const UserAccount = () => {
    const [activeTab, setActiveTab] = useState("profile");
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState({})
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState({
        name: "",
        surname: "",
        fin: "",
        email: "",
        mobile: "",
        depositAmount: 0,
        gainPercent: 0
    });

    const [originalEmail, setOriginalEmail] = useState("");
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: "",
    });

    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

    useEffect(() => {
        Authservices.getUserOwnInfo().then((res) => {
            if (res?.data?.data) {
                const user = res.data.data;
                setProfileData({
                    name: user.name || "",
                    surname: user.surname || "",
                    fin: user.fin || "",
                    email: user.email || "",
                    mobile: user.mobile || "",
                    depositAmount: user.depositAmount || 0,
                    gainPercent: user.gainPercent || 0
                });
                setOriginalEmail(user.email || "");
            }
        });
    }, []);

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoadingProfile(true);

        try {
            const response = await Authservices.updateUserOwnInfo(profileData);

            if (response.data.status === 200) {
                toast.success("Profil uğurla yeniləndi!");

                if (profileData.email !== originalEmail) {
                    toast.info("Email dəyişdiyi üçün yenidən daxil olmalısınız");
                    await handleLogout();
                }
            }
        } catch (err) {
            console.error(err);
            if (err.response?.data?.data) {
                const backendErrors = err.response.data.data; // [{field, message}, ...]
                const formattedErrors = {};
                backendErrors.forEach(e => {
                    formattedErrors[e.field] = e.message;
                });
                setError(formattedErrors);
            }
            toast.error(err.response?.data?.message || "Xəta baş verdi!");
        } finally {
            setLoadingProfile(false);
        }
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
            toast.success("Şifrə uğurla dəyişdirildi!");
            setPasswords({
                current: "",
                new: "",
                confirm: "",
            });
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Xəta baş verdi!");
        } finally {
            setLoadingPassword(false);
        }
    };

    const handleLogout = async () => {
        try {
            await Authservices.PostLogOut();
        } catch (err) {
            console.error("Çıxış xətası:", err);
        } finally {
            Cookies.remove("accessToken");
            navigate("/login");
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-semibold text-center text-gray-800 dark:text-white mb-10">Hesab Tənzimləmələri</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-gray-900 rounded-md shadow-md p-6 max-w-5xl mx-auto">
                    <div className="flex flex-col items-center">
                        <img
                            src={profile}
                            alt="Profile"
                            className="rounded-full w-28 h-28 mb-4 border-4 border-gray-200 dark:border-gray-700 object-cover"
                        />
                        <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                            {profileData.name} {profileData.surname}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{profileData.email}</p>

                        <div className="mt-8 w-full space-y-2">
                            <button
                                onClick={() => setActiveTab("profile")}
                                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "profile"
                                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                    : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                    }`}
                            >
                                👤 Profili Redaktə et
                            </button>
                            <button
                                onClick={() => setActiveTab("password")}
                                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "password"
                                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                    : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                    }`}
                            >
                                🔒 Şifrəni dəyiş
                            </button>
                            <button
                                onClick={() => setShowLogoutModal(true)}
                                className="w-full px-4 py-2 rounded-lg text-sm font-medium transition bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Çıxış et
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow-md p-8">
                    {activeTab === "profile" ? (
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Profil Məlumatları</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Ad</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profileData.name}
                                        onChange={handleProfileChange}
                                        className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {error.name && <p className="text-sm text-red-500 mt-1">{error.name}</p>}

                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Soyad</label>
                                    <input
                                        type="text"
                                        name="surname"
                                        value={profileData.surname}
                                        onChange={handleProfileChange}
                                        className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {error.surname && <p className="text-sm text-red-500 mt-1">{error.surname}</p>}

                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">FIN</label>
                                    <input
                                        type="text"
                                        name="fin"
                                        value={profileData.fin}
                                        onChange={handleProfileChange}
                                        className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {error.fin && <p className="text-sm text-red-500 mt-1">{error.fin}</p>}

                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Telefon</label>
                                    <input
                                        type="text"
                                        name="mobile"
                                        value={profileData.mobile}
                                        onChange={handleProfileChange}
                                        className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {error.mobile && <p className="text-sm text-red-500 mt-1">{error.mobile}</p>}

                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleProfileChange}
                                        className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {error.email && <p className="text-sm text-red-500 mt-1">{error.email}</p>}

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
                                    {loadingProfile ? "Yadda saxlanılır..." : "Yadda Saxla"}
                                </button>
                            </div>
                        </form>
                    ) : (

                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Şifrəni Dəyiş</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                        Hazırkı Şifrə
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            name="current"
                                            value={passwords.current}
                                            onChange={handlePasswordChange}
                                            className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                                        >
                                            {showCurrentPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Yeni Şifrə */}
                                <div>
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                        Yeni Şifrə
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            name="new"
                                            value={passwords.new}
                                            onChange={handlePasswordChange}
                                            className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                                        >
                                            {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Yeni Şifrə (Təkrar) */}
                                <div>
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                        Yeni Şifrə (Təkrar)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirm"
                                            value={passwords.confirm}
                                            onChange={handlePasswordChange}
                                            className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                                        >
                                            {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                        </button>
                                    </div>
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
                                    {loadingPassword ? "Yadda saxlanılır..." : "Şifrəni Dəyiş"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Çıxış etmək istədiyinizə əminsiniz?</h3>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
                            >
                                Ləğv et
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Çıxış et
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserAccount;