const http = require("http");

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testCustomerRegister() {
  try {
    const options = {
      hostname: "localhost",
      port: 5000,
      path: "/api/customer/auth/register",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(
          JSON.stringify({
            phone_number: "08123456789",
            full_name: "Test Customer",
            password: "password123",
            address: "Jakarta",
          })
        ),
      },
    };

    const postData = JSON.stringify({
      phone_number: "08123456789",
      full_name: "Test Customer",
      password: "password123",
      address: "Jakarta",
    });

    const result = await makeRequest(options, postData);
    console.log("Customer Registration Response:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Customer Registration Error:", error.message);
  }
}

async function testAdminLogin() {
  try {
    const postData = JSON.stringify({
      phone_number: "6282111111111",
      password: "admin123",
    });

    const options = {
      hostname: "localhost",
      port: 5000,
      path: "/api/admin/auth/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const result = await makeRequest(options, postData);
    console.log("\nAdmin Login Response:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Admin Login Error:", error.message);
  }
}

async function runTests() {
  console.log("🧪 Testing Authentication Endpoints...\n");

  await testCustomerRegister();
  await testAdminLogin();

  console.log("\n✅ Testing completed!");
}

runTests();
