import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, { _id: true });

export const Comment = mongoose.model('Comment', commentSchema);