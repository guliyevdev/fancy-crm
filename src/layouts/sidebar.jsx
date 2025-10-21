import { forwardRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import { navbarLinks } from "@/constants";
import { cn } from "@/utils/cn";
import PropTypes from "prop-types";
import { useUser } from "../contexts/UserContext";

export const Sidebar = forwardRef(({ collapsed }, ref) => {
    const { user } = useUser(); // ✅ user məlumatlarını alırıq

    const [openGroups, setOpenGroups] = useState(() =>
        navbarLinks.reduce((acc, link) => {
            acc[link.title] = false;
            return acc;
        }, {})
    );

    const toggleGroup = (title) => {
        setOpenGroups((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    // ✅ Permission-lara görə navbarLinks-i filterləyirik
    const filteredNavbarLinks = navbarLinks
        .map((group) => ({
            ...group,
            links: group.links.filter((link) => {
                // Əgər permission təyin edilməyibsə hamıya açıqdır
                if (!link.permission) return true;

                // Əgər user yoxdursa və ya icazə yoxdursa — göstərmə
                if (!user || !user.permissions) return false;

                return user.permissions.includes(link.permission);
            }),
        }))
        .filter((group) => group.links.length > 0); // boş qrupları çıxart

    return (
        <aside
            ref={ref}
            className={cn(
                "fixed z-[100] flex h-full flex-col overflow-x-hidden border-r border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 [transition:_width_300ms_cubic-bezier(0.4,_0,_0.2,_1)]",
                collapsed ? "md:w-[70px] md:items-center" : "md:w-[250px]",
                collapsed ? "max-md:-left-full" : "max-md:left-0"
            )}
        >
            <div className="flex w-full flex-col gap-y-4 overflow-y-auto overflow-x-hidden p-3 [scrollbar-width:_thin]">
                {filteredNavbarLinks.map((navbarLink) => {
                    const isOpen = openGroups[navbarLink.title];
                    return (
                        <nav
                            key={navbarLink.title}
                            className={cn("sidebar-group", collapsed && "md:items-center")}
                        >
                            <div
                                className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                                onClick={() => toggleGroup(navbarLink.title)}
                            >
                                <p className={cn("sidebar-group-title", collapsed && "md:w-[45px]")}>
                                    {navbarLink.title}
                                </p>
                                {!collapsed && (
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 p-2">
                                        <FaChevronDown
                                            className={`text-gray-600 dark:text-blue-400 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
                                            size={16}
                                        />
                                    </div>
                                )}
                            </div>

                            {isOpen && !collapsed && (
                                <div className="mt-1 ml-4 flex flex-col gap-1">
                                    {navbarLink.links.map((link) => (
                                        <NavLink
                                            key={link.label}
                                            to={link.path}
                                            className={cn("sidebar-item", collapsed && "md:w-[45px]")}
                                        >
                                            <link.icon size={22} className="flex-shrink-0" />
                                            <p className="whitespace-nowrap">{link.label}</p>
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </nav>
                    );
                })}
            </div>
        </aside>
    );
});

Sidebar.displayName = "Sidebar";
Sidebar.propTypes = {
    collapsed: PropTypes.bool,
};
