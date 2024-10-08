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
import {
  PlusCircleIcon,
  Edit2Icon,
  TrashIcon,
  SearchIcon,
  ArrowUpDown,
} from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { debounce } from "lodash";

const initialProductState = {
  sku: "",
  name: "",
  description: "",
  type: "",
  productCatrgory: "",
  price: { amount: "", currency: "INR" },
  inventory: { quantity: "", reserved: 0 },
  categories: [],
  attributes: {
    collection: "",
    material: "",
    color: { family: "", shade: "" },
    dimensions: { length: "", width: "", height: "", unit: "cm" },
    configuration: "",
  },
  designer: { name: "", royalty: "" },
  images: [{ url: "", altText: "", isPrimary: false }],
  tags: [],
  features: [],
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(initialProductState);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  const columns = useMemo(
    () => [
      {
        Header: "SKU",
        accessor: "sku",
        Filter: ColumnFilter,
      },
      {
        Header: "Name",
        accessor: "name",
        Filter: ColumnFilter,
      },
      {
        Header: "Type",
        accessor: "type",
        Filter: SelectColumnFilter,
        filter: "includes",
      },
      {
        Header: "Product Category",
        accessor: "productCategory",
        Filter: SelectColumnFilter,
        filter: "includes",
      },
      {
        Header: "Price",
        accessor: "price.amount",
        Cell: ({ value }) => `₹${parseFloat(value).toFixed(2)}`,
        Filter: NumberRangeColumnFilter,
        filter: "between",
      },
      {
        Header: "Inventory",
        accessor: "inventory.quantity",
        Filter: NumberRangeColumnFilter,
        filter: "between",
      },
      {
        Header: "Collection",
        accessor: "attributes.collection",
        Filter: SelectColumnFilter,
        filter: "includes",
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
      data: products,
      manualPagination: true,
      pageCount: totalPages,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useFilters,
    useSortBy,
    usePagination
  );

  const fetchProducts = useCallback(async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await api.get("admin/products", {
        params: { page, limit: pageSize },
      });
      if (response.data && Array.isArray(response.data.products)) {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
        setTotalProducts(response.data.totalProducts);
      } else {
        console.error("Unexpected response format:", response.data);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetchProducts = useCallback(
    debounce((page, pageSize) => {
      fetchProducts(page, pageSize);
    }, 300),
    [fetchProducts]
  );

  useEffect(() => {
    debouncedFetchProducts(pageIndex + 1, pageSize);
  }, [debouncedFetchProducts, pageIndex, pageSize]);

  const handleInputChange = useCallback(
    (e, category = null, subCategory = null) => {
      const { name, value } = e.target;
      setFormData((prev) => {
        if (category) {
          if (subCategory) {
            return {
              ...prev,
              [category]: {
                ...prev[category],
                [subCategory]: {
                  ...prev[category][subCategory],
                  [name]: value,
                },
              },
            };
          }
          return {
            ...prev,
            [category]: {
              ...prev[category],
              [name]: value,
            },
          };
        }
        return { ...prev, [name]: value };
      });
    },
    []
  );

  const handleArrayInputChange = useCallback((e, field) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [field]: value.split(",").map((item) => item.trim()),
    }));
  }, []);

  const handleEdit = useCallback((product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`admin/products/${id}`);
      debouncedFetchProducts(pageIndex + 1, pageSize);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`admin/products/${editingProduct._id}`, formData);
      } else {
        await api.post("admin/products", formData);
      }
      setIsDialogOpen(false);
      debouncedFetchProducts(pageIndex + 1, pageSize);
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const resetForm = useCallback(() => {
    setFormData(initialProductState);
    setEditingProduct(null);
  }, []);

  const openDialog = useCallback(() => {
    resetForm();
    setIsDialogOpen(true);
  }, [resetForm]);

  return (
    <AdminLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground p-6">
            <CardTitle className="text-3xl font-bold">
              Products Management
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <Button
                onClick={openDialog}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <PlusCircleIcon className="h-5 w-5" />
                <span>Add New Product</span>
              </Button>
              <div className="flex items-center gap-4">
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
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table {...getTableProps()} className="w-full">
                <thead className="bg-gray-100">
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
                          className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center justify-between">
                            <span>{column.render("Header")}</span>
                            <ArrowUpDown className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="mt-2">
                            {column.canFilter ? column.render("Filter") : null}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody
                  {...getTableBodyProps()}
                  className="bg-white divide-y divide-gray-200"
                >
                  {page.map((row) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()} className="hover:bg-gray-50">
                        {row.cells.map((cell) => (
                          <td
                            {...cell.getCellProps()}
                            className="p-4 text-sm text-gray-500"
                          >
                            {cell.render("Cell")}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Pagination
                currentPage={pageIndex + 1}
                totalPages={totalPages}
                onPageChange={(page) => gotoPage(page - 1)}
              />
              <p className="text-sm text-gray-500">
                Showing {pageIndex * pageSize + 1} to{" "}
                {Math.min((pageIndex + 1) * pageSize, totalProducts)} of{" "}
                {totalProducts} products
              </p>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-[800px] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto max-h-[calc(90vh-100px)] pr-6"
            >
              <div className="grid grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-4">
                  <Input
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="SKU"
                    required
                    className="w-full"
                  />
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Product Name"
                    required
                    className="w-full"
                  />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Description"
                    className="w-full p-2 border rounded-md"
                    rows={3}
                  />
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wardrobe">Wardrobe</SelectItem>
                      <SelectItem value="Storage">Storage</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    name="productCategory"
                    value={formData.productCategory}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        productCategory: value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Product Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sliding Wardrobe">
                        Sliding Wardrobe
                      </SelectItem>
                      <SelectItem value="Openable Wardrobe">
                        Openable Wardrobe
                      </SelectItem>
                      <SelectItem value="Sliding Storage">
                        Sliding Storage
                      </SelectItem>
                      <SelectItem value="Openable Storage">
                        Openable Storage
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    name="amount"
                    type="number"
                    value={formData.price.amount}
                    onChange={(e) => handleInputChange(e, "price")}
                    placeholder="Price"
                    required
                    className="w-full"
                  />
                  <Input
                    name="quantity"
                    type="number"
                    value={formData.inventory.quantity}
                    onChange={(e) => handleInputChange(e, "inventory")}
                    placeholder="Inventory Quantity"
                    required
                    className="w-full"
                  />
                </div>
                {/* Right column */}
                <div className="space-y-4">
                  <Input
                    name="collection"
                    value={formData.attributes.collection}
                    onChange={(e) => handleInputChange(e, "attributes")}
                    placeholder="Collection"
                    className="w-full"
                  />
                  <Input
                    name="material"
                    value={formData.attributes.material}
                    onChange={(e) => handleInputChange(e, "attributes")}
                    placeholder="Material"
                    className="w-full"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="family"
                      value={formData.attributes.color.family}
                      onChange={(e) =>
                        handleInputChange(e, "attributes", "color")
                      }
                      placeholder="Color Family"
                      className="w-full"
                    />
                    <Input
                      name="shade"
                      value={formData.attributes.color.shade}
                      onChange={(e) =>
                        handleInputChange(e, "attributes", "color")
                      }
                      placeholder="Color Shade"
                      className="w-full"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      name="length"
                      type="number"
                      value={formData.attributes.dimensions.length}
                      onChange={(e) =>
                        handleInputChange(e, "attributes", "dimensions")
                      }
                      placeholder="Length"
                      className="w-full"
                    />
                    <Input
                      name="width"
                      type="number"
                      value={formData.attributes.dimensions.width}
                      onChange={(e) =>
                        handleInputChange(e, "attributes", "dimensions")
                      }
                      placeholder="Width"
                      className="w-full"
                    />
                    <Input
                      name="height"
                      type="number"
                      value={formData.attributes.dimensions.height}
                      onChange={(e) =>
                        handleInputChange(e, "attributes", "dimensions")
                      }
                      placeholder="Height"
                      className="w-full"
                    />
                  </div>
                  <Select
                    name="unit"
                    value={formData.attributes.dimensions.unit}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        attributes: {
                          ...prev.attributes,
                          dimensions: {
                            ...prev.attributes.dimensions,
                            unit: value,
                          },
                        },
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="inch">inch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <Input
                  name="configuration"
                  value={formData.attributes.configuration}
                  onChange={(e) => handleInputChange(e, "attributes")}
                  placeholder="Configuration"
                  className="w-full"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="name"
                    value={formData.designer.name}
                    onChange={(e) => handleInputChange(e, "designer")}
                    placeholder="Designer Name"
                    className="w-full"
                  />
                  <Input
                    name="royalty"
                    type="number"
                    value={formData.designer.royalty}
                    onChange={(e) => handleInputChange(e, "designer")}
                    placeholder="Designer Royalty"
                    className="w-full"
                  />
                </div>
                <Input
                  name="url"
                  value={formData.images[0].url}
                  onChange={(e) => handleInputChange(e, "images", "0")}
                  placeholder="Image URL"
                  className="w-full"
                />
                <Input
                  name="altText"
                  value={formData.images[0].altText}
                  onChange={(e) => handleInputChange(e, "images", "0")}
                  placeholder="Image Alt Text"
                  className="w-full"
                />
                <Input
                  name="tags"
                  value={formData.tags.join(", ")}
                  onChange={(e) => handleArrayInputChange(e, "tags")}
                  placeholder="Tags (comma-separated)"
                  className="w-full"
                />
                <Input
                  name="features"
                  value={formData.features.join(", ")}
                  onChange={(e) => handleArrayInputChange(e, "features")}
                  placeholder="Features (comma-separated)"
                  className="w-full"
                />
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white"
                >
                  {editingProduct ? "Update Product" : "Add Product"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

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

export default Products;
