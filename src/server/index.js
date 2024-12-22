import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import connectDB from '../config/db.js'
import mongoose from 'mongoose'
import http from 'http'
import { setupWebSocket } from './websocket.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 创建 Express 应用
const app = express()
const server = http.createServer(app)

// 设置 WebSocket
const wss = setupWebSocket(server)

// 添加 WebSocket 路由
app.use('/ws', (req, res, next) => {
  console.log('WebSocket request received')
  if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
    console.log('Valid WebSocket upgrade request')
    next()
  } else {
    console.log('Invalid WebSocket request')
    res.status(400).json({ error: 'WebSocket connection required' })
  }
})

// 连接数据库
connectDB()

// 创建上传目录
const uploadDir = path.join(__dirname, '../../public/uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 配置中间件
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 配置静态文件服务
app.use(express.static(path.join(__dirname, '../../public')))
app.use('/uploads', express.static(uploadDir))

// 导入路由
import adminRouter from './routes/admin.js'
import userRouter from './routes/user.js'
import contentRouter from './routes/content.js'

// 使用路由
app.use('/api/admin', adminRouter)
app.use('/api/user', userRouter)
app.use('/api/content', contentRouter)

// 添加健康检查路由
app.get('/api/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState
    const dbStatus = {
      0: '已断开',
      1: '已连接',
      2: '正在连接',
      3: '正在断开'
    }

    res.json({
      status: 'ok',
      database: {
        state: dbStatus[dbState] || '未知状态',
        connected: dbState === 1
      }
    })
  } catch (error) {
    res.status(200).json({
      status: 'error',
      database: {
        state: '连接异常',
        connected: false,
        error: error.message
      }
    })
  }
})

// 添加数据库连接测试路由
app.get('/api/db-test', async (req, res) => {
  try {
    // 检查数据库连接状态
    const dbState = mongoose.connection.readyState
    const dbStatus = {
      0: '已断开',
      1: '已连接',
      2: '正在连接',
      3: '正在断开'
    }

    // 尝试执行一个简单的查询来验证连接
    if (dbState === 1) {
      await mongoose.connection.db.admin().ping()
      console.log('Database connection test successful')
      
      res.json({
        success: true,
        status: 'ok',
        database: {
          state: dbStatus[dbState],
          connected: true,
          host: mongoose.connection.host,
          name: mongoose.connection.name
        }
      })
    } else {
      throw new Error(`数据库未连接: ${dbStatus[dbState]}`)
    }
  } catch (error) {
    console.error('Database test error:', error)
    res.status(200).json({
      success: false,
      status: 'error',
      error: error.message,
      database: {
        state: '连接失败',
        connected: false
      }
    })
  }
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ error: err.message })
})

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

// 启动服务器
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`WebSocket server is ready`)
})

export default server