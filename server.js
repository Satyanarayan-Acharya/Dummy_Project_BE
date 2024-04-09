const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const authRoutes = require("./routes/authRoutes");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

require("./config/database");

app.use("/api/auth", authRoutes);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
