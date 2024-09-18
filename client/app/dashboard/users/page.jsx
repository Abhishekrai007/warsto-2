"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users as UsersIcon,
  UserCheck,
  UserPlus,
  Edit2Icon,
  TrashIcon,
} from "lucide-react";
import api from "@/utils/api";
import AdminLayout from "@/components/AdminDashboard";

const initialUserState = {
  name: "",
  email: "",
  role: "user",
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    latestUsers: [],
  });
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(initialUserState);

  const fetchUsers = useCallback(async () => {
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        api.get("admin/users"),
        api.get("admin/users/stats/overview"),
      ]);
      setUsers(usersResponse.data);
      setUserStats(statsResponse.data);
    } catch (error) {
      console.error("Error fetching users data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`admin/users/${editingUser._id}`, formData);
      } else {
        await api.post("admin/users", formData);
      }
      setIsDialogOpen(false);
      fetchUsers();
      resetForm();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleEdit = useCallback((user) => {
    setEditingUser(user);
    setFormData(user);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`admin/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const resetForm = useCallback(() => {
    setFormData(initialUserState);
    setEditingUser(null);
  }, []);

  const openDialog = useCallback(() => {
    resetForm();
    setIsDialogOpen(true);
  }, [resetForm]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">Loading...</div>
      </AdminLayout>
    );
  }

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
          User Management
        </h1>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <MetricCard
            title="Total Users"
            value={userStats.totalUsers}
            icon={<UsersIcon className="h-6 w-6 text-blue-500" />}
          />
          <MetricCard
            title="Admin Users"
            value={userStats.adminUsers}
            icon={<UserCheck className="h-6 w-6 text-green-500" />}
          />
          <MetricCard
            title="Regular Users"
            value={userStats.regularUsers}
            icon={<UserPlus className="h-6 w-6 text-purple-500" />}
          />
        </div>

        <Card className="bg-white shadow-md mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Latest Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-600">Name</TableHead>
                  <TableHead className="text-gray-600">Email</TableHead>
                  <TableHead className="text-gray-600">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userStats.latestUsers.map((user) => (
                  <TableRow key={user._id} className="hover:bg-gray-50">
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Button onClick={openDialog} className="mb-4">
          Add New User
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Add New User"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Name"
                required
              />
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                required
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <Button type="submit" className="w-full">
                {editingUser ? "Update User" : "Add User"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Card className="bg-white shadow-md">
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-600">Name</TableHead>
                  <TableHead className="text-gray-600">Email</TableHead>
                  <TableHead className="text-gray-600">Role</TableHead>
                  <TableHead className="text-gray-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id} className="hover:bg-gray-50">
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        onClick={() => handleEdit(user)}
                        className="mr-2"
                      >
                        <Edit2Icon />
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <TrashIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Users;
