/**
 * AI RECOMMENDATION DEBUG TEST
 * Test langsung di Browser Console
 */

console.log("🧪 Starting AI Recommendation Tests...");

// Test 1: Check API Base URL
console.log("\n📍 Test 1: Check Configuration");
console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);
console.log("Expected:", "http://localhost:5000/api");

// Test 2: Test Backend Health
console.log("\n📍 Test 2: Backend Health Check");
fetch("http://localhost:5000/api/health")
  .then((r) => r.json())
  .then((data) => console.log("✅ Backend Health:", data))
  .catch((err) => console.error("❌ Backend Error:", err));

// Test 3: Test ML Service (via Backend)
console.log("\n📍 Test 3: ML Service Health (via Backend)");
fetch("http://localhost:8000/health")
  .then((r) => r.json())
  .then((data) => console.log("✅ ML Service Health:", data))
  .catch((err) => console.error("❌ ML Service Error:", err));

// Test 4: Test Similar Products (Direct to Backend)
const testProductId = "9c8cc803-c506-11f0-b326-0a0027000015";
console.log("\n📍 Test 4: Similar Products API");
console.log("Product ID:", testProductId);

fetch(
  `http://localhost:5000/api/recommendations/similar/${testProductId}?top_k=5`
)
  .then((r) => {
    console.log("Response Status:", r.status);
    if (!r.ok) {
      throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    }
    return r.json();
  })
  .then((data) => {
    console.log("✅ Similar Products Success:", data);
    console.log("   Recommendations:", data.data?.recommendations?.length || 0);
  })
  .catch((err) => console.error("❌ Similar Products Error:", err));

// Test 5: Test Bundle Recommendations (Direct to Backend)
console.log("\n📍 Test 5: Bundle Recommendations API");
const testCartIds = [
  "9c8cc803-c506-11f0-b326-0a0027000015",
  "7a4af2f2-f55b-4300-a4ba-4406efcc350c",
];

fetch("http://localhost:5000/api/recommendations/bundle?top_k=5", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ productIds: testCartIds }),
})
  .then((r) => {
    console.log("Response Status:", r.status);
    return r.json();
  })
  .then((data) => {
    console.log("✅ Bundle Recommendations Success:", data);
    console.log("   Recommendations:", data.data?.recommendations?.length || 0);
  })
  .catch((err) => console.error("❌ Bundle Error:", err));

// Test 6: Test via apiClient (with auth)
console.log("\n📍 Test 6: Test via apiClient (Frontend)");
import apiClient from "./src/utils/apiClient";
import {
  getSimilarProducts,
  getBundleRecommendations,
} from "./src/services/services_customer/recommendationService";

// Test similar products
console.log("Testing getSimilarProducts...");
getSimilarProducts(testProductId, 5)
  .then((data) => console.log("✅ apiClient Similar Products:", data))
  .catch((err) => console.error("❌ apiClient Similar Error:", err));

// Test bundle
console.log("Testing getBundleRecommendations...");
getBundleRecommendations(testCartIds, 5)
  .then((data) => console.log("✅ apiClient Bundle:", data))
  .catch((err) => console.error("❌ apiClient Bundle Error:", err));

console.log("\n⏱️  Wait for results above...");
