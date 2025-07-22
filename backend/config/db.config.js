const mongoose = require("mongoose");
const connectionString = process.env.MOGNO_URI;
const dbName = process.env.DBNAME;

exports.connectDb = async () => {
  try {
    await mongoose.connect(connectionString, {
      dbName: dbName,
    });
    console.log("MongoDb connected");
  } catch (error) {
    console.error(`Error while connecting MongoDb : ${error}`);
    process.exit(1);
  }
};
