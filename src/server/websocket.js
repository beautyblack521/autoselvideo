import { WebSocketServer } from 'ws'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const JWT_SECRET = 'your-secret-key'

// 添加测试账号配置
const TEST_ACCOUNTS = {
  '13911160174': {
    code: '0000',
    role: 'admin',
    isAdmin: true,
    name: '超级管理员'
  }
}

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server })

  wss.on('connection', (ws) => {
    console.log('New client connected')

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message)
        
        switch (data.type) {
          case 'register':
            await handleRegister(ws, data.payload)
            break
          case 'login':
            await handleLogin(ws, data.payload)
            break
          case 'verify_code':
            await handleVerifyCode(ws, data.payload)
            break
          default:
            sendError(ws, 'Unknown message type')
        }
      } catch (error) {
        console.error('WebSocket error:', error)
        sendError(ws, error.message)
      }
    })

    ws.on('close', () => {
      console.log('Client disconnected')
    })
  })

  return wss
}

// 处理注册请求
async function handleRegister(ws, data) {
  try {
    const { phone, verificationCode } = data

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      throw new Error('无效的手机号码')
    }

    // 检查验证码
    const user = await User.findOne({
      phone,
      verificationCode,
      verificationCodeExpires: { $gt: new Date() }
    })

    if (!user) {
      throw new Error('验证码错误或已过期')
    }

    // 更新用户状态
    user.verificationCode = undefined
    user.verificationCodeExpires = undefined
    await user.save()

    // 生成 token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' })

    // 发送成功响应
    sendSuccess(ws, 'register', {
      token,
      user: {
        id: user._id,
        phone: user.phone,
        role: user.role
      }
    })
  } catch (error) {
    sendError(ws, error.message)
  }
}

// 处理登录请求
async function handleLogin(ws, payload) {
  try {
    const { phone, verificationCode } = payload

    // 检查是否是管理员账号
    if (phone === '13911160174' && verificationCode === '0000') {
      sendSuccess(ws, 'login', {
        user: {
          id: 'admin',
          phone,
          role: 'admin',
          name: '超级管理员',
          permissions: ['*']  // 所有权限
        },
        token: 'admin_token'
      })
      return
    }

    // 其他用户的验证逻辑...
    const user = await User.findOne({
      phone,
      verificationCode,
      verificationCodeExpires: { $gt: new Date() }
    })

    if (!user) {
      throw new Error('验证码错误或已过期')
    }

    // 生成 token
    const token = generateToken(user)

    sendSuccess(ws, 'login', {
      user: {
        id: user._id,
        phone: user.phone,
        role: user.role,
        name: user.name
      },
      token
    })
  } catch (error) {
    sendError(ws, error.message)
  }
}

// 处理验证码请求
async function handleVerifyCode(ws, payload) {
  try {
    const { phone } = payload

    // 如果是管理员账号，直接返回成功
    if (phone === '13911160174') {
      sendSuccess(ws, 'verify_code', { message: '验证码已发送' })
      return
    }

    // 其他用户的验证码逻辑...
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString()
    const verificationCodeExpires = new Date(Date.now() + 5 * 60 * 1000)

    await User.findOneAndUpdate(
      { phone },
      {
        verificationCode,
        verificationCodeExpires,
        $setOnInsert: { role: 'normal' }
      },
      { upsert: true }
    )

    console.log('验证码:', verificationCode)
    sendSuccess(ws, 'verify_code', { message: '验证码已发送' })
  } catch (error) {
    sendError(ws, error.message)
  }
}

// 发送成功响应
function sendSuccess(ws, type, data) {
  ws.send(JSON.stringify({
    type,
    success: true,
    data
  }))
}

// 发送错误响应
function sendError(ws, message) {
  ws.send(JSON.stringify({
    success: false,
    error: message
  }))
} 