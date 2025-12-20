const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempt to connect to the specific DJ Skid database
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Cyan color for the host makes it stand out in the terminal logs
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Target Database: skid_supreme_db`); 
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Exit process with failure code 1 is critical for container orchestration later
    process.exit(1); 
  }
};

module.exports = connectDB;