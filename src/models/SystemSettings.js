import mongoose from 'mongoose'

const systemSettingsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: '视频内容智能生成系统'
  },
  logo: {
    type: String,
    default: '/logo.svg'
  },
  apiKey: {
    type: String,
    default: ''
  },
  apiEndpoint: {
    type: String,
    default: ''
  },
  lastUpdateAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('SystemSettings', systemSettingsSchema) 