import { forwardRef, useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import { navbarLinks } from "@/constants";
import { cn } from "@/utils/cn";
import PropTypes from "prop-types";
import { useUser } from "../contexts/UserContext";
import { motion, AnimatePresence } from "framer-motion";

export const Sidebar = forwardRef(({ collapsed }, ref) => {
    const { user } = useUser();
    const location = useLocation();

    // State for open groups
    const [openGroups, setOpenGroups] = useState(() =>
        navbarLinks.reduce((acc, link) => {
            acc[link.title] = false;
            return acc;
        }, {})
    );

    // Effect to handle route changes and auto-expand
    useEffect(() => {
        const currentPath = location.pathname;

        // Keep previously opened groups open, only open the current group if not already open
        setOpenGroups(prev => {
            const newGroups = { ...prev };

            const activeGroup = navbarLinks.find(group =>
                group.links.some(link => {
                    return currentPath === link.path ||
                        (link.path !== '/' && currentPath.startsWith(link.path));
                })
            );

            if (activeGroup) {
                newGroups[activeGroup.title] = true;
            }

            return newGroups;
        });
    }, [location.pathname]);

    const toggleGroup = (title) => {
        setOpenGroups((prev) => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const filteredNavbarLinks = navbarLinks
        .map((group) => ({
            ...group,
            links: group.links.filter((link) => {
                if (!link.permission) return true;

                if (!user || !user.permissions) return false;

                return user.permissions.includes(link.permission);
            }),
        }))
        .filter((group) => group.links.length > 0);

    return (
        <aside
            ref={ref}
            className={cn(
                "fixed z-[49] flex h-full flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 transition-all duration-300 ease-in-out shadow-sm",
                collapsed ? "md:w-[80px]" : "md:w-[280px]",
                collapsed ? "max-md:-left-full" : "max-md:left-0"
            )}
        >
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 custom-scrollbar">
                <div className="flex flex-col gap-y-3">
                    {filteredNavbarLinks.map((navbarLink) => {
                        const isOpen = openGroups[navbarLink.title];
                        const isGroupActive = navbarLink.links.some(link =>
                            location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))
                        );

                        return (
                            <div key={navbarLink.title} className="flex flex-col">
                                {/* Group Header */}
                                {!collapsed ? (
                                    <button
                                        onClick={() => toggleGroup(navbarLink.title)}
                                        className={cn(
                                            "flex items-center justify-between w-full p-2.5 rounded-xl transition-all duration-200 group outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                                            "hover:bg-gray-100 dark:hover:bg-gray-900"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "text-sm font-bold tracking-wide transition-colors",
                                                isGroupActive ? "text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-200",
                                                "group-hover:text-blue-700 dark:group-hover:text-blue-300"
                                            )}>
                                                {navbarLink.title}
                                            </span>
                                        </div>

                                        <FaChevronDown
                                            className={cn(
                                                "text-gray-400 transition-transform duration-300",
                                                isOpen ? "rotate-180 text-blue-600" : "group-hover:text-gray-600"
                                            )}
                                            size={12}
                                        />
                                    </button>
                                ) : (
                                    // Collapsed Header (optional, maybe just a divider or hidden)
                                    <div className="flex justify-center py-2 border-b border-gray-100 dark:border-gray-800 mb-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            {navbarLink.title.substring(0, 3)}
                                        </span>
                                    </div>
                                )}

                                {/* Group Links (Expanded) */}
                                <AnimatePresence initial={false}>
                                    {isOpen && !collapsed && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="flex flex-col gap-1 mt-1 ml-2 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                                                {navbarLink.links.map((link) => (
                                                    <NavLink
                                                        key={link.label}
                                                        to={link.path}
                                                        className={({ isActive }) => cn(
                                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                                                            isActive
                                                                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 shadow-sm translate-x-1"
                                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 hover:translate-x-1"
                                                        )}
                                                    >
                                                        {({ isActive }) => (
                                                            <>
                                                                <link.icon size={18} className={cn("flex-shrink-0 transition-colors", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700")} />
                                                                <span className="truncate">{link.label}</span>
                                                            </>
                                                        )}
                                                    </NavLink>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Group Links (Collapsed - Always show icons) */}
                                {collapsed && (
                                    <div className="flex flex-col gap-1 items-center">
                                        {navbarLink.links.map((link) => (
                                            <NavLink
                                                key={link.label}
                                                to={link.path}
                                                className={({ isActive }) => cn(
                                                    "p-2.5 rounded-xl transition-all duration-200 relative group/icon",
                                                    isActive
                                                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 shadow-sm"
                                                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                                                )}
                                                title={link.label}
                                            >
                                                <link.icon size={20} />

                                                {/* Tooltip on hover for collapsed state */}
                                                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover/icon:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg dark:bg-gray-700">
                                                    {link.label}
                                                </span>
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
});

Sidebar.displayName = "Sidebar";
Sidebar.propTypes = {
    collapsed: PropTypes.bool,
};
