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
  },
  '13911111111': {
    code: '1111',
    role: 'member',
    isAdmin: false,
    name: '会员用户'
  },
  '13911112222': {
    code: '2222',
    role: 'normal',
    isAdmin: false,
    name: '普通用户'
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
async function handleLogin(ws, data) {
  try {
    const { phone, verificationCode } = data

    // 检查是否是测试账号
    if (TEST_ACCOUNTS[phone]) {
      if (verificationCode !== TEST_ACCOUNTS[phone].code) {
        throw new Error('验证码错误')
      }

      // 查找或创建用户
      let user = await User.findOne({ phone })
      if (!user) {
        user = await User.create({
          phone,
          role: TEST_ACCOUNTS[phone].role,
          name: TEST_ACCOUNTS[phone].name,
          verificationCode: undefined,
          verificationCodeExpires: undefined,
          lastLoginAt: new Date()
        })
      } else {
        // 更新用户状态
        user.role = TEST_ACCOUNTS[phone].role
        user.name = TEST_ACCOUNTS[phone].name
        user.verificationCode = undefined
        user.verificationCodeExpires = undefined
        user.lastLoginAt = new Date()
        await user.save()
      }

      // 生成 token
      const token = jwt.sign({ 
        userId: user._id,
        role: user.role,
        isAdmin: TEST_ACCOUNTS[phone].isAdmin
      }, JWT_SECRET, { 
        expiresIn: '7d' 
      })

      // 发送成功响应
      sendSuccess(ws, 'login', {
        token,
        user: {
          id: user._id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          isAdmin: TEST_ACCOUNTS[phone].isAdmin
        }
      })
      return
    }

    // 非测试账号的处理逻辑
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
    user.lastLoginAt = new Date()
    await user.save()

    // 生成 token
    const token = jwt.sign({ 
      userId: user._id,
      role: user.role
    }, JWT_SECRET, { 
      expiresIn: '7d' 
    })

    // 发送成功响应
    sendSuccess(ws, 'login', {
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

// 处理验证码请求
async function handleVerifyCode(ws, data) {
  try {
    const { phone } = data

    // 如果是测试账号，直接返回成功
    if (TEST_ACCOUNTS[phone]) {
      sendSuccess(ws, 'verify_code', { 
        message: '验证码已发送',
        code: TEST_ACCOUNTS[phone].code // 仅在开发环境返回
      })
      return
    }

    // 生成验证码
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString()
    const verificationCodeExpires = new Date(Date.now() + 5 * 60 * 1000) // 5分钟后过期

    // 更新或创建用户
    await User.findOneAndUpdate(
      { phone },
      {
        verificationCode,
        verificationCodeExpires,
        $setOnInsert: { role: 'normal' }
      },
      { upsert: true }
    )

    // TODO: 实际项目中这里需要调用短信服务发送验证码
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