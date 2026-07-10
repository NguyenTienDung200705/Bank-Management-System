const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");

const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => {
  res.json({ status: "UP", timestamp: new Date().toISOString() });
});

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
