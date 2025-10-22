const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:5000/api";
let authToken = "";
let testProductId = null;
let uploadedImageIds = [];

// Helper function to format response
function logResponse(stepNumber, stepName, response, error = null) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`STEP ${stepNumber}: ${stepName}`);
  console.log(`${"=".repeat(60)}`);

  if (error) {
    console.log("❌ ERROR:", error.response?.status || "Network Error");
    console.log("Message:", error.response?.data?.message || error.message);
    console.log("Data:", JSON.stringify(error.response?.data, null, 2));
  } else {
    console.log("✅ Status:", response.status);
    console.log("Success:", response.data.success);
    console.log("Message:", response.data.message || "No message");
    console.log("Data:", JSON.stringify(response.data.data, null, 2));
  }
}

// Helper to create a test image file
function createTestImageBuffer(filename) {
  // Create a simple 1x1 pixel PNG for testing
  // PNG header + IHDR + IDAT + IEND
  const pngBuffer = Buffer.from([
    0x89,
    0x50,
    0x4e,
    0x47,
    0x0d,
    0x0a,
    0x1a,
    0x0a, // PNG signature
    0x00,
    0x00,
    0x00,
    0x0d,
    0x49,
    0x48,
    0x44,
    0x52, // IHDR chunk
    0x00,
    0x00,
    0x00,
    0x01,
    0x00,
    0x00,
    0x00,
    0x01,
    0x08,
    0x06,
    0x00,
    0x00,
    0x00,
    0x1f,
    0x15,
    0xc4,
    0x89,
    0x00,
    0x00,
    0x00,
    0x0a,
    0x49,
    0x44,
    0x41,
    0x54,
    0x78,
    0x9c,
    0x63,
    0x00,
    0x01,
    0x00,
    0x00,
    0x05,
    0x00,
    0x01,
    0x0d,
    0x0a,
    0x2d,
    0xb4,
    0x00,
    0x00,
    0x00,
    0x00,
    0x49,
    0x45,
    0x4e,
    0x44,
    0xae,
    0x42,
    0x60,
    0x82,
  ]);

  return pngBuffer;
}

// Main test function
async function runProductImagesAPITests() {
  console.log("\n🚀 Starting Product Images API Tests...\n");

  try {
    // STEP 1: Login as admin
    console.log("Step 1: Logging in as admin...");
    const loginResponse = await axios.post(`${BASE_URL}/admin/auth/login`, {
      email: "admin@baletani.com",
      password: "admin123",
    });

    authToken = loginResponse.data.token;
    logResponse(1, "Admin Login", loginResponse); // Set default headers
    axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

    // STEP 2: Create a test product first
    console.log("\nStep 2: Creating test product...");
    const productData = {
      name: "Test Product for Images",
      sku: "TEST-IMG-001",
      category_id: 1,
      selling_price: 25000,
      purchase_price: 20000,
      total_stock: 100,
      min_stock: 10,
      unit: "kg",
      description: "Test product for image upload testing",
    };

    const createProductResponse = await axios.post(
      `${BASE_URL}/admin/products`,
      productData
    );

    testProductId = createProductResponse.data.data.id;
    logResponse(2, "Create Test Product", createProductResponse);

    // STEP 3: Upload Multiple Images
    console.log("\nStep 3: Uploading multiple images...");
    const formData = new FormData();

    // Add 3 test images
    for (let i = 1; i <= 3; i++) {
      const imageBuffer = createTestImageBuffer(`test-image-${i}.png`);
      formData.append("images", imageBuffer, `test-image-${i}.png`);
    }

    const uploadResponse = await axios.post(
      `${BASE_URL}/admin/products/${testProductId}/images`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    uploadedImageIds = uploadResponse.data.data.map((img) => img.id);
    logResponse(3, "Upload Multiple Images", uploadResponse);

    // STEP 4: Get Product Images
    console.log("\nStep 4: Getting product images...");
    const getImagesResponse = await axios.get(
      `${BASE_URL}/admin/products/${testProductId}/images`
    );
    logResponse(4, "Get Product Images", getImagesResponse);

    // STEP 5: Set Main Image
    console.log("\nStep 5: Setting main image...");
    const setMainResponse = await axios.put(
      `${BASE_URL}/admin/products/images/${uploadedImageIds[1]}`,
      { is_main: true }
    );
    logResponse(5, "Set Main Image", setMainResponse);

    // STEP 6: Update Display Order
    console.log("\nStep 6: Updating display order...");
    const updateOrderResponse = await axios.put(
      `${BASE_URL}/admin/products/images/${uploadedImageIds[0]}`,
      { display_order: 3 }
    );
    logResponse(6, "Update Display Order", updateOrderResponse);

    // STEP 7: Reorder All Images
    console.log("\nStep 7: Reordering all images...");
    const reorderData = {
      images: [
        { id: uploadedImageIds[2], display_order: 1 },
        { id: uploadedImageIds[0], display_order: 2 },
        { id: uploadedImageIds[1], display_order: 3 },
      ],
    };

    const reorderResponse = await axios.put(
      `${BASE_URL}/admin/products/${testProductId}/images/reorder`,
      reorderData
    );
    logResponse(7, "Reorder All Images", reorderResponse);

    // STEP 8: Delete One Image
    console.log("\nStep 8: Deleting one image...");
    const deleteResponse = await axios.delete(
      `${BASE_URL}/admin/products/images/${uploadedImageIds[0]}`
    );
    logResponse(8, "Delete Image", deleteResponse);

    // STEP 9: Verify Image Deleted
    console.log("\nStep 9: Verifying image deleted...");
    const verifyDeleteResponse = await axios.get(
      `${BASE_URL}/admin/products/${testProductId}/images`
    );
    logResponse(9, "Verify Image Deleted", verifyDeleteResponse);

    // STEP 10: Test Upload Limit (try to upload more than 5 images total)
    console.log("\nStep 10: Testing 5 image limit...");
    try {
      const limitFormData = new FormData();
      // Try to add 5 more images (should fail as we already have 2)
      for (let i = 1; i <= 5; i++) {
        const imageBuffer = createTestImageBuffer(`limit-test-${i}.png`);
        limitFormData.append("images", imageBuffer, `limit-test-${i}.png`);
      }

      await axios.post(
        `${BASE_URL}/admin/products/${testProductId}/images`,
        limitFormData,
        {
          headers: {
            ...limitFormData.getHeaders(),
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      console.log("⚠️ Warning: Upload limit test did not fail as expected");
    } catch (limitError) {
      logResponse(10, "Test Upload Limit (Expected Failure)", null, limitError);
    }

    // Final cleanup
    console.log("\n🧹 Cleaning up test data...");

    // Delete remaining images
    const remainingImages = await axios.get(
      `${BASE_URL}/admin/products/${testProductId}/images`
    );

    for (const image of remainingImages.data.data) {
      await axios.delete(`${BASE_URL}/admin/products/images/${image.id}`);
    }

    // Delete test product
    await axios.delete(`${BASE_URL}/admin/products/${testProductId}`);
    console.log("✅ Test data cleaned up");

    console.log("\n" + "=".repeat(60));
    console.log("✅ ALL PRODUCT IMAGES API TESTS COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    logResponse("ERROR", "Test Failed", null, error);
    console.log("\n❌ Tests stopped due to error\n");

    // Attempt cleanup even on error
    if (testProductId) {
      try {
        await axios.delete(`${BASE_URL}/admin/products/${testProductId}`);
        console.log("✅ Test product deleted during cleanup");
      } catch (cleanupError) {
        console.log("⚠️ Failed to cleanup test product");
      }
    }
  }
}

// Run tests
runProductImagesAPITests();
