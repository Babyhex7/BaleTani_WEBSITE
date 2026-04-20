const http = require('http');

function postJson(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ statusCode: res.statusCode, body: json });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: body });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(data);
    req.end();
  });
}

function getJson(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET',
      headers: {},
    };
    if (token) options.headers.Authorization = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ statusCode: res.statusCode, body: json });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: body });
        }
      });
    });
    req.on('error', (err) => reject(err));
    req.end();
  });
}

(async () => {
  try {
    console.log('Logging in admin...');
    const loginResp = await postJson('/api/admin/auth/login', { phone_number: '6281234567890', password: 'admin12345' });
    console.log('Login status:', loginResp.statusCode);
    console.log(JSON.stringify(loginResp.body, null, 2));

    const token = loginResp.body?.data?.token;
    if (!token) {
      console.error('No token received');
      process.exit(1);
    }

    const productId = '0888908e-fc9f-49da-b8a6-c34c306b8807';
    console.log('Requesting stock history for product', productId);
    const historyResp = await getJson(`/api/admin/products/${productId}/stock-history?limit=2&page=1`, token);
    console.log('History status:', historyResp.statusCode);
    console.log(JSON.stringify(historyResp.body, null, 2));
    
    console.log('Requesting legacy stock_history endpoint (backfill)...');
    const legacyResp = await getJson(`/api/admin/stock-history?product_id=${productId}&limit=2`, token);
    console.log('Legacy status:', legacyResp.statusCode);
    console.log(JSON.stringify(legacyResp.body, null, 2));
  } catch (e) {
    console.error('Error', e);
    process.exit(1);
  }
})();
