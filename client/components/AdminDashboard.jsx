// components/AdminLayout.jsx
import Link from "next/link";
import { useState } from "react";
import {
  BarChartIcon,
  PackageIcon,
  ShoppingCartIcon,
  TagIcon,
  StarIcon,
  UsersIcon,
  MoonIcon,
  SunIcon,
  ChartArea,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function AdminLayout({ children }) {
  const [theme, setTheme] = useState("light");

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
                <MoonIcon className="h-5 w-5" />
              ) : (
                <SunIcon className="h-5 w-5" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <UsersIcon className="h-5 w-5" />
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
        <nav className="hidden h-full w-64 flex-col border-r bg-background p-6 md:flex">
          <div className="mb-6 flex items-center gap-2 text-lg font-semibold">
            <PackageIcon className="h-6 w-6" />
            <span>Warsto</span>
          </div>
          <div className="flex flex-col gap-2">
            <NavLink
              href="/dashboard"
              icon={<BarChartIcon className="h-5 w-5" />}
            >
              Dashboard
            </NavLink>
            <NavLink
              href="/dashboard/analytics"
              icon={<ChartArea className="h-5 w-5" />}
            >
              Analytics
            </NavLink>
            <NavLink
              href="/dashboard/products"
              icon={<TagIcon className="h-5 w-5" />}
            >
              Products
            </NavLink>
            <NavLink
              href="/dashboard/orders"
              icon={<ShoppingCartIcon className="h-5 w-5" />}
            >
              Orders
            </NavLink>
            <NavLink
              href="/dashboard/users"
              icon={<UsersIcon className="h-5 w-5" />}
            >
              Users
            </NavLink>
            <NavLink
              href="/dashboard/reviews"
              icon={<StarIcon className="h-5 w-5" />}
            >
              Reviews
            </NavLink>
          </div>
        </nav>
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
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
