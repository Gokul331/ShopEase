// Test the image utility fix with sample API data
import {
  getProductImage,
  getProductImages,
  getImageUrl,
} from "./imageUtils.js";

// Sample product data from Django API response (like the iPhone 15 Pro)
const sampleProduct = {
  id: 68,
  title: "iPhone 15 Pro",
  slug: "iphone-15-pro",
  main_image: null,
  image: null,
  images: [
    {
      id: 3,
      image:
        "https://shopeasee.pythonanywhere.com/media/products/gallery/Iphone.jpeg",
      alt_text: "",
      is_primary: true,
      order: 0,
      product: 68,
    },
  ],
};

// Sample product with multiple images (like iPad Air)
const sampleProductMultipleImages = {
  id: 73,
  title: "iPad Air 5th Generation",
  slug: "ipad-air-5th-generation",
  main_image: null,
  image: null,
  images: [
    {
      id: 7,
      image:
        "https://shopeasee.pythonanywhere.com/media/products/gallery/Apple_iPad_Air_13.jpeg",
      alt_text: "",
      is_primary: true,
      order: 0,
      product: 73,
    },
    {
      id: 8,
      image:
        "https://shopeasee.pythonanywhere.com/media/products/gallery/Apple_13-Inch_iPad_Air_M3.jpeg",
      alt_text: "",
      is_primary: false,
      order: 0,
      product: 73,
    },
  ],
};

console.log("🧪 Testing Image Utility Functions");
console.log("=====================================");

// Test getImageUrl with various inputs
console.log("\n1. Testing getImageUrl:");
console.log(
  "- Full URL:",
  getImageUrl(
    "https://shopeasee.pythonanywhere.com/media/products/gallery/Iphone.jpeg"
  )
);
console.log(
  "- Relative path:",
  getImageUrl("/media/products/gallery/Iphone.jpeg")
);
console.log(
  "- Object with image property:",
  getImageUrl({
    image:
      "https://shopeasee.pythonanywhere.com/media/products/gallery/Iphone.jpeg",
  })
);
console.log("- Null input:", getImageUrl(null));

// Test getProductImage with sample data
console.log("\n2. Testing getProductImage:");
console.log(
  "- iPhone (null main_image/image, has images array):",
  getProductImage(sampleProduct)
);
console.log(
  "- iPad (null main_image/image, multiple images):",
  getProductImage(sampleProductMultipleImages)
);
console.log("- Null product:", getProductImage(null));

// Test getProductImages with sample data
console.log("\n3. Testing getProductImages:");
console.log("- iPhone images array:", getProductImages(sampleProduct));
console.log(
  "- iPad images array:",
  getProductImages(sampleProductMultipleImages)
);

console.log("\n✅ Image utility fix test completed!");

export { sampleProduct, sampleProductMultipleImages };
