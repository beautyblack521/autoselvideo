import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^1[3-9]\d{9}$/.test(v)
      },
      message: '请输入正确的手机号码'
    }
  },
  name: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['normal', 'member', 'admin'],
    default: 'normal'
  },
  verificationCode: String,
  verificationCodeExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: Date,
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active'
  }
})

// 添加索引
userSchema.index({ phone: 1 }, { unique: true })
userSchema.index({ verificationCodeExpires: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model('User', userSchema) 