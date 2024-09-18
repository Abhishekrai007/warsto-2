"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
  Legend,
} from "recharts";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  BarChart2,
  Inbox,
  Tag,
  Star,
  Moon,
  Sun,
  User,
  ChartArea,
} from "lucide-react";
import api from "@/utils/api";

export default function Dashboard() {
  const [theme, setTheme] = useState("light");
  const [salesData, setSalesData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [newOrders, setNewOrders] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [inventoryValue, setInventoryValue] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async (page = 1, pageSize = 10) => {
      try {
        const [
          salesResponse,
          productResponse,
          userGrowthResponse,
          ordersResponse,
          inventoryResponse,
          reviewsResponse,
          usersResponse,
        ] = await Promise.all([
          api.get("/admin/analytics/sales"),
          api.get("/admin/analytics/products"),
          api.get("/admin/analytics/users"),
          api.get("/admin/orders"),
          api.get("/admin/inventory/low-stock"),
          api.get("/admin/reviews/pending"),
          api.get("/admin/users"),
        ]);

        setSalesData(
          Array.isArray(salesResponse.data) ? salesResponse.data : []
        );
        setProductData(
          Array.isArray(productResponse.data) ? productResponse.data : []
        );
        setUserGrowth(
          Array.isArray(userGrowthResponse.data) ? userGrowthResponse.data : []
        );
        setRecentOrders(
          Array.isArray(ordersResponse.data.orders)
            ? ordersResponse.data.orders.slice(0, 5)
            : []
        );
        setLowStockProducts(
          Array.isArray(inventoryResponse.data) ? inventoryResponse.data : []
        );
        setPendingReviews(
          Array.isArray(reviewsResponse.data) ? reviewsResponse.data : []
        );
        setUsers(
          Array.isArray(usersResponse.data)
            ? usersResponse.data.slice(0, 5)
            : []
        );

        setTotalRevenue(
          Array.isArray(salesResponse.data)
            ? salesResponse.data.reduce(
                (total, sale) => total + sale.totalSales,
                0
              )
            : 0
        );
        setNewOrders(
          Array.isArray(ordersResponse.data.orders)
            ? ordersResponse.data.orders.length
            : 0
        );
        setActiveUsers(
          Array.isArray(userGrowthResponse.data) &&
            userGrowthResponse.data.length > 0
            ? userGrowthResponse.data[userGrowthResponse.data.length - 1]
                .newUsers
            : 0
        );
        setInventoryValue(
          Array.isArray(inventoryResponse.data)
            ? inventoryResponse.data.reduce(
                (total, product) =>
                  total + product.price * product.inventory.quantity,
                0
              )
            : 0
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        // Set all states to empty arrays or appropriate default values
        setSalesData([]);
        setProductData([]);
        setUserGrowth([]);
        setRecentOrders([]);
        setLowStockProducts([]);
        setPendingReviews([]);
        setUsers([]);
        setTotalRevenue(0);
        setNewOrders(0);
        setActiveUsers(0);
        setInventoryValue(0);
      }
    };

    fetchData();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div
      className={`min-h-screen bg-background text-foreground ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      <header className="sticky top-0 z-40 border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <nav className="hidden h-[calc(100vh-4rem)] w-64 flex-col border-r bg-background p-6 md:flex">
          <div className="mb-6 flex items-center gap-2 text-lg font-semibold">
            <Package className="h-6 w-6" />
            <span>Warsto</span>
          </div>
          <div className="flex flex-col gap-2">
            <NavLink href="/dashboard" icon={<BarChart2 className="h-5 w-5" />}>
              Dashboard
            </NavLink>
            <NavLink
              href="/dashboard/analytics"
              icon={<ChartArea className="h-5 w-5" />}
            >
              Analytics
            </NavLink>
            <NavLink
              href="/dashboard/orders"
              icon={<ShoppingCart className="h-5 w-5" />}
            >
              Orders
            </NavLink>
            <NavLink
              href="/dashboard/products"
              icon={<Tag className="h-5 w-5" />}
            >
              Products
            </NavLink>
            <NavLink
              href="/dashboard/reviews"
              icon={<Star className="h-5 w-5" />}
            >
              Reviews
            </NavLink>
            <NavLink
              href="/dashboard/users"
              icon={<Users className="h-5 w-5" />}
            >
              Users
            </NavLink>
          </div>
        </nav>
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={Array.isArray(salesData) ? salesData : []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="totalSales"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Array.isArray(productData) ? productData : []}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="totalSold" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(recentOrders) && recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell>{order._id.slice(-6)}</TableCell>
                          <TableCell>{order.user.name || order.user}</TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>₹ {order.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                order.status === "Delivered"
                                  ? "success"
                                  : "warning"
                              }
                            >
                              {order.status}
                            </Badge>
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
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Products</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Reorder Level</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockProducts.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.inventory.quantity}</TableCell>
                        <TableCell>{product.inventory.reorderLevel}</TableCell>
                        <TableCell>
                          <Button size="sm">Reorder</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(users) && users.length > 0 ? (
                      users.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4}>No users found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <Button className="mt-4">View All Users</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pending Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingReviews.map((review) => (
                      <TableRow key={review._id}>
                        <TableCell>{review.product?.name}</TableCell>
                        <TableCell>{review.user.name}</TableCell>
                        <TableCell>{review.rating}</TableCell>
                        <TableCell>{review.comment.slice(0, 50)}...</TableCell>
                        <TableCell>
                          <Button size="sm" className="mr-2">
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive">
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function NavLink({ href, icon, children }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

// function BarChart({ data }) {
//   return (
//     <ResponsiveBar
//       data={data}
//       keys={["totalSold"]}
//       indexBy="name"
//       margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
//       padding={0.3}
//       valueScale={{ type: "linear" }}
//       indexScale={{ type: "band", round: true }}
//       colors={{ scheme: "nivo" }}
//       defs={[
//         {
//           id: "dots",
//           type: "patternDots",
//           background: "inherit",
//           color: "#38bcb2",
//           size: 4,
//           padding: 1,
//           stagger: true,
//         },
//         {
//           id: "lines",
//           type: "patternLines",
//           background: "inherit",
//           color: "#eed312",
//           rotation: -45,
//           lineWidth: 6,
//           spacing: 10,
//         },
//       ]}
//       borderColor={{
//         from: "color",
//         modifiers: [["darker", 1.6]],
//       }}
//       axisTop={null}
//       axisRight={null}
//       axisBottom={{
//         tickSize: 5,
//         tickPadding: 5,
//         tickRotation: -45,
//         legend: "Product",
//         legendPosition: "middle",
//         legendOffset: 32,
//       }}
//       axisLeft={{
//         tickSize: 5,
//         tickPadding: 5,
//         tickRotation: 0,
//         legend: "Total Sold",
//         legendPosition: "middle",
//         legendOffset: -40,
//       }}
//       labelSkipWidth={12}
//       labelSkipHeight={12}
//       labelTextColor={{
//         from: "color",
//         modifiers: [["darker", 1.6]],
//       }}
//       legends={[
//         {
//           dataFrom: "keys",
//           anchor: "bottom-right",
//           direction: "column",
//           justify: false,
//           translateX: 120,
//           translateY: 0,
//           itemsSpacing: 2,
//           itemWidth: 100,
//           itemHeight: 20,
//           itemDirection: "left-to-right",
//           itemOpacity: 0.85,
//           symbolSize: 20,
//           effects: [
//             {
//               on: "hover",
//               style: {
//                 itemOpacity: 1,
//               },
//             },
//           ],
//         },
//       ]}
//       role="application"
//       ariaLabel="Nivo bar chart demo"
//       barAriaLabel={(e) =>
//         e.id + ": " + e.formattedValue + " in product: " + e.indexValue
//       }
//     />
//   );
// }

function MessageSquareIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function BarChartIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

function DollarSignIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function LineChartIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}
// function LineChart({ data }) {
//   return (
//     <ResponsiveLine
//       data={[
//         {
//           id: "sales",
//           data: data.map((item) => ({
//             x: new Date(item._id).toISOString().split("T")[0],
//             y: item.totalSales,
//           })),
//         },
//       ]}
//       margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
//       xScale={{
//         type: "time",
//         format: "%Y-%m-%d",
//         useUTC: false,
//         precision: "day",
//       }}
//       xFormat="time:%Y-%m-%d"
//       yScale={{
//         type: "linear",
//         min: "auto",
//         max: "auto",
//         stacked: true,
//         reverse: false,
//       }}
//       yFormat=" >-.2f"
//       axisTop={null}
//       axisRight={null}
//       axisBottom={{
//         format: "%b %d",
//         tickValues: "every 2 days",
//         legend: "Date",
//         legendOffset: 36,
//         legendPosition: "middle",
//       }}
//       axisLeft={{
//         orient: "left",
//         tickSize: 5,
//         tickPadding: 5,
//         tickRotation: 0,
//         legend: "Total Sales",
//         legendOffset: -40,
//         legendPosition: "middle",
//       }}
//       pointSize={10}
//       pointColor={{ theme: "background" }}
//       pointBorderWidth={2}
//       pointBorderColor={{ from: "serieColor" }}
//       pointLabelYOffset={-12}
//       useMesh={true}
//       legends={[
//         {
//           anchor: "bottom-right",
//           direction: "column",
//           justify: false,
//           translateX: 100,
//           translateY: 0,
//           itemsSpacing: 0,
//           itemDirection: "left-to-right",
//           itemWidth: 80,
//           itemHeight: 20,
//           itemOpacity: 0.75,
//           symbolSize: 12,
//           symbolShape: "circle",
//           symbolBorderColor: "rgba(0, 0, 0, .5)",
//           effects: [
//             {
//               on: "hover",
//               style: {
//                 itemBackground: "rgba(0, 0, 0, .03)",
//                 itemOpacity: 1,
//               },
//             },
//           ],
//         },
//       ]}
//     />
//   );
// }
function MoonIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function MountainIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}

function PackageIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function ShoppingCartIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function StarIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function SunIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function TagIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  );
}

function TimeseriesChart(props) {
  return (
    <div {...props}>
      <ResponsiveLine
        data={[
          {
            id: "Desktop",
            data: [
              { x: "2018-01-01", y: 7 },
              { x: "2018-01-02", y: 5 },
              { x: "2018-01-03", y: 11 },
              { x: "2018-01-04", y: 9 },
              { x: "2018-01-05", y: 12 },
              { x: "2018-01-06", y: 16 },
              { x: "2018-01-07", y: 13 },
            ],
          },
          {
            id: "Mobile",
            data: [
              { x: "2018-01-01", y: 9 },
              { x: "2018-01-02", y: 8 },
              { x: "2018-01-03", y: 13 },
              { x: "2018-01-04", y: 6 },
              { x: "2018-01-05", y: 8 },
              { x: "2018-01-06", y: 14 },
              { x: "2018-01-07", y: 11 },
            ],
          },
        ]}
        margin={{ top: 10, right: 20, bottom: 40, left: 40 }}
        xScale={{
          type: "time",
          format: "%Y-%m-%d",
          useUTC: false,
          precision: "day",
        }}
        xFormat="time:%Y-%m-%d"
        yScale={{
          type: "linear",
          min: 0,
          max: "auto",
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 0,
          tickPadding: 16,
          format: "%d",
          tickValues: "every 1 day",
        }}
        axisLeft={{
          tickSize: 0,
          tickValues: 5,
          tickPadding: 16,
        }}
        colors={["#2563eb", "#e11d48"]}
        pointSize={6}
        useMesh={true}
        gridYValues={6}
        theme={{
          tooltip: {
            chip: {
              borderRadius: "9999px",
            },
            container: {
              fontSize: "12px",
              textTransform: "capitalize",
              borderRadius: "6px",
            },
          },
          grid: {
            line: {
              stroke: "#f3f4f6",
            },
          },
        }}
        role="application"
      />
    </div>
  );
}

function UsersIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
