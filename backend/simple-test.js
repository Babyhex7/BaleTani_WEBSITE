const http = require("http");

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

const req = http.request(options, (res) => {
  let body = "";
  res.on("data", (chunk) => {
    body += chunk;
  });
  res.on("end", () => {
    console.log(`Status: ${res.statusCode}`);
    console.log("Response:", body);
  });
});

req.on("error", (err) => {
  console.error("Error:", err.message);
});

req.write(postData);
req.end();
