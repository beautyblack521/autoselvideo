import express from 'express'
import UserProfile from '../models/UserProfile.js'
import Order from '../models/Order.js'
import SystemSettings from '../models/SystemSettings.js'
import multer from 'multer'
import path from 'path'
import axios from 'axios'
import { fileURLToPath } from 'url'
import fs from 'fs'
import mongoose from 'mongoose'
import config from '../config.js'

const router = express.Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置文件上传
const uploadDir = path.join(__dirname, '../../../public/uploads')
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, `logo-${uniqueSuffix}${ext}`)
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: function(req, file, cb) {
    // 扩展支持的文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error('请选择JPG、PNG、GIF或WEBP格式的图片')
      error.code = 'INVALID_FILE_TYPE'
      return cb(error, false)
    }
    cb(null, true)
  }
})

// 获取个人信息
router.get('/profile', async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.user._id })
    if (!profile) {
      return res.json({
        phone: req.user.phone,
        nickname: '',
        signature: ''
      })
    }
    
    res.json({
      phone: req.user.phone,
      ...profile.toObject()
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 更新个人信息
router.post('/profile', async (req, res) => {
  try {
    const { nickname, signature } = req.body
    
    await UserProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        nickname,
        signature,
        lastUpdateAt: new Date()
      },
      { upsert: true }
    )
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 获取购买记录
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 获取系统设置
router.get('/settings', async (req, res) => {
  try {
    let settings = await SystemSettings.findOne()
    if (!settings) {
      settings = await SystemSettings.create({
        title: '视频内容智能生成系统',
        logo: '/logo.svg'
      })
    }
    console.log('Settings found:', settings)
    res.json(settings)
  } catch (error) {
    console.error('Error getting settings:', error)
    res.status(500).json({ error: error.message })
  }
})

// 上传Logo
router.post('/settings/logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error('请选择要上传的Logo')
    }

    // 构建相对路径
    const logoPath = `/uploads/${req.file.filename}`
    console.log('Logo uploaded to:', logoPath)

    // 更新数据库
    const settings = await SystemSettings.findOneAndUpdate(
      {},
      { 
        logo: logoPath,
        lastUpdateAt: new Date()
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true
      }
    )

    // 返回新的logo路径
    res.json({ 
      success: true, 
      logo: logoPath,
      settings
    })
  } catch (error) {
    console.error('Logo upload error:', error)
    // 如果上传失败，删除已上传的文件
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting failed upload:', err)
      })
    }
    // 返回更详细的错误信息
    res.status(500).json({ 
      error: error.code === 'INVALID_FILE_TYPE' 
        ? error.message 
        : '上传失败：' + error.message
    })
  }
})

// 更新页面标题
router.post('/settings/title', async (req, res) => {
  try {
    const { title } = req.body
    await SystemSettings.findOneAndUpdate(
      {},
      { 
        title,
        lastUpdateAt: new Date()
      },
      { upsert: true }
    )
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 更新API设置
router.post('/settings/api', async (req, res) => {
  try {
    const { apiKey, apiEndpoint } = req.body
    await SystemSettings.findOneAndUpdate(
      {},
      { 
        apiKey,
        apiEndpoint,
        lastUpdateAt: new Date()
      },
      { upsert: true }
    )
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 测试API连接
router.post('/settings/test-api', async (req, res) => {
  try {
    const { apiKey, apiEndpoint } = req.body
    
    // 这里实现实际的API连接测试逻辑
    const response = await axios.post(apiEndpoint + '/test', {}, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.response?.data?.message || error.message 
    })
  }
})

// 更新数据库配置
router.post('/settings/database', async (req, res) => {
  try {
    const { url } = req.body
    
    if (!url) {
      return res.status(400).json({ error: '数据库连接地址不能为空' })
    }

    // 先测试新的连接是否可用
    try {
      const testConn = await mongoose.createConnection(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        authSource: 'admin',
        serverSelectionTimeoutMS: 5000 // 5秒超时
      })
      await testConn.close()
    } catch (error) {
      console.error('Database connection test failed:', error)
      return res.status(400).json({ 
        error: '数据库连接测试失败：' + error.message 
      })
    }
    
    // 更新数据库配置
    const settings = await SystemSettings.findOneAndUpdate(
      {},
      { 
        dbUrl: url,
        lastUpdateAt: new Date()
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true
      }
    )

    // 更新当前连接
    mongoose.disconnect() // 断开当前连接
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      authSource: 'admin'
    })
    
    res.json({ 
      success: true,
      settings
    })
  } catch (error) {
    console.error('Save database config error:', error)
    res.status(500).json({ 
      error: '保存数据库配置失败：' + error.message 
    })
  }
})

export default router 