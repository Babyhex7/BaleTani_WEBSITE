// ============================================
// CONFIG: LOAD STAGES (Profil Beban Testing)
// ============================================
// File ini berisi berbagai profil beban untuk test scenarios
// Setiap profil mendefinisikan jumlah VUs (Virtual Users) dan durasi test

export const stages = {
  // 1. SMOKE TEST - Test cepat untuk validasi dasar
  // 1 user selama 1 menit - memastikan semua endpoint berfungsi
  smoke: [
    { duration: '1m', target: 1 },
  ],
  
  // 2. BASELINE - Normal load (Beban Normal)
  // 50 concurrent users selama 30 menit
  // Ramp-up 5 menit, sustain 20 menit, ramp-down 5 menit
  baseline: [
    { duration: '5m', target: 50 },   // Naik bertahap ke 50 users
    { duration: '20m', target: 50 },  // Maintain 50 users
    { duration: '5m', target: 0 },    // Turun bertahap ke 0
  ],
  
  // 3. PEAK LOAD - Flash Sale / High Traffic
  // 150 concurrent users selama 15 menit
  // Ramp-up cepat (3 menit) untuk simulasi traffic spike
  peak: [
    { duration: '3m', target: 150 },  // Naik cepat ke 150 users (flash sale)
    { duration: '10m', target: 150 }, // Maintain peak load
    { duration: '2m', target: 0 },    // Drop cepat
  ],
  
  // 4. STRESS TEST - Cari Breaking Point
  // Gradually increase sampai sistem mulai error
  // 100 -> 200 -> 300 -> 400 users
  stress: [
    { duration: '2m', target: 100 },  // Warm-up
    { duration: '2m', target: 200 },  // Push harder
    { duration: '2m', target: 300 },  // Near breaking point
    { duration: '2m', target: 400 },  // Likely to break
    { duration: '2m', target: 500 },  // Definitely breaking
  ],
  
  // 5. ENDURANCE - Stability Test (4 jam)
  // 50 concurrent users non-stop untuk detect memory leaks
  endurance: [
    { duration: '5m', target: 50 },    // Ramp-up
    { duration: '230m', target: 50 },  // Sustain 4 hours (240 min total)
    { duration: '5m', target: 0 },     // Ramp-down
  ],
  
  // 6. SPIKE TEST - Sudden Traffic Surge
  // 20 -> 200 -> 20 users (test recovery)
  spike: [
    { duration: '5m', target: 20 },   // Baseline traffic
    { duration: '2m', target: 200 },  // SUDDEN SPIKE (10x increase)
    { duration: '5m', target: 200 },  // Sustain spike
    { duration: '2m', target: 20 },   // SUDDEN DROP
    { duration: '6m', target: 20 },   // Monitor recovery
  ],
  
  // 7. SOAK TEST - Extended Baseline (8 jam)
  // Untuk production-like testing
  soak: [
    { duration: '10m', target: 50 },   // Ramp-up
    { duration: '470m', target: 50 },  // 8 hours sustained
    { duration: '10m', target: 0 },    // Ramp-down
  ],
};

// CARA PAKAI:
// import { stages } from '../config/stages.js';
// export let options = { stages: stages.baseline };
