/**
 * Test Pagination Response Format
 * Run this to check if backend returns correct format
 */

const axios = require("axios");

const testEndpoints = async () => {
  const endpoints = [
    "http://localhost:5000/api/admin/categories?page=1&limit=10",
    "http://localhost:5000/api/admin/products?page=1&limit=10",
    "http://localhost:5000/api/admin/discounts?page=1&limit=10",
    "http://localhost:5000/api/admin/orders?page=1&limit=10",
  ];

  console.log("🧪 Testing Pagination Response Format\n");

  for (const url of endpoints) {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: "Bearer YOUR_TOKEN_HERE", // Update with real token
        },
      });

      const endpoint = url.split("/api/")[1].split("?")[0];

      if (response.data.data.pagination) {
        console.log(`✅ ${endpoint}`);
        console.log(
          "   Format:",
          Object.keys(response.data.data.pagination).join(", ")
        );
        console.log(
          "   Sample:",
          JSON.stringify(response.data.data.pagination, null, 2)
        );
      } else {
        console.log(`❌ ${endpoint} - No pagination found`);
      }
      console.log("");
    } catch (error) {
      console.log(`❌ ${url} - Error:`, error.message);
      console.log("");
    }
  }
};

testEndpoints();
