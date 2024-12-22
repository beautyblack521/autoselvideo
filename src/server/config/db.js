import mongoose from 'mongoose'
import config from './config.js'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.url, {
      ...config.mongodb.options,
      dbName: 'autovideo'  // 指定数据库名称
    })

    console.log('MongoDB Connected:', conn.connection.host)

    // 监听连接错误
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err)
    })

    // 监听连接断开
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...')
      setTimeout(() => {
        connectDB()
      }, 5000)
    })

    // 监听连接重连
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected')
    })

    return conn
  } catch (error) {
    console.error('MongoDB connection error:', error)
    // 连接失败后尝试重连
    setTimeout(() => {
      connectDB()
    }, 5000)
  }
}

export default connectDB 