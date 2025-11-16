import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  productAPI,
  categoryAPI,
  brandAPI,
  handleAPIError,
} from "../services/api";
import { getImageUrl } from "../utils/imageUtils";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiPackage,
  FiSave,
  FiX,
  FiChevronDown,
  FiSearch,
  FiImage,
  FiDollarSign,
  FiTag,
  FiBox,
  FiLayers,
  FiCheck,
  FiUpload,
  FiCamera,
  FiStar,
} from "react-icons/fi";

const RetailerProductManagement = () => {
  // Initial form data - moved to top to avoid reference error
  const initialFormData = {
    title: "",
    slug: "",
    sku: "",
    upc: "",
    model_number: "",
    description: "",
    short_description: "",
    category: "",
    brand: "",
    price: "",
    compare_at_price: "",
    cost_price: "",
    discount_percentage: 0,
    stock: 0,
    low_stock_threshold: 10,
    manage_stock: true,
    allow_backorders: false,
    backorder_limit: 0,
    weight: "",
    weight_unit: "kg",
    length: "",
    width: "",
    height: "",
    dimensions_unit: "cm",
    color: "",
    material: "",
    size: "",
    style: "",
    specification_1: "",
    specification_2: "",
    specification_3: "",
    specification_4: "",
    specification_5: "",
    is_active: true,
    is_trending: false,
    is_featured: false,
    is_bestseller: false,
    is_new_arrival: true,
    warranty_period: "",
    warranty_type: "",
    country_of_origin: "",
    hs_code: "",
    meta_title: "",
    meta_description: "",
    search_keywords: "",
  };

  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [productImages, setProductImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]); // Add user to dependency array

  const fetchData = async () => {
    try {
      setLoading(true);
      setMessage("");

      // Check if user is available and has an ID
      if (!user || !user.id) {
        console.warn("User not available or missing ID");
        setMessage("Please log in to manage products");
        setProducts([]);
        return;
      }

      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        productAPI.list({ retailer: user.id }),
        categoryAPI.list(),
        brandAPI.list(),
      ]);

      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setBrands(brandsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      const apiError = handleAPIError(error);
      setMessage(apiError.message || "Error loading data");

      // Set empty arrays on error
      setProducts([]);
      setCategories([]);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch product images when a product is selected
  const fetchProductImages = async (productId) => {
    try {
      const response = await productAPI.getImages(productId);
      setProductImages(response.data || []);
    } catch (error) {
      console.error("Error fetching product images:", error);
      setProductImages([]);
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = async (product) => {
    setSelectedProduct(product);
    setFormData({
      ...initialFormData,
      ...product,
      category: product.category?.id || "",
      brand: product.brand?.id || "",
    });
    setIsEditing(false);
    setShowDropdown(false);
    setSearchTerm("");
    setErrors({});
    setMessage("");

    // Fetch images for the selected product
    if (product.id) {
      await fetchProductImages(product.id);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title?.trim()) newErrors.title = "Product name is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Valid price is required";
    if (formData.manage_stock && (formData.stock < 0 || formData.stock === ""))
      newErrors.stock = "Valid stock quantity is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.brand) newErrors.brand = "Brand is required";

    return newErrors;
  };

  const handleSave = async () => {
    // Validation
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage("Please fix the errors before saving");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      // Prepare data for API
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price
          ? parseFloat(formData.compare_at_price)
          : null,
        cost_price: formData.cost_price
          ? parseFloat(formData.cost_price)
          : null,
        stock: parseInt(formData.stock),
        low_stock_threshold: parseInt(formData.low_stock_threshold),
      };

      if (selectedProduct) {
        // Update existing product
        await productAPI.update(selectedProduct.id, submitData);
        setMessage("Product updated successfully!");
      } else {
        // Create new product
        const response = await productAPI.create(submitData);
        setMessage("Product created successfully!");
        setFormData(initialFormData);
        // Select the newly created product
        if (response.data) {
          await handleProductSelect(response.data);
        }
      }

      // Refresh product list
      await fetchData();
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving product:", error);
      const apiError = handleAPIError(error);
      setMessage(apiError.message || "Error saving product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !selectedProduct ||
      !window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await productAPI.delete(selectedProduct.id);
      setMessage("Product deleted successfully!");
      setSelectedProduct(null);
      setFormData(initialFormData);
      setProductImages([]);
      await fetchData();
    } catch (error) {
      console.error("Error deleting product:", error);
      const apiError = handleAPIError(error);
      setMessage(apiError.message || "Error deleting product");
    }
  };

  // Add these constants at the top of your component
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FILE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !selectedProduct) return;

    setUploading(true);
    setMessage("");

    try {
      let successfulUploads = 0;
      let errors = [];

      for (const file of files) {
        try {
          // Validate file type
          if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            errors.push(
              `${file.name}: Invalid file type. Only JPEG, JPG, PNG, and WebP are allowed.`
            );
            continue;
          }

          // Validate file size
          if (file.size > MAX_FILE_SIZE) {
            errors.push(`${file.name}: File too large. Maximum size is 5MB.`);
            continue;
          }

          const formData = new FormData();
          formData.append("image", file);
          formData.append("product", selectedProduct.id.toString());

          console.log(
            "Uploading file:",
            file.name,
            "to product:",
            selectedProduct.id
          );

          const response = await productAPI.uploadImage(formData);
          console.log("Upload successful:", response.data);
          successfulUploads++;

          // Small delay between uploads
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (uploadError) {
          console.error(`Failed to upload ${file.name}:`, uploadError);
          const errorMessage =
            uploadError.response?.data?.error ||
            uploadError.response?.data?.detail ||
            uploadError.message;
          errors.push(`${file.name}: ${errorMessage}`);
        }
      }

      if (errors.length > 0) {
        setMessage(
          `Uploaded ${successfulUploads} image(s). Errors: ${errors.join(", ")}`
        );
      } else {
        setMessage(`Successfully uploaded ${successfulUploads} image(s)`);
      }

      // Refresh images
      await fetchProductImages(selectedProduct.id);
    } catch (error) {
      console.error("Error in upload process:", error);
      setMessage("Error during upload process");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };
  // Replace the handleDeleteImage function with this version
  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      await productAPI.deleteImage(imageId);
      setMessage("Image deleted successfully");
      // Refresh images
      await fetchProductImages(selectedProduct.id);
    } catch (error) {
      console.error("Error deleting image:", error);
      const apiError = handleAPIError(error);
      setMessage(apiError.message || "Error deleting image");
    }
  };

  const handleSetPrimaryImage = async (imageId) => {
    try {
      await productAPI.setPrimaryImage(imageId);
      setMessage("Primary image updated successfully");
      // Refresh images
      await fetchProductImages(selectedProduct.id);
    } catch (error) {
      console.error("Error setting primary image:", error);
      const apiError = handleAPIError(error);
      setMessage(apiError.message || "Error setting primary image");
    }
  };

  const handleNewProduct = () => {
    setSelectedProduct(null);
    setFormData(initialFormData);
    setProductImages([]);
    setIsEditing(true);
    setMessage("");
    setErrors({});
  };

  const handleCancel = () => {
    if (selectedProduct) {
      setFormData({
        ...initialFormData,
        ...selectedProduct,
        category: selectedProduct.category?.id || "",
        brand: selectedProduct.brand?.id || "",
      });
    } else {
      setFormData(initialFormData);
    }
    setIsEditing(false);
    setErrors({});
    setMessage("");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest(".dropdown-container")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Product Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your product catalog and images
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes("Error") || message.includes("Please log in")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {message}
          </div>
        )}

        {!user || !user.id ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              Authentication Required
            </h3>
            <p className="text-yellow-700">
              Please log in to manage your products.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Product Selection */}
            <div className="space-y-6">
              {/* Product Selection Dropdown */}
              <div className="bg-white rounded-lg shadow-sm p-6 dropdown-container">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Product
                </h2>

                {/* Dropdown Trigger */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-700">
                      {selectedProduct
                        ? selectedProduct.title
                        : "Choose a product..."}
                    </span>
                    <FiChevronDown
                      className={`text-gray-400 transition-transform ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-80 overflow-y-auto">
                      {/* Search Input */}
                      <div className="p-3 border-b border-gray-100">
                        <div className="relative">
                          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Product List */}
                      <div className="max-h-60 overflow-y-auto">
                        {filteredProducts.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            {products.length === 0
                              ? "No products found"
                              : "No matching products"}
                          </div>
                        ) : (
                          filteredProducts.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => handleProductSelect(product)}
                              className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                                selectedProduct?.id === product.id
                                  ? "bg-indigo-50"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {product.title}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    SKU: {product.sku || "N/A"} | Stock:{" "}
                                    {product.stock || 0}
                                  </p>
                                </div>
                                {product.is_active ? (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    Active
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                    Inactive
                                  </span>
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>

                      {/* Add New Product Option */}
                      <div className="border-t border-gray-100">
                        <button
                          onClick={handleNewProduct}
                          className="w-full text-left p-3 hover:bg-gray-50 flex items-center gap-2 text-indigo-600 font-medium"
                        >
                          <FiPlus size={16} />
                          Add New Product
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Product Info */}
                {selectedProduct && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {selectedProduct.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Last updated:{" "}
                          {new Date(
                            selectedProduct.updated_at || Date.now()
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-indigo-600">
                          ${parseFloat(selectedProduct.price || 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Stock: {selectedProduct.stock || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Management Section */}
              {selectedProduct && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiImage className="text-purple-600" />
                    Product Images
                  </h3>

                  {/* Upload Section */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Images
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="hidden"
                          id="image-upload"
                        />
                        <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 transition-colors cursor-pointer bg-gray-50">
                          <FiUpload className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {uploading ? "Uploading..." : "Choose images"}
                          </span>
                        </div>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Supports JPG, PNG, WEBP. Max 5MB per image.
                    </p>
                  </div>

                  {/* Image Gallery */}
                  {productImages.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {productImages.map((image, index) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={
                              getImageUrl(image.image) ||
                              "/api/placeholder/100/100"
                            }
                            alt={`${selectedProduct.title} - ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              setSelectedImage(image);
                              setShowImageModal(true);
                            }}
                          />

                          {/* Primary Image Badge */}
                          {image.is_primary && (
                            <div className="absolute top-1 left-1 bg-yellow-500 text-white px-1 py-0.5 rounded text-xs">
                              <FiStar size={10} />
                            </div>
                          )}

                          {/* Image Actions */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                            {!image.is_primary && (
                              <button
                                onClick={() => handleSetPrimaryImage(image.id)}
                                className="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                                title="Set as primary"
                              >
                                <FiStar size={12} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteImage(image.id)}
                              className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                              title="Delete image"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FiImage
                        className="mx-auto text-gray-300 mb-2"
                        size={32}
                      />
                      <p>No images uploaded yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleNewProduct}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    <FiPlus size={18} />
                    New Product
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    disabled={!selectedProduct}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    <FiEdit size={18} />
                    Edit
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={(!isEditing && !selectedProduct) || saving}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave size={18} />
                        Save
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={!selectedProduct}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    <FiTrash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Product Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedProduct ? "Edit Product" : "Create New Product"}
                  {!isEditing && selectedProduct && " (Read-only)"}
                </h2>
                {isEditing && (
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-700 transition-colors"
                  >
                    <FiX size={16} />
                    Cancel
                  </button>
                )}
              </div>

              {/* Product Form */}
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {/* Basic Information */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <FiPackage className="text-indigo-600" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.title ? "border-red-500" : "border-gray-300"
                        } ${!isEditing ? "bg-gray-100" : "bg-white"}`}
                      />
                      {errors.title && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.title}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SKU
                        </label>
                        <input
                          type="text"
                          name="sku"
                          value={formData.sku}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          UPC
                        </label>
                        <input
                          type="text"
                          name="upc"
                          value={formData.upc}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing & Inventory */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <FiDollarSign className="text-green-600" />
                    Pricing & Inventory
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        step="0.01"
                        min="0"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.price ? "border-red-500" : "border-gray-300"
                        } ${!isEditing ? "bg-gray-100" : "bg-white"}`}
                      />
                      {errors.price && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.price}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Compare at Price
                      </label>
                      <input
                        type="number"
                        name="compare_at_price"
                        value={formData.compare_at_price}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock *
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        disabled={!isEditing || !formData.manage_stock}
                        min="0"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.stock ? "border-red-500" : "border-gray-300"
                        } ${
                          !isEditing || !formData.manage_stock
                            ? "bg-gray-100"
                            : "bg-white"
                        }`}
                      />
                      {errors.stock && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.stock}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Low Stock Threshold
                      </label>
                      <input
                        type="number"
                        name="low_stock_threshold"
                        value={formData.low_stock_threshold}
                        onChange={handleInputChange}
                        disabled={!isEditing || !formData.manage_stock}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="manage_stock"
                        checked={formData.manage_stock}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:bg-gray-100"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Manage stock
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="allow_backorders"
                        checked={formData.allow_backorders}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:bg-gray-100"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Allow backorders
                      </span>
                    </label>
                  </div>
                </div>

                {/* Categories & Brand */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <FiTag className="text-purple-600" />
                    Categories & Brand
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.category ? "border-red-500" : "border-gray-300"
                        } ${!isEditing ? "bg-gray-100" : "bg-white"}`}
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.category}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand *
                      </label>
                      <select
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.brand ? "border-red-500" : "border-gray-300"
                        } ${!isEditing ? "bg-gray-100" : "bg-white"}`}
                      >
                        <option value="">Select Brand</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                      {errors.brand && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.brand}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Product Status */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <FiCheck className="text-blue-600" />
                    Product Status
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:bg-gray-100"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:bg-gray-100"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Featured
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_trending"
                        checked={formData.is_trending}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:bg-gray-100"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Trending
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_new_arrival"
                        checked={formData.is_new_arrival}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:bg-gray-100"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        New Arrival
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Product Image</h3>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="p-4">
                <img
                  src={
                    getImageUrl(selectedImage.image) ||
                    "/api/placeholder/600/400"
                  }
                  alt="Product preview"
                  className="max-w-full max-h-96 object-contain mx-auto"
                />
              </div>
              <div className="p-4 border-t flex justify-between">
                <div>
                  {selectedImage.is_primary && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                      <FiStar size={12} />
                      Primary Image
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!selectedImage.is_primary && (
                    <button
                      onClick={() => {
                        handleSetPrimaryImage(selectedImage.id);
                        setShowImageModal(false);
                      }}
                      className="flex items-center gap-1 px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      <FiStar size={14} />
                      Set as Primary
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleDeleteImage(selectedImage.id);
                      setShowImageModal(false);
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <FiTrash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetailerProductManagement;
