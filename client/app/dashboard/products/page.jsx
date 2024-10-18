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
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import AdminLayout from "@/components/AdminDashboard";
import {
  PlusCircleIcon,
  Edit2Icon,
  TrashIcon,
  SearchIcon,
  ArrowUpDown,
  X,
} from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { debounce } from "lodash";
import api from "@/utils/api";
import MultiCheckboxSelect from "@/components/MultipleCheckboxSelect";

const initialProductState = {
  sku: "",
  name: "",
  description: "",
  type: "",
  productCategory: "",
  price: { amount: "", currency: "INR" },
  inventory: { quantity: "", reserved: 0 },
  categories: [],
  attributes: {
    collection: "",
    material: "",
    color: { family: "", shade: "" },
    width: "",
    height: "",
    depth: "",
    doors: "",
    style: [],
    woodwork: {
      carcassMaterial: [],
      carcassFinish: [],
      shutterMaterial: [],
      shutterFinish: "",
      finishType: [],
      finishCode: "",
    },
    brand: "",
  },
  hardware: {
    channels: [],
    hinges: [],
    hRodsAndAccessories: [],
  },
  designer: {
    name: "",
    area: "",
    royalty: "",
  },
  images: [],
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
  const [images, setImages] = useState([]);
  const [altTexts, setAltTexts] = useState([]);
  const [collectionDefaults, setCollectionDefaults] = useState([]);

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

  useEffect(() => {
    const fetchCollectionDefaults = async () => {
      try {
        const response = await api.get("admin/products/collection-defaults");
        if (response.data && Array.isArray(response.data)) {
          setCollectionDefaults(response.data);
        } else {
          console.error("Unexpected response format:", response.data);
          setCollectionDefaults([]);
        }
      } catch (error) {
        console.error("Error fetching collection defaults:", error);
        setCollectionDefaults([]);
      }
    };
    fetchCollectionDefaults();
  }, []);

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

  const handleEdit = useCallback((product) => {
    setEditingProduct(product);
    setFormData(product);
    setImages(product.images || []);
    setAltTexts((product.images || []).map((img) => img.altText || ""));
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

  useEffect(() => {
    if (formData.type && formData.attributes.collection) {
      const generatedSKU = generateSKU(
        formData.type,
        formData.attributes.collection
      );
      setFormData((prev) => ({ ...prev, sku: generatedSKU }));
    }
  }, [formData.type, formData.attributes.collection]);

  function generateSKU(type, collection) {
    const typePrefix = type.substring(0, 2).toUpperCase();
    const collectionPrefix = collection
      .replace(/\s+/g, "")
      .substring(0, 3)
      .toUpperCase();
    const randomSuffix = Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase();
    return `${typePrefix}-${collectionPrefix}-${randomSuffix}`;
  }

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const formDataToSend = new FormData();
  //     const productData = { ...formData };

  //     productData.sku = generateSKU(
  //       productData.type,
  //       productData.attributes.collection
  //     );

  //     productData.attributes = {
  //       ...productData.attributes,
  //       woodwork: {
  //         ...productData.attributes.woodwork,
  //         carcassMaterial: productData.attributes.woodwork.carcassMaterial,
  //         carcassFinish: productData.attributes.woodwork.carcassFinish,
  //         finishType: productData.attributes.woodwork.finishType,
  //       },
  //     };

  //     productData.hardware = {
  //       channels: productData.hardware.channels,
  //       hinges: productData.hardware.hinges,
  //       hRodsAndAccessories: productData.hardware.hRodsAndAccessories,
  //     };

  //     delete productData.images;

  //     formDataToSend.append("productData", JSON.stringify(productData));

  //     images.forEach((image, index) => {
  //       if (image instanceof File) {
  //         formDataToSend.append("newImages", image);
  //       } else {
  //         formDataToSend.append("existingImages", JSON.stringify(image));
  //       }
  //       formDataToSend.append(`altTexts[${index}]`, altTexts[index] || "");
  //     });

  //     if (editingProduct) {
  //       await api.put(`admin/products/${editingProduct._id}`, formDataToSend, {
  //         headers: { "Content-Type": "multipart/form-data" },
  //       });
  //     } else {
  //       await api.post("admin/products", formDataToSend, {
  //         headers: { "Content-Type": "multipart/form-data" },
  //       });
  //     }

  //     setIsDialogOpen(false);
  //     debouncedFetchProducts(pageIndex + 1, pageSize);
  //     resetForm();
  //   } catch (error) {
  //     console.error("Error saving product:", error);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      const productData = { ...formData };

      // Generate SKU if it's a new product
      if (!editingProduct) {
        productData.sku = generateSKU(
          productData.type,
          productData.attributes.collection
        );
      }

      // Ensure shutter finish and brand are set correctly
      const collectionDefault = collectionDefaults.find(
        (def) => def.collection === productData.attributes.collection
      );
      if (collectionDefault) {
        productData.attributes.woodwork.shutterFinish =
          collectionDefault.shutterFinish;
        if (productData.attributes.collection !== "Smart Space") {
          productData.attributes.brand = collectionDefault.brand[0];
        }
      }

      // Append product data
      formDataToSend.append("productData", JSON.stringify(productData));

      // Append images
      images.forEach((image, index) => {
        if (image instanceof File) {
          formDataToSend.append(`image`, image);
        }
      });

      const response = editingProduct
        ? await api.put(
            `admin/products/${editingProduct._id}`,
            formDataToSend,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          )
        : await api.post("admin/products", formDataToSend, {
            headers: { "Content-Type": "multipart/form-data" },
          });

      setIsDialogOpen(false);
      debouncedFetchProducts(pageIndex + 1, pageSize);
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      // Show error message to user
    }
  };

  const resetForm = useCallback(() => {
    setFormData(initialProductState);
    setImages([]);
    setAltTexts([]);
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

        <ImprovedProductModal
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSubmit={handleSubmit}
          editingProduct={editingProduct}
          formData={formData}
          handleInputChange={handleInputChange}
          images={images}
          setImages={setImages}
          altTexts={altTexts}
          setAltTexts={setAltTexts}
          collectionDefaults={collectionDefaults}
        />
      </div>
    </AdminLayout>
  );
};

function ImprovedProductModal({
  isOpen,
  onClose,
  onSubmit,
  editingProduct,
  formData,
  handleInputChange,
  images,
  setImages,
  altTexts,
  setAltTexts,
  collectionDefaults,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const validateForm = () => {
      // Basic required fields
      const requiredFields = [
        formData.sku,
        formData.name,
        formData.type,
        formData.productCategory,
        formData.price.amount,
        formData.inventory.quantity,
        formData.attributes.collection,
        formData.attributes.material,
        formData.attributes.color.family,
        formData.attributes.width,
        formData.attributes.height,
        formData.attributes.depth,
        formData.attributes.doors,
        formData.designer.name,
        formData.designer.area,
      ];

      // Check if all required fields are filled
      const allRequiredFieldsFilled = requiredFields.every(
        (field) => field !== "" && field !== undefined
      );

      // Check if at least one style is selected
      const hasStyle = formData.attributes.style.length > 0;

      // Check if images are uploaded
      const hasAllImages = images.length === 4;

      setIsFormValid(allRequiredFieldsFilled && hasStyle && hasAllImages);
    };

    validateForm();
  }, [formData, images]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...newFiles]);
    setAltTexts((prevAltTexts) => [...prevAltTexts, ...newFiles.map(() => "")]);
  };

  const handleAltTextChange = (index, value) => {
    setAltTexts((prevAltTexts) => {
      const newAltTexts = [...prevAltTexts];
      newAltTexts[index] = value;
      return newAltTexts;
    });
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setAltTexts((prevAltTexts) => prevAltTexts.filter((_, i) => i !== index));
  };

  const handleCollectionChange = (value) => {
    const defaults =
      collectionDefaults.find((def) => def.collection === value) || {};
    handleInputChange({ target: { name: "collection", value } }, "attributes");
    handleInputChange(
      {
        target: {
          name: "shutterFinish",
          value: defaults.shutterFinish || "",
        },
      },
      "attributes",
      "woodwork"
    );
    handleInputChange(
      {
        target: {
          name: "brand",
          value: defaults.brand ? defaults.brand[0] : "",
        },
      },
      "attributes"
    );
  };

  const steps = [
    { title: "Basic Info", component: BasicInfoStep },
    { title: "Attributes", component: AttributesStep },
    { title: "Hardware", component: HardwareStep },
    { title: "Images & Tags", component: ImagesAndTagsStep },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <Tabs
            value={currentStep.toString()}
            onValueChange={(value) => setCurrentStep(parseInt(value))}
          >
            <TabsList className="grid w-full grid-cols-4">
              {steps.map((step, index) => (
                <TabsTrigger key={index} value={index.toString()}>
                  {step.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {steps.map((step, index) => (
              <TabsContent key={index} value={index.toString()}>
                <step.component
                  formData={formData}
                  handleInputChange={handleInputChange}
                  handleFileChange={handleFileChange}
                  handleAltTextChange={handleAltTextChange}
                  removeImage={removeImage}
                  images={images}
                  setImages={setImages}
                  altTexts={altTexts}
                  collectionDefaults={collectionDefaults}
                  handleCollectionChange={handleCollectionChange}
                />
              </TabsContent>
            ))}
          </Tabs>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={!isFormValid}>
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BasicInfoStep({ formData, handleInputChange }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="sku">SKU</Label>
        <Input
          id="sku"
          name="sku"
          value={formData.sku}
          onChange={handleInputChange}
          readOnly
        />
      </div>
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="col-span-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full p-2 border rounded-md"
          rows={3}
        />
      </div>
      <div>
        <Label htmlFor="type">Type</Label>
        <Select
          name="type"
          value={formData.type}
          onChange={(value) =>
            handleInputChange({ target: { name: "type", value } })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Wardrobe">Wardrobe</SelectItem>
            <SelectItem value="Storage">Storage</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="productCategory">Product Category</Label>
        <Select
          name="productCategory"
          value={formData.productCategory}
          onChange={(value) =>
            handleInputChange({ target: { name: "productCategory", value } })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Sliding Wardrobe">Sliding Wardrobe</SelectItem>
            <SelectItem value="Openable Wardrobe">Openable Wardrobe</SelectItem>
            <SelectItem value="Sliding Storage">Sliding Storage</SelectItem>
            <SelectItem value="Openable Storage">Openable Storage</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="price">Price (INR)</Label>
        <Input
          id="price"
          name="amount"
          type="number"
          value={formData.price.amount}
          onChange={(e) => handleInputChange(e, "price")}
          required
        />
      </div>
      <div>
        <Label htmlFor="inventory">Inventory Quantity</Label>
        <Input
          id="inventory"
          name="quantity"
          type="number"
          value={formData.inventory.quantity}
          onChange={(e) => handleInputChange(e, "inventory")}
          required
        />
      </div>
    </div>
  );
}

function AttributesStep({
  formData,
  handleInputChange,
  collectionDefaults,
  handleCollectionChange,
}) {
  const [styleInput, setStyleInput] = useState("");
  const [brandOptions, setBrandOptions] = useState([]);

  useEffect(() => {
    if (formData.attributes.collection === "Smart Space") {
      setBrandOptions(["Greenlam", "Merino"]);
    } else {
      const defaults = collectionDefaults.find(
        (def) => def.collection === formData.attributes.collection
      );
      setBrandOptions(defaults ? [defaults.brand] : []);
    }
  }, [formData.attributes.collection]);

  const handleStyleAdd = () => {
    if (styleInput && !formData.attributes.style.includes(styleInput)) {
      handleInputChange(
        {
          target: {
            name: "style",
            value: [...formData.attributes.style, styleInput],
          },
        },
        "attributes"
      );
      setStyleInput("");
    }
  };

  const handleStyleRemove = (style) => {
    handleInputChange(
      {
        target: {
          name: "style",
          value: formData.attributes.style.filter((s) => s !== style),
        },
      },
      "attributes"
    );
  };
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="collection">Collection</Label>
        <Select
          name="collection"
          value={formData.attributes.collection}
          onChange={handleCollectionChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Collection" />
          </SelectTrigger>
          <SelectContent>
            {collectionDefaults.map((def) => (
              <SelectItem key={def.collection} value={def.collection}>
                {def.collection}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="material">Material</Label>
        <Input
          id="material"
          name="material"
          value={formData.attributes.material}
          onChange={(e) => handleInputChange(e, "attributes")}
        />
      </div>
      <div>
        <Label htmlFor="colorFamily">Color Family</Label>
        <Input
          id="colorFamily"
          name="family"
          value={formData.attributes.color.family}
          onChange={(e) => handleInputChange(e, "attributes", "color")}
        />
      </div>
      <div>
        <Label htmlFor="colorShade">Color Shade</Label>
        <Input
          id="colorShade"
          name="shade"
          value={formData.attributes.color.shade}
          onChange={(e) => handleInputChange(e, "attributes", "color")}
        />
      </div>
      <div>
        <Label htmlFor="width">Width</Label>
        <Input
          id="width"
          name="width"
          type="number"
          value={formData.attributes.width}
          onChange={(e) => handleInputChange(e, "attributes")}
        />
      </div>
      <div>
        <Label htmlFor="height">Height</Label>
        <Input
          id="height"
          name="height"
          type="number"
          value={formData.attributes.height}
          onChange={(e) => handleInputChange(e, "attributes")}
        />
      </div>
      <div>
        <Label htmlFor="depth">Depth</Label>
        <Input
          id="depth"
          name="depth"
          type="number"
          value={formData.attributes.depth}
          onChange={(e) => handleInputChange(e, "attributes")}
        />
      </div>
      <div>
        <Label htmlFor="doors">Number of Doors</Label>
        <Select
          name="doors"
          value={formData.attributes.doors}
          onChange={(value) =>
            handleInputChange(
              { target: { name: "doors", value } },
              "attributes"
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Doors" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <SelectItem key={num} value={num.toString()}>
                {num}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <Label htmlFor="style">Style</Label>
        <div className="flex flex-wrap gap-2 p-2 border rounded-md">
          {formData.attributes.style.map((style) => (
            <span
              key={style}
              className="bg-primary text-primary-foreground px-2 py-1 rounded-md flex items-center"
            >
              {style}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0"
                onClick={() => handleStyleRemove(style)}
              >
                <X className="h-3 w-3" />
              </Button>
            </span>
          ))}
          <Input
            type="text"
            value={styleInput}
            onChange={(e) => setStyleInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleStyleAdd()}
            placeholder="Add style..."
            className="flex-grow"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="designerName">Designer Name</Label>
        <Input
          id="designerName"
          name="name"
          value={formData.designer.name}
          onChange={(e) => handleInputChange(e, "designer")}
        />
      </div>
      <div>
        <Label htmlFor="designerArea">Designer Area</Label>
        <Input
          id="designerArea"
          name="area"
          value={formData.designer.area}
          onChange={(e) => handleInputChange(e, "designer")}
        />
      </div>
      <div>
        <Label htmlFor="designerRoyalty">Designer Royalty</Label>
        <Input
          id="designerRoyalty"
          name="royalty"
          type="number"
          value={formData.designer.royalty}
          onChange={(e) => handleInputChange(e, "designer")}
        />
      </div>
      {formData.attributes.collection === "Smart Space" ? (
        <div>
          <Label htmlFor="brand">Brand</Label>
          <Select
            name="brand"
            value={formData.attributes.brand}
            onChange={(value) =>
              handleInputChange(
                { target: { name: "brand", value } },
                "attributes"
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Greenlam">Greenlam</SelectItem>
              <SelectItem value="Merino">Merino</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            name="brand"
            value={formData.attributes.brand}
            readOnly
          />
        </div>
      )}

      {/* Woodwork Inputs */}
      <div className="col-span-2">
        <h3 className="text-lg font-semibold mb-2">Woodwork</h3>
      </div>
      <div>
        <Label htmlFor="carcassMaterial">Carcass Material</Label>
        <Select
          name="carcassMaterial"
          value={formData.attributes.woodwork.carcassMaterial}
          onChange={(value) =>
            handleInputChange(
              { target: { name: "carcassMaterial", value } },
              "attributes",
              "woodwork"
            )
          }
          multiple
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Carcass Material" />
          </SelectTrigger>
          <SelectContent>
            {["MR", "BWR", "BWP"].map((material) => (
              <SelectItem key={material} value={material}>
                {material}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="carcassFinish">Carcass Finish</Label>
        <Select
          name="carcassFinish"
          value={formData.attributes.woodwork.carcassFinish}
          onChange={(value) =>
            handleInputChange(
              { target: { name: "carcassFinish", value } },
              "attributes",
              "woodwork"
            )
          }
          multiple
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Carcass Finish" />
          </SelectTrigger>
          <SelectContent>
            {["WLAM", "FABLAM"].map((finish) => (
              <SelectItem key={finish} value={finish}>
                {finish}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="shutterMaterial">Shutter Material</Label>
        <Select
          name="shutterMaterial"
          value={formData.attributes.woodwork.shutterMaterial}
          onChange={(value) =>
            handleInputChange(
              { target: { name: "shutterMaterial", value } },
              "attributes",
              "woodwork"
            )
          }
          multiple
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Carcass Material" />
          </SelectTrigger>
          <SelectContent>
            {["MR", "BWR", "BWP", "MDF", "HDHMR", "HDFMR", "RcSAW"].map(
              (material) => (
                <SelectItem key={material} value={material}>
                  {material}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="shutterFinish">Shutter Finish</Label>
        <Input
          id="shutterFinish"
          name="shutterFinish"
          value={formData.attributes.woodwork.shutterFinish}
          readOnly
        />
      </div>
      <div>
        <Label htmlFor="finishType">Finish Type</Label>
        <Select
          name="finishType"
          value={formData.attributes.woodwork.finishType}
          onChange={(value) =>
            handleInputChange(
              { target: { name: "finishType", value } },
              "attributes",
              "woodwork"
            )
          }
          multiple
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Finish Type" />
          </SelectTrigger>
          <SelectContent>
            {["Glossy", "Matt", "Text"].map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="finishCode">Finish Code</Label>
        <Input
          id="finishCode"
          name="finishCode"
          value={formData.attributes.woodwork.finishCode}
          onChange={(e) => handleInputChange(e, "attributes", "woodwork")}
        />
      </div>
    </div>
  );
}

function HardwareStep({ formData, handleInputChange }) {
  const hRodsAndAccessoriesOptions = [
    "Hettich",
    "Haffle",
    "Ebco",
    "Heppo",
    "Onyx",
    "NA",
  ];

  const handleHRodsChange = (newValue) => {
    handleInputChange(
      { target: { name: "hRodsAndAccessories", value: newValue } },
      "hardware"
    );
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="channels">Channels</Label>
        <Select
          name="channels"
          value={formData.hardware.channels}
          onChange={(value) =>
            handleInputChange(
              { target: { name: "channels", value } },
              "hardware"
            )
          }
          multiple
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Channels" />
          </SelectTrigger>
          <SelectContent>
            {["Hettich", "Haffle", "ebco", "heppo", "NA"].map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="hinges">Hinges</Label>
        <Select
          name="hinges"
          value={formData.hardware.hinges}
          onChange={(value) =>
            handleInputChange({ target: { name: "hinges", value } }, "hardware")
          }
          multiple
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Hinges" />
          </SelectTrigger>
          <SelectContent>
            {["Hettich", "Haffle", "ebco", "heppo", "NA"].map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <MultiCheckboxSelect
          options={hRodsAndAccessoriesOptions}
          value={formData.hardware.hRodsAndAccessories}
          onChange={handleHRodsChange}
          label="H'Rods & Accessories"
        />
      </div>
    </div>
  );
}

function ImagesAndTagsStep({ images, setImages }) {
  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...images];
      newImages[index] = file;
      setImages(newImages);
    }
  };

  return (
    <div className="space-y-4">
      {["Shutter View", "Open Shutter View", "Internal View"].map(
        (label, index) => (
          <div key={label}>
            <Label htmlFor={`image${index + 1}`}>{label}</Label>
            <Input
              id={`image${index + 1}`}
              name={`image${index + 1}`}
              type="file"
              onChange={(e) => handleFileChange(e, index)}
              accept="image/*"
            />
          </div>
        )
      )}
      <div>
        <Label htmlFor="image4">2D View</Label>
        <Input
          id="image4"
          name="image4"
          type="file"
          onChange={(e) => handleFileChange(e, 3)}
          accept="application/pdf"
        />
      </div>
    </div>
  );
}

function ColumnFilter({ column }) {
  const { filterValue, setFilter } = column;
  return (
    <Input
      value={filterValue || ""}
      onChange={(e) => setFilter(e.target.value)}
      placeholder={`Search ${column.Header.toLowerCase()}...`}
      className="w-full text-xs"
    />
  );
}

function SelectColumnFilter({ column }) {
  const { filterValue, setFilter, preFilteredRows, id } = column;
  const options = React.useMemo(() => {
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
      <SelectTrigger className="w-full text-xs">
        <SelectValue placeholder={`Select ${column.Header}`} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">All</SelectItem>
        {options.map((option, i) => (
          <SelectItem key={i} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function NumberRangeColumnFilter({ column: { filterValue = [], setFilter } }) {
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
        placeholder={`Min`}
        className="w-24 text-xs"
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
        placeholder={`Max`}
        className="w-24 text-xs"
      />
    </div>
  );
}

export default Products;
