import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ThemeProvider } from "@/contexts/theme-context";

import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import Customers from "./components/materials";
import CreateCustomer from "./components/createCustomer";
import Bookings from "./components/bookings";
import Settings from "./components/settings";
import CalendarComponent from "./components/calendar";
import Materials from "./components/materials";
import Designers from "./components/designers";
import Colors from "./components/Colors";
import DailySales from "./components/DailySales";
import Category from "./components/Category";
import Occasions from "./components/Occasions";
import Carats from "./components/Carats";
import Products from "./components/Products";
import ProductDetail from "./components/ProductDetail";
import AddProduct from "./components/AddProduct";
import Partners from "./components/Partners";
import AddPartner from "./components/AddPartner";
import PartnerDetails from "./components/PartnerDetails";
import Orders from "./components/orders";
import CreateOrderForm from "./components/CreateOrderForm";
import OrderDetails from "./components/OrderDetails";
import { Toaster } from "sonner";
import TelegramOrdersMock from "./components/TelegramOrders";
import CampaignDiscounts from "./components/CampaignDiscounts";
import MessageOrders from "./components/MessageOrders";

function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Layout />,
            children: [
                {
                    index: true,
                    element: <DashboardPage />,
                },
                {
                    path: "calendar",
                    element: <CalendarComponent />,
                },
                {
                    path: "reports",
                    element: <h1 className="title">Reports</h1>,
                },
                {
                    path: "materials",
                    element: <Materials />,
                },
                {
                    path: "designers",
                    element: <Designers />,
                },
                {
                    path: "colors",
                    element: <Colors />,
                },
                {
                    path: "daily-Sales",
                    element: <DailySales />,
                },
                {
                    path: "categorys",
                    element: <Category />,
                },
                {
                    path: "Occasions",
                    element: <Occasions />,
                },
                {
                    path: "carats",
                    element: <Carats />,
                },

                {
                    path: "settings",
                    element: <Settings />,
                },
                {
                    path: "products",
                    element: <Products />,
                },
                {
                    path: "products/:id",
                    element: <ProductDetail />,
                },
                {
                    path: "products/add",
                    element: <AddProduct />,
                },
                {
                    path: "partners",
                    element: <Partners />,
                },
                {
                    path: "partners/add",
                    element: <AddPartner />,
                },
                {
                    path: "partners/:id",
                    element: <PartnerDetails />,
                },
                {
                    path: "orders",
                    element: <Orders />,
                },
                {
                    path: "create/order",
                    element: <CreateOrderForm />,
                }
                ,
                {
                    path: "/order/:id",
                    element: <OrderDetails />,
                },
                {
                    path: "/telegram-orders",
                    element: <TelegramOrdersMock></TelegramOrdersMock>
                },
                {
                    path: "/discounts",
                    element: <CampaignDiscounts/>
                },
                {
                    path: "/messages",
                    element: <MessageOrders/>
                }
                

            ],
        },
    ]);

    return (
        <ThemeProvider storageKey="theme">
            <Toaster position="top-right" richColors />
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}

export default App;