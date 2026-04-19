const fs = require("fs");
const path = require("path");
const { sequelize } = require("./src/config/database");

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

function splitSqlStatements(sql) {
  return sql
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("--"))
    .join("\n")
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

function shouldIgnoreMigrationError(error) {
  const mysqlErrno = error?.original?.errno;
  const message = (error?.message || "").toLowerCase();

  // Allow rerun on partially migrated databases.
  const ignorableErrnos = new Set([
    1050, // Table already exists
    1060, // Duplicate column name
    1061, // Duplicate key name
    1091, // Can't DROP ... check that column/key exists
  ]);

  if (ignorableErrnos.has(mysqlErrno)) {
    return true;
  }

  if (
    message.includes("already exists") ||
    message.includes("duplicate column") ||
    message.includes("duplicate key") ||
    message.includes("check that column/key exists")
  ) {
    return true;
  }

  return false;
}

async function ensureMigrationsTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      file_name VARCHAR(255) NOT NULL UNIQUE,
      executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function getAppliedMigrations() {
  const [rows] = await sequelize.query(
    "SELECT file_name FROM schema_migrations ORDER BY id ASC"
  );
  return new Set(rows.map((row) => row.file_name));
}

function getSqlFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    throw new Error(`Migration directory not found: ${MIGRATIONS_DIR}`);
  }

  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.toLowerCase().endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));
}

async function applyMigration(fileName) {
  const migrationPath = path.join(MIGRATIONS_DIR, fileName);
  const sql = fs.readFileSync(migrationPath, "utf8");
  const statements = splitSqlStatements(sql);

  if (statements.length === 0) {
    console.log(`⚠️  Skip ${fileName} (no executable SQL statements)`);
    return;
  }

  const transaction = await sequelize.transaction();

  try {
    for (const statement of statements) {
      try {
        await sequelize.query(statement, {
          transaction,
          retry: { max: 0 },
        });
      } catch (error) {
        if (shouldIgnoreMigrationError(error)) {
          console.warn(
            `⚠️  Ignored idempotent error in ${fileName}: ${error.message}`
          );
          continue;
        }
        throw error;
      }
    }

    await sequelize.query(
      "INSERT INTO schema_migrations (file_name) VALUES (:file_name)",
      {
        transaction,
        replacements: { file_name: fileName },
      }
    );

    await transaction.commit();
    console.log(`✅ Applied migration: ${fileName}`);
  } catch (error) {
    await transaction.rollback();
    throw new Error(`Failed on ${fileName}: ${error.message}`);
  }
}

async function run() {
  try {
    console.log("🔄 Starting SQL migration runner...");

    await sequelize.authenticate();
    await ensureMigrationsTable();

    const files = getSqlFiles();
    if (files.length === 0) {
      console.log("ℹ️  No SQL migration files found.");
      process.exit(0);
    }

    const applied = await getAppliedMigrations();
    const pending = files.filter((file) => !applied.has(file));

    if (pending.length === 0) {
      console.log("✅ No pending migrations. Database is up to date.");
      process.exit(0);
    }

    console.log(`📦 Found ${pending.length} pending migration(s):`);
    pending.forEach((file) => console.log(`   - ${file}`));

    for (const file of pending) {
      await applyMigration(file);
    }

    console.log("🎉 All pending migrations applied successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration runner failed:", error.message);
    process.exit(1);
  }
}

run();