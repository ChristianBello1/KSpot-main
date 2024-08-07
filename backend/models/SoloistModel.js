import mongoose from 'mongoose';
import { Comment } from './CommentModel.js';

const soloistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stageName: String,
  birthday: Date,
  zodiacSign: String,
  height: Number,
  weight: Number,
  mbtiType: String,
  nationality: String,
  bio: String,
  company: String,
  debutDate: Date,
  photo: String,
  type: {
    type: String,
    enum: ['male-solo', 'female-solo'],
    required: true
  },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  socialMedia: {
    youtube: String,
    x: String,
    instagram: String
  },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export const Soloist = mongoose.model('Soloist', soloistSchema);