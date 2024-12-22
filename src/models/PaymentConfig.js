import mongoose from 'mongoose'

const paymentConfigSchema = new mongoose.Schema({
  appId: {
    type: String,
    required: true
  },
  mchId: {
    type: String,
    required: true
  },
  apiKey: {
    type: String,
    required: true
  },
  notifyUrl: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdateAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('PaymentConfig', paymentConfigSchema) 