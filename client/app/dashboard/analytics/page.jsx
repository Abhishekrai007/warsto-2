"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";

import api from "@/utils/api";
import AdminLayout from "@/components/AdminDashboard";

export default function AnalyticsPage() {
  const [salesData, setSalesData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [newOrders, setNewOrders] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [inventoryValue, setInventoryValue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesResponse, productResponse, userResponse, ordersResponse] =
          await Promise.all([
            api.get("/admin/analytics/sales"),
            api.get("/admin/analytics/products"),
            api.get("/admin/analytics/users"),
            api.get("/admin/orders?page=1&limit=10"),
          ]);

        setSalesData(
          Array.isArray(salesResponse.data) ? salesResponse.data : []
        );
        setProductData(
          Array.isArray(productResponse.data) ? productResponse.data : []
        );
        setUserGrowth(
          Array.isArray(userResponse.data) ? userResponse.data : []
        );
        if (ordersResponse.data && Array.isArray(ordersResponse.data.orders)) {
          setRecentOrders(ordersResponse.data.orders.slice(0, 5));
        } else {
          console.error(
            "Unexpected format for orders data:",
            ordersResponse.data
          );
          setRecentOrders([]);
        }
        console.log(ordersResponse.data);

        // Calculate total revenue
        const revenue = Array.isArray(salesResponse.data)
          ? salesResponse.data.reduce(
              (total, sale) => total + (sale.totalSales || 0),
              0
            )
          : 0;
        setTotalRevenue(revenue);

        // Set new orders
        setNewOrders(
          ordersResponse.data && Array.isArray(ordersResponse.data.orders)
            ? ordersResponse.data.orders.length
            : 0
        );

        // Set active users
        setActiveUsers(
          Array.isArray(userResponse.data) && userResponse.data.length > 0
            ? userResponse.data[userResponse.data.length - 1].newUsers || 0
            : 0
        );

        setInventoryValue(1000000); // This is a static value, you might want to calculate it based on actual data
      } catch (error) {
        console.error("Error fetching data:", error);
        // Set default values in case of error
        setSalesData([]);
        setProductData([]);
        setUserGrowth([]);
        setRecentOrders([]);
        setTotalRevenue(0);
        setNewOrders(0);
        setActiveUsers(0);
        setInventoryValue(0);
      }
    };

    fetchData();
  }, []);

  const MetricCard = ({ title, value, icon }) => (
    <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="p-8 bg-gray-50">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Analytics Dashboard
        </h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricCard
            title="Total Revenue"
            value={`₹${totalRevenue.toFixed(2)}`}
            icon={<DollarSign className="h-6 w-6 text-green-500" />}
          />
          <MetricCard
            title="New Orders"
            value={newOrders}
            icon={<ShoppingCart className="h-6 w-6 text-blue-500" />}
          />
          <MetricCard
            title="Active Users"
            value={activeUsers}
            icon={<Users className="h-6 w-6 text-purple-500" />}
          />
          <MetricCard
            title="Inventory Value"
            value={`₹${inventoryValue.toFixed(2)}`}
            icon={<Package className="h-6 w-6 text-orange-500" />}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Sales Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="_id" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="totalSales"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Top Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Bar dataKey="totalSold" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-600">Order ID</TableHead>
                  <TableHead className="text-gray-600">User</TableHead>
                  <TableHead className="text-gray-600">Date</TableHead>
                  <TableHead className="text-gray-600">Total</TableHead>
                  <TableHead className="text-gray-600">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <TableRow key={order._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {order._id.slice(-6)}
                      </TableCell>
                      <TableCell>{order.user.name}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>₹{order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "Processing"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>No recent orders</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
