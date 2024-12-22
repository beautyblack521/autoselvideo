import express from 'express'
import User from '../models/User.js'

const router = express.Router()

// 发送验证码
router.post('/send-verification-code', async (req, res) => {
  try {
    const { phone } = req.body
    
    // 生成4位随机验证码
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString()
    
    // 设置验证码5分钟后过期
    const verificationCodeExpires = new Date(Date.now() + 5 * 60 * 1000)
    
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
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 注册
router.post('/register', async (req, res) => {
  try {
    const { phone, verificationCode } = req.body
    
    const user = await User.findOne({
      phone,
      verificationCode,
      verificationCodeExpires: { $gt: new Date() }
    })
    
    if (!user) {
      return res.status(400).json({ message: '验证码错误或已过期' })
    }
    
    // 更新用户信息
    user.verificationCode = undefined
    user.verificationCodeExpires = undefined
    await user.save()
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router 