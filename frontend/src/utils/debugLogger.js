// Simple debug logger utility.
// Aktif bila: (1) mode development, dan (2) VITE_DEBUG_AUTH === 'true'.
// Pemakaian: import { debugLog, enableDebug } from '.../utils/debugLogger'
// debugLog('AUTH', 'Pesan', {obj});

const DEBUG_FLAG = import.meta?.env?.VITE_DEBUG_AUTH === 'true';
const IS_DEV = import.meta?.env?.DEV;

export const enableDebug = () => (IS_DEV && DEBUG_FLAG);

// Konsisten format prefix
function ts() {
  return new Date().toISOString();
}

export function debugLog(scope, message, payload) {
  if (!enableDebug()) return;
  const base = `[DEBUG][${ts()}][${scope}]`;
  if (payload !== undefined) {
    // Hindari me-log token full
    const safePayload = sanitize(payload);
    // Gunakan group agar rapi
    console.groupCollapsed(`${base} ${message}`);
    console.log(safePayload);
    console.groupEnd();
  } else {
    console.log(`${base} ${message}`);
  }
}

// Diff helper untuk state
export function diffStates(prev, next) {
  if (!enableDebug()) return;
  const changes = {};
  const keys = new Set([...Object.keys(prev || {}), ...Object.keys(next || {})]);
  keys.forEach(k => {
    if (prev?.[k] !== next?.[k]) {
      changes[k] = { from: redact(prev?.[k]), to: redact(next?.[k]) };
    }
  });
  if (Object.keys(changes).length) {
    debugLog('STORE', 'State changed', changes);
  }
}

function redact(val) {
  if (typeof val === 'string' && val.length > 24) {
    // treat as possible token
    return val.slice(0, 6) + '...' + val.slice(-6);
  }
  return val;
}

function sanitize(obj) {
  try {
    if (obj == null) return obj;
    if (typeof obj !== 'object') return obj;
    return JSON.parse(JSON.stringify(obj, (key, value) => {
      if (key.toLowerCase().includes('token') && typeof value === 'string') {
        return redact(value);
      }
      return value;
    }));
  } catch (e) {
    return obj;
  }
}

export default debugLog;
