const mongoose = require("mongoose");

mongoose
  .connect("mongodb+srv://sna773510:smt9TbRcdbeFPGuO@cluster0.olvflby.mongodb.net/Project_Demo?retryWrites=true&w=majority")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
