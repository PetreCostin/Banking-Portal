const fs = require("fs");
const path = require("path");
const morgan = require("morgan");

const { accounts, users, writeJSON } = require("./data.js");

const express = require("express");
const app = express();

// Security middleware imports
const securityHeadersMiddleware = require("./middleware/securityHeadersMiddleware.js");
const { generalLimiter } = require("./middleware/rateLimitMiddleware.js");
const { sessionMiddleware, sessionTimeoutMiddleware } = require("./middleware/sessionMiddleware.js");
const logger = require("./config/logger.js");

const accountRoutes = require("./routes/accounts.js");
const servicesRoutes = require("./routes/services.js");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Apply security middleware
app.use(securityHeadersMiddleware);
app.use(generalLimiter);
app.use(sessionMiddleware);
app.use(sessionTimeoutMiddleware);

// Logging middleware
app.use(morgan("combined", { stream: { write: message => logger.info(message.trim()) } }));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index", { title: "Account Summary", accounts });
});

app.get("/profile", (req, res) => {
  res.render("profile", { user: users[0] });
});

app.use("/account", accountRoutes);
app.use("/services", servicesRoutes);

app.listen(3000, () => console.log("PS Project Running on port 3000!"));
