import express from 'express'
import { User } from '../models'
import { generateToken, verifyToken } from '../utils/auth'

const router = express.Router()

// 登录
router.post('/login', async (req, res) => {
  try {
    const { phone, verificationCode } = req.body

    // 管理员账号特殊处理
    if (phone === '13911160174' && verificationCode === '0000') {
      const adminUser = {
        id: 'admin',
        phone,
        role: 'admin',
        name: '超级管理员',
        permissions: ['*']
      }
      
      const token = generateToken(adminUser)
      
      return res.json({
        success: true,
        data: {
          user: adminUser,
          token
        }
      })
    }

    // 普通用户验证
    const user = await User.findOne({
      phone,
      verificationCode,
      verificationCodeExpires: { $gt: new Date() }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: '验证码错误或已过期'
      })
    }

    // 清除验证码
    user.verificationCode = undefined
    user.verificationCodeExpires = undefined
    await user.save()

    const token = generateToken(user)

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          phone: user.phone,
          role: user.role,
          name: user.name
        },
        token
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// 发送验证码
router.post('/verify-code', async (req, res) => {
  try {
    const { phone } = req.body

    // 管理员账号特殊处理
    if (phone === '13911160174') {
      return res.json({
        success: true,
        message: '验证码已发送'
      })
    }

    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString()
    const verificationCodeExpires = new Date(Date.now() + 5 * 60 * 1000)

    await User.findOneAndUpdate(
      { phone },
      {
        verificationCode,
        verificationCodeExpires,
        $setOnInsert: { role: 'user' }
      },
      { upsert: true }
    )

    // TODO: 实际项目中这里需要调用短信服务发送验证码
    console.log('验证码:', verificationCode)

    res.json({
      success: true,
      message: '验证码已发送'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({
        success: false,
        error: '未登录'
      })
    }

    const decoded = verifyToken(token)
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      })
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        phone: user.phone,
        role: user.role,
        name: user.name
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router 