// ============================================
// CONFIG: SHORTENED STAGES (Versi Pendek untuk Skripsi)
// ============================================
// File ini berisi profil beban PENDEK yang tetap representatif
// untuk keperluan dokumentasi akademik (skripsi/jurnal)
//
// MENGAPA VERSI PENDEK?
// - Test panjang (>30 menit) sering timeout/crash di laptop
// - Hasil 5-10 menit sudah cukup untuk validate performa
// - Lebih praktis untuk development & documentation

export const stagesShort = {
  // ✅ 1. SMOKE TEST - Tetap sama (sudah pendek)
  smoke: [{ duration: "1m", target: 1 }],

  // ✅ 2. BASELINE LOAD - SHORTENED
  // ORIGINAL: 30 menit (5m ramp + 20m sustain + 5m down)
  // SHORTENED: 10 menit (2m ramp + 6m sustain + 2m down)
  baseline: [
    { duration: "2m", target: 50 }, // Naik ke 50 users (cepat)
    { duration: "6m", target: 50 }, // Sustain 6 menit (cukup untuk collect metrics)
    { duration: "2m", target: 0 }, // Turun
  ],

  // ✅ 3. PEAK LOAD - SHORTENED
  // ORIGINAL: 15 menit
  // SHORTENED: 8 menit
  peak: [
    { duration: "2m", target: 150 }, // Spike cepat
    { duration: "5m", target: 150 }, // Sustain 5 menit (cukup)
    { duration: "1m", target: 0 }, // Drop
  ],

  // ✅ 4. STRESS TEST - SHORTENED
  // ORIGINAL: 10 menit (ramp sampai 500 VUs)
  // SHORTENED: 6 menit (ramp sampai 300 VUs - cukup untuk breaking point)
  stress: [
    { duration: "1m", target: 100 }, // Warm-up
    { duration: "1m", target: 200 }, // Push
    { duration: "2m", target: 300 }, // Near breaking (cukup sampai sini)
    { duration: "2m", target: 0 }, // Cooldown
  ],

  // ✅ 5. ENDURANCE - SHORTENED (PALING PENTING!)
  // ORIGINAL: 4 JAM (240 menit) - TERLALU LAMA!
  // SHORTENED: 30 MENIT - Cukup untuk detect pattern
  endurance: [
    { duration: "2m", target: 50 }, // Ramp-up
    { duration: "26m", target: 50 }, // Sustain 26 menit (cukup lihat trend)
    { duration: "2m", target: 0 }, // Ramp-down
  ],

  // ✅ 6. SPIKE TEST - SHORTENED
  // ORIGINAL: 20 menit
  // SHORTENED: 10 menit
  spike: [
    { duration: "2m", target: 20 }, // Baseline
    { duration: "1m", target: 200 }, // SPIKE!
    { duration: "3m", target: 200 }, // Sustain
    { duration: "1m", target: 20 }, // DROP
    { duration: "3m", target: 20 }, // Recovery
  ],

  // ============================================
  // VERSI MINI (< 5 MENIT EACH) - UNTUK TESTING CEPAT
  // ============================================

  // 🔥 BASELINE MINI (5 menit)
  baselineMini: [
    { duration: "1m", target: 30 }, // Ramp ke 30 VUs
    { duration: "3m", target: 30 }, // Sustain 3 menit
    { duration: "1m", target: 0 }, // Down
  ],

  // 🔥 PEAK MINI (5 menit)
  peakMini: [
    { duration: "1m", target: 100 }, // Spike
    { duration: "3m", target: 100 }, // Sustain
    { duration: "1m", target: 0 }, // Drop
  ],

  // 🔥 STRESS MINI (5 menit)
  stressMini: [
    { duration: "1m", target: 100 },
    { duration: "1m", target: 200 },
    { duration: "2m", target: 250 }, // Breaking point
    { duration: "1m", target: 0 },
  ],
};

// ============================================
// PROFIL REKOMENDASI UNTUK SKRIPSI
// ============================================

// Total waktu: ~1 jam (jauh lebih praktis dari 6+ jam)
export const skripsiProfile = {
  smoke: stagesShort.smoke, // 1 menit
  baseline: stagesShort.baseline, // 10 menit
  peak: stagesShort.peak, // 8 menit
  stress: stagesShort.stress, // 6 menit
  endurance: stagesShort.endurance, // 30 menit
  spike: stagesShort.spike, // 10 menit
};

// Total: 1 menit + 10 menit + 8 menit + 6 menit + 30 menit + 10 menit = 65 menit (~1 jam)

// ============================================
// CARA PAKAI
// ============================================

// Option 1: Import versi pendek
// import { stagesShort } from '../config/stages-short.js';
// export let options = { stages: stagesShort.baseline };

// Option 2: Import versi mini (untuk testing cepat)
// import { stagesShort } from '../config/stages-short.js';
// export let options = { stages: stagesShort.baselineMini };

// Option 3: Import full skripsi profile
// import { skripsiProfile } from '../config/stages-short.js';
// export let options = { stages: skripsiProfile.baseline };
