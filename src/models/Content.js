import mongoose from 'mongoose'

const contentSchema = new mongoose.Schema({
  videoUrl: {
    type: String,
    required: true
  },
  videoTitle: {
    type: String,
    required: true
  },
  wordCount: {
    type: Number,
    required: true,
    min: 100,
    max: 2000
  },
  sections: [{
    id: Number,
    title: String,
    content: String,
    screenshot: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

export default mongoose.model('Content', contentSchema) 