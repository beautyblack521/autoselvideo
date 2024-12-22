import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

// 速率限制配置
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 每个IP限制100个请求
})

// 安全中间件配置
export const securityMiddleware = [
  helmet(), // 添加安全相关的HTTP头
  limiter,  // 添加速率限制
  (req, res, next) => {
    // 添加自定义安全头
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    next()
  }
] 