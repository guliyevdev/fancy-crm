import { useTheme } from "@/hooks/use-theme";
import { useState, useEffect } from "react";

import { Bell, ChevronsLeft, Moon, Search, Sun } from "lucide-react";

import profileImg from "@/assets/profile.jpg";
import CustomOrderService from "@/services/getCustomOrderServices";

import PropTypes from "prop-types";
import { Link } from "react-router-dom";

export const Header = ({ collapsed, setCollapsed }) => {
    const { theme, setTheme } = useTheme();
    const [notificationCount, setNotificationCount] = useState(0);

    const fetchNotificationCount = async () => {
        try {
            const response = await CustomOrderService.getNotifications(1, 1);

            if (response.data.key === "Success") {
                const totalElements = response.data.data.totalElements || 0;

                const readNotificationIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');

                if (readNotificationIds.length === 0) {
                    setNotificationCount(totalElements);
                } else {
                    const unreadCount = totalElements - readNotificationIds.length;
                    setNotificationCount(Math.max(0, unreadCount));
                }
            }
        } catch (error) {
            console.error('Error fetching notification count:', error);
        }
    };



    return (
        <header className="relative z-10 flex h-[60px] items-center justify-between bg-white px-4 shadow-md transition-colors dark:bg-slate-900 ">
            <div className="flex items-center gap-x-3  ">
                <button
                    className="btn-ghost size-10"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <ChevronsLeft className={collapsed && "rotate-180"} />
                </button>

            </div>
            <div className="flex items-center gap-x-3">
                <button
                    className="btn-ghost size-10"
                    onClick={() => {
                        localStorage.removeItem('readNotifications');
                        fetchNotificationCount();
                    }}
                    title="Clear read notifications"
                >
                    <Search size={20} />
                </button>
                <button
                    className="btn-ghost size-10"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                    <Sun
                        size={20}
                        className="dark:hidden"
                    />
                    <Moon
                        size={20}
                        className="hidden dark:block"
                    />
                </button>
                <button className="btn-ghost size-10 relative" onClick={fetchNotificationCount}>
                    <Link to='/notification'>
                        <Bell size={20} />
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                {notificationCount > 99 ? '99+' : notificationCount}
                            </span>
                        )}
                    </Link>
                </button>
                <Link to='user-account' className="size-10 overflow-hidden rounded-full">
                    <img
                        src={profileImg}
                        alt="profile image"
                        className="size-full object-cover"
                    />
                </Link>
            </div>
        </header>
    );
};

Header.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
};
