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
import Inventory from "./components/Inventory";
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
import InventoryDetail from "./components/InventoryDetail";
import AddPartnerDocument from "./components/AddPartnerDocument";
import Register from "./components/Register";
import Login from "./components/Login";
import ForgetPassword from "./components/ForgetPassword";
import UserAccount from "./components/UserAccount";
import PrivateRoute from "./components/routes/PrivateRoutes";
import ProductAdd from "./components/ProductAdd";
import AllUsers from "./components/Auth/AllUsers";
import PartnerUsers from "./components/Auth/PartnerUsers";
// function App() {
//     const router = createBrowserRouter([
//         {
//             path: "/",
//             element: <Layout />,
//             children: [
//                 {
//                     index: true,
//                     element: <DashboardPage />,
//                 },
//                 {
//                     path: "calendar",
//                     element: <CalendarComponent />,
//                 },
//                 {
//                     path: "reports",
//                     element: <h1 className="title">Reports</h1>,
//                 },
//                 {
//                     path: "materials",
//                     element: <Materials />,
//                 },
//                 {
//                     path: "designers",
//                     element: <Designers />,
//                 },
//                 {
//                     path: "colors",
//                     element: <Colors />,
//                 },
//                 {
//                     path: "inventory",
//                     element: <Inventory />
//                 },
//                 {
//                     path: "inventory/:id", // Yeni route
//                     element: <InventoryDetail />,
//                 },
//                 {
//                     path: "daily-Sales",
//                     element: <DailySales />,
//                 },
//                 {
//                     path: "categorys",
//                     element: <Category />,
//                 },
//                 {
//                     path: "Occasions",
//                     element: <Occasions />,
//                 },
//                 {
//                     path: "carats",
//                     element: <Carats />,
//                 },

//                 {
//                     path: "settings",
//                     element: <Settings />,
//                 },
//                 {
//                     path: "products",
//                     element: <Products />,
//                 },
//                 {
//                     path: "products/:id",
//                     element: <ProductDetail />,
//                 },
//                 {
//                     path: "products/add",
//                     element: <AddProduct />,
//                 },
//                 {
//                     path: "products/addproduct",
//                     element: <ProductAdd />,
//                 },
//                 {
//                     path: "partners/add-document/:id",
//                     element: <AddPartnerDocument />,
//                 },
//                 {
//                     path: "partners",
//                     element: <Partners />,
//                 },
//                 {
//                     path: "partners/add",
//                     element: <AddPartner />,
//                 },
//                 {
//                     path: "partners/:id",
//                     element: <PartnerDetails />,
//                 },
//                 {
//                     path: "orders",
//                     element: <Orders />,
//                 },
//                 {
//                     path: "create/order",
//                     element: <CreateOrderForm />,
//                 }
//                 ,
//                 {
//                     path: "/order/:id",
//                     element: <OrderDetails />,
//                 },
//                 {
//                     path: "/telegram-orders",
//                     element: <TelegramOrdersMock></TelegramOrdersMock>
//                 },
//                 {
//                     path: "/discounts",
//                     element: <CampaignDiscounts />
//                 },

//                 {
//                     path: "/messages",
//                     element: <MessageOrders />
//                 },
//                 {
//                     path: "/user-account",
//                     element: <UserAccount />
//                 },
//                 {
//                     path: "/all-users",
//                     element: <AllUsers />
//                 },
//                 {
//                     path: "/partner-users",
//                     element: <PartnerUsers />
//                 }


//             ],

//         },
//         {
//             path: "/register",
//             element: <Register />,
//         },
//         {
//             path: "/login",
//             element: <Login />
//         },
//         {
//             path: "/forgot-password",
//             element: <ForgetPassword />
//         },
//     ]);

//     return (
//         <ThemeProvider storageKey="theme">
//             <Toaster position="top-right" richColors />
//             <RouterProvider router={router} />
//         </ThemeProvider>
//     );
// }

// export default App;


// import PrivateRoute from "./components/PrivateRoute"; // import et

function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: (
                <PrivateRoute>
                    <Layout />
                </PrivateRoute>
            ),
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
                    path: "inventory",
                    element: <Inventory />
                },
                {
                    path: "inventory/:id",
                    element: <InventoryDetail />,
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
                    path: "products/addproduct",
                    element: <ProductAdd />,
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
                },
                {
                    path: "/order/:id",
                    element: <OrderDetails />,
                },
                {
                    path: "/telegram-orders",
                    element: <TelegramOrdersMock />,
                },
                {
                    path: "/discounts",
                    element: <CampaignDiscounts />,
                },
                {
                    path: "/messages",
                    element: <MessageOrders />,
                },
                {
                    path: "/user-account",
                    element: <UserAccount />
                },
                {
                    path: "/all-users",
                    element: <AllUsers />
                },
                {
                    path: "/partner-users",
                    element: <PartnerUsers />
                }
            ],
        },
        {
            path: "/register",
            element: <Register />,
        },
        {
            path: "/login",
            element: <Login />,
        },
        {
            path: "/forgot-password",
            element: <ForgetPassword />,
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