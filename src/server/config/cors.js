const corsOptions = {
  // 允许的来源
  origin: [
    'http://localhost:3000',
    'http://localhost:8080',
    'https://pjamqgygqxul.sealoshzh.site'
  ],
  // 允许的方法
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // 允许的头部
  allowedHeaders: ['Content-Type', 'Authorization'],
  // 允许发送凭证
  credentials: true,
  // 预检请求的缓存时间
  maxAge: 86400,
  // 成功状态码
  optionsSuccessStatus: 200
}

export default corsOptions 