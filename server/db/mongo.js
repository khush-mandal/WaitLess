const dns = require('dns');
// Set custom DNS resolvers to ensure Windows Node.js resolves MongoDB Atlas SRV records cleanly
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS cannot be set
}

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/waitless_db';

let isConnected = false;

const connectMongoDB = async () => {
  if (isConnected) return;

  console.log('🔄 Connecting to MongoDB Atlas cluster...');
  try {
    const opts = {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 15000,
      family: 4
    };
    
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGODB_URI, opts);
    isConnected = true;
    console.log('✅ Connected to MongoDB Atlas cluster successfully!');
  } catch (err) {
    console.warn('⚠️ MongoDB Atlas connection warning:', err.message);
    console.log('ℹ️ WaitLess server will continue with fallback operational mode');
  }
};

module.exports = {
  connectMongoDB,
  mongoose
};
