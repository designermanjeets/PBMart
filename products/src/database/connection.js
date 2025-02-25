const mongoose = require("mongoose");
const { DB_URL } = require("../config");

module.exports = async () => {
  try {
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database Connected");
  } catch (error) {
    console.error("Error =============");
    console.log(error);
    process.exit(1);
  }
};
