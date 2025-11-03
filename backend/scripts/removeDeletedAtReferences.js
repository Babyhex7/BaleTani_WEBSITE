/**
 * Script untuk hapus semua referensi deleted_at dari controllers
 */

const fs = require("fs");
const path = require("path");

const controllersDir = path.join(__dirname, "../src/controllers");

// Pattern untuk hapus deleted_at: null
const patterns = [
  // Pattern 1: deleted_at: null dengan koma sebelumnya
  { regex: /,\s*deleted_at:\s*null/g, replacement: "" },
  // Pattern 2: deleted_at: null dengan koma sesudahnya
  { regex: /deleted_at:\s*null,\s*/g, replacement: "" },
  // Pattern 3: deleted_at: null standalone
  { regex: /deleted_at:\s*null/g, replacement: "" },
  // Pattern 4: comment tentang deleted_at
  { regex: /\/\/.*deleted.*products?\n/gi, replacement: "" },
];

function cleanFile(filePath) {
  console.log(`\n📝 Processing: ${path.basename(filePath)}`);

  let content = fs.readFileSync(filePath, "utf8");
  let originalLength = content.length;
  let changeCount = 0;

  patterns.forEach(({ regex, replacement }) => {
    const matches = content.match(regex);
    if (matches) {
      changeCount += matches.length;
      content = content.replace(regex, replacement);
    }
  });

  // Clean up empty where clauses
  content = content.replace(/where:\s*{\s*,/g, "where: {");
  content = content.replace(/where:\s*{\s*}/g, "// where clause cleaned");

  if (content.length !== originalLength) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`   ✅ Removed ${changeCount} deleted_at references`);
    console.log(`   📊 Size: ${originalLength} → ${content.length} bytes`);
    return true;
  } else {
    console.log(`   ⚪ No changes needed`);
    return false;
  }
}

// Process all controller files
const files = fs.readdirSync(controllersDir);
let totalFiles = 0;
let modifiedFiles = 0;

files.forEach((file) => {
  if (file.endsWith(".controller.js") || file.endsWith("Controller.js")) {
    totalFiles++;
    const filePath = path.join(controllersDir, file);
    if (cleanFile(filePath)) {
      modifiedFiles++;
    }
  }
});

console.log(`\n✅ Cleanup completed!`);
console.log(`📊 Summary:`);
console.log(`   - Total controller files: ${totalFiles}`);
console.log(`   - Modified files: ${modifiedFiles}`);
console.log(`   - Unchanged files: ${totalFiles - modifiedFiles}`);
