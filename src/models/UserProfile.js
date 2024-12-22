import mongoose from 'mongoose'

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  nickname: {
    type: String,
    trim: true,
    maxLength: 30
  },
  signature: {
    type: String,
    trim: true,
    maxLength: 200
  },
  lastUpdateAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('UserProfile', userProfileSchema) 