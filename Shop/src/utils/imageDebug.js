// Quick debugging utility for image issues
export const debugImageData = (product, componentName) => {
  console.group(`🔍 Image Debug - ${componentName}`);
  console.log("Product data:", {
    id: product?.id,
    title: product?.title,
    image: product?.image,
    main_image: product?.main_image,
    images: product?.images,
  });

  if (product?.image) {
    console.log("Image type:", typeof product.image);
    console.log("Image value:", product.image);

    // Test different URL constructions
    const tests = [
      `https://shopeasee.pythonanywhere.com${product.image}`,
      `https://shopeasee.pythonanywhere.com/media/${product.image}`,
      product.image,
    ];

    console.log("Possible URLs to test:");
    tests.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });
  }

  console.groupEnd();
};

// Test image URL validity
export const testImageUrl = (url) => {
  if (!url) return false;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      console.log("✅ Image loads:", url);
      resolve(true);
    };
    img.onerror = () => {
      console.log("❌ Image fails:", url);
      resolve(false);
    };
    img.src = url;
  });
};
