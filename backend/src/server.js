require("dotenv").config();
const fs = require("fs");
const path = require("path");
const app = require("./app");
const sequelize = require("./config/database");
require("./models"); // đảm bảo tất cả model + quan hệ được nạp
const configService = require("./services/configService");

const PORT = process.env.PORT || 4000;

async function start() {
  const dataDir = path.join(__dirname, "..", "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  await sequelize.authenticate();
  await sequelize.sync(); // tự động tạo bảng nếu chưa có
  await configService.ensureDefaults();

  app.listen(PORT, () => {
    console.log(`\n🏦 BSLMS API server đang chạy tại http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
  });
}

start().catch((err) => {
  console.error("Không thể khởi động server:", err);
  process.exit(1);
});
