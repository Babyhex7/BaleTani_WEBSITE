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

async function testAdminLoginAlternative() {
  try {
    // Test dengan nomor lain juga
    const tests = [
      { phone: "6282111111111", password: "admin123" },
      { phone: "082111111111", password: "admin123" },
      { phone: "6282111111111", password: "wrongpass" },
    ];

    for (const test of tests) {
      console.log(`\nTesting admin login with: ${test.phone}`);

      const postData = JSON.stringify({
        phone_number: test.phone,
        password: test.password,
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
      console.log("Response:", JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error("Admin Login Error:", error.message);
  }
}

testAdminLoginAlternative();
