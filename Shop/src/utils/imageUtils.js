// Image utility functions for handling product and category images

/**
 * Get the full URL for an image, handling both relative and absolute paths
 * @param {string|object} imagePath - The image path from the API (string or object with url/image property)
 * @returns {string|null} - Full image URL or null if no path
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    console.log("❌ getImageUrl: No imagePath provided");
    return null;
  }

  console.log("🔍 getImageUrl input:", imagePath, typeof imagePath);

  // Handle case where imagePath is an object (like from Django ImageField)
  let actualPath = imagePath;
  if (typeof imagePath === "object") {
    console.log("📝 Processing object imagePath:", imagePath);
    // Try common object properties for image URLs
    actualPath =
      imagePath.url || imagePath.image || imagePath.path || imagePath.src;
    if (!actualPath) {
      console.log("❌ No valid path found in object");
      return null;
    }
    console.log("✅ Found path in object:", actualPath);
  }

  // Convert to string and handle non-string values
  actualPath = String(actualPath);
  console.log("📝 Converted to string:", actualPath);

  // If it's already a full URL (starts with http), return as is
  if (actualPath.startsWith("http")) {
    console.log("✅ Full URL found:", actualPath);
    return actualPath;
  }

  // If it's a relative path starting with /media/, prepend the backend URL
  if (actualPath.startsWith("/media/")) {
    const fullUrl = `https://shopeasee.pythonanywhere.com${actualPath}`;
    console.log("✅ Media path converted:", fullUrl);
    return fullUrl;
  }

  // Clean the path - remove any leading slashes or 'media/' prefixes
  actualPath = actualPath.replace(/^\/+/, "").replace(/^media\/+/, "");

  // If it's just a filename or partial path, assume it's in media directory
  const fullUrl = `https://shopeasee.pythonanywhere.com/media/${actualPath}`;
  console.log("✅ Filename converted:", fullUrl);
  return fullUrl;
};

/**
 * Get the best available product image
 * @param {object} product - Product object from API
 * @returns {string|null} - Image URL or null if no image available
 */
export const getProductImage = (product) => {
  if (!product) {
    console.log("❌ getProductImage: No product provided");
    return null;
  }

  console.log("🔍 getProductImage input:", {
    productId: product.id,
    title: product.title,
    main_image: product.main_image,
    image: product.image,
    images: product.images,
  });

  // Try main_image first, then image, with proper object handling
  const mainImageUrl = getImageUrl(product.main_image);
  const imageUrl = getImageUrl(product.image);

  // If main_image and image are null, try to get the first image from images array
  let finalUrl = mainImageUrl || imageUrl;

  if (
    !finalUrl &&
    product.images &&
    Array.isArray(product.images) &&
    product.images.length > 0
  ) {
    console.log("🔍 Trying images array:", product.images);

    // Look for primary image first
    const primaryImage = product.images.find((img) => img.is_primary === true);
    if (primaryImage) {
      finalUrl = getImageUrl(primaryImage.image);
      console.log("✅ Found primary image:", finalUrl);
    }

    // If no primary image, use the first image in the array
    if (!finalUrl) {
      finalUrl = getImageUrl(product.images[0].image);
      console.log("✅ Using first image from array:", finalUrl);
    }
  }

  console.log("✅ getProductImage result:", finalUrl);

  return finalUrl;
};

/**
 * Get the best available category image
 * @param {object} category - Category object from API
 * @returns {string|null} - Image URL or null if no image available
 */
export const getCategoryImage = (category) => {
  return getImageUrl(category.image);
};

/**
 * Get all product images for gallery display
 * @param {object} product - Product object from API
 * @returns {Array<string>} - Array of image URLs (only actual images, no placeholders)
 */
export const getProductImages = (product) => {
  if (!product) {
    return [];
  }

  console.log("🔍 getProductImages input:", {
    productId: product.id,
    title: product.title,
    main_image: product.main_image,
    image: product.image,
    images: product.images,
  });

  const images = [];

  // First, try main_image and image fields
  const mainImageUrl = getImageUrl(product.main_image);
  const imageUrl = getImageUrl(product.image);

  if (mainImageUrl) images.push(mainImageUrl);
  if (imageUrl && imageUrl !== mainImageUrl) images.push(imageUrl);

  // Then add images from the images array
  if (product.images && Array.isArray(product.images)) {
    const galleryImages = product.images
      .map((img) => getImageUrl(img.image))
      .filter(Boolean) // Remove any null/undefined images
      .filter((url) => !images.includes(url)); // Avoid duplicates

    images.push(...galleryImages);
  }

  console.log("✅ getProductImages result:", images);

  return images;
};
