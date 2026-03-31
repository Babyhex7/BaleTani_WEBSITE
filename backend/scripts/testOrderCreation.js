/**
 * Test order creation to capture exact error
 */

const axios = require("axios");

const testOrderCreation = async () => {
  try {
    // Test customer login first
    const loginRes = await axios.post("http://localhost:5000/api/customer/auth/login", {
      phone_number: "6281234567890",
      password: "customer12345",
    });

    const token = loginRes.data.data.token;
    const customerId = loginRes.data.data.id;
    console.log("✅ Login successful. Token:", token.substring(0, 20) + "...");

    // Get products first
    const productsRes = await axios.get("http://localhost:5000/api/public/products");
    const products = productsRes.data.data.products;
    console.log(`✅ Found ${products.length} products`);

    // Prepare order items
    const items = [
      {
        product_id: products[0].id,
        quantity: 1,
      },
    ];

    console.log("📦 Creating order with items:", items);

    // Create order
    const orderRes = await axios.post(
      "http://localhost:5000/api/customer/orders/create",
      {
        customer_name: "Ibu Siti Nurhaliza",
        customer_phone: "6281234567890",
        delivery_method: "delivery",
        delivery_address: "Jl. Test No. 123",
        payment_method: "cash",
        items: items,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Order created successfully!", orderRes.data);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    if (error.response?.data?.error?.message) {
      console.error("Error message:", error.response.data.error.message);
    }
    if (error.response?.status === 500) {
      console.error("Server Error - Check backend console for details");
    }
  }
};

testOrderCreation();
