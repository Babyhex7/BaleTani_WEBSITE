const http = require("http");

const postData = JSON.stringify({
  phone_number: "08123456789",
  full_name: "Test Customer",
  password: "test123",
  address: "Test Address"
});

const options = {
  hostname: "localhost",
  port: 5000,
  path: "/api/customer/auth/register",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(postData),
    "Origin": "http://localhost:5173"
  },
};

const req = http.request(options, (res) => {
  let body = "";
  
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  res.on("data", (chunk) => {
    body += chunk;
  });
  
  res.on("end", () => {
    console.log("Response:", body);
  });
});

req.on("error", (err) => {
  console.error("Error:", err.message);
});

req.write(postData);
req.end();
