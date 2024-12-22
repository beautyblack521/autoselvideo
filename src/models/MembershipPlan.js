import mongoose from 'mongoose'

const membershipPlanSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['week', 'month', 'quarter'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,  // 天数
    required: true
  },
  benefits: [{
    type: String,
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdateAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('MembershipPlan', membershipPlanSchema) 