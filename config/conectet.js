const mongoose = require("mongoose");
const conectet = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("conectet to mongo db💖💖");
  } catch (error) {
    // throw error;
    // or
    console.log("error conectet to mongo db💔💔💔:  ", error.message);

  }
};
module.exports = conectet;