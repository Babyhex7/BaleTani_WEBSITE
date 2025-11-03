/**
 * Script untuk hapus semua field deleted_at dan deleted_by dari models
 */

const fs = require("fs");
const path = require("path");

const modelsDir = path.join(__dirname, "../src/models");

function cleanModel(filePath) {
  console.log(`\n📝 Processing: ${path.basename(filePath)}`);

  let content = fs.readFileSync(filePath, "utf8");
  const originalContent = content;

  // Pattern untuk hapus field deleted_at dan deleted_by beserta definisinya
  // Hapus blok field deleted_at (termasuk semua properties-nya)
  content = content.replace(/deleted_at:\s*{[^}]*},?\s*/g, "");

  // Hapus blok field deleted_by (termasuk semua properties-nya)
  content = content.replace(/deleted_by:\s*{[^}]*},?\s*/g, "");

  // Clean up koma ganda atau trailing comma
  content = content.replace(/,\s*,/g, ",");
  content = content.replace(/,(\s*)\)/g, "$1)");
  content = content.replace(/,(\s*)}/g, "$1}");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`   ✅ Removed deleted_at/deleted_by fields`);
    console.log(
      `   📊 Size: ${originalContent.length} → ${content.length} bytes`
    );
    return true;
  } else {
    console.log(`   ⚪ No changes needed`);
    return false;
  }
}

// Process all model files
const files = fs.readdirSync(modelsDir);
let totalFiles = 0;
let modifiedFiles = 0;

// Skip index.js dan softDeleteLog.model.js
const skipFiles = ["index.js", "softDeleteLog.model.js"];

files.forEach((file) => {
  if (file.endsWith(".model.js") && !skipFiles.includes(file)) {
    totalFiles++;
    const filePath = path.join(modelsDir, file);
    if (cleanModel(filePath)) {
      modifiedFiles++;
    }
  }
});

console.log(`\n✅ Cleanup completed!`);
console.log(`📊 Summary:`);
console.log(`   - Total model files: ${totalFiles}`);
console.log(`   - Modified files: ${modifiedFiles}`);
console.log(`   - Unchanged files: ${totalFiles - modifiedFiles}`);
console.log(
  `\n⚠️  Note: softDeleteLog.model.js was skipped (will be deleted separately)`
);
