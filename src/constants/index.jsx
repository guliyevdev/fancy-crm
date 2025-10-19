import { House, Calendar, Home, NotepadText, Ticket, Package, PackagePlus, Settings, Gem, PenTool, Palette, BarChart, Layers, PartyPopper, Tag, Users, ShoppingCart, Users2 } from "lucide-react";

import ProfileImage from "@/assets/profile.jpg";
import RoomImage from "@/assets/121.jpg";
import RoomImage2 from "@/assets/123.jpg";
import RoomImage3 from "@/assets/124.jpeg";
import RoomImage4 from "@/assets/125.jpg";
import RoomImage5 from "@/assets/126.jpg";
import { SiTraefikproxy } from "react-icons/si";
import { FaBlog } from "react-icons/fa";




export const navbarLinks = [
    {
        title: "Dashboard",
        links: [
            {
                label: "Dashboard",
                icon: Home,
                path: "/",

            },
            {
                label: "Calendar",
                icon: Calendar,
                path: "/calendar",
            },
            {
                label: "Reports",
                icon: NotepadText,
                path: "/reports",
                permission: "REPORTS",
            },
        ],
    },
    {
        title: "Auth",
        links: [
            {
                label: "Users",
                icon: Users2,
                path: "/all-users",
                permission: "CAN_SEE_USER",
            },
            {
                label: "Company-Workers",
                icon: PenTool,
                path: "/company-workers",
                permission: "CAN_SEE_USER",
            },
            {
                label: "Partner-Users",
                icon: BarChart,
                path: "/partner-users",
                permission: "CAN_SEE_USER",
            },
            {
                label: "Customer-Users",
                icon: Tag,
                path: "/customers",
                permission: "CAN_SEE_USER",
            },


        ],
    },
    {
        title: "Product Management",
        links: [
            {
                label: "Materials",
                icon: Gem,
                path: "/materials",
                permission: "SEARCH_MATERIAL",
            },
            // {
            //     label: "Designers",
            //     icon: PenTool,
            //     path: "/designers",
            // },
            {
                label: "Colors",
                icon: Palette,
                path: "/colors",
                permission: "SEARCH_COLOR",
            },
            // {
            //     label: "Daily Sales",
            //     icon: BarChart,
            //     path: "/daily-Sales",
            // },
            {
                label: "Category",
                icon: Layers,
                path: "/categorys",
                permission: "SEARCH_CATEGORY",
            },
            {
                label: "Occasions",
                icon: PartyPopper,
                path: "/occasions",
                permission: "SEARCH_OCCASION",
            }
            ,
            // {
            //     label: "Karats",
            //     icon: Tag,
            //     path: "/carats",
            // },
            {
                label: "Products",
                icon: ShoppingCart,
                path: "/products",
                permission: "SEARCH_PRODUCT",
            },
            {
                label: "Inventory",
                icon: BarChart,
                path: "/inventory",
                permission: "SEARCH_INVENTORY",
            },

        ],
    },
    {
        title: "Partners Management",
        links: [
            {
                label: "Partners",
                icon: Users,
                path: "/partners",
                permission: "SEARCH_PARTNER",
            }
        ],
    },
    {
        title: "InstallMent Management",
        links: [
            {
                label: "Installments",
                icon: Users,
                path: "/installment",
                permission: "INSTALLMENT",
                
            },
            {
                label: "All Installments",
                icon: Package,
                path: "/all-installment",
                
                
            }
        ],
    },
    {
        title: "Orders",
        links: [
            {
                label: "Rent Orders",
                icon: Package,
                path: "/orders",
                permission: "SEARCH_ORDER",
            },
            {
                label: "Sale Orders",
                icon: ShoppingCart,
                path: "/sale-orders",
                permission: "SEARCH_ORDER",
            },

            // {
            //     label: "Telegram Orders",
            //     icon: Package,
            //     path: "/telegram-orders"
            // },
            // {
            //     label: "Message Orders",
            //     icon: Package,
            //     path: "/messages"
            // }
        ],
    },
    {
        title: "Website Management",
        links: [
            // {
            //     label: "Site Category",
            //     icon: SiTraefikproxy,
            //     path: "/site-category",
            // },
            {
                label: "Site Content",
                icon: SiTraefikproxy,
                path: "/site-content",
            },
            {
                label: "Site Blog",
                icon: FaBlog,
                path: "/site-blog",
            },

        ],
    },
    // {
    //     title: "Discounts",
    //     links: [
    //         {
    //             label: "Discounts",
    //             icon: Ticket,
    //             path: "/discounts",
    //         }
    //     ],
    // },
    {
        title: "Settings",
        links: [
            {
                label: "Settings",
                icon: Settings,
                path: "/user-account",
            },
        ],
    },
];

export const overviewData = [
    {
        name: "Jan",
        total: 1500,
    },
    {
        name: "Feb",
        total: 2000,
    },
    {
        name: "Mar",
        total: 1000,
    },
    {
        name: "Apr",
        total: 5000,
    },
    {
        name: "May",
        total: 2000,
    },
    {
        name: "Jun",
        total: 5900,
    },
    {
        name: "Jul",
        total: 2000,
    },
    {
        name: "Aug",
        total: 5500,
    },
    {
        name: "Sep",
        total: 2000,
    },
    {
        name: "Oct",
        total: 4000,
    },
    {
        name: "Nov",
        total: 1500,
    },
    {
        name: "Dec",
        total: 2500,
    },
];

export const recentSalesData = [
    {
        id: 1,
        name: "Olivia Martin",
        email: "olivia.martin@email.com",
        image: ProfileImage,
        total: 1500,
    },
    {
        id: 2,
        name: "James Smith",
        email: "james.smith@email.com",
        image: ProfileImage,
        total: 2000,
    },
    {
        id: 3,
        name: "Sophia Brown",
        email: "sophia.brown@email.com",
        image: ProfileImage,
        total: 4000,
    },
    {
        id: 4,
        name: "Noah Wilson",
        email: "noah.wilson@email.com",
        image: ProfileImage,
        total: 3000,
    },
    {
        id: 5,
        name: "Emma Jones",
        email: "emma.jones@email.com",
        image: ProfileImage,
        total: 2500,
    },
    {
        id: 6,
        name: "William Taylor",
        email: "william.taylor@email.com",
        image: ProfileImage,
        total: 4500,
    },
    {
        id: 7,
        name: "Isabella Johnson",
        email: "isabella.johnson@email.com",
        image: ProfileImage,
        total: 5300,
    },
];

export const topOrders = [
    {
        number: 1,
        orderCode: "ORD-20250708-001",
        orderType: "Online",
        product: {
            name: "Gold Ring",
            category: "Jewelry",
            image: RoomImage,
        },
        shippingAddress: "123 Avenue Hassan II, Casablanca",
        status: "PENDING",
    },
    {
        number: 2,
        orderCode: "ORD-20250708-002",
        orderType: "In-store",
        product: {
            name: "Sterling Silver Necklace",
            category: "Jewelry",
            image: RoomImage2,
        },
        shippingAddress: "456 Boulevard Zerktouni, Marrakech",
        status: "SHIPPED",
    },
    {
        number: 3,
        orderCode: "ORD-20250708-003",
        orderType: "Online",
        product: {
            name: "Men's Titanium Bracelet",
            category: "Bracelets",
            image: RoomImage3,
        },
        shippingAddress: "789 Quartier des Fleurs, Rabat",
        status: "DELIVERED",
    },
    {
        number: 4,
        orderCode: "ORD-20250708-004",
        orderType: "Online",
        product: {
            name: "Black Leather Watch",
            category: "Watches",
            image: RoomImage4,
        },
        shippingAddress: "12 Lotissement Al Qods, Fes",
        status: "CANCELLED",
    },
    {
        number: 5,
        orderCode: "ORD-20250708-005",
        orderType: "In-store",
        product: {
            name: "Diamond Earrings",
            category: "Luxury",
            image: RoomImage5,
        },
        shippingAddress: "99 Résidence El Amal, Agadir",
        status: "PENDING",
    },
];
