"use client";

import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/hooks/use-theme";
import { Footer } from "@/layouts/footer";
import {
  CreditCard,
  DollarSign,
  Package,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import DashboardService from "../../services/dashboardServices";

const DashboardPage = () => {
  const { theme } = useTheme();

  const [topCustomers, setTopCustomers] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [topRentProducts, setTopRentProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          customersRes,
          revenueRes,
          rentProductsRes,
          summaryRes,
        ] = await Promise.all([
          DashboardService.getTopCustomers(),
          DashboardService.getMonthlyRevenue(),
          DashboardService.getTopRentProducts(),
          DashboardService.getSummary(),
        ]);

        setTopCustomers(customersRes?.data?.data || []);
        setMonthlyRevenue(revenueRes?.data?.data || []);
        setTopRentProducts(rentProductsRes?.data || []);
        setSummary(summaryRes?.data?.data || null);
      } catch (error) {
        console.error("❌ Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-lg font-medium">
        Loading dashboard data...
      </div>
    );
  }
  const CustomYAxisTick = ({ x, y, payload }) => {
    const fontSize = 12;
    const padding = 4;

    return (
      <g transform={`translate(${x}, ${y})`}>
        <rect
          x={-padding - 30}
          y={-fontSize / 2 - padding / 2}
          width={30 + padding * 2} 
          height={fontSize + padding}
          fill="white"
          strokeWidth={1}
          rx={4}
        />
        <text
          x={0}
          y={0}
          textAnchor="end"
          alignmentBaseline="middle"
          fill="#64748b"
          fontSize={fontSize}
        >
          {payload.value} ₼
        </text>
      </g>
    );
  };



  return (
    <div className="flex flex-col gap-y-4">
      <h1 className="title">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="card">
          <div className="card-header">
            <div className="w-fit rounded-lg bg-blue-500/20 p-2 text-blue-500">
              <Package size={26} />
            </div>
            <p className="card-title">Finished Orders</p>
          </div>
          <div className="card-body bg-slate-100 dark:bg-slate-950">
            <p className="text-3xl font-bold">
              {summary?.finishedOrders ?? 0}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500">
              <DollarSign size={26} />
            </div>
            <p className="card-title">Finished Rent Orders</p>
          </div>
          <div className="card-body bg-slate-100 dark:bg-slate-950">
            <p className="text-3xl font-bold">
              {summary?.finishedRentOrders ?? 0}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500">
              <Users size={26} />
            </div>
            <p className="card-title">Active Users</p>
          </div>
          <div className="card-body bg-slate-100 dark:bg-slate-950">
            <p className="text-3xl font-bold">
              {summary?.activeUsers ?? 0}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500">
              <CreditCard size={26} />
            </div>
            <p className="card-title">Company Share (Sales)</p>
          </div>
          <div className="card-body bg-slate-100 dark:bg-slate-950">
            <p className="text-3xl font-bold">
              {summary?.companyShareSale ?? 0}
            </p>
          </div>
        </div>
      </div>

      <div className="flex  gap-y-4 gap-1">
        <div className="card min-w-[500px]">
          <div className="card-header">
            <p className="card-title">Monthly Revenue</p>
          </div>
          <div className="card-body p-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={monthlyRevenue || []}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  stroke={theme === "light" ? "#475569" : "#94a3b8"}
                  tickMargin={6}
                  tickFormatter={(value) => {
                    if (!value) return "";
                    const [year, month] = value.split("-");
                    const months = [
                      "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
                      "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
                    ];
                    return `${year} ${months[parseInt(month) - 1]}`;
                  }}
                />
                <YAxis
                  stroke={theme === "light" ? "#475569" : "#94a3b8"}
                  tickMargin={6}
                  tick={<CustomYAxisTick />}
                />
                <Tooltip
                  labelFormatter={(value) => {
                    if (!value) return "";
                    const [year, month] = value.split("-");
                    const months = [
                      "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
                      "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
                    ];
                    return `${year} ${months[parseInt(month) - 1]}`;
                  }}
                  formatter={(value) => [`${value} AZN`]}
                />
                <Bar
                  dataKey="companyShareSale"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>


          </div>
        </div>

        <div className="card w-[100%] min-w-[500px]">
          <div className="card-header">
            <p className="card-title">Top Customers</p>
          </div>
          <div className="relative h-[300px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left">Full Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Rent Orders</th>
                  <th className="px-4 py-2 text-left">Sale Orders</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {topCustomers?.map((c) => (
                  <tr
                    key={c.email}
                    className="hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <td className="px-4 py-2">{c.fullName}</td>
                    <td className="px-4 py-2">{c.email}</td>
                    <td className="px-4 py-2">{c.finishedRentOrders}</td>
                    <td className="px-4 py-2">{c.finishedSaleOrders}</td>
                  </tr>
                ))}

              </tbody>

            </table>
          </div>
        </div>
      </div>

      {/* ==== TOP RENTED PRODUCTS TABLE ==== */}
      <div className="card">
        <div className="card-header">
          <p className="card-title">Top Rented Products</p>
        </div>
        <div className="card-body p-0">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left">Image</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Product Code</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Total Rents</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {topRentProducts?.map((p) => (
                <tr
                  key={p.productCode}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <td className="px-4 py-2">
                    <img
                      src={p.productPicture}
                      alt={p.productName}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  </td>
                  <td className="px-4 py-2">{p.productName}</td>
                  <td className="px-4 py-2">{p.productCode}</td>
                  <td className="px-4 py-2">{p.categoryName}</td>
                  <td className="px-4 py-2">{p.totalRentOrders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardPage;
