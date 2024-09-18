"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTable, useFilters, useSortBy, usePagination } from "react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/utils/api";
import AdminLayout from "@/components/AdminDashboard";
import { ArrowUpDown, Edit2Icon, TrashIcon } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { debounce } from "lodash";
import { toast } from "@/components/ui/toast";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  const columns = useMemo(
    () => [
      {
        Header: "Order ID",
        accessor: "_id",
        Filter: ColumnFilter,
      },
      {
        Header: "User",
        accessor: "user.name",
        Filter: ColumnFilter,
      },
      {
        Header: "Total",
        accessor: "total",
        Cell: ({ value }) => `₹${parseFloat(value).toFixed(2)}`,
        Filter: NumberRangeColumnFilter,
        filter: "between",
      },
      {
        Header: "Status",
        accessor: "status",
        Filter: SelectColumnFilter,
        filter: "includes",
      },
      {
        Header: "Payment Status",
        accessor: "paymentStatus",
        Filter: SelectColumnFilter,
        filter: "includes",
      },
      {
        Header: "Date",
        accessor: "createdAt",
        Cell: ({ value }) => new Date(value).toLocaleDateString(),
        Filter: DateRangeColumnFilter,
        filter: "between",
      },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(row.original)}
            >
              <Edit2Icon className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(row.original._id)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state: { pageIndex, pageSize },
    gotoPage,
    setPageSize,
  } = useTable(
    {
      columns,
      data: orders,
      manualPagination: true,
      pageCount: totalPages,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useFilters,
    useSortBy,
    usePagination
  );

  const fetchOrders = useCallback(
    async (page = 1, pageSize = 10, filters = {}) => {
      try {
        setLoading(true);
        const response = await api.get("admin/orders", {
          params: { page, limit: pageSize, ...filters },
        });
        if (response.data && Array.isArray(response.data.orders)) {
          setOrders(response.data.orders);
          setTotalPages(response.data.totalPages);
          setTotalOrders(response.data.totalOrders);
        } else {
          console.error("Unexpected response format:", response.data);
          setOrders([]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const debouncedFetchOrders = useCallback(
    debounce((page, pageSize, filters) => {
      fetchOrders(page, pageSize, filters);
    }, 300),
    [fetchOrders]
  );

  useEffect(() => {
    debouncedFetchOrders(pageIndex + 1, pageSize);
  }, [debouncedFetchOrders, pageIndex, pageSize]);

  const handleEdit = useCallback((order) => {
    setEditingOrder({ ...order });
    setIsDialogOpen(true);
  }, []);

  const handleStatusUpdate = async (id, updateData) => {
    try {
      const response = await api.put(`/admin/orders/${id}/status`, updateData);
      if (response.data) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === id ? { ...order, ...response.data } : order
          )
        );
        setIsDialogOpen(false);
      } else {
        throw new Error("No data received from server");
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/orders/${id}`);
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== id));
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 bg-gray-50">
        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Orders Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table {...getTableProps()} className="w-full">
                <thead>
                  {headerGroups.map((headerGroup) => (
                    <tr
                      {...headerGroup.getHeaderGroupProps()}
                      className="bg-gray-100"
                    >
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
                          className="p-3 text-left font-semibold text-gray-600"
                        >
                          <div className="flex items-center space-x-1">
                            <span>{column.render("Header")}</span>
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                          <div className="mt-2">
                            {column.canFilter ? column.render("Filter") : null}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {page.map((row) => {
                    prepareRow(row);
                    return (
                      <tr
                        {...row.getRowProps()}
                        className="border-b hover:bg-gray-50"
                      >
                        {row.cells.map((cell) => (
                          <td {...cell.getCellProps()} className="p-3">
                            {cell.render("Cell")}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex items-center justify-between">
          <Pagination
            currentPage={pageIndex + 1}
            totalPages={totalPages}
            onPageChange={(page) => gotoPage(page - 1)}
          />
          <div>
            <Select
              value={pageSize.toString()}
              onChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select page size" />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    Show {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Showing {pageIndex * pageSize + 1} to{" "}
              {Math.min((pageIndex + 1) * pageSize, totalOrders)} of{" "}
              {totalOrders} orders
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Order</DialogTitle>
            </DialogHeader>
            {editingOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Order ID:</strong>
                    <p className="text-gray-600">{editingOrder._id}</p>
                  </div>
                  <div>
                    <strong>User:</strong>
                    <p className="text-gray-600">{editingOrder.user.name}</p>
                  </div>
                  <div>
                    <strong>Total:</strong>
                    <p className="text-gray-600">
                      ₹{editingOrder.total.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <strong>Date:</strong>
                    <p className="text-gray-600">
                      {new Date(editingOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <strong>Status:</strong>
                  <Select
                    value={editingOrder.status}
                    onChange={(value) =>
                      handleStatusUpdate(editingOrder._id, { status: value })
                    }
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <strong>Payment Status:</strong>
                  <Select
                    value={editingOrder.paymentStatus}
                    onChange={(value) =>
                      handleStatusUpdate(editingOrder._id, {
                        paymentStatus: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select Payment Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <strong>Items:</strong>
                  <ul className="list-disc pl-5 mt-2">
                    {editingOrder.items.map((item, index) => (
                      <li key={index} className="text-gray-600">
                        {item.product.name} - Quantity: {item.quantity}, Price:
                        ₹{item.price.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Shipping Address:</strong>
                  <p className="text-gray-600">
                    {`${editingOrder.shippingAddress.street}, ${editingOrder.shippingAddress.city}, ${editingOrder.shippingAddress.state}, ${editingOrder.shippingAddress.country}, ${editingOrder.shippingAddress.zipCode}`}
                  </p>
                </div>
                <div>
                  <strong>Mobile Number:</strong>
                  <p className="text-gray-600">{editingOrder.mobileNumber}</p>
                </div>
                <div>
                  <strong>Razorpay Order ID:</strong>
                  <p className="text-gray-600">
                    {editingOrder.razorpayOrderId || "N/A"}
                  </p>
                </div>
                <div>
                  <strong>Razorpay Payment ID:</strong>
                  <p className="text-gray-600">
                    {editingOrder.razorpayPaymentId || "N/A"}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

function getStatusColor(status) {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Processing":
      return "bg-blue-100 text-blue-800";
    case "Shipped":
      return "bg-purple-100 text-purple-800";
    case "Delivered":
      return "bg-green-100 text-green-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getPaymentStatusColor(status) {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Paid":
      return "bg-green-100 text-green-800";
    case "Failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Filter components
function ColumnFilter({ column }) {
  const { filterValue, setFilter } = column;
  return (
    <Input
      value={filterValue || ""}
      onChange={(e) => setFilter(e.target.value)}
      placeholder={`Search ${column.Header}`}
    />
  );
}

function SelectColumnFilter({ column }) {
  const { filterValue, setFilter, preFilteredRows, id } = column;
  const options = useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  return (
    <Select
      value={filterValue}
      onChange={(value) => setFilter(value || undefined)}
    >
      <SelectTrigger>
        <SelectValue placeholder={`Filter ${column.Header}`} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">All</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function NumberRangeColumnFilter({ column }) {
  const { filterValue = [], setFilter } = column;
  return (
    <div className="flex space-x-2">
      <Input
        value={filterValue[0] || ""}
        type="number"
        onChange={(e) => {
          const val = e.target.value;
          setFilter((old = []) => [
            val ? parseInt(val, 10) : undefined,
            old[1],
          ]);
        }}
        placeholder={`Min ${column.Header}`}
      />
      <Input
        value={filterValue[1] || ""}
        type="number"
        onChange={(e) => {
          const val = e.target.value;
          setFilter((old = []) => [
            old[0],
            val ? parseInt(val, 10) : undefined,
          ]);
        }}
        placeholder={`Max ${column.Header}`}
      />
    </div>
  );
}

function DateRangeColumnFilter({ column }) {
  const { filterValue = [], setFilter } = column;
  return (
    <div className="flex space-x-2">
      <Input
        type="date"
        value={filterValue[0] || ""}
        onChange={(e) => {
          const val = e.target.value;
          setFilter((old = []) => [val ? val : undefined, old[1]]);
        }}
        placeholder="Start Date"
      />
      <Input
        type="date"
        value={filterValue[1] || ""}
        onChange={(e) => {
          const val = e.target.value;
          setFilter((old = []) => [old[0], val ? val : undefined]);
        }}
        placeholder="End Date"
      />
    </div>
  );
}

export default Orders;
