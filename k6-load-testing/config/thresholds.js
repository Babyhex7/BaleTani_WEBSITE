// ================================================
// CONFIG: THRESHOLDS (Kriteria Keberhasilan Test)
// ================================================
// File ini mendefinisikan threshold (batas toleransi) untuk setiap scenario
// Test akan PASS jika memenuhi threshold, FAIL jika melebihi

export const thresholds = {
  // 1. SMOKE TEST - Semua request harus sukses
  smoke: {
    // Response time p95 harus <2 detik
    http_req_duration: ["p(95)<2000"],
    // Error rate harus <1% (hampir 0)
    http_req_failed: ["rate<0.01"],
  },

  // 2. BASELINE - Normal Load Thresholds
  baseline: {
    // p95: 95% request harus <1 detik
    // p99: 99% request harus <2 detik
    http_req_duration: ["p(95)<1000", "p(99)<2000"],
    // Error rate maksimal 1%
    http_req_failed: ["rate<0.01"],
    // Minimum throughput 50 requests per detik
    http_reqs: ["rate>50"],
  },

  // 3. PEAK LOAD - Flash Sale Thresholds
  peak: {
    // Toleransi lebih tinggi untuk peak load
    // p95: <1.5 detik, p99: <3 detik
    http_req_duration: ["p(95)<1500", "p(99)<3000"],
    // Error rate maksimal 3% (acceptable during peak)
    http_req_failed: ["rate<0.03"],
    // Minimum throughput 150 requests per detik
    http_reqs: ["rate>150"],
  },

  // 4. STRESS TEST - Breaking Point (Document only)
  stress: {
    // Tidak expect pass, tapi capture data saat break
    // p95 <5 detik masih dianggap responding
    http_req_duration: ["p(95)<5000"],
    // Error rate <50% (akan fail, tapi capture data)
    http_req_failed: ["rate<0.5"],
  },

  // 5. ENDURANCE - Stability Thresholds
  endurance: {
    // Response time harus stabil selama 4 jam
    // p95: <1.2 detik (sedikit lebih toleran karena lama)
    http_req_duration: ["p(95)<1200", "p(99)<2500"],
    // Error rate sangat rendah untuk endurance
    http_req_failed: ["rate<0.005"],
  },

  // 6. SPIKE TEST - Recovery Thresholds
  spike: {
    // Toleransi tinggi saat spike, tapi harus recover
    // p95: <3 detik during spike
    http_req_duration: ["p(95)<3000"],
    // Error rate <10% during spike
    http_req_failed: ["rate<0.1"],
  },
};

// ENDPOINT-SPECIFIC THRESHOLDS (Optional)
// Untuk threshold berbeda per endpoint
export const endpointThresholds = {
  // Login harus cepat (<300ms p95)
  login: {
    "http_req_duration{name:CustomerLogin}": ["p(95)<300"],
  },

  // Product browsing dengan cache harus sangat cepat
  products: {
    "http_req_duration{name:BrowseProducts}": ["p(95)<500"],
  },

  // Checkout boleh lebih lambat (transaksi kompleks)
  checkout: {
    "http_req_duration{name:Checkout}": ["p(95)<2000"],
  },

  // Cart operations harus cepat
  cart: {
    "http_req_duration{name:AddToCart}": ["p(95)<500"],
  },
};

// CARA PAKAI:
// import { thresholds } from '../config/thresholds.js';
// export let options = {
//   stages: stages.baseline,
//   thresholds: thresholds.baseline
// };
