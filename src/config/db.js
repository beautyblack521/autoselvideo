import mongoose from 'mongoose';
import config from './config.js';

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection URL:', config.mongodb.url);
    console.log('Connection options:', JSON.stringify(config.mongodb.options, null, 2));
    
    const conn = await mongoose.connect(config.mongodb.url, {
      ...config.mongodb.options
    });

    console.log('MongoDB Connected Successfully!');
    console.log('Connected to host:', conn.connection.host);
    console.log('Database name:', conn.connection.name);
    console.log('Connection state:', conn.connection.readyState);

    // 测试连接
    await mongoose.connection.db.admin().ping();
    console.log('MongoDB ping successful - Database is responsive');

    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        code: err.code
      });
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(() => {
        connectDB();
      }, 5000);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

    return conn;
  } catch (error) {
    console.error('MongoDB connection error occurred:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('Server selection details:', error.reason);
      console.error('Topology description:', error.topology?.description);
    }
    
    // 连接失败后尝试重连
    console.log('Attempting to reconnect in 5 seconds...');
    setTimeout(() => {
      connectDB();
    }, 5000);
  }
};

export default connectDB; 