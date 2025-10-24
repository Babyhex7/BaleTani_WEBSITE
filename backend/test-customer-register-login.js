const http = require("http");

// Test customer registration dengan nomor baru
const testCustomerRegistration = () => {
  const timestamp = Date.now();
  const data = JSON.stringify({
    phone_number: `081234567${timestamp.toString().slice(-3)}`,
    full_name: "Customer Test " + timestamp,
    password: "customer123",
    address: "Jl. Test No. 123",
  });

  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/customer/auth/register",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  const req = http.request(options, (res) => {
    let body = "";

    res.on("data", (chunk) => {
      body += chunk.toString();
    });

    res.on("end", () => {
      console.log("\n📝 Customer Registration Response:");
      const response = JSON.parse(body);
      console.log(response);

      // Test login jika register berhasil
      if (res.statusCode === 201 && response.data && response.data.customer) {
        testCustomerLogin(response.data.customer.phone_number);
      }
    });
  });

  req.on("error", (error) => {
    console.error("❌ Error:", error);
  });

  req.write(data);
  req.end();
};

// Test customer login
const testCustomerLogin = (phone) => {
  const data = JSON.stringify({
    phone_number: phone,
    password: "customer123",
  });

  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/customer/auth/login",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  const req = http.request(options, (res) => {
    let body = "";

    res.on("data", (chunk) => {
      body += chunk.toString();
    });

    res.on("end", () => {
      console.log("\n🔐 Customer Login Response:");
      console.log(JSON.parse(body));
    });
  });

  req.on("error", (error) => {
    console.error("❌ Error:", error);
  });

  req.write(data);
  req.end();
};

console.log("🧪 Testing Customer Registration & Login...\n");
testCustomerRegistration();
